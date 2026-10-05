import json
import re
import unicodedata

from app.models.chat_request import ChatMenuItem


class PromptService:
    """Builds prompts for LLM calls.

    Ported from: foodee-be/src/modules/chat/services/chat-prompt.service.ts
    """

    @staticmethod
    def _normalize(text: str) -> str:
        text = unicodedata.normalize("NFD", text.casefold().replace("đ", "d"))
        text = "".join(char for char in text if unicodedata.category(char) != "Mn")
        return re.sub(r"[^a-z0-9]+", " ", text).strip()

    @classmethod
    def select_menu_candidates(
        cls, user_message: str, menu_flat: list[ChatMenuItem], limit: int
    ) -> list[ChatMenuItem]:
        """Rank the complete menu by name match, then fill unused slots in menu order."""
        message = f" {cls._normalize(user_message)} "
        if any(phrase in message for phrase in (" re nhat ", " gia thap nhat ", " gia re nhat ")):
            return sorted(menu_flat, key=lambda item: item.price)[:limit]
        message_tokens = set(message.split())
        ranked: list[tuple[int, int, ChatMenuItem]] = []
        remainder: list[ChatMenuItem] = []
        for index, item in enumerate(menu_flat):
            name = cls._normalize(item.name)
            name_tokens = set(name.split())
            exact = bool(name) and f" {name} " in message
            overlap = len(name_tokens & message_tokens)
            if exact or overlap:
                score = (1000 + len(name_tokens)) if exact else overlap * 10 - len(name_tokens)
                ranked.append((score, index, item))
            else:
                remainder.append(item)
        ranked.sort(key=lambda row: (-row[0], row[1]))
        return ([item for _, _, item in ranked] + remainder)[:limit]

    @staticmethod
    def build_order_items_prompt(user_message: str, menu_flat: list[ChatMenuItem]) -> str:
        """Build prompt to extract order items from user message."""
        menu_json = json.dumps(
            [item.model_dump() for item in PromptService.select_menu_candidates(user_message, menu_flat, 15)],
            ensure_ascii=False,
        )
        return (
            f'Người dùng: "{user_message}"\n\n'
            f"Danh sách một số món có sẵn: {menu_json}\n\n"
            "Trả về JSON array món người dùng muốn đặt (nếu không tìm thấy thì []):\n"
            '[{"id":"...", "name":"...", "quantity":1, "restaurantId":"..."}]\n\n'
            "Chỉ trả JSON."
        )

    @staticmethod
    def build_general_reply_prompt(user_message: str, menu_flat: list[ChatMenuItem]) -> str:
        """Build prompt for general chat reply."""
        menu_json = json.dumps(
            [item.model_dump() for item in PromptService.select_menu_candidates(user_message, menu_flat, 12)],
            ensure_ascii=False,
        )
        return (
            "Bạn là MiXiBot, trợ lý đặt món của Foodee. "
            "Trả lời ngắn gọn, tự nhiên bằng tiếng Việt.\n\n"
            f'Người dùng nói: "{user_message}"\n\n'
            f"Thực đơn tóm tắt: {menu_json}\n\n"
            "Trả về đúng JSON:\n"
            "{\n"
            '  "reply": "Câu trả lời ngắn bằng tiếng Việt",\n'
            '  "suggestions": [],\n'
            '  "action": null\n'
            "}\n\n"
            "Bạn không thể tự tạo đơn, thu tiền hoặc thay đổi giá ở bước này. "
            "Không tuyên bố đã thực hiện các thao tác đó; nếu khách muốn đặt món, "
            "hãy hướng dẫn họ bắt đầu quy trình đặt món và xác nhận từng bước. "
            "Nếu thực đơn thiếu thông tin để trả lời, hãy nói rõ điều đó. "
            "Chỉ trả JSON, không thêm gì khác."
        )
