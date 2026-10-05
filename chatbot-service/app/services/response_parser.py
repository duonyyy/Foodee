import json
import re
from pydantic import ValidationError

from app.models.chat_response import (
    ChatSuggestion,
    GeneralReplyResponse,
    OrderItem,
)

SAFE_CHAT_ACTIONS = {
    "orderItems", "confirmOrder", "confirmRestaurant", "chooseAddress",
    "choosePayment", "confirmCreateOrder", "retryOrder",
}

FALSE_ORDER_CLAIM = re.compile(
    r"(?:đã\s+(?:tự\s+)?(?:tạo|đặt)\s+(?:đơn|hàng|món)|"
    r"đơn\s+hàng\s+(?:của\s+bạn\s+)?đã\s+được\s+tạo)",
    flags=re.IGNORECASE,
)
SAFE_ORDER_REPLY = (
    "Mình chưa tạo đơn. Nếu muốn đặt món, bạn hãy bắt đầu quy trình đặt món "
    "và xác nhận từng bước."
)


class LlmOutputError(Exception):
    """The provider returned a response that violates the chat JSON contract."""

    code = "invalid_llm_output"


class ResponseParser:
    """Parses raw LLM text output into structured data.

    Ported from: foodee-be/src/modules/chat/services/chat-response-parser.service.ts
    """

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @classmethod
    def parse_order_items(cls, raw: str) -> list[OrderItem]:
        """Parse raw LLM response into a list of order items."""
        try:
            parsed = json.loads(cls._strip_fence(raw))
            if not isinstance(parsed, list):
                raise LlmOutputError()
            return [cls._normalize_order_item(entry) for entry in parsed]
        except (json.JSONDecodeError, TypeError, ValueError, ValidationError) as exc:
            raise LlmOutputError() from None

    @classmethod
    def parse_general_reply(cls, raw: str) -> GeneralReplyResponse:
        """Parse raw LLM response into a general reply structure."""
        try:
            parsed = json.loads(cls._strip_fence(raw))
            if not isinstance(parsed, dict):
                raise LlmOutputError()
            reply = parsed.get("reply")
            if not isinstance(reply, str) or not reply.strip():
                raise LlmOutputError()
            action = parsed.get("action")
            if isinstance(action, (dict, list)) or FALSE_ORDER_CLAIM.search(reply):
                return GeneralReplyResponse(reply=SAFE_ORDER_REPLY)
            return GeneralReplyResponse(
                reply=reply,
                suggestions=cls._normalize_suggestions(parsed.get("suggestions")),
                action=action if isinstance(action, str) and action in SAFE_CHAT_ACTIONS else None,
            )
        except (json.JSONDecodeError, TypeError, ValueError, ValidationError):
            raise LlmOutputError() from None

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _strip_fence(raw: str) -> str:
        if not isinstance(raw, str):
            raise LlmOutputError()
        text = raw.strip()
        text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
        text = re.sub(r"\s*```$", "", text)
        return text.strip()

    @staticmethod
    def _normalize_suggestions(value) -> list[ChatSuggestion]:
        if not isinstance(value, list):
            return []

        suggestions: list[ChatSuggestion] = []
        for item in value:
            if isinstance(item, dict) and item.get("id") and item.get("name"):
                suggestions.append(
                    ChatSuggestion(
                        id=str(item["id"]),
                        name=str(item["name"]),
                        price=float(item.get("price", 0)),
                        image=str(item.get("image", "")),
                        link=str(item.get("link", "")),
                    )
                )
        return suggestions

    @staticmethod
    def _normalize_order_item(item) -> OrderItem:
        if not isinstance(item, dict):
            raise LlmOutputError()

        if any(not isinstance(item.get(key), str) or not item[key].strip() for key in ("id", "name", "restaurantId")):
            raise LlmOutputError()

        quantity = item.get("quantity", 1)
        if isinstance(quantity, str) and quantity.isdecimal():
            quantity = int(quantity)

        if type(quantity) is not int or quantity <= 0:
            raise LlmOutputError()

        return OrderItem(
            id=str(item["id"]),
            name=str(item["name"]),
            quantity=quantity,
            price=0,
            restaurantId=str(item["restaurantId"]),
        )
