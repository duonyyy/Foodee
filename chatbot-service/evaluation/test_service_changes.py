import asyncio
import importlib

import httpx
import pytest
from types import SimpleNamespace

from app import auth
from app.main import app
from app.models.chat_request import ChatMenuItem
from app.routers import chat
from app.services.llm_service import LlmProviderError
from app.services.prompt_service import PromptService
from app.services.response_parser import LlmOutputError, ResponseParser
from evaluation.run_eval import load_dataset, score_case


def menu_fixture() -> list[ChatMenuItem]:
    return [ChatMenuItem.model_validate(item) for item in load_dataset()["menu"]]


def test_candidate_selection_reaches_tail_without_mutating_menu():
    menu = menu_fixture()
    original_order = [item.id for item in menu]
    selected = PromptService.select_menu_candidates("2 bánh bao và 1 phở bò", menu, 15)
    assert {"f16", "f01"}.issubset({item.id for item in selected})
    assert len(selected) == 15
    assert [item.id for item in menu] == original_order

    prompt = PromptService.build_general_reply_prompt("Có bánh bao không?", menu)
    assert "MiXiBot" in prompt
    assert '"id": "f16"' in prompt
    cheap_prompt = PromptService.build_general_reply_prompt("Món nào rẻ nhất?", menu)
    assert '"id": "f16"' in cheap_prompt


def test_general_reply_drops_unsupported_action():
    parsed = ResponseParser.parse_general_reply('{"reply":"Chào bạn","suggestions":[],"action":"asking"}')
    assert parsed.action is None
    assert parsed.reply == "Chào bạn"


def test_general_reply_does_not_claim_order_was_created():
    raw = '{"reply":"Tôi đã tự tạo đơn cho bạn.","suggestions":[],"action":{"type":"create_order"}}'
    parsed = ResponseParser.parse_general_reply(raw)
    assert parsed.action is None
    assert parsed.suggestions == []
    assert "chưa tạo đơn" in parsed.reply

    case = next(case for case in load_dataset()["cases"] if case["id"] == "g06")
    score = score_case(case, {"reply": "Tôi đã tự tạo đơn cho bạn."}, load_dataset()["menu"], 200)
    assert "false_order_claim" in score["issues"]


def test_provider_failure_returns_machine_readable_error(monkeypatch):
    async def unavailable(_prompt: str) -> str:
        raise LlmProviderError("upstream_http_error", 502, 429)

    monkeypatch.setattr(chat._llm_service, "call_llm", unavailable)
    monkeypatch.setattr(auth, "get_settings", lambda: SimpleNamespace(ai_service_token="test-token"))

    async def request():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.post(
                "/api/chat/parse-order-items",
                json={"userMessage": "1 phở bò", "menuFlat": load_dataset()["menu"]},
                headers={"X-AI-Service-Token": "test-token"},
            )

    response = asyncio.run(request())
    assert response.status_code == 502
    assert response.json()["detail"] == {"code": "upstream_http_error", "upstream_status": 429}


def test_chat_requires_internal_token(monkeypatch):
    monkeypatch.setattr(auth, "get_settings", lambda: SimpleNamespace(ai_service_token="test-token"))

    async def request(headers: dict[str, str]):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.post(
                "/api/chat/parse-order-items",
                json={"userMessage": "1 phở bò", "menuFlat": load_dataset()["menu"]},
                headers=headers,
            )

    assert asyncio.run(request({})).status_code == 401
    assert asyncio.run(request({"X-AI-Service-Token": "wrong"})).status_code == 401


def test_empty_order_is_valid_but_malformed_order_is_an_error():
    assert ResponseParser.parse_order_items("[]") == []
    assert ResponseParser.parse_order_items("```json\n[]\n```") == []
    for raw in ("not JSON", "{}", '[{"id":"f01","name":"Phở bò","restaurantId":"r1","quantity":0}]'):
        with pytest.raises(LlmOutputError):
            ResponseParser.parse_order_items(raw)


def test_malformed_llm_json_returns_502_not_empty_order(monkeypatch):
    async def malformed(_prompt: str) -> str:
        return "not JSON"

    monkeypatch.setattr(auth, "get_settings", lambda: SimpleNamespace(ai_service_token="test-token"))
    monkeypatch.setattr(chat._llm_service, "call_llm", malformed)

    async def request():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.post(
                "/api/chat/parse-order-items",
                json={"userMessage": "1 phở bò", "menuFlat": load_dataset()["menu"]},
                headers={"X-AI-Service-Token": "test-token"},
            )

    response = asyncio.run(request())
    assert response.status_code == 502
    assert response.json()["detail"] == {"code": "invalid_llm_output"}


def test_readiness_fails_closed_without_internal_token(monkeypatch):
    main_module = importlib.import_module("app.main")

    async def request():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.get("/ready")

    monkeypatch.setattr(main_module, "settings", SimpleNamespace(ai_service_token=""))
    assert asyncio.run(request()).status_code == 503
    monkeypatch.setattr(main_module, "settings", SimpleNamespace(ai_service_token="fixture"))
    res = asyncio.run(request())
    assert res.status_code == 200
    assert "model" in res.json()


def test_models_registry_and_endpoint():
    async def request():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.get("/api/models")

    response = asyncio.run(request())
    assert response.status_code == 200
    data = response.json()
    assert "active" in data
    assert "supported_models" in data
    assert len(data["supported_models"]) >= 3
    # Verify health endpoint also contains active model
    async def health_request():
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            return await client.get("/health")
    h_res = asyncio.run(health_request())
    assert h_res.status_code == 200
    assert "active_model" in h_res.json()

