import asyncio
import time

import httpx

from app.config import Settings, get_settings


class LlmProviderError(Exception):
    def __init__(self, code: str, status_code: int, upstream_status: int | None = None):
        super().__init__(code)
        self.code = code
        self.status_code = status_code
        self.upstream_status = upstream_status


class LlmService:
    """Calls LLM providers (Gemini API or local LM Studio / vLLM / Ollama).

    Ported from: foodee-be/src/modules/chat/services/chat-llm.service.ts
    """

    def __init__(self, settings: Settings | None = None):
        self._settings = settings or get_settings()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def call_llm(self, prompt: str) -> str:
        """Route to the configured LLM provider."""
        if self._settings.llm_provider == "gemini":
            return await self.call_gemini(prompt)
        return await self.call_local_llm(prompt)

    async def call_gemini(self, prompt: str) -> str:
        """Call Google Gemini API."""
        api_key = self._settings.gemini_api_key
        if not api_key:
            raise LlmProviderError("provider_not_configured", 503)
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self._settings.gemini_model}:generateContent"
        )

        data = await self._post_json(
            url,
            {"contents": [{"role": "user", "parts": [{"text": prompt}]}]},
            {"Content-Type": "application/json", "x-goog-api-key": api_key},
        )
        try:
            result = data["candidates"][0]["content"]["parts"][0]["text"]
            if not isinstance(result, str) or not result.strip():
                raise ValueError("empty provider response")
            return result
        except (KeyError, IndexError, TypeError, ValueError):
            raise LlmProviderError("invalid_provider_response", 502) from None

    async def call_local_llm(self, prompt: str) -> str:
        """Call local LLM via OpenAI-compatible API (LM Studio / vLLM / Ollama)."""
        base_url = self._settings.chat_llm_base_url.rstrip("/")
        url = f"{base_url}/chat/completions"

        data = await self._post_json(
            url,
            {
                "model": self._settings.chat_llm_model,
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "Bạn là MiXiBot - trợ lý đặt món ăn vui vẻ, "
                            "thân thiện, nói tiếng Việt tự nhiên và ngắn gọn."
                        ),
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": self._settings.chat_llm_temperature,
                "max_tokens": 1024,
                "stream": False,
            },
            {"Content-Type": "application/json"},
        )
        try:
            result = data["choices"][0]["message"]["content"]
            if not isinstance(result, str) or not result.strip():
                raise ValueError("empty provider response")
            return result
        except (KeyError, IndexError, TypeError, ValueError):
            raise LlmProviderError("invalid_provider_response", 502) from None

    async def _post_json(self, url: str, payload: dict, headers: dict) -> dict:
        """One bounded retry for short 429/503 failures within the LLM deadline."""
        deadline = time.monotonic() + self._timeout_seconds
        async with httpx.AsyncClient() as client:
            for attempt in range(2):
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise LlmProviderError("upstream_timeout", 504)
                try:
                    response = await client.post(url, json=payload, headers=headers, timeout=remaining)
                    if response.status_code in (429, 503) and attempt == 0:
                        delay = self._retry_delay(response.headers.get("Retry-After"))
                        if delay is not None and deadline - time.monotonic() - delay >= 1:
                            await asyncio.sleep(delay)
                            continue
                    response.raise_for_status()
                    data = response.json()
                    if not isinstance(data, dict):
                        raise LlmProviderError("invalid_provider_response", 502)
                    return data
                except httpx.HTTPStatusError as exc:
                    raise LlmProviderError("upstream_http_error", 502, exc.response.status_code) from None
                except httpx.TimeoutException:
                    raise LlmProviderError("upstream_timeout", 504) from None
                except httpx.RequestError:
                    raise LlmProviderError("upstream_unavailable", 503) from None
                except ValueError:
                    raise LlmProviderError("invalid_provider_response", 502) from None
        raise LlmProviderError("upstream_unavailable", 503)

    @staticmethod
    def _retry_delay(retry_after: str | None) -> float | None:
        if retry_after is None:
            return 0.25
        try:
            seconds = float(retry_after)
        except ValueError:
            return None
        return seconds if 0 <= seconds <= 1 else None

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @property
    def _timeout_seconds(self) -> float:
        return self._settings.chat_llm_timeout_ms / 1000.0
