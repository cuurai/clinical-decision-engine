#!/bin/bash
set -e

# GCP Deployment Script for Clinical Decision Engine
# This script deploys all services to Google Cloud Run

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-"your-gcp-project-id"}
REGION=${GCP_REGION:-"us-central1"}
IMAGE_NAME=${IMAGE_NAME:-"clinical-decision-engine"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Clinical Decision Engine to GCP${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Set the project
gcloud config set project $PROJECT_ID

# Services configuration
declare -A SERVICES=(
    ["decision-intelligence"]="3000"
    ["patient-clinical-data"]="3001"
    ["knowledge-evidence"]="3002"
    ["workflow-care-pathways"]="3003"
    ["integration-interoperability"]="3004"
)

# Database connection string (should be set as environment variable)
DATABASE_URL=${DATABASE_URL:-""}
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set. Please set it before deploying.${NC}"
    echo "Example: DATABASE_URL=postgresql://user:password@host:5432/dbname"
    exit 1
fi

# Deploy each service to Cloud Run
for service_name in "${!SERVICES[@]}"; do
    port="${SERVICES[$service_name]}"
    service_id="${IMAGE_NAME}-${service_name}"
    image="${IMAGE_NAME}-${service_name}:latest"

    echo -e "${GREEN}📦 Deploying ${service_name}...${NC}"

    gcloud run deploy $service_id \
        --image gcr.io/$PROJECT_ID/$image \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port $port \
        --set-env-vars "DATABASE_URL=$DATABASE_URL,NODE_ENV=production,PORT=$port,HOST=0.0.0.0" \
        --memory 512Mi \
        --cpu 1 \
        --timeout 300 \
        --max-instances 10 \
        --min-instances 0 \
        --concurrency 80

    echo -e "${GREEN}✅ ${service_name} deployed${NC}"
    echo ""
done

# Deploy Dashboard
echo -e "${GREEN}📦 Deploying Dashboard...${NC}"
dashboard_id="${IMAGE_NAME}-dashboard"

# Get service URLs for dashboard env vars
DECISION_INTELLIGENCE_URL=$(gcloud run services describe ${IMAGE_NAME}-decision-intelligence --region $REGION --format 'value(status.url)')
PATIENT_CLINICAL_DATA_URL=$(gcloud run services describe ${IMAGE_NAME}-patient-clinical-data --region $REGION --format 'value(status.url)')
KNOWLEDGE_EVIDENCE_URL=$(gcloud run services describe ${IMAGE_NAME}-knowledge-evidence --region $REGION --format 'value(status.url)')
WORKFLOW_CARE_PATHWAYS_URL=$(gcloud run services describe ${IMAGE_NAME}-workflow-care-pathways --region $REGION --format 'value(status.url)')
INTEGRATION_INTEROPERABILITY_URL=$(gcloud run services describe ${IMAGE_NAME}-integration-interoperability --region $REGION --format 'value(status.url)')

gcloud run deploy $dashboard_id \
    --image gcr.io/$PROJECT_ID/${IMAGE_NAME}-dashboard:latest \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars "NODE_ENV=production,VITE_API_BASE_URL=$DECISION_INTELLIGENCE_URL" \
    --memory 256Mi \
    --cpu 1 \
    --timeout 60 \
    --max-instances 5 \
    --min-instances 0 \
    --concurrency 100

echo -e "${GREEN}✅ Dashboard deployed${NC}"
echo ""

# Print service URLs
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Service URLs:"
for service_name in "${!SERVICES[@]}"; do
    service_id="${IMAGE_NAME}-${service_name}"
    url=$(gcloud run services describe $service_id --region $REGION --format 'value(status.url)')
    echo "  ${service_name}: $url"
done

dashboard_url=$(gcloud run services describe $dashboard_id --region $REGION --format 'value(status.url)')
echo "  Dashboard: $dashboard_url"

