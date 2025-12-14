#!/bin/bash
# Check deployment status on VM
# Run this directly on the VM: bash check-status.sh

echo "🔍 Checking Clinical Decision Engine Deployment Status"
echo "======================================================"
echo ""

echo "📦 1. Docker Containers Status"
echo "-----------------------------"
docker ps -a | grep clinical-decision-engine || echo "No clinical-decision-engine containers found"

echo ""
echo "📊 2. Container Details"
echo "----------------------"
for container in clinical-decision-engine-dashboard clinical-decision-engine-decision-intelligence clinical-decision-engine-patient-clinical-data clinical-decision-engine-knowledge-evidence clinical-decision-engine-workflow-care-pathways clinical-decision-engine-integration-interoperability; do
    if docker ps -a | grep -q "$container"; then
        echo ""
        echo "Container: $container"
        echo "  Status: $(docker inspect $container --format '{{.State.Status}}' 2>/dev/null)"
        echo "  Ports: $(docker inspect $container --format '{{range $p, $conf := .NetworkSettings.Ports}}{{$p}} {{end}}' 2>/dev/null)"
        echo "  Logs (last 5 lines):"
        docker logs --tail 5 "$container" 2>/dev/null | sed 's/^/    /' || echo "    No logs"
    fi
done

echo ""
echo "🌐 3. Network Configuration"
echo "--------------------------"
echo "Docker networks:"
docker network ls | grep -E "(clinical|traefik)" || echo "No matching networks"

echo ""
echo "Port bindings:"
docker ps --format "{{.Names}}: {{.Ports}}" | grep clinical-decision-engine || echo "No port bindings found"

echo ""
echo "🔌 4. Port Accessibility"
echo "----------------------"
echo "Checking if ports are listening:"
for port in 8081 3100 3101 3102 3103 3104; do
    if sudo netstat -tlnp 2>/dev/null | grep -q ":$port " || sudo ss -tlnp 2>/dev/null | grep -q ":$port "; then
        echo "  ✅ Port $port: LISTENING"
    else
        echo "  ❌ Port $port: NOT LISTENING"
    fi
done

echo ""
echo "🔥 5. Firewall Status"
echo "-------------------"
if command -v ufw &> /dev/null; then
    echo "UFW rules for our ports:"
    sudo ufw status | grep -E "(8081|3100|3101|3102|3103|3104)" || echo "  No rules found for our ports"
fi

echo ""
echo "📝 6. Docker Compose Status"
echo "--------------------------"
if [ -f "/opt/clinical-decision-engine/docker-compose.yml" ]; then
    echo "docker-compose.yml exists"
    cd /opt/clinical-decision-engine 2>/dev/null && docker-compose ps 2>/dev/null || echo "Cannot check compose status"
else
    echo "docker-compose.yml not found in /opt/clinical-decision-engine"
fi

echo ""
echo "🔍 7. Service Health Checks"
echo "-------------------------"
echo "Testing services locally:"
for port in 3100 3101 3102 3103 3104; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health 2>/dev/null | grep -q "200\|404"; then
        echo "  ✅ Port $port: Responding"
    else
        echo "  ❌ Port $port: Not responding"
    fi
done

if curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/ 2>/dev/null | grep -q "200\|404"; then
    echo "  ✅ Port 8081 (Dashboard): Responding"
else
    echo "  ❌ Port 8081 (Dashboard): Not responding"
fi
