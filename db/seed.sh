#!/usr/bin/env bash
# Run the seed script against any Postgres instance and exit.
# Usage: ./seed.sh <host> <port> <db> <user> <password>
# Defaults to local dev values if no args given.

DB_HOST=${1:-localhost}
DB_PORT=${2:-5432}
DB_NAME=${3:-sportshop}
DB_USER=${4:-sportshop}
DB_PASS=${5:-sportshop}

docker run --rm \
  -v "$(cd "$(dirname "$0")" && pwd)/init.sql:/init.sql:ro" \
  -e PGPASSWORD="$DB_PASS" \
  postgres:16-alpine \
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f /init.sql
