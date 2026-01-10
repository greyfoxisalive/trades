#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U ${POSTGRES_USER:-steam_trade} -d ${POSTGRES_DB:-steam_trade} 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing migrations..."
pnpm db:push || echo "Migration failed or already applied"

echo "Starting API server..."
exec pnpm start
