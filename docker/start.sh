#!/bin/sh
set -e

# Default service to run (can be overridden)
SERVICE=${SERVICE:-all}

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3

    echo "🚀 Starting $service_name service on port $port..."
    cd "$service_path"
    PORT=$port HOST=0.0.0.0 node dist/main.js &
    echo $! > "/tmp/${service_name}.pid"
    echo "✅ $service_name started (PID: $(cat /tmp/${service_name}.pid))"
}

# Function to serve dashboard
start_dashboard() {
    echo "🚀 Starting dashboard on port 8080..."
    cd /app/dashboard
    # Use a simple HTTP server to serve the built static files
    npx serve -s dist -l 8080 &
    echo $! > /tmp/dashboard.pid
    echo "✅ Dashboard started (PID: $(cat /tmp/dashboard.pid))"
}

# Cleanup function
cleanup() {
    echo "🛑 Shutting down services..."
    for pidfile in /tmp/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            kill "$pid" 2>/dev/null || true
            rm "$pidfile"
        fi
    done
    exit 0
}

# Trap signals
trap cleanup SIGTERM SIGINT

# Start services based on SERVICE env var
case "$SERVICE" in
    decision-intelligence)
        start_service "decision-intelligence" "/app/platform/services/src/decision-intelligence" "${PORT:-3000}"
        ;;
    patient-clinical-data)
        start_service "patient-clinical-data" "/app/platform/services/src/patient-clinical-data" "${PORT:-3001}"
        ;;
    knowledge-evidence)
        start_service "knowledge-evidence" "/app/platform/services/src/knowledge-evidence" "${PORT:-3002}"
        ;;
    workflow-care-pathways)
        start_service "workflow-care-pathways" "/app/platform/services/src/workflow-care-pathways" "${PORT:-3003}"
        ;;
    integration-interoperability)
        start_service "integration-interoperability" "/app/platform/services/src/integration-interoperability" "${PORT:-3004}"
        ;;
    dashboard)
        start_dashboard
        ;;
    all)
        # Start all services
        start_service "decision-intelligence" "/app/platform/services/src/decision-intelligence" "${DECISION_INTELLIGENCE_PORT:-3000}"
        start_service "patient-clinical-data" "/app/platform/services/src/patient-clinical-data" "${PATIENT_CLINICAL_DATA_PORT:-3001}"
        start_service "knowledge-evidence" "/app/platform/services/src/knowledge-evidence" "${KNOWLEDGE_EVIDENCE_PORT:-3002}"
        start_service "workflow-care-pathways" "/app/platform/services/src/workflow-care-pathways" "${WORKFLOW_CARE_PATHWAYS_PORT:-3003}"
        start_service "integration-interoperability" "/app/platform/services/src/integration-interoperability" "${INTEGRATION_INTEROPERABILITY_PORT:-3004}"
        start_dashboard
        ;;
    *)
        echo "❌ Unknown service: $SERVICE"
        echo "Available services: decision-intelligence, patient-clinical-data, knowledge-evidence, workflow-care-pathways, integration-interoperability, dashboard, all"
        exit 1
        ;;
esac

# Wait for all background processes
wait

