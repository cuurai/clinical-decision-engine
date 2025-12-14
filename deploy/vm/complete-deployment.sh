#!/bin/bash
# Complete the deployment - transfer images and deploy to VM

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
APP_NAME=${APP_NAME:-"clinical-decision-engine"}
DEPLOY_DIR=${DEPLOY_DIR:-"/opt/${APP_NAME}"}
SSH_PASS=${SSH_PASS:-"kontnt-mixpost"}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Completing Deployment to VM${NC}"
echo "VM: ${VM_USER}@${VM_HOST}"
echo ""

# Check if images exist locally
echo -e "${GREEN}📦 Checking local images...${NC}"
MISSING_IMAGES=()
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
    if ! docker images | grep -q "${APP_NAME}-${service}"; then
        MISSING_IMAGES+=("${APP_NAME}-${service}")
    fi
done

if [ ${#MISSING_IMAGES[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Missing images: ${MISSING_IMAGES[*]}${NC}"
    echo "Building missing images..."
    # Build missing images
    for img in "${MISSING_IMAGES[@]}"; do
        service=$(echo $img | sed "s/${APP_NAME}-//")
        if [ "$service" = "dashboard" ]; then
            docker build -f Dockerfile.dashboard -t $img:latest .
        else
            docker build -f Dockerfile.service --build-arg SERVICE_NAME=$service -t $img:latest .
        fi
    done
fi

echo -e "${GREEN}✅ All images ready${NC}"
echo ""

# Save images
echo -e "${GREEN}💾 Saving images...${NC}"
mkdir -p /tmp/${APP_NAME}-images
rm -rf /tmp/${APP_NAME}-images/*

for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
    echo "Saving ${APP_NAME}-${service}..."
    docker save ${APP_NAME}-${service}:latest | gzip > /tmp/${APP_NAME}-images/${service}.tar.gz
done

echo -e "${GREEN}✅ Images saved${NC}"
echo ""

# Transfer to VM
echo -e "${GREEN}📤 Transferring to VM...${NC}"
if command -v sshpass &> /dev/null && [ -n "$SSH_PASS" ]; then
    export SSHPASS="$SSH_PASS"
    sshpass -e scp -o StrictHostKeyChecking=no -r /tmp/${APP_NAME}-images ${VM_USER}@${VM_HOST}:/tmp/
else
    scp -r /tmp/${APP_NAME}-images ${VM_USER}@${VM_HOST}:/tmp/
fi

echo -e "${GREEN}✅ Images transferred${NC}"
echo ""

# Load and deploy on VM
echo -e "${GREEN}📥 Loading images and deploying on VM...${NC}"
if command -v sshpass &> /dev/null && [ -n "$SSH_PASS" ]; then
    export SSHPASS="$SSH_PASS"
    sshpass -e ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_HOST} << EOF
set -e
cd /tmp/${APP_NAME}-images
for img in *.tar.gz; do
    echo "Loading \${img}..."
    gunzip -c \${img} | docker load
done
rm -rf /tmp/${APP_NAME}-images

# Create deployment directory
sudo mkdir -p ${DEPLOY_DIR}
sudo chown \$(whoami):\$(whoami) ${DEPLOY_DIR}

# Copy docker-compose file
# Note: You'll need to copy docker-compose.vm.yml manually or use the one from deployment
echo "Images loaded. Next steps:"
echo "1. Copy docker-compose.vm.yml to ${DEPLOY_DIR}/docker-compose.yml"
echo "2. Create .env file in ${DEPLOY_DIR}"
echo "3. Run: cd ${DEPLOY_DIR} && docker-compose up -d"
EOF
else
    ssh ${VM_USER}@${VM_HOST} << EOF
set -e
cd /tmp/${APP_NAME}-images
for img in *.tar.gz; do
    echo "Loading \${img}..."
    gunzip -c \${img} | docker load
done
rm -rf /tmp/${APP_NAME}-images

sudo mkdir -p ${DEPLOY_DIR}
sudo chown \$(whoami):\$(whoami) ${DEPLOY_DIR}

echo "Images loaded. Next steps:"
echo "1. Copy docker-compose.vm.yml to ${DEPLOY_DIR}/docker-compose.yml"
echo "2. Create .env file in ${DEPLOY_DIR}"
echo "3. Run: cd ${DEPLOY_DIR} && docker-compose up -d"
EOF
fi

echo ""
echo -e "${GREEN}🎉 Images loaded on VM!${NC}"
echo ""
echo "Next: Copy docker-compose.yml and deploy:"
echo "  scp deploy/vm/docker-compose.vm.yml ${VM_USER}@${VM_HOST}:${DEPLOY_DIR}/docker-compose.yml"
echo "  ssh ${VM_USER}@${VM_HOST} 'cd ${DEPLOY_DIR} && docker-compose up -d'"
