from copy import deepcopy

from evaluation.run_eval import load_dataset, score_case


def test_dataset_has_unique_ids_and_40_cases():
    dataset = load_dataset()
    assert len(dataset["cases"]) == 40
    assert len(dataset["menu"]) == 18


def test_exact_order_score_rejects_hallucinated_item():
    dataset = load_dataset()
    case = dataset["cases"][0]
    valid = {"orderItems": [{"id": "f01", "name": "Phở bò", "quantity": 1,
                             "restaurantId": "r1", "price": 55000}]}
    assert score_case(case, valid, dataset["menu"], 200)["result"] == "pass"
    invalid = deepcopy(valid)
    invalid["orderItems"][0]["id"] = "invented"
    score = score_case(case, invalid, dataset["menu"], 200)
    assert score["result"] == "fail"
    assert "unknown_menu_id" in score["issues"]


def test_general_reply_requires_human_review_even_when_contract_passes():
    dataset = load_dataset()
    case = next(case for case in dataset["cases"] if case["id"] == "g01")
    assert score_case(case, {"reply": "Xin chào", "suggestions": []}, dataset["menu"], 200)["result"] == "manual_review"
    assert score_case(case, {"reply": "Xin chào", "action": "placeOrder"}, dataset["menu"], 200)["result"] == "fail"


def test_http_failure_is_never_scored_as_success():
    dataset = load_dataset()
    assert score_case(dataset["cases"][0], {"detail": "unavailable"}, dataset["menu"], 500)["result"] == "error"
