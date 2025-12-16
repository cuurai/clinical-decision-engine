#!/bin/bash
# Fix all services to use 4000+ ports and update Traefik path prefixes
# Port mapping:
# - decision-intelligence: 4000
# - patient-clinical-data: 4001 (already done)
# - knowledge-evidence: 4002
# - workflow-care-pathways: 4003
# - integration-interoperability: 4004

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
BASE_DIR="/opt/clinical-decision-engine-code/clinical-decision-engine-20251215-174550"

echo "🔧 Fixing all services ports and Traefik configuration"
echo "======================================================"
echo ""

# Service port mapping
declare -A SERVICE_PORTS=(
    ["decision-intelligence"]="4000"
    ["patient-clinical-data"]="4001"
    ["knowledge-evidence"]="4002"
    ["workflow-care-pathways"]="4003"
    ["integration-interoperability"]="4004"
)

# Update nginx proxy configs
echo "📝 Updating nginx proxy configurations..."
for service in decision-intelligence knowledge-evidence workflow-care-pathways integration-interoperability; do
    port=${SERVICE_PORTS[$service]}
    if [ -n "$port" ]; then
        echo "  Updating $service proxy to port $port..."
        ssh ${VM_USER}@${VM_HOST} "sudo sed -i.bak 's|proxy_pass http://172.18.0.1:[0-9]*|proxy_pass http://172.18.0.1:'$port'|g' ${BASE_DIR}/nginx-${service}-proxy.conf"
    fi
done

# Update docker-compose.traefik-direct.yml path prefixes
echo ""
echo "📝 Updating Traefik path prefixes in docker-compose..."
ssh ${VM_USER}@${VM_HOST} << EOF
cd ${BASE_DIR}
# Update decision-intelligence
sudo sed -i.bak 's|PathPrefix(\`/api/decision-intelligence\`)|PathPrefix(\`/api/v1/decision-intelligence\`)|g' docker-compose.traefik-direct.yml
sudo sed -i.bak2 's|prefixes=/api/decision-intelligence|prefixes=/api/v1/decision-intelligence|g' docker-compose.traefik-direct.yml

# Update knowledge-evidence
sudo sed -i.bak 's|PathPrefix(\`/api/knowledge-evidence\`)|PathPrefix(\`/api/v1/knowledge-evidence\`)|g' docker-compose.traefik-direct.yml
sudo sed -i.bak2 's|prefixes=/api/knowledge-evidence|prefixes=/api/v1/knowledge-evidence|g' docker-compose.traefik-direct.yml

# Update workflow-care-pathways
sudo sed -i.bak 's|PathPrefix(\`/api/workflow-care-pathways\`)|PathPrefix(\`/api/v1/workflow-care-pathways\`)|g' docker-compose.traefik-direct.yml
sudo sed -i.bak2 's|prefixes=/api/workflow-care-pathways|prefixes=/api/v1/workflow-care-pathways|g' docker-compose.traefik-direct.yml

# Update integration-interoperability
sudo sed -i.bak 's|PathPrefix(\`/api/integration-interoperability\`)|PathPrefix(\`/api/v1/integration-interoperability\`)|g' docker-compose.traefik-direct.yml
sudo sed -i.bak2 's|prefixes=/api/integration-interoperability|prefixes=/api/v1/integration-interoperability|g' docker-compose.traefik-direct.yml
EOF

echo ""
echo "🔄 Restarting nginx proxy containers..."
ssh ${VM_USER}@${VM_HOST} "cd ${BASE_DIR} && sudo docker-compose -f docker-compose.traefik-direct.yml restart cde-proxy-decision-intelligence cde-proxy-knowledge-evidence cde-proxy-workflow-care-pathways cde-proxy-integration-interoperability"

echo ""
echo "✅ Configuration updated!"
echo ""
echo "Next steps:"
echo "1. Start services on their assigned ports (4000-4004)"
echo "2. Verify services are running: curl http://localhost:4000/health"
echo "3. Test endpoints: curl http://${VM_HOST}/api/v1/{service-name}/health"
