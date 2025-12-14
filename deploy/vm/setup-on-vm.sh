#!/bin/bash
# Complete setup script - run this ON THE VM after images are loaded

set -e

DEPLOY_DIR="/opt/clinical-decision-engine"

echo "🚀 Setting up Clinical Decision Engine"
echo "======================================"
echo ""

# Create directory
echo "📁 Creating deployment directory..."
sudo mkdir -p ${DEPLOY_DIR}
sudo chown $USER:$USER ${DEPLOY_DIR}

# Create .env file
echo "⚙️  Creating .env file..."
cat > ${DEPLOY_DIR}/.env << 'EOF'
APP_NAME=clinical-decision-engine
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
VITE_API_BASE_URL=http://34.136.153.216:3100
VM_HOST=34.136.153.216
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/clinical_decision_engine
EOF

echo "✅ .env file created"
echo ""
echo "⚠️  IMPORTANT: Update POSTGRES_PASSWORD in ${DEPLOY_DIR}/.env if needed!"
echo ""

# Check if docker-compose.yml exists
if [ ! -f "${DEPLOY_DIR}/docker-compose.yml" ]; then
    echo "❌ docker-compose.yml not found!"
    echo "   Copy it from your local machine:"
    echo "   scp deploy/vm/docker-compose.vm.yml info@34.136.153.216:${DEPLOY_DIR}/docker-compose.yml"
    exit 1
fi

echo "✅ docker-compose.yml found"
echo ""

# Deploy
echo "🚀 Deploying services..."
cd ${DEPLOY_DIR}
docker-compose down 2>/dev/null || true
docker-compose up -d

echo ""
echo "✅ Deployment started!"
echo ""
echo "📊 Checking status..."
docker-compose ps

echo ""
echo "📝 Next steps:"
echo "1. Check logs: docker-compose logs -f"
echo "2. Configure firewall: sudo firewall-cmd --permanent --add-port=8081/tcp --add-port=3100-3104/tcp && sudo firewall-cmd --reload"
echo "3. Test: curl http://localhost:8081/"
