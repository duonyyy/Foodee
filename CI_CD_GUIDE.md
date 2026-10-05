# Foodee CI/CD

The production deployment procedure and release gates are in
[docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md).

- `.github/workflows/ci.yml` validates source and both local/production Compose
  configurations. It does not deploy.
- `.github/workflows/cd.yml` is **manual only**. It builds five immutable
  `sha-<commit>` images, checks production prerequisites on the server, and
  deploys that exact tag with `compose.prod.yml`.
- `docker-compose.yml` is the local development stack. Use `compose.prod.yml`
  alone for production. Do not combine the two files.
- A fresh root checkout must include `core-api`, `web-client`,
  `chatbot-service`, and `vision-service` before CD can build images. The
  workspace is being prepared as one release repository; verify these files
  are actually tracked and available from a fresh checkout before triggering CD.

No automatic deployment is enabled until DNS, TLS, credentials, backup/restore,
and the source checkout gate in the runbook are complete.
