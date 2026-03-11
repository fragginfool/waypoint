#!/bin/sh
set -e

# Run prisma db push to ensure the SQLite database is created and migrations are applied
echo "Initializing SQLite Database..."
npx prisma@5.22.0 db push --skip-generate

# Start the Next.js standalone application
echo "Starting Next.js Server..."
exec node server.js
