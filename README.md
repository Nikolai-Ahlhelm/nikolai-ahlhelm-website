# Main Website

Monorepo for the Strapi backend and Next.js frontend.

## Structure

- `backend/` contains the Strapi 5 application.
- `frontend/` contains the Next.js application.
- `docker-compose.yml` runs PostgreSQL, Strapi, and Next.js together.
- `.github/workflows/docker-images.yml` builds and pushes both images to GHCR on pushes to `master`.

## Local Docker Run

Copy `.env.example` to `.env`, replace all placeholder secrets, then run:

```bash
docker compose build
docker compose up -d
```

Frontend: http://localhost:3000

Strapi: http://localhost:1337

## Production Image Pull

Set these values in `.env` on the server:

```bash
BACKEND_IMAGE=ghcr.io/<owner>/<repo>/backend:latest
FRONTEND_IMAGE=ghcr.io/<owner>/<repo>/frontend:latest
```

Then update the deployment with:

```bash
docker compose pull
docker compose up -d
```
