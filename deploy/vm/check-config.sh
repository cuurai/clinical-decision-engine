#!/bin/bash
# Script to check current firewall and Traefik configuration
# Run this directly on the VM: bash check-config.sh

echo "🔍 Checking Current Configuration..."
echo "===================================="
echo ""

echo "📋 1. Firewall Status"
echo "---------------------"
# Check UFW
if command -v ufw &> /dev/null; then
    echo "UFW Status:"
    sudo ufw status verbose
else
    echo "UFW: Not installed"
fi

echo ""
# Check firewalld
if command -v firewall-cmd &> /dev/null; then
    echo "firewalld Status:"
    sudo firewall-cmd --list-all
else
    echo "firewalld: Not installed"
fi

echo ""
# Check iptables
echo "iptables Rules (relevant ports):"
sudo iptables -L -n -v | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443|8080)" || echo "No matching rules found"

echo ""
echo "📡 2. Listening Ports"
echo "---------------------"
echo "Ports currently listening:"
sudo netstat -tlnp 2>/dev/null | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443|8080)" || \
sudo ss -tlnp 2>/dev/null | grep -E "(8081|3100|3101|3102|3103|3104|5433|80|443|8080)" || \
echo "No matching ports found"

echo ""
echo "🐳 3. Docker Containers"
echo "---------------------"
echo "Running containers:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

echo ""
echo "🔀 4. Traefik Configuration"
echo "---------------------"
# Check if Traefik is running
if docker ps | grep -q traefik; then
    echo "✅ Traefik is RUNNING"
    echo ""
    echo "Traefik container details:"
    docker ps | grep traefik
    echo ""
    echo "Traefik networks:"
    docker inspect traefik 2>/dev/null | grep -A 10 '"Networks"' || echo "Cannot inspect Traefik"
    echo ""
    echo "Traefik network name:"
    TRAEFIK_NETWORK=$(docker inspect traefik 2>/dev/null | grep -A 5 '"Networks"' | grep -oP '(?<=")[^"]*(?=":)' | head -1)
    echo "Network: $TRAEFIK_NETWORK"
    echo ""
    echo "Traefik network details:"
    if [ -n "$TRAEFIK_NETWORK" ]; then
        docker network inspect "$TRAEFIK_NETWORK" 2>/dev/null | grep -A 5 "Name\|Driver\|Containers" || echo "Cannot inspect network"
    fi
    echo ""
    echo "Containers connected to Traefik network:"
    docker network inspect "$TRAEFIK_NETWORK" 2>/dev/null | grep -oP '(?<="Name": ")[^"]*' || echo "None found"
else
    echo "❌ Traefik is NOT running"
fi

echo ""
echo "🏷️  5. Containers with Traefik Labels"
echo "---------------------"
docker ps --format '{{.Names}}' | while read container; do
    labels=$(docker inspect "$container" --format '{{range $k, $v := .Config.Labels}}{{$k}}={{$v}} {{end}}' 2>/dev/null)
    if echo "$labels" | grep -q "traefik"; then
        echo "Container: $container"
        echo "$labels" | grep "traefik" | sed 's/^/  /'
        echo ""
    fi
done

echo ""
echo "🌐 6. Docker Networks"
echo "---------------------"
echo "All Docker networks:"
docker network ls
echo ""
echo "Traefik-related networks:"
docker network ls | grep -i traefik || echo "No Traefik networks found"

echo ""
echo "📝 7. Summary"
echo "---------------------"
echo "Current setup:"
if docker ps | grep -q traefik; then
    echo "  ✅ Traefik: Running"
    TRAEFIK_NETWORK=$(docker inspect traefik 2>/dev/null | grep -A 5 '"Networks"' | grep -oP '(?<=")[^"]*(?=":)' | head -1)
    echo "  📡 Traefik Network: $TRAEFIK_NETWORK"
else
    echo "  ❌ Traefik: Not running"
fi

echo ""
echo "Recommended next steps:"
if docker ps | grep -q traefik; then
    echo "  → Use docker-compose.traefik.yml (Traefik routing)"
    echo "  → Ensure services connect to Traefik network: $TRAEFIK_NETWORK"
else
    echo "  → Use docker-compose.vm.yml (Direct port exposure)"
    echo "  → Configure firewall for ports: 8081, 3100-3104"
fi
