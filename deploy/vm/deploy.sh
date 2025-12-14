#!/bin/bash
set -e

# VM Deployment Script for Clinical Decision Engine
# Deploys to VM at 34.136.153.216

# Configuration
VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"root"}
APP_NAME=${APP_NAME:-"clinical-decision-engine"}
DEPLOY_DIR=${DEPLOY_DIR:-"/opt/${APP_NAME}"}
SSH_KEY=${SSH_KEY:-""}
SSH_PASS=${SSH_PASS:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Clinical Decision Engine to VM${NC}"
echo "VM Host: $VM_HOST"
echo "Deploy Directory: $DEPLOY_DIR"
echo ""

# Check if SSH is available
if ! command -v ssh &> /dev/null; then
    echo -e "${RED}❌ SSH is not installed. Please install it first.${NC}"
    exit 1
fi

# Build SSH command with optional key or password
SSH_CMD="ssh"
SCP_CMD="scp"

if [ -n "$SSH_KEY" ]; then
    SSH_CMD="ssh -i $SSH_KEY"
    SCP_CMD="scp -i $SSH_KEY"
elif [ -n "$SSH_PASS" ]; then
    # Check if sshpass is available for password authentication
    if command -v sshpass &> /dev/null; then
        SSH_CMD="sshpass -p '$SSH_PASS' ssh -o StrictHostKeyChecking=no"
        SCP_CMD="sshpass -p '$SSH_PASS' scp -o StrictHostKeyChecking=no"
    else
        echo -e "${YELLOW}⚠️  sshpass not found. Installing or using alternative method...${NC}"
        echo -e "${YELLOW}   You can install sshpass with: brew install hudochenkov/sshpass/sshpass (macOS)${NC}"
        echo -e "${YELLOW}   Or use SSH key authentication instead.${NC}"
        # Fallback: use expect or manual password entry
        SSH_CMD="ssh -o StrictHostKeyChecking=no"
        SCP_CMD="scp -o StrictHostKeyChecking=no"
    fi
else
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
    SCP_CMD="scp -o StrictHostKeyChecking=no"
fi

# Build Docker images locally
echo -e "${GREEN}📦 Building Docker images locally...${NC}"

# Build services
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability; do
    echo "Building $service..."
    docker build -f Dockerfile.service \
        --build-arg SERVICE_NAME=$service \
        -t ${APP_NAME}-${service}:latest .
done

# Build dashboard
echo "Building dashboard..."
docker build -f Dockerfile.dashboard \
    -t ${APP_NAME}-dashboard:latest .

echo -e "${GREEN}✅ Images built successfully${NC}"
echo ""

# Save images to tar files
echo -e "${GREEN}💾 Saving images to tar files...${NC}"
mkdir -p /tmp/${APP_NAME}-images

for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
    echo "Saving ${APP_NAME}-${service}..."
    docker save ${APP_NAME}-${service}:latest | gzip > /tmp/${APP_NAME}-images/${service}.tar.gz
done

echo -e "${GREEN}✅ Images saved${NC}"
echo ""

# Create deployment directory on VM
echo -e "${GREEN}📁 Creating deployment directory on VM...${NC}"
$SSH_CMD ${VM_USER}@${VM_HOST} "mkdir -p ${DEPLOY_DIR}"

# Setup firewall (optional - uncomment if needed)
# echo -e "${GREEN}🔥 Setting up firewall...${NC}"
# $SCP_CMD deploy/vm/setup-firewall.sh ${VM_USER}@${VM_HOST}:/tmp/setup-firewall.sh
# $SSH_CMD ${VM_USER}@${VM_HOST} "chmod +x /tmp/setup-firewall.sh && sudo /tmp/setup-firewall.sh"

# Copy docker-compose.yml and environment files
echo -e "${GREEN}📋 Copying configuration files...${NC}"
$SCP_CMD deploy/vm/docker-compose.vm.yml ${VM_USER}@${VM_HOST}:${DEPLOY_DIR}/docker-compose.yml
$SCP_CMD .env.example ${VM_USER}@${VM_HOST}:${DEPLOY_DIR}/.env.example 2>/dev/null || true

# Copy images to VM
echo -e "${GREEN}📤 Copying images to VM...${NC}"
$SCP_CMD -r /tmp/${APP_NAME}-images ${VM_USER}@${VM_HOST}:/tmp/

# Load images on VM
echo -e "${GREEN}📥 Loading images on VM...${NC}"
$SSH_CMD ${VM_USER}@${VM_HOST} << EOF
cd /tmp/${APP_NAME}-images
for img in *.tar.gz; do
    echo "Loading \${img}..."
    gunzip -c \${img} | docker load
done
rm -rf /tmp/${APP_NAME}-images
EOF

# Cleanup local temp files
rm -rf /tmp/${APP_NAME}-images

# Create .env file if it doesn't exist
echo -e "${GREEN}⚙️  Setting up environment...${NC}"
$SSH_CMD ${VM_USER}@${VM_HOST} << EOF
if [ ! -f ${DEPLOY_DIR}/.env ]; then
    echo "Creating .env file from example..."
    if [ -f ${DEPLOY_DIR}/.env.example ]; then
        cp ${DEPLOY_DIR}/.env.example ${DEPLOY_DIR}/.env
    else
        cat > ${DEPLOY_DIR}/.env << EOL
APP_NAME=${APP_NAME}
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=clinical_decision_engine
POSTGRES_PORT=5433
DECISION_INTELLIGENCE_PORT=3100
PATIENT_CLINICAL_DATA_PORT=3101
KNOWLEDGE_EVIDENCE_PORT=3102
WORKFLOW_CARE_PATHWAYS_PORT=3103
INTEGRATION_INTEROPERABILITY_PORT=3104
DASHBOARD_PORT=8081
VITE_API_BASE_URL=http://${VM_HOST}:3100
VM_HOST=${VM_HOST}
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/clinical_decision_engine
EOL
    fi
fi
EOF

# Deploy with docker-compose
echo -e "${GREEN}🚀 Deploying services...${NC}"
$SSH_CMD ${VM_USER}@${VM_HOST} << EOF
cd ${DEPLOY_DIR}
docker-compose down 2>/dev/null || true
docker-compose up -d
docker-compose ps
EOF

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Services are running on:"
echo "  Dashboard: http://${VM_HOST}:8080"
echo "  Decision Intelligence: http://${VM_HOST}:3000"
echo "  Patient Clinical Data: http://${VM_HOST}:3001"
echo "  Knowledge Evidence: http://${VM_HOST}:3002"
echo "  Workflow Care Pathways: http://${VM_HOST}:3003"
echo "  Integration Interoperability: http://${VM_HOST}:3004"
echo ""
echo "To view logs: ssh ${VM_USER}@${VM_HOST} 'cd ${DEPLOY_DIR} && docker-compose logs -f'"
echo "To stop services: ssh ${VM_USER}@${VM_HOST} 'cd ${DEPLOY_DIR} && docker-compose down'"
