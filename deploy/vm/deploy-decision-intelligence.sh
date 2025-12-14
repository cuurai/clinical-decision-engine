#!/bin/bash
# Deploy decision-intelligence service to VM
# Builds, saves, transfers, and deploys the decision-intelligence API

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
APP_NAME=${APP_NAME:-"clinical-decision-engine"}
DEPLOY_DIR=${DEPLOY_DIR:-"/opt/${APP_NAME}"}
SSH_PASS=${SSH_PASS:-"kontnt-mixpost"}
SERVICE_NAME="decision-intelligence"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying Decision Intelligence Service to VM${NC}"
echo "VM: ${VM_USER}@${VM_HOST}"
echo ""

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

# Function to execute command on remote VM
remote_exec() {
    if command -v sshpass &> /dev/null && [ -n "$SSH_PASS" ]; then
        export SSHPASS="$SSH_PASS"
        sshpass -e ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_HOST} "$@"
    else
        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_HOST} "$@"
    fi
}

# Function to copy files to remote VM
remote_copy() {
    if command -v sshpass &> /dev/null && [ -n "$SSH_PASS" ]; then
        export SSHPASS="$SSH_PASS"
        sshpass -e scp -o StrictHostKeyChecking=no "$@"
    else
        scp -o StrictHostKeyChecking=no "$@"
    fi
}

# Step 1: Build service image
echo -e "${GREEN}📦 Building ${SERVICE_NAME} for linux/amd64...${NC}"
docker build --platform linux/amd64 \
    -f Dockerfile.service \
    --build-arg SERVICE_NAME=${SERVICE_NAME} \
    -t ${APP_NAME}-${SERVICE_NAME}:latest . 2>&1 | grep -E "(Step|Building|built|Successfully|ERROR|WARN)" | tail -5

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ ${SERVICE_NAME} built successfully${NC}"
else
    echo -e "${RED}❌ ${SERVICE_NAME} build failed${NC}"
    exit 1
fi

echo ""

# Step 2: Save image
echo -e "${GREEN}💾 Saving ${SERVICE_NAME} image...${NC}"
mkdir -p /tmp/${APP_NAME}-${SERVICE_NAME}
rm -rf /tmp/${APP_NAME}-${SERVICE_NAME}/*
docker save ${APP_NAME}-${SERVICE_NAME}:latest | gzip > /tmp/${APP_NAME}-${SERVICE_NAME}/${SERVICE_NAME}.tar.gz
echo -e "${GREEN}✅ Image saved${NC}"
echo ""

# Step 3: Transfer to VM
echo -e "${GREEN}📤 Transferring image to VM...${NC}"
remote_copy -r /tmp/${APP_NAME}-${SERVICE_NAME} ${VM_USER}@${VM_HOST}:/tmp/
echo -e "${GREEN}✅ Image transferred${NC}"
echo ""

# Step 4: Load image on VM and update docker-compose
echo -e "${GREEN}📥 Loading image and deploying ${SERVICE_NAME} on VM...${NC}"
remote_exec << EOF
set -e
cd /tmp/${APP_NAME}-${SERVICE_NAME}
echo "Loading ${SERVICE_NAME} image..."
gunzip -c ${SERVICE_NAME}.tar.gz | docker load
rm -rf /tmp/${APP_NAME}-${SERVICE_NAME}

# Check if PostgreSQL is running, start it if needed
cd ${DEPLOY_DIR}
if ! docker ps | grep -q "${APP_NAME}-db\|postgres"; then
    echo "Starting PostgreSQL database..."
    docker-compose up -d postgres
    echo "Waiting for PostgreSQL to be healthy..."
    sleep 10
fi

# Start decision-intelligence service
if docker-compose ps | grep -q "${SERVICE_NAME}"; then
    echo "Restarting ${SERVICE_NAME} service..."
    docker-compose up -d --force-recreate ${SERVICE_NAME}
    echo "✅ ${SERVICE_NAME} restarted"
else
    echo "Starting ${SERVICE_NAME} service..."
    docker-compose up -d ${SERVICE_NAME}
    echo "✅ ${SERVICE_NAME} started"
fi

# Show status
echo ""
echo "${SERVICE_NAME} status:"
docker-compose ps ${SERVICE_NAME}
echo ""
echo "Logs (last 10 lines):"
docker-compose logs --tail=10 ${SERVICE_NAME}
EOF

echo ""
echo -e "${GREEN}🎉 ${SERVICE_NAME} deployment complete!${NC}"
echo ""
echo "Service should be available at:"
echo "  http://${VM_HOST}:3100 (direct)"
echo ""
echo "To view logs:"
echo "  ssh ${VM_USER}@${VM_HOST} 'cd ${DEPLOY_DIR} && docker-compose logs -f ${SERVICE_NAME}'"

# Cleanup local temp files
rm -rf /tmp/${APP_NAME}-${SERVICE_NAME}
