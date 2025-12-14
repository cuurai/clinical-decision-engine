# Manual Deployment Steps

Since images are built locally, follow these steps to deploy:

## Step 1: Transfer Images to VM

**On your local machine:**

```bash
# Save images (if not already done)
cd /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine
./deploy/vm/transfer-images.sh

# Transfer images to VM
scp -r /tmp/clinical-decision-engine-images info@34.136.153.216:/tmp/
```

## Step 2: Load Images on VM

**On the VM (SSH into it):**

```bash
# Load all images
cd /tmp/clinical-decision-engine-images
for img in *.tar.gz; do
    echo "Loading $img..."
    gunzip -c $img | docker load
done

# Verify images loaded
docker images | grep clinical-decision-engine
```

## Step 3: Copy docker-compose.yml

**On your local machine:**

```bash
# Copy docker-compose file
scp deploy/vm/docker-compose.vm.yml info@34.136.153.216:/opt/clinical-decision-engine/docker-compose.yml
```

**OR create it manually on VM:**

```bash
# On VM
sudo mkdir -p /opt/clinical-decision-engine
sudo chown $USER:$USER /opt/clinical-decision-engine
cd /opt/clinical-decision-engine
nano docker-compose.yml
# Paste the content from deploy/vm/docker-compose.vm.yml
```

## Step 4: Create .env File

**On the VM:**

```bash
cd /opt/clinical-decision-engine
cat > .env << 'EOF'
APP_NAME=clinical-decision-engine
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password-here
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
DATABASE_URL=postgresql://postgres:your-secure-password-here@postgres:5432/clinical_decision_engine
EOF

# Edit password
nano .env
```

## Step 5: Deploy

**On the VM:**

```bash
cd /opt/clinical-decision-engine
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f dashboard
```

## Step 6: Configure Firewall

**On the VM:**

```bash
# Check firewall type
sudo firewall-cmd --version 2>/dev/null && FIREWALL_TYPE=firewalld || FIREWALL_TYPE=iptables

# If firewalld:
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --permanent --add-port=3100-3104/tcp
sudo firewall-cmd --reload

# If iptables:
sudo iptables -A INPUT -p tcp --dport 8081 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3100:3104 -j ACCEPT
# Save rules (depends on your system)
```

## Step 7: Test

```bash
# Test locally on VM
curl http://localhost:8081/

# Test from outside
curl http://34.136.153.216:8081/
```

## Troubleshooting

If port 8081 is not accessible:

1. Check if container is running: `docker ps | grep dashboard`
2. Check if port is listening: `sudo netstat -tlnp | grep 8081`
3. Check firewall: `sudo firewall-cmd --list-ports` or `sudo iptables -L -n`
4. Check logs: `docker logs clinical-decision-engine-dashboard`
