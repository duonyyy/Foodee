from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models_registry import get_active_model_summary, list_supported_models
from app.routers import chat
from app.config import get_settings

settings = get_settings()
allowed_origins = [origin.strip() for origin in settings.ai_allowed_origins.split(",") if origin.strip()]

app = FastAPI(
    title="Foodee AI Server",
    description="AI/LLM service cho Foodee chatbot — tách riêng từ NestJS backend.",
    version="1.0.0",
)

# AI chat is internal to the API in Docker. Restrict CORS if it is exposed for local debugging.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(chat.router)


@app.get("/health")
async def root_health():
    """Root health check endpoint with active model information."""
    model_summary = get_active_model_summary(settings)
    return {
        "status": "ok",
        "service": "foodee-chatbot",
        "active_model": model_summary["active_model"],
        "provider": model_summary["provider"],
    }


@app.get("/ready")
async def readiness():
    """Readiness probe checking service configuration and model setup."""
    if not settings.ai_service_token:
        raise HTTPException(status_code=503, detail={"code": "service_not_configured"})
    
    model_summary = get_active_model_summary(settings)
    return {
        "status": "ready",
        "model": model_summary,
    }


@app.get("/api/models")
async def list_models(provider: str | None = None):
    """List available LLM models and inspect current runtime active model."""
    return {
        "active": get_active_model_summary(settings),
        "supported_models": list_supported_models(provider=provider),
    }
