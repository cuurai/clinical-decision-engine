#!/bin/bash
# Generate Prisma clients for all services
# This script recursively generates Prisma clients for all domains

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATABASE_URL="${DATABASE_URL:-postgresql://quub:quub123@localhost:5432/quub_identity}"

echo "🔧 Generating Prisma clients for all services..."
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

  echo "📦 Generating client for ${service}..."
  cd "${ROOT_DIR}"
  DATABASE_URL="${DATABASE_URL}" npx prisma@6 generate --schema="${SCHEMA_PATH}" > /dev/null 2>&1

  if [ $? -eq 0 ]; then
    echo "   ✅ ${service} client generated successfully"
  else
    echo "   ❌ Failed to generate ${service} client"
    exit 1
  fi
done

echo ""
echo "✨ All Prisma clients generated successfully!"
