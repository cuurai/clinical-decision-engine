#!/bin/bash
# Create .env file on VM - run this ON THE VM

DEPLOY_DIR=${DEPLOY_DIR:-"/opt/clinical-decision-engine"}

cat > ${DEPLOY_DIR}/.env << 'EOF'
APP_NAME=clinical-decision-engine

# Supabase Database Connection (CRITICAL - line 3)
# Get this from Supabase Dashboard → Settings → Database → Connection string
# Format: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Service Ports (VM deployment)
DECISION_INTELLIGENCE_PORT=3100
PATIENT_CLINICAL_DATA_PORT=3101
KNOWLEDGE_EVIDENCE_PORT=3102
WORKFLOW_CARE_PATHWAYS_PORT=3103
INTEGRATION_INTEROPERABILITY_PORT=3104
DASHBOARD_PORT=8081

# API Configuration
VITE_API_BASE_URL=http://34.136.153.216:3100
VM_HOST=34.136.153.216
EOF

echo "✅ .env file created at ${DEPLOY_DIR}/.env"
echo ""
echo "⚠️  IMPORTANT: Update the DATABASE_URL in .env file with your Supabase connection string!"
echo "   Get it from: Supabase Dashboard → Settings → Database"
echo "   nano ${DEPLOY_DIR}/.env"
