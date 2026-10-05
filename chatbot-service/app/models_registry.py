"""LLM Model Registry and Metadata Catalog for Foodee Chatbot Service."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class LLMModelMetadata(BaseModel):
    model_id: str
    name: str
    provider: str  # "gemini" | "local"
    context_window: int
    recommended_temperature: float
    max_output_tokens: int
    supports_vision: bool = False
    description: str


SUPPORTED_MODELS: Dict[str, LLMModelMetadata] = {
    # Google Gemini Models
    "gemini-3.1-flash-lite": LLMModelMetadata(
        model_id="gemini-3.1-flash-lite",
        name="Gemini 3.1 Flash Lite",
        provider="gemini",
        context_window=1048576,
        recommended_temperature=0.3,
        max_output_tokens=8192,
        supports_vision=True,
        description="High-speed, cost-efficient multimodal model tailored for fast chatbot interactions.",
    ),
    "gemini-1.5-flash": LLMModelMetadata(
        model_id="gemini-1.5-flash",
        name="Gemini 1.5 Flash",
        provider="gemini",
        context_window=1048576,
        recommended_temperature=0.3,
        max_output_tokens=8192,
        supports_vision=True,
        description="Balanced speed and reasoning for conversation and structured order parsing.",
    ),
    "gemini-1.5-pro": LLMModelMetadata(
        model_id="gemini-1.5-pro",
        name="Gemini 1.5 Pro",
        provider="gemini",
        context_window=2097152,
        recommended_temperature=0.2,
        max_output_tokens=8192,
        supports_vision=True,
        description="High reasoning capacity for complex multi-turn menu inquiries.",
    ),
    # Local Models (LM Studio / vLLM / Ollama)
    "qwen/qwen2.5-vl-7b": LLMModelMetadata(
        model_id="qwen/qwen2.5-vl-7b",
        name="Qwen 2.5 VL 7B",
        provider="local",
        context_window=32768,
        recommended_temperature=0.3,
        max_output_tokens=2048,
        supports_vision=True,
        description="Multimodal vision-language open-weights model running locally via OpenAI-compatible endpoint.",
    ),
    "qwen/qwen2.5-7b-instruct": LLMModelMetadata(
        model_id="qwen/qwen2.5-7b-instruct",
        name="Qwen 2.5 7B Instruct",
        provider="local",
        context_window=32768,
        recommended_temperature=0.3,
        max_output_tokens=2048,
        supports_vision=False,
        description="Fast localized text instruction following for natural Vietnamese dialogue.",
    ),
    "meta-llama/Llama-3.2-3B-Instruct": LLMModelMetadata(
        model_id="meta-llama/Llama-3.2-3B-Instruct",
        name="Llama 3.2 3B Instruct",
        provider="local",
        context_window=131072,
        recommended_temperature=0.3,
        max_output_tokens=2048,
        supports_vision=False,
        description="Ultra-lightweight edge model for low latency on consumer GPU or CPU.",
    ),
}


def get_model_metadata(model_id: str) -> Optional[LLMModelMetadata]:
    """Retrieve metadata for a known model ID."""
    return SUPPORTED_MODELS.get(model_id)


def list_supported_models(provider: Optional[str] = None) -> List[Dict[str, Any]]:
    """List catalog of supported models, optionally filtered by provider."""
    models = SUPPORTED_MODELS.values()
    if provider:
        models = [m for m in models if m.provider == provider]
    return [m.model_dump() for m in models]


def get_active_model_summary(settings: Any) -> Dict[str, Any]:
    """Inspect current runtime settings and return active model metadata."""
    provider = getattr(settings, "llm_provider", "local")
    if provider == "gemini":
        active_model_id = getattr(settings, "gemini_model", "gemini-3.1-flash-lite")
    else:
        active_model_id = getattr(settings, "chat_llm_model", "qwen/qwen2.5-vl-7b")

    metadata = get_model_metadata(active_model_id)
    return {
        "provider": provider,
        "active_model": active_model_id,
        "is_catalog_model": metadata is not None,
        "details": metadata.model_dump() if metadata else {
            "model_id": active_model_id,
            "provider": provider,
            "description": "Custom or external model",
        },
        "temperature": getattr(settings, "chat_llm_temperature", 0.3) if provider == "local" else 0.3,
        "timeout_ms": getattr(settings, "chat_llm_timeout_ms", None) if provider == "local" else None,
    }
