#!/bin/bash
# Rebuild all images for linux/amd64 platform

set -e

APP_NAME=${APP_NAME:-"clinical-decision-engine"}

echo "🔨 Rebuilding all images for linux/amd64 platform"
echo "================================================="
echo ""

# Build services
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability; do
    echo "Building ${service} for linux/amd64..."
    docker build --platform linux/amd64 \
        -f Dockerfile.service \
        --build-arg SERVICE_NAME=$service \
        -t ${APP_NAME}-${service}:latest .
    echo "✅ ${service} built"
    echo ""
done

# Build dashboard
echo "Building dashboard for linux/amd64..."
docker build --platform linux/amd64 \
    -f Dockerfile.dashboard \
    -t ${APP_NAME}-dashboard:latest .
echo "✅ dashboard built"
echo ""

echo "✅ All images rebuilt for linux/amd64!"
echo ""
echo "Verify platform:"
docker images | grep ${APP_NAME} | head -6
echo ""
echo "Next: Transfer images to VM"
echo "  ./deploy/vm/transfer-images.sh"
