#!/bin/bash
# Build Docker images for Mac M1 (Apple Silicon)
# Builds all 6 images for linux/amd64 platform (for VM deployment)

set -e

APP_NAME=${APP_NAME:-"clinical-decision-engine"}
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "${ROOT_DIR}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🍎 Mac M1 Docker Image Builder${NC}"
echo "=================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Check architecture
ARCH=$(uname -m)
echo -e "${BLUE}📱 Architecture: ${ARCH}${NC}"

# Check for Docker Buildx (needed for cross-platform builds)
if ! docker buildx version > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker Buildx not found. Installing...${NC}"
    echo "   Docker Buildx is required for building linux/amd64 images on M1"
    echo "   Please install Docker Desktop with Buildx support"
    exit 1
fi

echo -e "${GREEN}✅ Docker Buildx available${NC}"
echo ""

# Setup buildx builder if needed
BUILDER_NAME="multiarch-builder"
if ! docker buildx ls | grep -q "${BUILDER_NAME}"; then
    echo -e "${BLUE}🔧 Setting up buildx builder...${NC}"
    docker buildx create --name "${BUILDER_NAME}" --use --bootstrap
    echo -e "${GREEN}✅ Buildx builder created${NC}"
else
    echo -e "${BLUE}🔧 Using existing buildx builder...${NC}"
    docker buildx use "${BUILDER_NAME}"
fi
echo ""

# Clean up old images (optional)
read -p "🧹 Clean up old images before building? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🧹 Cleaning up old images...${NC}"
    docker-compose down 2>/dev/null || true

    for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
        docker rmi ${APP_NAME}-${service}:latest 2>/dev/null || true
    done

    docker image prune -f
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    echo ""
fi

# Build configuration
PLATFORM="linux/amd64"
SERVICES=("decision-intelligence" "patient-clinical-data" "knowledge-evidence" "workflow-care-pathways" "integration-interoperability")

echo -e "${BLUE}🔨 Building Docker Images for ${PLATFORM}${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}⚠️  Note: Building for linux/amd64 on M1 may take longer${NC}"
echo -e "${YELLOW}   This is normal - Docker is emulating amd64 architecture${NC}"
echo ""

# Build services
for service in "${SERVICES[@]}"; do
    echo -e "${BLUE}📦 Building ${service}...${NC}"
    echo "   Platform: ${PLATFORM}"
    echo "   Image: ${APP_NAME}-${service}:latest"

    START_TIME=$(date +%s)

    if docker buildx build \
        --platform ${PLATFORM} \
        --load \
        -f Dockerfile.service \
        --build-arg SERVICE_NAME=${service} \
        -t ${APP_NAME}-${service}:latest \
        . > /tmp/build-${service}.log 2>&1; then

        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "   ${GREEN}✅ ${service} built successfully (${DURATION}s)${NC}"
    else
        echo -e "   ${RED}❌ ${service} build failed${NC}"
        echo "   Check logs: /tmp/build-${service}.log"
        echo ""
        echo "Last 20 lines of build log:"
        tail -20 /tmp/build-${service}.log
        exit 1
    fi
    echo ""
done

# Build dashboard
echo -e "${BLUE}📦 Building dashboard...${NC}"
echo "   Platform: ${PLATFORM}"
echo "   Image: ${APP_NAME}-dashboard:latest"

START_TIME=$(date +%s)

if docker buildx build \
    --platform ${PLATFORM} \
    --load \
    -f Dockerfile.dashboard \
    -t ${APP_NAME}-dashboard:latest \
    . > /tmp/build-dashboard.log 2>&1; then

    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo -e "   ${GREEN}✅ dashboard built successfully (${DURATION}s)${NC}"
else
    echo -e "   ${RED}❌ dashboard build failed${NC}"
    echo "   Check logs: /tmp/build-dashboard.log"
    echo ""
    echo "Last 20 lines of build log:"
    tail -20 /tmp/build-dashboard.log
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All images built successfully!${NC}"
echo ""

# Verify images
echo -e "${BLUE}📊 Image Summary:${NC}"
echo "=================="
docker images | grep ${APP_NAME} | head -6
echo ""

# Verify platform
echo -e "${BLUE}🔍 Verifying image platforms...${NC}"
for service in "${SERVICES[@]}" dashboard; do
    PLATFORM_CHECK=$(docker inspect ${APP_NAME}-${service}:latest --format '{{.Architecture}}' 2>/dev/null || echo "unknown")
    if [ "$PLATFORM_CHECK" = "amd64" ] || [ "$PLATFORM_CHECK" = "x86_64" ]; then
        echo -e "   ${GREEN}✅ ${service}: ${PLATFORM_CHECK}${NC}"
    else
        echo -e "   ${YELLOW}⚠️  ${service}: ${PLATFORM_CHECK} (expected amd64)${NC}"
    fi
done
echo ""

# Next steps
echo -e "${GREEN}🎉 Build Complete!${NC}"
echo ""
echo "📦 Next steps:"
echo "   1. Save images: ./deploy/vm/transfer-images.sh"
echo "   2. Or deploy directly: ./deploy/vm/deploy.sh"
echo ""
echo "💡 Tip: Building for amd64 on M1 uses emulation and may take 10-20 minutes"
echo "   Consider building during a break or overnight"
