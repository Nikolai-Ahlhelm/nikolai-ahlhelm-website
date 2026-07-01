#!/usr/bin/env bash
set -euo pipefail

REPO_OWNER="nikolai-ahlhelm"
REPO_NAME="nikolai-ahlhelm-website"
BRANCH="master"
RAW_BASE_URL="https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}"

DEFAULT_TARGET_DIR="${REPO_NAME}"
DEFAULT_FRONTEND_PORT="3000"
DEFAULT_BACKEND_PORT="1337"
DEFAULT_STRAPI_PUBLIC_URL="http://localhost:1337"
DEFAULT_STRAPI_HOME_SLUG="startseite"

TARGET_DIR="${1:-}"
TTY="/dev/tty"

log() {
  printf '%s\n' "$*"
}

die() {
  printf 'Error: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

prompt() {
  local label="$1"
  local default_value="${2:-}"
  local value

  if [ -n "$default_value" ]; then
    printf '%s [%s]: ' "$label" "$default_value" >"$TTY"
  else
    printf '%s: ' "$label" >"$TTY"
  fi

  IFS= read -r value <"$TTY" || true
  if [ -z "$value" ]; then
    value="$default_value"
  fi
  printf '%s' "$value"
}

prompt_required() {
  local label="$1"
  local value

  while true; do
    value="$(prompt "$label" "")"
    if [ -n "$value" ]; then
      printf '%s' "$value"
      return 0
    fi
    log "A value is required." >"$TTY"
  done
}

confirm() {
  local label="$1"
  local default_value="${2:-n}"
  local answer
  local prompt_suffix="[y/N]"

  if [ "$default_value" = "y" ]; then
    prompt_suffix="[Y/n]"
  fi

  printf '%s %s: ' "$label" "$prompt_suffix" >"$TTY"
  IFS= read -r answer <"$TTY" || true
  answer="${answer:-$default_value}"

  case "$answer" in
    y|Y|yes|YES|Yes) return 0 ;;
    *) return 1 ;;
  esac
}

random_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 32
    return 0
  fi

  if [ -r /dev/urandom ] && command -v base64 >/dev/null 2>&1; then
    dd if=/dev/urandom bs=32 count=1 2>/dev/null | base64
    return 0
  fi

  die "Could not generate a secure random value. Install openssl or base64."
}

env_escape() {
  local value="$1"
  value="${value//\\/\\\\}"
  value="${value//\"/\\\"}"
  value="${value//\$/\\\$}"
  value="${value//\`/\\\`}"
  printf '%s' "$value"
}

write_env_line() {
  local key="$1"
  local value="$2"
  printf '%s="%s"\n' "$key" "$(env_escape "$value")" >> .env
}

download_file() {
  local remote_path="$1"
  local output_path="$2"

  log "Downloading ${remote_path}..."
  curl -fsSL "${RAW_BASE_URL}/${remote_path}" -o "$output_path"
}

check_requirements() {
  require_command curl
  require_command docker
  docker compose version >/dev/null 2>&1 || die "Docker Compose plugin not found. Install Docker Compose v2 so 'docker compose' works."

  if [ ! -r "$TTY" ]; then
    die "Interactive terminal not available. Run this script from a shell, not from a non-interactive job."
  fi
}

choose_database_mode() {
  local choice

  while true; do
    log "" >"$TTY"
    log "Database mode:" >"$TTY"
    log "  1) Bundled Postgres container (recommended)" >"$TTY"
    log "  2) External Postgres server" >"$TTY"
    choice="$(prompt "Choose database mode" "1")"

    case "$choice" in
      1|bundled|local|container) printf 'bundled'; return 0 ;;
      2|external|remote) printf 'external'; return 0 ;;
      *) log "Please choose 1 or 2." >"$TTY" ;;
    esac
  done
}

prepare_target_dir() {
  if [ -z "$TARGET_DIR" ]; then
    TARGET_DIR="$(prompt "Target directory" "$DEFAULT_TARGET_DIR")"
  fi

  mkdir -p "$TARGET_DIR"
  cd "$TARGET_DIR"
}

write_generated_env() {
  local db_mode="$1"
  local frontend_port="$2"
  local backend_port="$3"
  local strapi_public_url="$4"
  local strapi_home_slug="$5"
  local database_host database_port database_name database_username database_password database_ssl
  local app_keys

  app_keys="$(random_secret),$(random_secret),$(random_secret),$(random_secret)"

  if [ "$db_mode" = "bundled" ]; then
    database_host="postgres"
    database_port="5432"
    database_name="strapi"
    database_username="strapi"
    database_password="$(random_secret)"
    database_ssl="false"
  else
    database_host="$(prompt_required "External database host")"
    database_port="$(prompt "External database port" "5432")"
    database_name="$(prompt "External database name" "strapi")"
    database_username="$(prompt_required "External database username")"
    database_password="$(prompt_required "External database password")"
    database_ssl="$(prompt "Use database SSL? true/false" "false")"
  fi

  : > .env
  write_env_line "BACKEND_IMAGE" "ghcr.io/${REPO_OWNER}/${REPO_NAME}/backend:latest"
  write_env_line "FRONTEND_IMAGE" "ghcr.io/${REPO_OWNER}/${REPO_NAME}/frontend:latest"
  write_env_line "COMPOSE_PROFILES" "$([ "$db_mode" = "bundled" ] && printf 'local-db' || true)"
  write_env_line "FRONTEND_PORT" "$frontend_port"
  write_env_line "BACKEND_PORT" "$backend_port"
  write_env_line "DATABASE_CLIENT" "postgres"
  write_env_line "DATABASE_HOST" "$database_host"
  write_env_line "DATABASE_PORT" "$database_port"
  write_env_line "DATABASE_NAME" "$database_name"
  write_env_line "DATABASE_USERNAME" "$database_username"
  write_env_line "DATABASE_PASSWORD" "$database_password"
  write_env_line "DATABASE_SSL" "$database_ssl"
  write_env_line "APP_KEYS" "$app_keys"
  write_env_line "API_TOKEN_SALT" "$(random_secret)"
  write_env_line "ADMIN_JWT_SECRET" "$(random_secret)"
  write_env_line "TRANSFER_TOKEN_SALT" "$(random_secret)"
  write_env_line "JWT_SECRET" "$(random_secret)"
  write_env_line "ENCRYPTION_KEY" "$(random_secret)"
  write_env_line "STRAPI_URL" "http://backend:1337"
  write_env_line "STRAPI_PUBLIC_URL" "$strapi_public_url"
  write_env_line "STRAPI_HOME_SLUG" "$strapi_home_slug"
  write_env_line "STRAPI_API_TOKEN" ""
}

main() {
  local frontend_port backend_port strapi_public_url strapi_home_slug db_mode

  check_requirements

  log "Nikolai Ahlhelm Website setup"
  log "This script downloads Docker deployment files, generates .env, and starts the stack."
  log ""

  prepare_target_dir

  download_file "docker-compose.yml" "docker-compose.yml"
  download_file ".env.example" ".env.example"

  if [ -f ".env" ]; then
    if ! confirm ".env already exists. Overwrite it?" "n"; then
      die "Keeping existing .env. Remove it or rerun and choose overwrite."
    fi
  fi

  frontend_port="$(prompt "Public frontend port" "$DEFAULT_FRONTEND_PORT")"
  backend_port="$(prompt "Public backend port" "$DEFAULT_BACKEND_PORT")"
  strapi_public_url="$(prompt "Public Strapi URL" "$DEFAULT_STRAPI_PUBLIC_URL")"
  strapi_home_slug="$(prompt "Homepage fallback slug" "$DEFAULT_STRAPI_HOME_SLUG")"
  db_mode="$(choose_database_mode)"

  write_generated_env "$db_mode" "$frontend_port" "$backend_port" "$strapi_public_url" "$strapi_home_slug"

  log ""
  log "Pulling Docker images..."
  docker compose pull

  log ""
  log "Starting containers..."
  docker compose up -d

  log ""
  log "Setup complete."
  log "Frontend: http://localhost:${frontend_port}"
  log "Strapi:   http://localhost:${backend_port}"
  log "Create the first Strapi admin user in the Strapi admin panel."
}

main "$@"
