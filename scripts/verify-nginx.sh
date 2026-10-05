#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf -- "$tmp"' EXIT

sed \
  -e 's/${APP_DOMAIN}/app.foodee.vn/g' \
  -e 's/${API_DOMAIN}/api.foodee.vn/g' \
  -e 's/${STORAGE_DOMAIN}/storage.foodee.vn/g' \
  "$root/nginx/prod.conf.template" > "$tmp/default.conf"
openssl req -x509 -newkey rsa:2048 -nodes -days 1 \
  -keyout "$tmp/privkey.pem" -out "$tmp/fullchain.pem" \
  -subj '/CN=app.foodee.vn' >/dev/null 2>&1

docker run --rm --network none \
  --add-host frontend:127.0.0.1 \
  --add-host api:127.0.0.1 \
  --add-host ai-server:127.0.0.1 \
  --add-host food-ai:127.0.0.1 \
  --add-host minio:127.0.0.1 \
  -v "$root/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" \
  -v "$tmp/default.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$tmp/fullchain.pem:/etc/nginx/tls/fullchain.pem:ro" \
  -v "$tmp/privkey.pem:/etc/nginx/tls/privkey.pem:ro" \
  --entrypoint nginx nginx:1.27-alpine -t
