# Troubleshooting Port 8081 Not Accessible

## Issue: Cannot connect to http://34.136.153.216:8081/

### Step 1: Check if Deployment Completed

Run on VM:

```bash
# Check if containers are running
docker ps | grep clinical-decision-engine

# Check deployment directory
ls -la /opt/clinical-decision-engine/

# Check docker-compose status
cd /opt/clinical-decision-engine && docker-compose ps
```

### Step 2: Check if Service is Running

Run on VM:

```bash
# Check dashboard container
docker ps | grep dashboard

# Check dashboard logs
docker logs clinical-decision-engine-dashboard --tail 50

# Check if port is listening locally
sudo netstat -tlnp | grep 8081
# OR
sudo ss -tlnp | grep 8081
```

### Step 3: Check Firewall

Run on VM:

```bash
# Check UFW
sudo ufw status | grep 8081

# Check firewalld
sudo firewall-cmd --list-ports | grep 8081

# Check iptables
sudo iptables -L -n | grep 8081
```

### Step 4: Check GCP Firewall Rules (if GCP VM)

```bash
# List firewall rules
gcloud compute firewall-rules list | grep 8081

# Check if rule exists
gcloud compute firewall-rules describe clinical-decision-engine-dashboard 2>/dev/null || echo "Rule does not exist"
```

### Step 5: Check Traefik (if using Traefik)

Run on VM:

```bash
# Check if Traefik is routing
docker logs traefik --tail 50 | grep dashboard

# Check Traefik dashboard
curl http://localhost:8080/api/http/routers | grep dashboard
```

## Quick Fixes

### Fix 1: Open Firewall Port (if not using Traefik)

```bash
# UFW
sudo ufw allow 8081/tcp
sudo ufw reload

# firewalld
sudo firewall-cmd --permanent --add-port=8081/tcp
sudo firewall-cmd --reload

# GCP Firewall
gcloud compute firewall-rules create clinical-decision-engine-dashboard \
    --allow tcp:8081 \
    --source-ranges 0.0.0.0/0 \
    --description "Clinical Decision Engine Dashboard"
```

### Fix 2: Restart Services

```bash
cd /opt/clinical-decision-engine
docker-compose restart dashboard
docker-compose logs dashboard
```

### Fix 3: Check Container Port Mapping

```bash
# Verify port mapping
docker port clinical-decision-engine-dashboard

# Should show: 8080/tcp -> 0.0.0.0:8081
```

### Fix 4: Test Locally on VM

```bash
# Test from inside VM
curl http://localhost:8081/
curl http://127.0.0.1:8081/

# If this works but external doesn't, it's a firewall issue
```

## Common Issues

### Issue: Container not running

**Solution**: Check logs and restart

```bash
docker logs clinical-decision-engine-dashboard
docker-compose up -d dashboard
```

### Issue: Port not mapped correctly

**Solution**: Check docker-compose.yml port mapping

```bash
grep -A 5 "dashboard:" /opt/clinical-decision-engine/docker-compose.yml | grep ports
```

### Issue: Firewall blocking

**Solution**: Open port in firewall (see Fix 1 above)

### Issue: Traefik routing incorrectly

**Solution**: Check Traefik labels and network

```bash
docker inspect clinical-decision-engine-dashboard | grep -A 20 Labels
docker network inspect traefik | grep dashboard
```

## Next Steps

1. Run `check-status.sh` on VM to get full status
2. Check firewall rules
3. Verify container is running and port is mapped
4. Test locally on VM first, then externally
