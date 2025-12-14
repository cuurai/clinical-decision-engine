# Firewall and Traefik Configuration Guide

## Manual Check Commands

Since SSH password authentication may require interactive input, run these commands directly on the VM:

### 1. Check Firewall Status

```bash
# Check UFW
sudo ufw status

# Check firewalld
sudo firewall-cmd --list-all

# Check iptables
sudo iptables -L -n | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443)"

# Check listening ports
sudo netstat -tlnp | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443)"
# OR
sudo ss -tlnp | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443)"
```

### 2. Check Traefik Configuration

```bash
# Check if Traefik is running
docker ps | grep traefik

# Check Traefik container details
docker inspect traefik | grep -A 10 "Networks"

# Check Traefik networks
docker network ls | grep traefik

# Check Traefik labels on containers
docker ps --format '{{.Names}}' | while read container; do
    docker inspect $container --format '{{range $k, $v := .Config.Labels}}{{$k}}={{$v}} {{end}}' | grep traefik
done

# Check Traefik dashboard (if enabled)
docker exec traefik cat /etc/traefik/traefik.yml 2>/dev/null
```

### 3. Check Existing Docker Networks

```bash
docker network ls
docker network inspect traefik 2>/dev/null
```

## Configuration Options

### Option A: Use Traefik (Recommended if Traefik is already running)

If Traefik is running, use `docker-compose.traefik.yml` which:

- Connects services to Traefik network
- Uses Traefik labels for routing
- No direct port exposure needed
- Routes through Traefik on ports 80/443

**Benefits:**

- Single entry point (Traefik)
- SSL/TLS termination at Traefik
- Path-based routing
- No firewall changes needed (if Traefik ports are already open)

**Deployment:**

```bash
# Use Traefik compose file
cp deploy/vm/docker-compose.traefik.yml /opt/clinical-decision-engine/docker-compose.yml

# Ensure Traefik network exists
docker network create traefik 2>/dev/null || true

# Deploy
cd /opt/clinical-decision-engine
docker-compose up -d
```

### Option B: Direct Port Exposure

If Traefik is not available or you prefer direct access, use `docker-compose.vm.yml` which:

- Exposes ports directly (3100-3104, 8081)
- Requires firewall rules for these ports
- Direct access to each service

**Firewall Setup:**

#### UFW (Ubuntu/Debian):

```bash
sudo ufw allow 8081/tcp comment 'Clinical Decision Engine Dashboard'
sudo ufw allow 3100:3104/tcp comment 'Clinical Decision Engine Services'
sudo ufw reload
sudo ufw status
```

#### firewalld (CentOS/RHEL):

```bash
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --permanent --add-port=3100-3104/tcp
sudo firewall-cmd --reload
sudo firewall-cmd --list-ports
```

#### GCP Firewall Rules:

```bash
# Dashboard
gcloud compute firewall-rules create clinical-decision-engine-dashboard \
    --allow tcp:8081 \
    --source-ranges 0.0.0.0/0 \
    --description "Clinical Decision Engine Dashboard"

# Services
gcloud compute firewall-rules create clinical-decision-engine-services \
    --allow tcp:3100-3104 \
    --source-ranges 0.0.0.0/0 \
    --description "Clinical Decision Engine Services"
```

## Traefik Network Setup

If using Traefik, ensure the network exists:

```bash
# Check if Traefik network exists
docker network inspect traefik

# If it doesn't exist, create it (or use existing Traefik network name)
docker network create traefik

# Or find Traefik's actual network name
docker inspect traefik | grep -A 5 "Networks"
```

## Recommended Traefik Labels Format

For Traefik routing, services will be accessible at:

- Dashboard: `http://34.136.153.216/` (or your domain)
- Decision Intelligence: `http://34.136.153.216/api/v1/decision-intelligence`
- Patient Clinical Data: `http://34.136.153.216/api/v1/patient-clinical-data`
- Knowledge Evidence: `http://34.136.153.216/api/v1/knowledge-evidence`
- Workflow Care Pathways: `http://34.136.153.216/api/v1/workflow-care-pathways`
- Integration Interoperability: `http://34.136.153.216/api/v1/integration-interoperability`

## Next Steps

1. **Check Traefik status** on the VM
2. **Choose configuration** (Traefik or direct ports)
3. **Update docker-compose.yml** accordingly
4. **Configure firewall** if using direct ports
5. **Deploy services**

## Troubleshooting

### Traefik not routing to services

```bash
# Check Traefik logs
docker logs traefik

# Verify network connectivity
docker exec clinical-decision-engine-decision-intelligence ping postgres

# Check Traefik dashboard (if enabled)
# Usually at http://34.136.153.216:8080 (Traefik dashboard port)
```

### Firewall blocking connections

```bash
# Test port accessibility
curl -v http://34.136.153.216:8081
curl -v http://34.136.153.216:3100/health

# Check if port is listening
sudo netstat -tlnp | grep 8081
```

### Services not starting

```bash
# Check logs
docker-compose logs decision-intelligence
docker-compose logs dashboard

# Check network connectivity
docker network inspect clinical-decision-engine-network
```
