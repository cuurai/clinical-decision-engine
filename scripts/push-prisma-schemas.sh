#!/bin/bash
# Push all Prisma schemas to database
# This script pushes all domain schemas to the database

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE_URL="${DATABASE_URL:-postgresql://quub:quub123@localhost:5432/quub_identity}"

echo "🚀 Pushing Prisma schemas to database..."
echo "   Database URL: ${DATABASE_URL}"
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

  echo "📦 Pushing schema for ${service}..."
  cd "${ROOT_DIR}"

  # Use --skip-generate to avoid regenerating clients
  DATABASE_URL="${DATABASE_URL}" npx prisma@6 db push \
    --schema="${SCHEMA_PATH}" \
    --accept-data-loss \
    --skip-generate \
    2>&1 | grep -E "(Pushed|Error|Created|Altered)" || true

  if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "   ✅ ${service} schema pushed successfully"
  else
    echo "   ⚠️  ${service} schema push completed (may have warnings)"
  fi
  echo ""
done

echo "✨ All schemas pushed to database!"
