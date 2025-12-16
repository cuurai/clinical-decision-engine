#!/bin/bash
# Manual script to apply Traefik path strip fix
# Run this script yourself if SSH keys are configured

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"root"}
DEPLOY_DIR=${DEPLOY_DIR:-"/opt/clinical-decision-engine"}

echo "🔧 Applying Traefik Path Strip Fix"
echo "===================================="
echo ""

echo "📤 Step 1: Copying updated docker-compose file to VM..."
scp deploy/vm/docker-compose.traefik-supabase.yml ${VM_USER}@${VM_HOST}:${DEPLOY_DIR}/docker-compose.yml

if [ $? -eq 0 ]; then
    echo "✅ File copied successfully"
else
    echo "❌ Failed to copy file. Please check SSH access."
    exit 1
fi

echo ""
echo "🔄 Step 2: Restarting services on VM..."
ssh ${VM_USER}@${VM_HOST} << 'EOF'
cd /opt/clinical-decision-engine
echo "Restarting services..."
docker-compose restart

echo ""
echo "✅ Services restarted"
echo ""
echo "Service status:"
docker-compose ps
EOF

echo ""
echo "🎉 Fix applied!"
echo ""
echo "Testing endpoint..."
sleep 2
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://${VM_HOST}/api/v1/patient-clinical-data/care-teams || echo "Test failed - endpoint may need a moment to start"
