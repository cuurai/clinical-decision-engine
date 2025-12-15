# VM Deployment Guide

This guide explains how to deploy the Clinical Decision Engine to a VM using Docker containers.

## Prerequisites

1. **SSH Access**: You need SSH access to the VM
2. **Docker**: Docker and Docker Compose must be installed on the VM
3. **Local Docker**: Docker must be installed locally to build images
4. **Network Access**: Ensure ports are open (see Port Configuration below)

## Deployment Options

The VM supports two deployment configurations:

1. **Direct Port Exposure** (`docker-compose.vm.yml`) - Services exposed directly on ports 3100-3104, 8081
2. **Traefik Routing** (`docker-compose.traefik.yml`) - Services routed through Traefik reverse proxy (recommended if Traefik is already running)

## Port Configuration

Since the VM already has other Docker apps, we use different ports to avoid conflicts:

| Service                      | Internal Port | External Port (VM) | Traefik Path              |
| ---------------------------- | ------------- | ------------------ | ------------------------- |
| Dashboard                    | 8080          | 8081               | `/cde`                    |
| Decision Intelligence        | 3000          | 3100               | `/api/decision-intelligence` |
| Patient Clinical Data        | 3001          | 3101               | `/api/patient-clinical-data` |
| Knowledge Evidence           | 3002          | 3102               | `/api/knowledge-evidence`   |
| Workflow Care Pathways       | 3003          | 3103               | `/api/workflow-care-pathways` |
| Integration Interoperability | 3004          | 3104               | `/api/integration-interoperability` |
| PostgreSQL                   | 5432          | 5433               | N/A (internal only)       |

## Quick Deployment

### Option 1: Automated Deployment Script (Recommended)

```bash
# Set environment variables
export VM_HOST=34.136.153.216
export VM_USER=info  # or root
export SSH_PASS=your-password  # Optional, if using password auth

# Run deployment script
chmod +x deploy/vm/deploy.sh
./deploy/vm/deploy.sh
```

The script will:
1. Build all Docker images locally
2. Save images to compressed tar files
3. Transfer images to VM
4. Load images on VM
5. Copy docker-compose.yml
6. Deploy services

### Option 2: Step-by-Step Manual Deployment

#### Step 1: Build Images Locally

```bash
# Build all service images
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability; do
    docker build -f Dockerfile.service \
        --build-arg SERVICE_NAME=$service \
        -t clinical-decision-engine-${service}:latest .
done

# Build dashboard
docker build -f Dockerfile.dashboard \
    -t clinical-decision-engine-dashboard:latest .
```

#### Step 2: Save and Transfer Images

Use the helper script:

```bash
# Save and transfer images
./deploy/vm/transfer-images.sh

# Or manually:
mkdir -p /tmp/clinical-decision-engine-images
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
    docker save clinical-decision-engine-${service}:latest | gzip > /tmp/clinical-decision-engine-images/${service}.tar.gz
done

# Transfer to VM
scp -r /tmp/clinical-decision-engine-images info@34.136.153.216:/tmp/

# Load images on VM
ssh info@34.136.153.216 << EOF
cd /tmp/clinical-decision-engine-images
for img in *.tar.gz; do
    echo "Loading \$img..."
    gunzip -c \$img | docker load
done
rm -rf /tmp/clinical-decision-engine-images
EOF
```

#### Step 3: Choose Docker Compose Configuration

**⚠️ IMPORTANT: Use Supabase docker-compose files** (no local PostgreSQL container)

**If Traefik is running** (recommended):
```bash
scp deploy/vm/docker-compose.traefik-supabase.yml info@34.136.153.216:/opt/clinical-decision-engine/docker-compose.yml
```

**If using direct port exposure**:
```bash
scp deploy/vm/docker-compose-supabase.yml info@34.136.153.216:/opt/clinical-decision-engine/docker-compose.yml
```

#### Step 4: Create Environment File

```bash
# Use the helper script
./deploy/vm/create-env.sh

# Or manually create .env on VM
ssh info@34.136.153.216
cd /opt/clinical-decision-engine
nano .env  # See Environment Configuration section below
```

#### Step 5: Deploy on VM

```bash
ssh info@34.136.153.216 << EOF
cd /opt/clinical-decision-engine
docker-compose down 2>/dev/null || true
docker-compose up -d
docker-compose ps
EOF
```

## Environment Configuration

### ⚠️ CRITICAL: .env File Required

**The `.env` file is REQUIRED for all Docker deployments.** Docker Compose reads this file to configure services, database connections, and ports.

**Location:** `/opt/clinical-decision-engine/.env` on VM

### Create .env File

**Option 1: Use Helper Script (Recommended)**
```bash
# On VM
./deploy/vm/create-env.sh
```

**Option 2: Manual Creation**
```bash
ssh info@34.136.153.216
cd /opt/clinical-decision-engine
nano .env
```

### Example .env Content

**IMPORTANT:** Line 3 contains the critical Supabase connection string (`DATABASE_URL`):

```env
# Application name (for container/network names)
APP_NAME=clinical-decision-engine

# Supabase Database Connection (CRITICAL - line 3)
# Get this from Supabase Dashboard → Settings → Database
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Service Ports (external ports on VM)
DECISION_INTELLIGENCE_PORT=3100
PATIENT_CLINICAL_DATA_PORT=3101
KNOWLEDGE_EVIDENCE_PORT=3102
WORKFLOW_CARE_PATHWAYS_PORT=3103
INTEGRATION_INTEROPERABILITY_PORT=3104
DASHBOARD_PORT=8081

# Dashboard API URL
VITE_API_BASE_URL=http://34.136.153.216:3100
VM_HOST=34.136.153.216
```

**Supabase Connection String:**
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`
- Find it in: Supabase Dashboard → Settings → Database → Connection string
- **URL-encode special characters** in password (e.g., `@` becomes `%40`)

## Managing Services

### View Logs

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose logs -f'
```

### View Logs for Specific Service

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose logs -f decision-intelligence'
```

### Stop Services

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose down'
```

### Start Services

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose up -d'
```

### Restart a Service

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose restart decision-intelligence'
```

### Check Service Status

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose ps'
```

## Updating Services

### Update a Single Service

```bash
# 1. Build new image locally
docker build -f Dockerfile.service \
    --build-arg SERVICE_NAME=decision-intelligence \
    -t clinical-decision-engine-decision-intelligence:latest .

# 2. Save and transfer
docker save clinical-decision-engine-decision-intelligence:latest | gzip > /tmp/decision-intelligence.tar.gz
scp /tmp/decision-intelligence.tar.gz root@34.136.153.216:/tmp/

# 3. Load and restart on VM
ssh root@34.136.153.216 << EOF
gunzip -c /tmp/decision-intelligence.tar.gz | docker load
cd /opt/clinical-decision-engine
docker-compose up -d --no-deps decision-intelligence
rm /tmp/decision-intelligence.tar.gz
EOF
```

### Update All Services

```bash
# Use the deployment script again
./deploy/vm/deploy.sh
```

## Firewall Configuration

The VM needs to have the following ports open in the firewall:

- **8081**: Dashboard
- **3100**: Decision Intelligence Service
- **3101**: Patient Clinical Data Service
- **3102**: Knowledge Evidence Service
- **3103**: Workflow Care Pathways Service
- **3104**: Integration Interoperability Service
- **5433**: PostgreSQL (optional, only if external access needed)

### Setup Firewall Automatically

```bash
# Copy firewall setup script to VM
scp deploy/vm/setup-firewall.sh root@34.136.153.216:/tmp/

# Run on VM
ssh root@34.136.153.216 "chmod +x /tmp/setup-firewall.sh && sudo /tmp/setup-firewall.sh"
```

### Manual Firewall Setup

#### For UFW (Ubuntu/Debian):
```bash
sudo ufw allow 8081/tcp
sudo ufw allow 3100:3104/tcp
sudo ufw allow 5433/tcp
sudo ufw reload
```

#### For firewalld (CentOS/RHEL):
```bash
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --permanent --add-port=3100-3104/tcp
sudo firewall-cmd --permanent --add-port=5433/tcp
sudo firewall-cmd --reload
```

#### For iptables:
```bash
sudo iptables -A INPUT -p tcp --dport 8081 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3100:3104 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 5433 -j ACCEPT
# Save rules (method depends on your distribution)
```

### Check Firewall Status

```bash
# UFW
sudo ufw status

# firewalld
sudo firewall-cmd --list-ports

# iptables
sudo iptables -L -n | grep -E "(8081|3100|3101|3102|3103|3104|5433)"
```

### GCP Firewall Rules

If this is a GCP VM, you also need to configure GCP firewall rules:

```bash
# Create firewall rule for dashboard
gcloud compute firewall-rules create clinical-decision-engine-dashboard \
    --allow tcp:8081 \
    --source-ranges 0.0.0.0/0 \
    --description "Clinical Decision Engine Dashboard"

# Create firewall rule for services
gcloud compute firewall-rules create clinical-decision-engine-services \
    --allow tcp:3100-3104 \
    --source-ranges 0.0.0.0/0 \
    --description "Clinical Decision Engine Services"
```

## Troubleshooting

### Port Already in Use

If you get port conflicts, update the ports in `deploy/vm/docker-compose.vm.yml` and your `.env` file.

### Database Connection Issues

Check that:

1. PostgreSQL container is running: `docker-compose ps`
2. Database URL in `.env` matches the container name
3. Network connectivity: `docker-compose exec decision-intelligence ping postgres`

### Service Won't Start

Check logs:

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose logs decision-intelligence'
```

### Out of Disk Space

Clean up old images:

```bash
ssh root@34.136.153.216 'docker system prune -a'
```

### Network Issues

Check network:

```bash
ssh root@34.136.153.216 'docker network ls'
ssh root@34.136.153.216 'docker network inspect clinical-decision-engine-network'
```

## Security Considerations

1. **Change Default Passwords**: Update PostgreSQL password in `.env`
2. **SSH Key Authentication**: Use SSH keys instead of passwords
3. **Firewall Rules**: Only expose necessary ports
4. **Environment Variables**: Keep `.env` file secure (chmod 600)
5. **Regular Updates**: Keep Docker images updated

## Available Scripts

The `deploy/vm/` directory contains several helper scripts:

### Deployment Scripts
- `deploy.sh` - Complete automated deployment (build, transfer, deploy)
- `complete-deployment.sh` - Transfer images and prepare deployment
- `transfer-images.sh` - Save and transfer Docker images to VM
- `load-and-deploy.sh` - Load images on VM (run on VM)

### Build Scripts
- `cleanup-and-rebuild.sh` - Clean old images and rebuild for linux/amd64
- `build-on-vm.sh` - Build images directly on VM (alternative approach)

### Service-Specific Scripts
- `deploy-dashboard.sh` - Deploy only dashboard service
- `deploy-decision-intelligence.sh` - Deploy only decision-intelligence service
- `manual-rebuild-decision-intelligence.sh` - Manual rebuild workflow for one service

### Utility Scripts
- `check-status.sh` - Comprehensive status check (run on VM)
- `check-config.sh` - Check firewall and Traefik configuration (run on VM)
- `setup-firewall.sh` - Setup firewall rules (run on VM)
- `setup-on-vm.sh` - Initial VM setup
- `create-env.sh` - Create .env file
- `add-firewall-rule.sh` - Add GCP firewall rule
- `cleanup-remote.sh` - Clean up old images on VM

## Accessing Services

### With Direct Port Exposure
- **Dashboard**: http://34.136.153.216:8081
- **Decision Intelligence API**: http://34.136.153.216:3100
- **Patient Clinical Data API**: http://34.136.153.216:3101
- **Knowledge Evidence API**: http://34.136.153.216:3102
- **Workflow Care Pathways API**: http://34.136.153.216:3103
- **Integration Interoperability API**: http://34.136.153.216:3104

### With Traefik Routing
- **Dashboard**: http://34.136.153.216/cde
- **Decision Intelligence API**: http://34.136.153.216/api/decision-intelligence
- **Patient Clinical Data API**: http://34.136.153.216/api/patient-clinical-data
- **Knowledge Evidence API**: http://34.136.153.216/api/knowledge-evidence
- **Workflow Care Pathways API**: http://34.136.153.216/api/workflow-care-pathways
- **Integration Interoperability API**: http://34.136.153.216/api/integration-interoperability

See [TRAEFIK-SETUP.md](./TRAEFIK-SETUP.md) for Traefik-specific configuration details.

## Monitoring

### Health Checks

```bash
# Check all services
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose ps'

# Check specific service health
curl http://34.136.153.216:3100/health
```

### Resource Usage

```bash
ssh root@34.136.153.216 'docker stats'
```

## Backup

### Database Backup

```bash
ssh root@34.136.153.216 << EOF
cd /opt/clinical-decision-engine
docker-compose exec -T postgres pg_dump -U postgres clinical_decision_engine > backup_\$(date +%Y%m%d_%H%M%S).sql
EOF
```

### Restore Database

```bash
ssh root@34.136.153.216 << EOF
cd /opt/clinical-decision-engine
docker-compose exec -T postgres psql -U postgres clinical_decision_engine < backup_file.sql
EOF
```
