# VM Deployment Guide

This guide explains how to deploy the Clinical Decision Engine to a VM at `34.136.153.216`.

## Prerequisites

1. **SSH Access**: You need SSH access to the VM
2. **Docker**: Docker and Docker Compose must be installed on the VM
3. **Local Docker**: Docker must be installed locally to build images
4. **Network Access**: Ensure ports are open (see Port Configuration below)

## Port Configuration

Since the VM already has other Docker apps, we use different ports to avoid conflicts:

| Service                      | Internal Port | External Port (VM) |
| ---------------------------- | ------------- | ------------------ |
| Dashboard                    | 8080          | 8081               |
| Decision Intelligence        | 3000          | 3100               |
| Patient Clinical Data        | 3001          | 3101               |
| Knowledge Evidence           | 3002          | 3102               |
| Workflow Care Pathways       | 3003          | 3103               |
| Integration Interoperability | 3004          | 3104               |
| PostgreSQL                   | 5432          | 5433               |

## Quick Deployment

### Option 1: Automated Deployment Script

```bash
# Set environment variables
export VM_HOST=34.136.153.216
export VM_USER=root
export SSH_KEY=/path/to/your/ssh/key  # Optional

# Run deployment script
chmod +x deploy/vm/deploy.sh
./deploy/vm/deploy.sh
```

### Option 2: Manual Deployment

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

```bash
# Save images
mkdir -p /tmp/clinical-decision-engine-images
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
    docker save clinical-decision-engine-${service}:latest | gzip > /tmp/clinical-decision-engine-images/${service}.tar.gz
done

# Transfer to VM
scp -r /tmp/clinical-decision-engine-images root@34.136.153.216:/tmp/

# Load images on VM
ssh root@34.136.153.216 << EOF
cd /tmp/clinical-decision-engine-images
for img in *.tar.gz; do
    echo "Loading \$img..."
    gunzip -c \$img | docker load
done
rm -rf /tmp/clinical-decision-engine-images
EOF
```

#### Step 3: Copy Configuration Files

```bash
# Copy docker-compose file
scp deploy/vm/docker-compose.vm.yml root@34.136.153.216:/opt/clinical-decision-engine/docker-compose.yml

# Copy environment file (create .env first)
scp .env root@34.136.153.216:/opt/clinical-decision-engine/.env
```

#### Step 4: Deploy on VM

```bash
ssh root@34.136.153.216 << EOF
cd /opt/clinical-decision-engine
docker-compose down 2>/dev/null || true
docker-compose up -d
docker-compose ps
EOF
```

## Environment Configuration

Create a `.env` file on the VM:

```bash
ssh root@34.136.153.216
cd /opt/clinical-decision-engine
nano .env
```

Example `.env` content:

```env
# Application name (for container/network names)
APP_NAME=clinical-decision-engine

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=clinical_decision_engine
POSTGRES_PORT=5433

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

# Database URL (internal Docker network)
DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/clinical_decision_engine
```

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

## Accessing Services

After deployment, services will be available at:

- **Dashboard**: http://34.136.153.216:8081
- **Decision Intelligence API**: http://34.136.153.216:3100
- **Patient Clinical Data API**: http://34.136.153.216:3101
- **Knowledge Evidence API**: http://34.136.153.216:3102
- **Workflow Care Pathways API**: http://34.136.153.216:3103
- **Integration Interoperability API**: http://34.136.153.216:3104

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
