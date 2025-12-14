#!/bin/bash
# Check firewall and Traefik configuration on VM

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"root"}
SSH_PASS=${SSH_PASS:-""}

# Build SSH command
if [ -n "$SSH_PASS" ] && command -v sshpass &> /dev/null; then
    export SSHPASS="$SSH_PASS"
    SSH_CMD="sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
else
    SSH_CMD="ssh -o StrictHostKeyChecking=no"
fi

echo "🔍 Checking firewall and Traefik configuration on $VM_HOST..."
echo ""

# Check firewall status
echo "📋 Firewall Status:"
$SSH_CMD ${VM_USER}@${VM_HOST} << 'EOF'
echo "--- UFW Status ---"
sudo ufw status 2>/dev/null || echo "UFW not installed"

echo ""
echo "--- firewalld Status ---"
sudo firewall-cmd --list-all 2>/dev/null || echo "firewalld not active"

echo ""
echo "--- iptables Rules (relevant ports) ---"
sudo iptables -L -n 2>/dev/null | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443)" || echo "No matching iptables rules found"

echo ""
echo "--- Listening Ports ---"
sudo netstat -tlnp 2>/dev/null | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443)" || sudo ss -tlnp 2>/dev/null | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443)" || echo "netstat/ss not available"
EOF

echo ""
echo "🐳 Docker Containers:"
$SSH_CMD ${VM_USER}@${VM_HOST} "docker ps --format 'table {{.Names}}\t{{.Ports}}' | head -20"

echo ""
echo "🔀 Traefik Configuration:"
$SSH_CMD ${VM_USER}@${VM_HOST} << 'EOF'
# Check if Traefik is running
if docker ps | grep -q traefik; then
    echo "✅ Traefik is running"
    echo ""
    echo "Traefik container details:"
    docker ps | grep traefik
    echo ""
    echo "Traefik configuration files:"
    docker exec traefik ls -la /etc/traefik/ 2>/dev/null || echo "Cannot access Traefik config"
    echo ""
    echo "Traefik dashboard (if enabled):"
    docker exec traefik cat /etc/traefik/traefik.yml 2>/dev/null | grep -A 5 "dashboard" || echo "Dashboard config not found"
else
    echo "❌ Traefik is not running"
fi

# Check for Traefik labels on containers
echo ""
echo "Containers with Traefik labels:"
docker ps --format '{{.Names}}' | while read container; do
    labels=$(docker inspect $container --format '{{range $k, $v := .Config.Labels}}{{$k}}={{$v}} {{end}}' 2>/dev/null)
    if echo "$labels" | grep -q "traefik"; then
        echo "  $container:"
        echo "$labels" | grep "traefik" | sed 's/^/    /'
    fi
done
EOF

echo ""
echo "📝 Recommended Configuration:"
echo "If Traefik is running, we should configure Traefik labels instead of exposing ports directly."
echo "See deploy/vm/docker-compose.traefik.yml for Traefik configuration."
