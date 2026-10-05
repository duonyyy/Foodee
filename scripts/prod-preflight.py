#!/usr/bin/env python3
"""Fail closed before pulling images or starting the production stack."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
COMPOSE_FILE = ROOT / "compose.prod.yml"
TLS_DIR = ROOT / "deploy" / "tls"


def fail(message: str) -> None:
    raise RuntimeError(message)


def command(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, cwd=ROOT, text=True, capture_output=True, check=False)


def certificate_public_key(args: list[str]) -> bytes:
    result = subprocess.run(args, cwd=ROOT, capture_output=True, check=False)
    if result.returncode:
        fail("TLS certificate/private key could not be read")
    return result.stdout


def validate_tls(domains: list[str]) -> None:
    cert = TLS_DIR / "fullchain.pem"
    key = TLS_DIR / "privkey.pem"
    if not cert.is_file() or not key.is_file():
        fail("deploy/tls/fullchain.pem and privkey.pem are required")
    if os.name != "nt" and stat.S_IMODE(key.stat().st_mode) & 0o077:
        fail("TLS private key must not be readable by group/others (chmod 600)")
    if command(["openssl", "x509", "-in", str(cert), "-noout", "-checkend", "604800"]).returncode:
        fail("TLS certificate expires within seven days or is invalid")
    for domain in domains:
        result = command(["openssl", "x509", "-in", str(cert), "-noout", "-checkhost", domain])
        if result.returncode or "does NOT match" in result.stdout:
            fail(f"TLS certificate does not cover {domain}")
    cert_pub = certificate_public_key(["openssl", "x509", "-in", str(cert), "-pubkey", "-noout"])
    key_pub = certificate_public_key(["openssl", "pkey", "-in", str(key), "-pubout"])
    if hashlib.sha256(cert_pub).digest() != hashlib.sha256(key_pub).digest():
        fail("TLS certificate and private key do not match")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--config-only", action="store_true", help="CI syntax check without TLS files")
    parser.add_argument("--env-file", type=Path, default=ROOT / ".env.production")
    args = parser.parse_args()
    env_file = args.env_file.resolve()

    if not env_file.is_file():
        fail(".env.production is missing; copy the example and set real values")
    if not args.config_only and os.name != "nt" and stat.S_IMODE(env_file.stat().st_mode) & 0o077:
        fail(".env.production must not be readable by group/others (chmod 600)")

    result = command([
        "docker", "compose", "--env-file", str(env_file), "-f", str(COMPOSE_FILE),
        "config", "--format", "json",
    ])
    if result.returncode:
        fail("Docker Compose production configuration is invalid: " + result.stderr.strip())
    config = json.loads(result.stdout)
    services = config["services"]
    backend = services["api"]["environment"]
    nginx = services["nginx"]["environment"]
    chatbot = services["ai-server"]["environment"]

    secret_keys = ("DB_PASSWORD", "JWT_SECRET", "MINIO_SECRET_KEY", "AI_SERVICE_TOKEN")
    for key in secret_keys:
        value = str(backend.get(key, ""))
        if len(value) < 32 or any(word in value.lower() for word in ("replace", "example", "changeme")):
            fail(f"{key} must be a unique random secret of at least 32 characters")
    if len(str(backend.get("MINIO_ACCESS_KEY", ""))) < 16:
        fail("MINIO_ACCESS_KEY must be at least 16 characters")
    if len({backend[key] for key in secret_keys}) != len(secret_keys):
        fail("Production secrets must be distinct")
    for key in ("MAPBOX_ACCESS_TOKEN", "MOMO_PARTNER_CODE", "MOMO_ACCESS_KEY", "MOMO_SECRET_KEY", "VNPAY_TMN_CODE", "VNPAY_HASH_SECRET"):
        value = str(backend.get(key, ""))
        if not value or any(word in value.lower() for word in ("replace", "example", "changeme")):
            fail(f"{key} is required by the current API startup configuration")

    domains = [str(nginx[key]) for key in ("APP_DOMAIN", "API_DOMAIN", "STORAGE_DOMAIN")]
    if len(set(domains)) != 3:
        fail("Application, API, and storage domains must be distinct")
    for domain in domains:
        if not re.fullmatch(r"(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}", domain):
            fail(f"Invalid production domain: {domain}")
        if domain.endswith((".example.com", ".example", ".test", ".invalid", ".local")):
            fail(f"Replace example/non-public domain: {domain}")
    if backend["API_URL"] != f"https://{domains[1]}" or backend["MINIO_PUBLIC_ENDPOINT"] != f"https://{domains[2]}":
        fail("Backend public URLs do not match the configured domains")
    for key in ("MOMO_BASE_URL", "VNPAY_BASE_URL", "VNPAY_API_URL"):
        endpoint = urlparse(str(backend.get(key, "")))
        if endpoint.scheme != "https" or not endpoint.netloc or any(word in endpoint.netloc for word in ("sandbox", "test", "example")):
            fail(f"{key} must be a live HTTPS provider endpoint")
    for key, domain in (("MOMO_REDIRECT_URL", domains[0]), ("VNPAY_RETURN_URL", domains[0]), ("MOMO_IPN_URL", domains[1]), ("VNPAY_IPN_URL", domains[1])):
        endpoint = urlparse(str(backend.get(key, "")))
        if endpoint.scheme != "https" or endpoint.hostname != domain:
            fail(f"{key} must use the corresponding production domain")

    provider = chatbot["LLM_PROVIDER"]
    if provider == "gemini" and (
        not chatbot.get("GEMINI_API_KEY")
        or any(word in chatbot["GEMINI_API_KEY"].lower() for word in ("replace", "example", "changeme"))
    ):
        fail("GEMINI_API_KEY is required for LLM_PROVIDER=gemini")
    if provider == "local":
        endpoint = urlparse(chatbot.get("CHAT_LLM_BASE_URL", ""))
        if endpoint.scheme not in ("http", "https") or not endpoint.netloc or endpoint.hostname in ("localhost", "127.0.0.1"):
            fail("CHAT_LLM_BASE_URL must be reachable from the chatbot container")
        if not chatbot.get("CHAT_LLM_MODEL"):
            fail("CHAT_LLM_MODEL is required for LLM_PROVIDER=local")
    if provider not in ("gemini", "local"):
        fail("LLM_PROVIDER must be gemini or local")

    for name, service in services.items():
        if name != "nginx" and service.get("ports"):
            fail(f"{name} exposes a host port")
        if service.get("build"):
            fail(f"{name} would build on the production server")
    published = {str(port["published"]) for port in services["nginx"].get("ports", [])}
    if published != {"80", "443"}:
        fail("Only nginx should publish ports 80 and 443")
    if not config["networks"]["data"].get("internal"):
        fail("Database network must be internal")
    images = {service["image"] for service in services.values() if service.get("image", "").startswith("ghcr.io/")}
    if len(images) != 5 or any("your-github-owner" in image or ":sha-0000000" in image for image in images):
        fail("GHCR_NAMESPACE and IMAGE_TAG must refer to real release images")

    if not args.config_only:
        validate_tls(domains)
    print("Production preflight passed" + (" (configuration only)" if args.config_only else ""))


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, OSError, KeyError, ValueError) as error:
        print(f"Production preflight failed: {error}", file=sys.stderr)
        sys.exit(1)
