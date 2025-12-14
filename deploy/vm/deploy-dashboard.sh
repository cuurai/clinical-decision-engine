#!/bin/bash
# Deploy dashboard only to VM
# Builds, saves, transfers, and deploys the dashboard with the latest changes

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
APP_NAME=${APP_NAME:-"clinical-decision-engine"}
DEPLOY_DIR=${DEPLOY_DIR:-"/opt/${APP_NAME}"}
SSH_PASS=${SSH_PASS:-"kontnt-mixpost"}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploying Dashboard to VM${NC}"
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

# Step 1: Build dashboard image
echo -e "${GREEN}📦 Building dashboard for linux/amd64...${NC}"
docker build --platform linux/amd64 \
    -f Dockerfile.dashboard \
    -t ${APP_NAME}-dashboard:latest . 2>&1 | grep -E "(Step|Building|built|Successfully|ERROR|WARN)" | tail -5

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "${GREEN}✅ Dashboard built successfully${NC}"
else
    echo -e "${RED}❌ Dashboard build failed${NC}"
    exit 1
fi

echo ""

# Step 2: Save image
echo -e "${GREEN}💾 Saving dashboard image...${NC}"
mkdir -p /tmp/${APP_NAME}-dashboard
rm -rf /tmp/${APP_NAME}-dashboard/*
docker save ${APP_NAME}-dashboard:latest | gzip > /tmp/${APP_NAME}-dashboard/dashboard.tar.gz
echo -e "${GREEN}✅ Image saved${NC}"
echo ""

# Step 3: Transfer to VM
echo -e "${GREEN}📤 Transferring image to VM...${NC}"
remote_copy -r /tmp/${APP_NAME}-dashboard ${VM_USER}@${VM_HOST}:/tmp/
echo -e "${GREEN}✅ Image transferred${NC}"
echo ""

# Step 4: Load image on VM and restart dashboard
echo -e "${GREEN}📥 Loading image and restarting dashboard on VM...${NC}"
remote_exec << EOF
set -e
cd /tmp/${APP_NAME}-dashboard
echo "Loading dashboard image..."
gunzip -c dashboard.tar.gz | docker load
rm -rf /tmp/${APP_NAME}-dashboard

# Restart dashboard service
cd ${DEPLOY_DIR}
if docker-compose ps | grep -q dashboard; then
    echo "Restarting dashboard service..."
    docker-compose up -d --force-recreate dashboard
    echo "✅ Dashboard restarted"
else
    echo "Starting dashboard service..."
    docker-compose up -d dashboard
    echo "✅ Dashboard started"
fi

# Show status
echo ""
echo "Dashboard status:"
docker-compose ps dashboard
EOF

echo ""
echo -e "${GREEN}🎉 Dashboard deployment complete!${NC}"
echo ""
echo "Dashboard should be available at:"
echo "  http://${VM_HOST}/cde (via Traefik)"
echo "  http://${VM_HOST}:8081 (direct)"
echo ""
echo "To view logs:"
echo "  ssh ${VM_USER}@${VM_HOST} 'cd ${DEPLOY_DIR} && docker-compose logs -f dashboard'"

# Cleanup local temp files
rm -rf /tmp/${APP_NAME}-dashboard
