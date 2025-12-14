# Docker Deployment Guide

This guide explains how to build and deploy the Clinical Decision Engine using Docker containers for GCP.

## Overview

The application consists of:

- **5 Microservices** (Fastify/Node.js backend services)
- **1 Dashboard** (React/Vite frontend)
- **1 Database** (PostgreSQL)

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- GCP account with Cloud Build and Cloud Run enabled (for GCP deployment)

## Local Development with Docker

### Quick Start

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=clinical_decision_engine
POSTGRES_PORT=5432

# Services
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/clinical_decision_engine

# Dashboard
VITE_API_BASE_URL=http://localhost:3000
```

### Accessing Services

- **Dashboard**: http://localhost:8080
- **Decision Intelligence**: http://localhost:3000
- **Patient Clinical Data**: http://localhost:3001
- **Knowledge Evidence**: http://localhost:3002
- **Workflow Care Pathways**: http://localhost:3003
- **Integration Interoperability**: http://localhost:3004
- **PostgreSQL**: localhost:5432

## Building Individual Images

### Build a Single Service

```bash
# Build decision-intelligence service
docker build -f Dockerfile.service \
  --build-arg SERVICE_NAME=decision-intelligence \
  -t clinical-decision-engine-decision-intelligence:latest .

# Build dashboard
docker build -f Dockerfile.dashboard \
  -t clinical-decision-engine-dashboard:latest .
```

### Build All Services

```bash
# Build main container (includes all services)
docker build -f Dockerfile -t clinical-decision-engine:latest .
```

## GCP Deployment

### Setup

1. **Enable required APIs**:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

2. **Set your project ID**:

```bash
export GCP_PROJECT_ID=your-project-id
gcloud config set project $GCP_PROJECT_ID
```

3. **Configure Cloud Build**:
   - Update `cloudbuild.yaml` with your project ID
   - Set substitution variables:
     ```bash
     _GCP_PROJECT_ID=your-project-id
     _IMAGE_NAME=clinical-decision-engine
     _REGION=us-central1
     ```

### Build Images with Cloud Build

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Or trigger from Git repository
gcloud builds triggers create github \
  --repo-name=clinical-decision-engine \
  --repo-owner=your-org \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml
```

### Deploy to Cloud Run

#### Option 1: Using Deployment Script

```bash
# Make script executable
chmod +x deploy/gcp/deploy.sh

# Set environment variables
export GCP_PROJECT_ID=your-project-id
export GCP_REGION=us-central1
export DATABASE_URL=postgresql://user:password@host:5432/dbname

# Deploy all services
./deploy/gcp/deploy.sh
```

#### Option 2: Manual Deployment

```bash
# Deploy decision-intelligence service
gcloud run deploy clinical-decision-engine-decision-intelligence \
  --image gcr.io/$GCP_PROJECT_ID/clinical-decision-engine-decision-intelligence:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "DATABASE_URL=$DATABASE_URL,NODE_ENV=production" \
  --memory 512Mi \
  --cpu 1

# Repeat for other services...
```

#### Option 3: Using Cloud Run YAML

```bash
# Update PROJECT_ID in cloud-run.yaml
sed -i 's/PROJECT_ID/your-project-id/g' deploy/gcp/cloud-run.yaml

# Deploy using YAML
gcloud run services replace deploy/gcp/cloud-run.yaml --region us-central1
```

### Database Setup

For production, use Cloud SQL:

```bash
# Create Cloud SQL instance
gcloud sql instances create clinical-decision-engine-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create clinical_decision_engine \
  --instance=clinical-decision-engine-db

# Get connection name
gcloud sql instances describe clinical-decision-engine-db \
  --format='value(connectionName)'

# Update DATABASE_URL to use Cloud SQL proxy format:
# postgresql://user:password@/dbname?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

### Secrets Management

Store sensitive data in Secret Manager:

```bash
# Create database URL secret
echo -n "postgresql://user:password@host:5432/dbname" | \
  gcloud secrets create database-url --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Dockerfile Structure

### Main Dockerfile (`Dockerfile`)

Multi-stage build that creates a single container with all services. Useful for:

- Local development
- Single-container deployments
- Testing

### Service Dockerfile (`Dockerfile.service`)

Builds individual microservice containers. Used for:

- Microservices architecture
- Cloud Run deployments
- Scalable production deployments

### Dashboard Dockerfile (`Dockerfile.dashboard`)

Builds the React frontend as a static site. Uses `serve` to serve static files.

## Troubleshooting

### Build Failures

1. **Prisma client generation fails**:

   - Ensure database is accessible during build
   - Check `DATABASE_URL` is set correctly
   - Verify Prisma schema files are present

2. **Node modules not found**:

   - Clear Docker cache: `docker builder prune`
   - Rebuild without cache: `docker build --no-cache`

3. **Port conflicts**:
   - Check if ports are already in use
   - Update port mappings in `docker-compose.yml`

### Runtime Issues

1. **Database connection errors**:

   - Verify `DATABASE_URL` is correct
   - Check network connectivity
   - Ensure database is running and accessible

2. **Service not starting**:

   - Check logs: `docker-compose logs <service-name>`
   - Verify environment variables
   - Check service health endpoints

3. **Dashboard can't reach APIs**:
   - Update `VITE_API_BASE_URL` to point to service URLs
   - Check CORS configuration
   - Verify services are running

## Production Considerations

1. **Security**:

   - Use Secret Manager for sensitive data
   - Enable authentication on Cloud Run services
   - Use private IP for Cloud SQL
   - Implement proper CORS policies

2. **Performance**:

   - Configure appropriate resource limits
   - Enable Cloud CDN for dashboard
   - Use connection pooling for database
   - Implement caching strategies

3. **Monitoring**:

   - Enable Cloud Logging
   - Set up Cloud Monitoring alerts
   - Configure error reporting
   - Monitor service health endpoints

4. **Scaling**:
   - Configure autoscaling in Cloud Run
   - Set appropriate min/max instances
   - Use load balancing for high traffic
   - Consider regional deployments

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/setup-gcloud@v1
      - run: gcloud builds submit --config cloudbuild.yaml
      - run: ./deploy/gcp/deploy.sh
```

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Docker Documentation](https://docs.docker.com/)
- [Prisma Documentation](https://www.prisma.io/docs)

