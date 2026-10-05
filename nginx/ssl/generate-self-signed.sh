#!/usr/bin/env bash
# Generate self-signed SSL certificate for local HTTPS testing (localhost)
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "Generating self-signed SSL certificate for localhost..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost.key \
  -out localhost.crt \
  -subj "/C=VN/ST=HCM/L=HoChiMinh/O=Foodee/OU=Dev/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "Certificate created:"
echo "  - Private Key: $DIR/localhost.key"
echo "  - Certificate: $DIR/localhost.crt"
