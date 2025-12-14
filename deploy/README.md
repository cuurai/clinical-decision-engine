# Deployment Quick Reference

## VM Deployment (34.136.153.216)

```bash
# Quick deploy to VM
make vm-deploy VM_HOST=34.136.153.216 VM_USER=root

# Or use the script directly
./deploy/vm/deploy.sh
```

**Ports used on VM** (to avoid conflicts with existing apps):

- Dashboard: 8081
- Services: 3100-3104
- PostgreSQL: 5433

See [deploy/vm/README.md](vm/README.md) for detailed VM deployment guide.

## Local Development

```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

## Build Individual Services

```bash
# Using Makefile
make build-service SERVICE=decision-intelligence
make build-dashboard

# Or directly with Docker
docker build -f Dockerfile.service --build-arg SERVICE_NAME=decision-intelligence -t clinical-decision-engine-decision-intelligence:latest .
docker build -f Dockerfile.dashboard -t clinical-decision-engine-dashboard:latest .
```

## GCP Deployment

### Prerequisites

```bash
# Set your project
export GCP_PROJECT_ID=your-project-id
export DATABASE_URL=postgresql://user:password@host:5432/dbname

# Enable APIs
make gcp-setup
```

### Build Images

```bash
# Using Cloud Build
make gcp-build PROJECT_ID=$GCP_PROJECT_ID

# Or manually
gcloud builds submit --config cloudbuild.yaml
```

### Deploy to Cloud Run

```bash
# Using deployment script
make gcp-deploy PROJECT_ID=$GCP_PROJECT_ID DATABASE_URL=$DATABASE_URL

# Or manually
./deploy/gcp/deploy.sh
```

## Service URLs

After deployment, services will be available at:

- Dashboard: `https://clinical-decision-engine-dashboard-xxx.run.app`
- Decision Intelligence: `https://clinical-decision-engine-decision-intelligence-xxx.run.app`
- Patient Clinical Data: `https://clinical-decision-engine-patient-clinical-data-xxx.run.app`
- Knowledge Evidence: `https://clinical-decision-engine-knowledge-evidence-xxx.run.app`
- Workflow Care Pathways: `https://clinical-decision-engine-workflow-care-pathways-xxx.run.app`
- Integration Interoperability: `https://clinical-decision-engine-integration-interoperability-xxx.run.app`

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to `production` for production deployments
- `PORT` - Service port (defaults to 3000-3004 for services, 8080 for dashboard)
- `HOST` - Host to bind to (defaults to 0.0.0.0)

For full documentation, see [DOCKER.md](../DOCKER.md).
