#!/bin/bash
# Start services on their assigned ports (4000-4004)
# Usage: ./start-services.sh [service-name|--all]
#   ./start-services.sh --all                    # Start all services
#   ./start-services.sh decision-intelligence     # Start only decision-intelligence
#   ./start-services.sh                          # Start all services (default)

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
BASE_DIR="/opt/clinical-decision-engine-code/clinical-decision-engine-20251215-174550"
# URL-encoded password: @ -> %40
DATABASE_URL="postgresql://postgres.skxcbvztdnhklffhwkdl:cuurD%40v2025@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=10"

# Parse arguments
SERVICE_ARG=${1:-"--all"}

declare -A SERVICE_PORTS=(
    ["decision-intelligence"]="4000"
    ["patient-clinical-data"]="4001"
    ["knowledge-evidence"]="4002"
    ["workflow-care-pathways"]="4003"
    ["integration-interoperability"]="4004"
)

# Determine which services to start
if [ "$SERVICE_ARG" = "--all" ]; then
    SERVICES_TO_START=("decision-intelligence" "patient-clinical-data" "knowledge-evidence" "workflow-care-pathways" "integration-interoperability")
    echo "🚀 Starting all services on ports 4000-4004"
else
    # Validate service name
    if [ -z "${SERVICE_PORTS[$SERVICE_ARG]}" ]; then
        echo "❌ Error: Unknown service '$SERVICE_ARG'"
        echo ""
        echo "Available services:"
        for svc in "${!SERVICE_PORTS[@]}"; do
            echo "  - $svc (port ${SERVICE_PORTS[$svc]})"
        done
        echo ""
        echo "Usage: $0 [service-name|--all]"
        exit 1
    fi
    SERVICES_TO_START=("$SERVICE_ARG")
    echo "🚀 Starting service: $SERVICE_ARG on port ${SERVICE_PORTS[$SERVICE_ARG]}"
fi

echo "============================================"
echo ""

for service in "${SERVICES_TO_START[@]}"; do
    port=${SERVICE_PORTS[$service]}
    echo "Starting $service on port $port..."

    ssh ${VM_USER}@${VM_HOST} << EOF
cd ${BASE_DIR}/platform/services/${service}
export PORT=${port}
export HOST=0.0.0.0
export NODE_ENV=production
export DATABASE_URL="${DATABASE_URL}"

# Kill any existing process on this port
pkill -f "node.*${service}" || true
sleep 1

# Start the service
nohup node dist/main.js > /tmp/${service}.log 2>&1 &
echo "Started PID: \$!"
sleep 3

# Check if it's running
if curl -s http://localhost:${port}/health > /dev/null 2>&1; then
    echo "✅ $service is running on port $port"
else
    echo "⚠️  $service started but health check failed. Check /tmp/${service}.log"
    tail -10 /tmp/${service}.log
fi
EOF

    echo ""
done

if [ "$SERVICE_ARG" = "--all" ]; then
    echo "✅ All services started!"
    echo ""
    echo "Check service status:"
    echo "  ssh ${VM_USER}@${VM_HOST} 'for port in 4000 4001 4002 4003 4004; do echo \"Port \$port:\"; curl -s http://localhost:\$port/health 2>&1 | head -1; done'"
else
    echo "✅ Service '$SERVICE_ARG' started!"
    echo ""
    echo "Check service status:"
    echo "  ssh ${VM_USER}@${VM_HOST} 'curl -s http://localhost:${SERVICE_PORTS[$SERVICE_ARG]}/health'"
fi
