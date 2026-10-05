#!/usr/bin/env python3
"""Exercise the production Compose gate without real credentials or TLS."""

from pathlib import Path
import os
import subprocess
import sys
import tempfile


ROOT = Path(__file__).resolve().parents[1]
VALUES = {
    "APP_DOMAIN": "app.foodee.vn",
    "API_DOMAIN": "api.foodee.vn",
    "STORAGE_DOMAIN": "storage.foodee.vn",
    "GHCR_NAMESPACE": "foodee-ci",
    "IMAGE_TAG": "sha-abcdef0",
    "DB_USERNAME": "foodee",
    "DB_NAME": "foodee",
    "DB_PASSWORD": "db_abcdefghijklmnopqrstuvwxyz0123456789",
    "JWT_SECRET": "jwt_abcdefghijklmnopqrstuvwxyz0123456789",
    "MINIO_ACCESS_KEY": "foodeeproductionaccess",
    "MINIO_SECRET_KEY": "minio_abcdefghijklmnopqrstuvwxyz0123456789",
    "MINIO_BUCKET": "foodee",
    "AI_SERVICE_TOKEN": "ai_abcdefghijklmnopqrstuvwxyz0123456789",
    "LLM_PROVIDER": "local",
    "CHAT_LLM_BASE_URL": "http://host.docker.internal:1234/v1",
    "CHAT_LLM_MODEL": "ci-model",
    "MAPBOX_ACCESS_TOKEN": "mapbox-ci-token",
    "MOMO_PARTNER_CODE": "momo-ci-partner",
    "MOMO_ACCESS_KEY": "momo-ci-access",
    "MOMO_SECRET_KEY": "momo-ci-secret",
    "MOMO_BASE_URL": "https://gateway.acmepay.org/momo",
    "MOMO_REDIRECT_URL": "https://app.foodee.vn/payment/momo/result",
    "MOMO_IPN_URL": "https://api.foodee.vn/payment/webhook/momo",
    "VNPAY_TMN_CODE": "vnpay-ci-code",
    "VNPAY_HASH_SECRET": "vnpay-ci-secret",
    "VNPAY_BASE_URL": "https://gateway.acmepay.org/vnpay",
    "VNPAY_API_URL": "https://api.acmepay.org/vnpay",
    "VNPAY_RETURN_URL": "https://app.foodee.vn/payment/vnpay/result",
    "VNPAY_IPN_URL": "https://api.foodee.vn/payment/webhook/vnpay",
}


def run(values: dict[str, str]) -> subprocess.CompletedProcess[str]:
    descriptor, path = tempfile.mkstemp(prefix=".prod-config-", suffix=".env", dir=ROOT)
    os.close(descriptor)
    env_file = Path(path)
    try:
        env_file.write_text("".join(f"{key}={value}\n" for key, value in values.items()), encoding="utf-8")
        return subprocess.run(
            [sys.executable, str(ROOT / "scripts" / "prod-preflight.py"), "--config-only", "--env-file", str(env_file)],
            cwd=ROOT,
            text=True,
            capture_output=True,
            check=False,
        )
    finally:
        env_file.unlink(missing_ok=True)


if __name__ == "__main__":
    good = run(VALUES)
    if good.returncode:
        print(good.stderr, file=sys.stderr)
        sys.exit("Valid production Compose fixture failed")
    bad_secret = run({**VALUES, "DB_PASSWORD": "123456"})
    if bad_secret.returncode == 0:
        sys.exit("Weak database password was accepted")
    reused_secret = run({**VALUES, "DB_PASSWORD": VALUES["JWT_SECRET"]})
    if reused_secret.returncode == 0:
        sys.exit("Reused production secret was accepted")
    fake_provider_key = run({**VALUES, "LLM_PROVIDER": "gemini", "GEMINI_API_KEY": "REPLACE_ME"})
    if fake_provider_key.returncode == 0:
        sys.exit("Placeholder Gemini key was accepted")
    bad_domain = run({**VALUES, "APP_DOMAIN": "app.example.com"})
    if bad_domain.returncode == 0:
        sys.exit("Example domain was accepted")
    print("Production Compose and fail-closed checks passed")
