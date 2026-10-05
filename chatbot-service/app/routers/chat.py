from fastapi import APIRouter, Depends, HTTPException

from app.auth import require_service_token
from app.models.chat_request import GeneralReplyRequest, ParseOrderItemsRequest
from app.models.chat_response import GeneralReplyResponse, ParseOrderItemsResponse
from app.services.llm_service import LlmProviderError, LlmService
from app.services.prompt_service import PromptService
from app.services.response_parser import LlmOutputError, ResponseParser

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Service instances
_llm_service = LlmService()
_prompt_service = PromptService()
_parser = ResponseParser()


@router.get("/health")
async def health_check():
    """Health check endpoint for the chat AI service."""
    return {"status": "ok"}


@router.post("/general-reply", response_model=GeneralReplyResponse, dependencies=[Depends(require_service_token)])
async def general_reply(request: GeneralReplyRequest):
    """Generate a general chat reply using LLM.

    Flow: build prompt → call LLM → parse response → return structured JSON.
    """
    try:
        prompt = _prompt_service.build_general_reply_prompt(
            request.userMessage, request.menuFlat
        )
        raw = await _llm_service.call_llm(prompt)
        result = _parser.parse_general_reply(raw)
        return result

    except LlmProviderError as exc:
        print(f"[/api/chat/general-reply] Provider error: {exc.code}, upstream_status={exc.upstream_status}")
        raise HTTPException(
            status_code=exc.status_code,
            detail={"code": exc.code, "upstream_status": exc.upstream_status},
        ) from None
    except LlmOutputError:
        raise HTTPException(status_code=502, detail={"code": "invalid_llm_output"}) from None
    except Exception as exc:
        print(f"[/api/chat/general-reply] Error: {type(exc).__name__}")
        raise HTTPException(
            status_code=500,
            detail="Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.",
        )


@router.post("/parse-order-items", response_model=ParseOrderItemsResponse, dependencies=[Depends(require_service_token)])
async def parse_order_items(request: ParseOrderItemsRequest):
    """Parse user message to extract order items using LLM.

    Flow: build prompt → call LLM → parse response → return order items.
    """
    try:
        prompt = _prompt_service.build_order_items_prompt(
            request.userMessage, request.menuFlat
        )
        raw = await _llm_service.call_llm(prompt)
        items = _parser.parse_order_items(raw)
        return ParseOrderItemsResponse(orderItems=items)

    except LlmProviderError as exc:
        print(f"[/api/chat/parse-order-items] Provider error: {exc.code}, upstream_status={exc.upstream_status}")
        raise HTTPException(
            status_code=exc.status_code,
            detail={"code": exc.code, "upstream_status": exc.upstream_status},
        ) from None
    except LlmOutputError:
        raise HTTPException(status_code=502, detail={"code": "invalid_llm_output"}) from None
    except Exception as exc:
        print(f"[/api/chat/parse-order-items] Error: {type(exc).__name__}")
        raise HTTPException(
            status_code=500,
            detail="Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.",
        )
