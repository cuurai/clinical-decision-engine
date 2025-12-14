#!/bin/bash
# Check deployment status - run on VM

echo "🔍 Checking Deployment Status"
echo "============================="
echo ""

echo "1. Check if images exist locally on VM:"
docker images | grep clinical-decision-engine || echo "  No images found"

echo ""
echo "2. Check deployment directory:"
if [ -d "/opt/clinical-decision-engine" ]; then
    echo "  ✅ Directory exists"
    ls -la /opt/clinical-decision-engine/
    echo ""
    echo "  docker-compose.yml:"
    cat /opt/clinical-decision-engine/docker-compose.yml 2>/dev/null | head -20 || echo "    File not found"
else
    echo "  ❌ Directory does not exist"
fi

echo ""
echo "3. Check if images were transferred:"
ls -la /tmp/clinical-decision-engine-images/ 2>/dev/null || echo "  No image files found in /tmp"

echo ""
echo "4. Check Docker networks:"
docker network ls

echo ""
echo "5. Check Traefik:"
docker ps | grep traefik && docker network inspect traefik 2>/dev/null | grep -A 5 "Name\|Driver" || echo "  Traefik not found"
