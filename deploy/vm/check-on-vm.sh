#!/bin/bash
# Run these commands directly on the VM to check status

echo "🔍 Checking Clinical Decision Engine Status"
echo "==========================================="
echo ""

echo "1. Docker containers:"
docker ps -a | grep clinical-decision-engine || echo "  No clinical-decision-engine containers found"

echo ""
echo "2. Dashboard container specifically:"
docker ps -a | grep dashboard || echo "  No dashboard container found"

echo ""
echo "3. Port 8081 listening:"
sudo netstat -tlnp 2>/dev/null | grep 8081 || sudo ss -tlnp 2>/dev/null | grep 8081 || echo "  Port 8081 not listening"

echo ""
echo "4. Firewall check:"
if command -v firewall-cmd &> /dev/null; then
    echo "  firewalld ports:"
    sudo firewall-cmd --list-ports | grep -E "(8081|3100|3101|3102|3103|3104)" || echo "    No matching ports found"
elif command -v ufw &> /dev/null; then
    echo "  UFW status:"
    sudo ufw status | grep -E "(8081|3100|3101|3102|3103|3104)" || echo "    No matching rules found"
else
    echo "  Checking iptables:"
    sudo iptables -L -n | grep -E "(8081|3100|3101|3102|3103|3104)" || echo "    No matching rules found"
fi

echo ""
echo "5. Test local connection:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8081/ 2>&1 || echo "  Cannot connect locally"

echo ""
echo "6. All listening ports (relevant):"
sudo netstat -tlnp 2>/dev/null | grep -E "(8081|3100|3101|3102|3103|3104|80|443)" || sudo ss -tlnp 2>/dev/null | grep -E "(8081|3100|3101|3102|3103|3104|80|443)" || echo "  No matching ports"

echo ""
echo "7. Traefik status:"
docker ps | grep traefik && echo "  ✅ Traefik is running" || echo "  ❌ Traefik is not running"

echo ""
echo "8. Docker networks:"
docker network ls | grep -E "(traefik|clinical)" || echo "  No matching networks"

echo ""
echo "9. Check deployment directory:"
ls -la /opt/clinical-decision-engine/ 2>/dev/null || echo "  Deployment directory not found"

echo ""
echo "10. Docker compose status (if exists):"
cd /opt/clinical-decision-engine 2>/dev/null && docker-compose ps 2>/dev/null || echo "  Cannot check compose status"
