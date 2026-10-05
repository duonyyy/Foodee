# Foodee CI for the demo

The GitHub workflow `.github/workflows/ci.yml` checks source, builds, tests,
and validates the local and production Compose configuration. It does not
deploy the application.

Run the demo with the local `docker-compose.yml` stack. The
`compose.prod.yml` file and [production deployment notes](docs/PRODUCTION_DEPLOYMENT.md)
are retained as references for future work.

There is no CD workflow or automatic deployment in this repository.
