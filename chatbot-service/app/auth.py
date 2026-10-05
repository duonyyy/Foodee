"""Authentication for internal NestJS-to-chatbot requests."""

import hmac

from fastapi import Header, HTTPException

from app.config import get_settings


def require_service_token(x_ai_service_token: str | None = Header(default=None)) -> None:
    configured = get_settings().ai_service_token
    if not configured:
        raise HTTPException(status_code=503, detail={"code": "service_not_configured"})
    if not x_ai_service_token or not hmac.compare_digest(x_ai_service_token, configured):
        raise HTTPException(status_code=401, detail={"code": "unauthorized_service"})
