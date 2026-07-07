# Nikolai Ahlhelm Website

Monorepo for Nikolai Ahlhelm's personal website. The project uses Strapi 5 as
the headless CMS for pages, navigation, and site settings, with Next.js 16 as
the frontend.

## Project Structure

- `backend/`: Strapi 5 CMS with content types for pages, navigation, footer content, and site settings.
- `frontend/`: Next.js App Router frontend with React 19, Tailwind CSS 4, and global content styles.
- `docker-compose.yml`: Production-like setup with frontend, backend, and optional PostgreSQL.
- `setup.sh`: Setup script for a fresh Linux server.

## Content Model

Content is managed in Strapi. The frontend currently renders these entries:

- `Page`: page content with `title`, `slug`, `content`, `seoTitle`, and `seoDescription`.
- `Site Setting`: site name, default theme, homepage, favicon, and background configuration.
- `Nav Item`: header navigation with sorting and optional external links.
- `Footer Setting`: copyright and additional footer text.
- `Footer Item`: footer links with sorting.

The homepage is resolved from `Site Setting.defaultPage` first. If no page is
configured there, the frontend uses `STRAPI_HOME_SLUG`, which defaults to
`startseite`.

## Editing Pages In Strapi

Page content is loaded from Strapi as HTML and rendered in the frontend with the
global `.content` styles. Standard HTML elements such as `h1`, `h2`, `p`, `ul`,
`ol`, `blockquote`, tables, and links work directly.

Additional CSS classes are available for code and console-style content.

### Welcome Console

Use this for the large console-style welcome text:

```html
<div class="console-welcome" role="heading" aria-level="1">
  <span class="console-welcome__prompt">&gt;_</span>
  <span class="console-welcome__text">welcome</span>
  <span class="console-welcome__cursor" aria-hidden="true"></span>
</div>
```

The block uses JetBrains Mono, follows the standard `h1` sizing, and does not
bring its own background. The background should come from the page or the
surrounding content panel.

### Console Lines

Use this for individual code or terminal-style lines:

```html
<p class="console">npm run dev</p>
```

With a blinking cursor at the end:

```html
<p class="console console--cursor">npm run dev</p>
```

The `.console` class automatically adds a `> ` prefix and also uses JetBrains
Mono.

## Local Development

Node.js 22 LTS is recommended. The Strapi backend supports Node.js 20, 22, or
24 in this project.

Start the backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Strapi will be available at <http://localhost:1337>.

Start the frontend:

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Next.js will be available at <http://localhost:3000>.

Important frontend variables:

- `STRAPI_URL`: internal Strapi URL for server-side requests.
- `STRAPI_PUBLIC_URL`: public Strapi URL for media URLs.
- `STRAPI_HOME_SLUG`: fallback homepage slug.
- `STRAPI_API_TOKEN`: optional API token when Strapi APIs are not publicly readable.

## Docker Setup

Create the root environment file and replace all placeholder secrets:

```bash
cp .env.example .env
docker compose pull
docker compose up -d
```

Services:

- Frontend: <http://localhost:3000>
- Strapi: <http://localhost:1337>

Persistent data is stored in Docker volumes:

- `postgres-data`: PostgreSQL database.
- `strapi-uploads`: uploaded Strapi media.

The bundled PostgreSQL container is enabled with `COMPOSE_PROFILES=local-db`.
Leave `COMPOSE_PROFILES` empty when using an external PostgreSQL database.

## Server Setup

On a fresh Linux server with Docker and Docker Compose installed, use the setup
script:

```bash
curl -fsSL https://raw.githubusercontent.com/nikolai-ahlhelm/nikolai-ahlhelm-website/master/setup.sh -o setup.sh
bash setup.sh
```

The script downloads the deployment files, generates a `.env` file with random
Strapi secrets, asks for the database configuration, and then starts:

```bash
docker compose pull
docker compose up -d
```

## Deployment

The GitHub Action builds two images on pushes to `master`:

- `ghcr.io/nikolai-ahlhelm/nikolai-ahlhelm-website/backend:latest`
- `ghcr.io/nikolai-ahlhelm/nikolai-ahlhelm-website/frontend:latest`

On the server, create a `.env` file from `.env.example`. Replace every
`change-me` value with a strong secret.

Pay special attention to:

- `STRAPI_PUBLIC_URL`: public URL of the Strapi backend.
- `STRAPI_HOME_SLUG`: fallback homepage slug.
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`,
  `JWT_SECRET`, `ENCRYPTION_KEY`: unique Strapi secrets.
- `DATABASE_PASSWORD`: strong database password.

## Generating Strapi Secrets

With OpenSSL:

```bash
openssl rand -base64 32
```

Run the command once for each secret:

```env
API_TOKEN_SALT=<generated-value>
ADMIN_JWT_SECRET=<generated-value>
TRANSFER_TOKEN_SALT=<generated-value>
JWT_SECRET=<generated-value>
ENCRYPTION_KEY=<generated-value>
```

`APP_KEYS` expects multiple comma-separated values:

```env
APP_KEYS=<generated-value-1>,<generated-value-2>,<generated-value-3>,<generated-value-4>
```

PowerShell alternative:

```powershell
$bytes = [byte[]]::new(32); [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes); [Convert]::ToBase64String($bytes)
```

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

## Windows Note

If the backend does not start after cloning on Windows, first use Node.js 22 LTS
and make sure `backend/.env` exists:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

For standalone local development, the backend uses SQLite. If `better-sqlite3`
fails during installation, retry with Node.js 22 LTS and the committed lockfile
first.
