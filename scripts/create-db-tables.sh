#!/bin/bash
# Create database tables using Prisma db push
# This script creates tables for all services

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE_URL="${DATABASE_URL:-postgresql://quub:quub123@localhost:5432/quub_identity}"

echo "🚀 Creating database tables..."
echo "   Database URL: ${DATABASE_URL}"
echo ""
echo "⚠️  Note: This will create/update tables in the database."
echo "   If tables already exist, they will be updated to match the schema."
echo ""

SERVICES=(
  "decision-intelligence"
  "integration-interoperability"
  "knowledge-evidence"
  "patient-clinical-data"
  "workflow-care-pathways"
)

for service in "${SERVICES[@]}"; do
  SCHEMA_PATH="${ROOT_DIR}/platform/adapters/src/${service}/prisma/schema.prisma"

  if [ ! -f "${SCHEMA_PATH}" ]; then
    echo "⚠️  Schema not found: ${SCHEMA_PATH}"
    continue
  fi

  echo "📦 Creating tables for ${service}..."
  cd "${ROOT_DIR}"

  # Use db push to create/update tables
  # --skip-generate to avoid regenerating clients
  # --accept-data-loss to allow schema changes
  DATABASE_URL="${DATABASE_URL}" npx prisma@6 db push \
    --schema="${SCHEMA_PATH}" \
    --accept-data-loss \
    --skip-generate \
    > /tmp/prisma_${service}.log 2>&1 || {
    echo "   ⚠️  ${service} had issues (check /tmp/prisma_${service}.log)"
    # Continue with other services even if one fails
    continue
  }

  echo "   ✅ ${service} tables created/updated"
done

echo ""
echo "✨ Database table creation completed!"
echo ""
echo "💡 If you see errors, the tables may already exist or there may be conflicts."
echo "   Check the logs in /tmp/prisma_*.log for details."
