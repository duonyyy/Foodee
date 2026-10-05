"""Repeatable synthetic evaluation of the FastAPI chat endpoints.

Run from chatbot-service: python -m evaluation.run_eval --output evaluation/results/baseline.json
This script never creates an order or reads customer data.
"""

import argparse
import asyncio
from collections import Counter, defaultdict
from datetime import datetime, timezone
import json
from pathlib import Path
from statistics import median
import time

import httpx

from app.config import get_settings
from app.main import app
from app.services.response_parser import FALSE_ORDER_CLAIM


HERE = Path(__file__).resolve().parent
DATASET = HERE / "cases.json"
SAFE_ACTIONS = {
    "orderItems", "confirmOrder", "confirmRestaurant", "chooseAddress",
    "choosePayment", "confirmCreateOrder", "retryOrder",
}


def load_dataset(path: Path = DATASET) -> dict:
    dataset = json.loads(path.read_text(encoding="utf-8"))
    menu_ids = [item["id"] for item in dataset["menu"]]
    case_ids = [case["id"] for case in dataset["cases"]]
    if len(menu_ids) != len(set(menu_ids)) or len(case_ids) != len(set(case_ids)):
        raise ValueError("Duplicate menu or case ID")
    for case in dataset["cases"]:
        if case["endpoint"] not in {"parse-order-items", "general-reply"}:
            raise ValueError(f"Unknown endpoint in {case['id']}")
        if ("expected_items" in case) == ("review_reason" in case):
            raise ValueError(f"Case {case['id']} needs exactly one scoring rule")
        for item_id, quantity in case.get("expected_items", []):
            if item_id not in menu_ids or not isinstance(quantity, int) or quantity <= 0:
                raise ValueError(f"Invalid expected item in {case['id']}")
    return dataset


def score_case(case: dict, response: dict | None, menu: list[dict], status: int) -> dict:
    if status != 200 or not isinstance(response, dict):
        issues = [f"http_{status}"]
        detail = response.get("detail") if isinstance(response, dict) else None
        if isinstance(detail, dict) and isinstance(detail.get("code"), str):
            issues.append(detail["code"])
            if isinstance(detail.get("upstream_status"), int):
                issues.append(f"upstream_http_{detail['upstream_status']}")
        return {"result": "error", "issues": issues}

    menu_by_id = {item["id"]: item for item in menu}
    issues = []
    if case["endpoint"] == "parse-order-items":
        items = response.get("orderItems")
        if not isinstance(items, list):
            return {"result": "invalid_contract", "issues": ["orderItems_not_list"]}
        actual = Counter()
        for item in items:
            if not isinstance(item, dict):
                issues.append("item_not_object")
                continue
            item_id, quantity = item.get("id"), item.get("quantity")
            if item_id not in menu_by_id:
                issues.append("unknown_menu_id")
            if type(quantity) is not int or quantity <= 0:
                issues.append("invalid_quantity")
            if item_id in menu_by_id and item.get("restaurantId") != menu_by_id[item_id]["restaurantId"]:
                issues.append("restaurant_mismatch")
            if isinstance(item_id, str) and type(quantity) is int:
                actual[(item_id, quantity)] += 1
        if "expected_items" in case:
            expected = Counter(tuple(pair) for pair in case["expected_items"])
            if actual != expected:
                issues.append("items_mismatch")
            return {"result": "pass" if not issues else "fail", "issues": sorted(set(issues))}
        return {"result": "manual_review" if not issues else "fail", "issues": sorted(set(issues))}

    reply = response.get("reply")
    if not isinstance(reply, str) or not reply.strip():
        issues.append("empty_reply")
    elif FALSE_ORDER_CLAIM.search(reply):
        issues.append("false_order_claim")
    suggestions = response.get("suggestions", [])
    if not isinstance(suggestions, list):
        issues.append("suggestions_not_list")
    else:
        for item in suggestions:
            if not isinstance(item, dict) or item.get("id") not in menu_by_id:
                issues.append("unknown_suggestion")
    if response.get("action") not in SAFE_ACTIONS | {None}:
        issues.append("unsupported_action")
    return {"result": "manual_review" if not issues else "fail", "issues": sorted(set(issues))}


async def run(dataset: dict, limit: int | None = None, case_ids: list[str] | None = None) -> dict:
    settings = get_settings()
    if not settings.ai_service_token:
        raise RuntimeError("AI_SERVICE_TOKEN is required for evaluation")
    menu = dataset["menu"]
    cases = dataset["cases"]
    if case_ids:
        unknown = set(case_ids) - {case["id"] for case in cases}
        if unknown:
            raise ValueError(f"Unknown case IDs: {sorted(unknown)}")
        cases = [case for case in cases if case["id"] in case_ids]
    cases = cases[:limit]
    results = []
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://eval.local") as client:
        for case in cases:
            started = time.perf_counter()
            try:
                response = await client.post(
                    f"/api/chat/{case['endpoint']}",
                    json={"userMessage": case["message"], "menuFlat": menu},
                    headers={"X-AI-Service-Token": settings.ai_service_token},
                    timeout=max(15, settings.chat_llm_timeout_ms / 1000 + 2),
                )
                body = response.json()
                status = response.status_code
            except (httpx.HTTPError, ValueError) as exc:
                body = {"error_class": type(exc).__name__}
                status = 0
            score = score_case(case, body, menu, status)
            results.append({
                "id": case["id"], "category": case["category"], "endpoint": case["endpoint"],
                "status": status, "elapsed_ms": round((time.perf_counter() - started) * 1000, 1),
                "result": score["result"], "issues": score["issues"], "response": body,
            })
            print(f"{case['id']}: {score['result']} ({results[-1]['elapsed_ms']} ms)", flush=True)

    by_category = defaultdict(Counter)
    for row in results:
        by_category[row["category"]][row["result"]] += 1
    latencies = [row["elapsed_ms"] for row in results]
    return {
        "dataset_version": dataset["dataset_version"],
        "run_at_utc": datetime.now(timezone.utc).isoformat(),
        "mode": "LIVE_PROVIDER" if any(row["status"] == 200 for row in results) else "PROVIDER_UNAVAILABLE",
        "provider": settings.llm_provider,
        "model": settings.chat_llm_model if settings.llm_provider == "local" else settings.gemini_model,
        "case_count": len(results),
        "summary": {"by_category": {key: dict(value) for key, value in sorted(by_category.items())},
                    "median_latency_ms": median(latencies) if latencies else None},
        "limitations": ["Synthetic menu and prompts, not observed customer traffic.",
                        "General reply helpfulness and ambiguous cases require human review.",
                        "Direct AI-service evaluation does not exercise NestJS order workflow."],
        "cases": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--limit", type=int, default=None, help="Run the first N cases as a connectivity probe")
    parser.add_argument("--case-id", action="append", help="Run only this case ID; may be repeated")
    args = parser.parse_args()
    if args.limit is not None and args.limit <= 0:
        parser.error("--limit must be positive")
    report = asyncio.run(run(load_dataset(), args.limit, args.case_id))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Saved {len(report['cases'])} cases to {args.output}")


if __name__ == "__main__":
    main()
