import asyncio

import httpx
import pytest

from app.config import Settings
from app.services.llm_service import LlmProviderError, LlmService


def test_gemini_key_is_sent_in_header_not_url(monkeypatch):
    secret = "fixture-secret-do-not-use"
    observed = {}

    def respond(request: httpx.Request) -> httpx.Response:
        observed["url"] = str(request.url)
        observed["header"] = request.headers.get("x-goog-api-key")
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "[]"}]}}]})

    transport = httpx.MockTransport(respond)
    original_client = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: original_client(transport=transport, **kwargs))
    settings = Settings(gemini_api_key=secret, gemini_model="gemini-test", llm_provider="gemini")

    assert asyncio.run(LlmService(settings).call_gemini("test")) == "[]"
    assert observed["header"] == secret
    assert secret not in observed["url"]
    assert "/models/gemini-test:generateContent" in observed["url"]


def test_short_503_gets_one_bounded_retry(monkeypatch):
    calls = []

    def respond(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        if len(calls) == 1:
            return httpx.Response(503, json={"error": "unavailable"})
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "[]"}]}}]})

    transport = httpx.MockTransport(respond)
    original_client = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: original_client(transport=transport, **kwargs))
    settings = Settings(gemini_api_key="fixture", gemini_model="gemini-test", chat_llm_timeout_ms=2000)

    assert asyncio.run(LlmService(settings).call_gemini("test")) == "[]"
    assert len(calls) == 2


def test_long_retry_after_429_is_returned_without_retry(monkeypatch):
    calls = []

    def respond(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        return httpx.Response(429, headers={"Retry-After": "10"}, json={"error": "quota"})

    transport = httpx.MockTransport(respond)
    original_client = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **kwargs: original_client(transport=transport, **kwargs))
    settings = Settings(gemini_api_key="fixture", gemini_model="gemini-test", chat_llm_timeout_ms=2000)

    with pytest.raises(LlmProviderError) as exc:
        asyncio.run(LlmService(settings).call_gemini("test"))
    assert exc.value.upstream_status == 429
    assert len(calls) == 1
