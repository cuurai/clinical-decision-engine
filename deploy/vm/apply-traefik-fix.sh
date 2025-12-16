#!/bin/bash
# Script to apply Traefik path strip fix
# This updates docker-compose.yml and restarts services

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"root"}
DEPLOY_DIR=${DEPLOY_DIR:-"/opt/clinical-decision-engine"}

echo "🔧 Applying Traefik Path Strip Fix"
echo "===================================="
echo ""

echo "📤 Copying updated docker-compose file to VM..."
scp deploy/vm/docker-compose.traefik-supabase.yml ${VM_USER}@${VM_HOST}:${DEPLOY_DIR}/docker-compose.yml

echo ""
echo "🔄 Restarting services to pick up new Traefik labels..."
ssh ${VM_USER}@${VM_HOST} << EOF
cd ${DEPLOY_DIR}
echo "Stopping services..."
docker-compose down

echo "Starting services with new configuration..."
docker-compose up -d

echo ""
echo "✅ Services restarted"
echo ""
echo "Service status:"
docker-compose ps
EOF

echo ""
echo "🎉 Fix applied!"
echo ""
echo "Test the endpoint:"
echo "  curl http://${VM_HOST}/api/v1/patient-clinical-data/care-teams"
echo ""
echo "Or restart Traefik if services don't pick up changes:"
echo "  ssh ${VM_USER}@${VM_HOST} 'docker restart mixpost_traefik_1'"
