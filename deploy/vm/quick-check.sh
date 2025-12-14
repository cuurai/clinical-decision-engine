#!/bin/bash
# Quick check script - run on VM to diagnose port 8081 issue

echo "🔍 Quick Diagnostic Check"
echo "========================"
echo ""

echo "1. Is dashboard container running?"
docker ps | grep dashboard || echo "  ❌ Dashboard container not found"

echo ""
echo "2. Is port 8081 listening?"
sudo netstat -tlnp 2>/dev/null | grep 8081 || sudo ss -tlnp 2>/dev/null | grep 8081 || echo "  ❌ Port 8081 not listening"

echo ""
echo "3. Firewall status for 8081:"
if command -v ufw &> /dev/null; then
    sudo ufw status | grep 8081 || echo "  ⚠️  Port 8081 not in UFW rules"
fi

echo ""
echo "4. Test locally:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8081/ 2>&1 || echo "  ❌ Cannot connect locally"

echo ""
echo "5. Container logs (last 10 lines):"
docker logs clinical-decision-engine-dashboard --tail 10 2>/dev/null || echo "  Container not found"

echo ""
echo "6. Docker compose status:"
cd /opt/clinical-decision-engine 2>/dev/null && docker-compose ps dashboard 2>/dev/null || echo "  Cannot check compose status"
