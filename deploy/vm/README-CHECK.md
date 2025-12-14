# Check Current Configuration

Before deploying, we need to understand the current firewall and Traefik setup on the VM.

## Option 1: Run Check Script on VM

Copy and run the check script directly on the VM:

```bash
# Copy script to VM
scp deploy/vm/check-config.sh root@34.136.153.216:/tmp/

# SSH into VM and run
ssh root@34.136.153.216
cd /tmp
bash check-config.sh
```

## Option 2: Manual Commands

Run these commands directly on the VM:

### Check Firewall

```bash
# UFW
sudo ufw status

# firewalld
sudo firewall-cmd --list-all

# iptables
sudo iptables -L -n | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443)"

# Listening ports
sudo netstat -tlnp | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443)"
```

### Check Traefik

```bash
# Is Traefik running?
docker ps | grep traefik

# Traefik network name
docker inspect traefik | grep -A 10 "Networks"

# List all networks
docker network ls

# Containers with Traefik labels
docker ps --format '{{.Names}}' | while read container; do
    docker inspect $container --format '{{range $k, $v := .Config.Labels}}{{$k}}={{$v}} {{end}}' | grep traefik
done
```

### Check Docker Containers

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
```

## What to Look For

1. **Traefik Status**: Is Traefik running? What network is it using?
2. **Firewall Rules**: What ports are currently open?
3. **Existing Services**: What other Docker apps are running?
4. **Network Configuration**: What Docker networks exist?

## After Checking

Based on the results:

- **If Traefik is running**: Use `docker-compose.traefik.yml` and connect to Traefik network
- **If Traefik is NOT running**: Use `docker-compose.vm.yml` and configure firewall for ports 8081, 3100-3104
