#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until pg_isready -h postgres -U ${POSTGRES_USER:-steam_trade} -d ${POSTGRES_DB:-steam_trade}; do
  sleep 1
done

echo "Running database migrations..."
pnpm db:push

echo "Database initialization complete!"
