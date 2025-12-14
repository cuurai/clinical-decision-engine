#!/bin/bash
# Save all images to tar.gz files for transfer

set -e

APP_NAME=${APP_NAME:-"clinical-decision-engine"}
OUTPUT_DIR="${OUTPUT_DIR:-/tmp/clinical-decision-engine-images}"

echo "💾 Saving Docker images to ${OUTPUT_DIR}"
echo "========================================="
echo ""

mkdir -p "${OUTPUT_DIR}"

SERVICES=("decision-intelligence" "patient-clinical-data" "knowledge-evidence" "workflow-care-pathways" "integration-interoperability" "dashboard")

for service in "${SERVICES[@]}"; do
    IMAGE_NAME="${APP_NAME}-${service}:latest"
    OUTPUT_FILE="${OUTPUT_DIR}/${service}.tar.gz"

    if docker images | grep -q "${APP_NAME}-${service}"; then
        echo "💾 Saving ${IMAGE_NAME}..."
        docker save ${IMAGE_NAME} | gzip > "${OUTPUT_FILE}"

        SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
        echo "   ✅ Saved to ${OUTPUT_FILE} (${SIZE})"
    else
        echo "   ⚠️  Image ${IMAGE_NAME} not found, skipping..."
    fi
done

echo ""
echo "✅ All images saved!"
echo ""
echo "📊 Files:"
ls -lh "${OUTPUT_DIR}"/*.tar.gz 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo "📦 Total size:"
du -sh "${OUTPUT_DIR}" | awk '{print "   " $1}'
echo ""
echo "🚀 Next: Transfer to VM"
echo "   ./deploy/vm/transfer-images.sh"
