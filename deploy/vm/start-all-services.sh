#!/bin/bash
# Start all services on their assigned ports (4000-4004)
# This script starts services as background processes

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
BASE_DIR="/opt/clinical-decision-engine-code/clinical-decision-engine-20251215-174550"
DATABASE_URL="postgresql://postgres.skxcbvztdnhklffhwkdl:cuurD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

echo "🚀 Starting all services on ports 4000-4004"
echo "============================================"
echo ""

declare -A SERVICE_PORTS=(
    ["decision-intelligence"]="4000"
    ["patient-clinical-data"]="4001"
    ["knowledge-evidence"]="4002"
    ["workflow-care-pathways"]="4003"
    ["integration-interoperability"]="4004"
)

for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability; do
    port=${SERVICE_PORTS[$service]}
    echo "Starting $service on port $port..."

    ssh ${VM_USER}@${VM_HOST} << EOF
cd ${BASE_DIR}/platform/services/${service}
export PORT=${port}
export HOST=0.0.0.0
export NODE_ENV=production
export DATABASE_URL="${DATABASE_URL}"

# Kill any existing process on this port
lsof -ti:${port} | xargs kill -9 2>/dev/null || true

# Start the service
nohup node dist/main.js > /tmp/${service}.log 2>&1 &
echo "Started PID: \$!"
sleep 1

# Check if it's running
if curl -s http://localhost:${port}/health > /dev/null 2>&1; then
    echo "✅ $service is running on port $port"
else
    echo "⚠️  $service started but health check failed. Check /tmp/${service}.log"
fi
EOF

    echo ""
done

echo "✅ All services started!"
echo ""
echo "Check service status:"
echo "  ssh ${VM_USER}@${VM_HOST} 'for port in 4000 4001 4002 4003 4004; do echo \"Port \$port:\"; curl -s http://localhost:\$port/health 2>&1 | head -1; done'"
