#!/bin/bash
# Clean up and rebuild all images for linux/amd64 platform

set -e

APP_NAME=${APP_NAME:-"clinical-decision-engine"}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "${ROOT_DIR}"

echo "🧹 Cleaning up old images and containers"
echo "========================================="
echo ""

# Stop and remove containers
echo "Stopping containers..."
docker-compose down 2>/dev/null || true

# Remove old images
echo "Removing old images..."
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
    docker rmi ${APP_NAME}-${service}:latest 2>/dev/null || true
done

# Clean up dangling images
echo "Cleaning up dangling images..."
docker image prune -f

echo ""
echo "✅ Cleanup complete!"
echo ""

echo "🔨 Rebuilding all images for linux/amd64 platform"
echo "================================================="
echo ""

# Build services
SERVICES=("decision-intelligence" "patient-clinical-data" "knowledge-evidence" "workflow-care-pathways" "integration-interoperability")

for service in "${SERVICES[@]}"; do
    echo "📦 Building ${service} for linux/amd64..."
    docker build --platform linux/amd64 \
        -f Dockerfile.service \
        --build-arg SERVICE_NAME=$service \
        -t ${APP_NAME}-${service}:latest . 2>&1 | grep -E "(Step|Building|built|Successfully|ERROR|WARN)" | tail -3
    
    if [ ${PIPESTATUS[0]} -eq 0 ]; then
        echo "   ✅ ${service} built successfully"
    else
        echo "   ❌ ${service} build failed"
        exit 1
    fi
    echo ""
done

# Build dashboard
echo "📦 Building dashboard for linux/amd64..."
docker build --platform linux/amd64 \
    -f Dockerfile.dashboard \
    -t ${APP_NAME}-dashboard:latest . 2>&1 | grep -E "(Step|Building|built|Successfully|ERROR|WARN)" | tail -3

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo "   ✅ dashboard built successfully"
else
    echo "   ❌ dashboard build failed"
    exit 1
fi

echo ""
echo "✅ All images rebuilt for linux/amd64!"
echo ""
echo "📊 Image summary:"
docker images | grep ${APP_NAME} | head -6
echo ""
echo "📦 Next steps:"
echo "   1. Save images: ./deploy/vm/save-images.sh"
echo "   2. Transfer to VM: ./deploy/vm/transfer-images.sh"
echo "   3. Or use complete deployment: ./deploy/vm/complete-deployment.sh"
