# Foodee single-host production deployment

Production uses `compose.prod.yml` alone. The root `docker-compose.yml` remains
the local development stack. Docker's [production Compose guidance](https://docs.docker.com/compose/how-tos/production/)
recommends keeping deployment-specific ports and environment separate.
The local stack binds Postgres, Redis, and MinIO to `127.0.0.1`; production
publishes only Nginx on 80/443.

## Release gates

Do not run the production stack until all of these are true:

1. One release checkout contains **all five image build contexts** and the
   frontend lockfile. Build and publish the five application images before
   attempting a manual deployment.
2. DNS for `APP_DOMAIN`, `API_DOMAIN`, and `STORAGE_DOMAIN` points at the host.
   A certificate covering all three names and its private key are stored as
   `deploy/tls/fullchain.pem` and `deploy/tls/privkey.pem`. They are ignored by
   Git. Renew the certificate before expiry and reload Nginx after renewal.
3. Copy `.env.production.example` to `.env.production` **on the server**, fill
   every credential, set `chmod 600 .env.production deploy/tls/privkey.pem`,
   and set the application domains in that file. Do not commit the populated
   file or the certificate key.
4. Supply live Mapbox, MoMo, and VNPay credentials and endpoints. The current
   API initializes those integrations on startup. Do not point production at
   the providers' sandbox endpoints. Test a payment webhook and callback.
5. Verify the host firewall exposes only 80/443 (and a restricted SSH port).
   Postgres, Redis, MinIO, the API, and the AI services have no host port in
   `compose.prod.yml`. The MinIO console is not routed by production Nginx.
6. Establish **off-host backups** for both the Postgres database and the MinIO
   bucket, then restore them to an isolated host and verify data. Named volumes
   alone are not backups. Record a recovery point and recovery time target.

## Before deploying

There is no CD workflow. This runbook is for a possible future manual release.
The five application images named by `GHCR_NAMESPACE` and `IMAGE_TAG` must
already exist in GHCR before running the commands below.

The server must have Docker Engine, Compose v2, Python 3, OpenSSL, access to
GHCR, and a clean checkout at the selected Git commit. Put the TLS files on
the server before starting; no sample/self-signed certificate is accepted as
a production substitute.

```sh
python3 scripts/prod-preflight.py
docker compose --env-file .env.production -f compose.prod.yml pull
docker compose --env-file .env.production -f compose.prod.yml up -d --wait --wait-timeout 300
docker compose --env-file .env.production -f compose.prod.yml ps
```

The preflight checks Compose syntax, secret strength, live provider settings,
public URLs, exposed ports, image references, certificate names and expiry,
and the certificate/private-key pair. It does not verify that upstream APIs,
DNS, payment callbacks, backups, or the chatbot model are operational.

The commands above are manual. GHCR tags can be overwritten; pin digests for
deployments that require image immutability. Promotion and rollback require an
operator to pick an image tag and check migration compatibility; database
migrations are not automatically reversible.

## Backup and recovery checks

Postgres can be backed up online to a protected directory with a command like:

```sh
docker compose --env-file .env.production -f compose.prod.yml exec -T postgres \
  sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' \
  > /secure-backups/foodee-$(date -u +%Y%m%dT%H%M%SZ).dump
```

Use a MinIO-compatible backup client to mirror the bucket to separate storage.
Schedule both backups, retain multiple restore points, encrypt off-host copies,
and rehearse restoring the database and objects together. Do not treat
`docker compose down -v` as a recovery or cleanup operation.

## Known release limitations

- App containers currently use the MinIO root account because the API manages
  bucket policy at startup. Before exposing production traffic, provision a
  bucket-scoped application identity and move bucket policy management into a
  one-time administrator step.
- Compose passes application credentials through environment variables. Host
  permissions reduce file exposure, but Docker administrators can inspect
  container environment. Move to a secret manager/Compose secrets where the
  application supports file-based credentials.
- The worker has no readiness endpoint; a running process is not proof it is
  consuming jobs. Monitor queue depth, failures, and processing latency.
- Private MinIO signed URLs are generated from an internal MinIO endpoint.
  Verify the resulting URL is reachable through the storage domain before
  relying on private document download in production.
- Size memory/CPU limits from a load test, especially for the vision model.
  This Compose file does not claim high availability or zero-downtime rollout.
