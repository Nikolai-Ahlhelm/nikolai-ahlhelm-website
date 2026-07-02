# Nikolai Ahlhelm Website

Monorepo for the website with Strapi 5 as the headless CMS, Next.js 16 as the
frontend, and PostgreSQL for Docker-based deployments.

## Structure

- `backend/`: Strapi 5 application with content types for pages, navigation,
  site settings, and footer content.
- `frontend/`: Next.js App Router frontend with React 19 and Tailwind CSS 4.
- `docker-compose.yml`: runs PostgreSQL, Strapi, and Next.js together.
- `.github/workflows/docker-images.yml`: builds and publishes the backend and
  frontend images to GHCR on pushes to `master`.

## Requirements

- Node.js 20, 22, or 24 for local development. Node 22 LTS is the safest
  choice for the Strapi backend on Windows.
- npm.
- Docker and Docker Compose for the production-like local setup.

## One-Command Server Setup

For a fresh Linux server with Docker and Docker Compose installed, download and
run the standalone setup script:

```bash
curl -fsSL https://raw.githubusercontent.com/nikolai-ahlhelm/nikolai-ahlhelm-website/master/setup.sh -o setup.sh
bash setup.sh
```

The script downloads the deployment files, generates `.env` with strong random
Strapi secrets, lets you choose between the bundled Postgres container and an
external Postgres server, then runs:

```bash
docker compose pull
docker compose up -d
```

By default, the script creates a `nikolai-ahlhelm-website` directory and uses
the bundled Postgres container. If you select the bundled database, it writes
`COMPOSE_PROFILES=local-db`, `DATABASE_HOST=postgres`,
`DATABASE_USERNAME=strapi`, and a generated random database password. If you
select an external database, it leaves the bundled Postgres profile disabled and
uses the connection details you enter.

## Local Development

Prepare the backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Strapi will be available at <http://localhost:1337>.

Prepare the frontend:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Next.js will be available at <http://localhost:3000>.

Important frontend variables:

- `STRAPI_URL`: internal Strapi URL for server-side requests.
- `STRAPI_PUBLIC_URL`: public Strapi URL for media URLs. If it is not set in
  the local frontend environment, `STRAPI_URL` is used instead.
- `STRAPI_HOME_SLUG`: fallback homepage slug when no `defaultPage` is set in
  Strapi. The code falls back to `startseite`.
- `STRAPI_API_TOKEN`: optional, only needed when the Strapi APIs are not
  publicly readable.

## Docker Setup

Create the root environment file and replace all placeholder secrets:

```bash
cp .env.example .env
docker compose pull
docker compose up -d
```

The services will be available at:

- Frontend: <http://localhost:3000>
- Strapi: <http://localhost:1337>

Persistent data is stored in Docker volumes:

- `postgres-data`: PostgreSQL database.
- `strapi-uploads`: uploaded Strapi media.

The bundled Postgres service is enabled through `COMPOSE_PROFILES=local-db` in
`.env`. Leave `COMPOSE_PROFILES` empty when connecting Strapi to an external
Postgres server.

## Strapi Content

The frontend currently reads these Strapi entries:

- `Page`: `title`, `slug`, `content`, `seoTitle`, `seoDescription`.
- `Site Setting`: `siteName`, `defaultTheme`, `defaultPage`, `favicon`,
  `backgroundMode`, `backgroundImageLight`, `backgroundImageDark`,
  `backgroundOverlayColorLight`, `backgroundOverlayColorDark`,
  `backgroundOverlayTransparencyLight`, `backgroundOverlayTransparencyDark`.
- `Nav Item`: `label`, `url`, `priority`, `isExternal`, and optional nested
  child items.
- `Footer Setting`: `copyrightText`, `additionalText`.
- `Footer Item`: `label`, `link`, `priority`.

The homepage is resolved from `Site Setting.defaultPage` first. If no page is
set there, the frontend uses `STRAPI_HOME_SLUG`.

## Deployment

The GitHub Action builds two images on pushes to `master`:

- `ghcr.io/nikolai-ahlhelm/nikolai-ahlhelm-website/backend:latest`
- `ghcr.io/nikolai-ahlhelm/nikolai-ahlhelm-website/frontend:latest`

On the server, create `.env` from `.env.example`, replace every `change-me`
value with strong secrets, and set the image names. Then run:

```bash
docker compose pull
docker compose up -d
```

For production deployments, pay special attention to these values:

- `STRAPI_PUBLIC_URL`: public URL of the Strapi backend.
- `STRAPI_HOME_SLUG`: fallback homepage slug.
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`,
  `JWT_SECRET`, `ENCRYPTION_KEY`: unique strong Strapi secrets.
- `DATABASE_PASSWORD`: strong database password.

### Generating Strapi Secrets

All Strapi secrets should be random, unique, and kept private. Do not reuse the
example `change-me` values in production, and do not commit the generated `.env`
file.

With OpenSSL, generate one value at a time:

```bash
openssl rand -base64 32
```

Run the command once for each single-value secret:

```env
API_TOKEN_SALT=<generated-value>
ADMIN_JWT_SECRET=<generated-value>
TRANSFER_TOKEN_SALT=<generated-value>
JWT_SECRET=<generated-value>
ENCRYPTION_KEY=<generated-value>
```

`APP_KEYS` expects multiple comma-separated values. Generate four separate
values and join them like this:

```env
APP_KEYS=<generated-value-1>,<generated-value-2>,<generated-value-3>,<generated-value-4>
```

On Windows PowerShell, this command generates one suitable base64 value:

```powershell
$bytes = [byte[]]::new(32); [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes); [Convert]::ToBase64String($bytes)
```

### Windows Backend Troubleshooting

If the backend does not start after cloning on Windows, first confirm that
Node.js is within the supported backend range (`>=20 <=24`; Node 22 LTS is
recommended on Windows) and that `backend/.env` exists:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

For standalone local development, the backend uses SQLite by default. If
`better-sqlite3` fails during install, keep the committed lockfile and retry
with Node 22 LTS before rebuilding native modules. Visual Studio Build Tools
are only needed when npm cannot use a prebuilt binary. If you want an
environment closer to deployment, use the Docker Compose setup from the
repository root instead; it runs Strapi against PostgreSQL.

## Useful Commands

Backend:

```bash
npm run dev
npm run build
npm run start
```

Frontend:

```bash
npm run dev
npm run build
npm run start
npm run lint
```
