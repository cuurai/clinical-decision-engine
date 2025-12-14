#!/bin/bash
# Create .env file on VM - run this ON THE VM

DEPLOY_DIR=${DEPLOY_DIR:-"/opt/clinical-decision-engine"}

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

echo "✅ .env file created at ${DEPLOY_DIR}/.env"
echo ""
echo "⚠️  IMPORTANT: Update the POSTGRES_PASSWORD in .env file!"
echo "   nano ${DEPLOY_DIR}/.env"
