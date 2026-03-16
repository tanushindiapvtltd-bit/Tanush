#!/bin/sh
set -e

echo "==> Waiting for PostgreSQL to be ready..."
until npx prisma db execute --stdin <<'SQL' 2>/dev/null
SELECT 1;
SQL
do
  echo "    Postgres not ready yet, retrying in 2s..."
  sleep 2
done

echo "==> Syncing Prisma schema to database..."
npx prisma db push --accept-data-loss

echo "==> Starting Next.js application..."
exec node server.js
