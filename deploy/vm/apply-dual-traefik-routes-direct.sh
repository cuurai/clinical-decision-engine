#!/bin/bash
# Apply dual Traefik routes directly to VM's docker-compose.traefik-direct.yml
# Primary: /api/{service} (dashboard-compatible)
# Secondary: /api/v1/{service} (backward/future compatibility)

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
BASE_DIR="/opt/clinical-decision-engine-code/clinical-decision-engine-20251215-174550"

echo "🔧 Applying Dual Traefik Routes to VM"
echo "========================================"
echo ""

ssh ${VM_USER}@${VM_HOST} << 'EOF'
set -e
BASE_DIR="/opt/clinical-decision-engine-code/clinical-decision-engine-20251215-174550"
COMPOSE_FILE="${BASE_DIR}/docker-compose.traefik-direct.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: $COMPOSE_FILE not found"
    exit 1
fi

# Backup
cp "$COMPOSE_FILE" "${COMPOSE_FILE}.backup.$(date +%Y%m%d-%H%M%S)"
echo "✅ Backup created"

# Function to update service routes
update_service_routes() {
    local service_name=$1
    local router_prefix=$2
    local service_path=$3
    
    echo "  Updating ${service_name}..."
    
    # Remove existing route labels (both /api and /api/v1)
    sed -i "/traefik.http.routers.${router_prefix}/d" "$COMPOSE_FILE"
    sed -i "/traefik.http.middlewares.${router_prefix}/d" "$COMPOSE_FILE"
    
    # Find the service port label and insert new routes before it
    if grep -q "traefik.http.services.${router_prefix}.loadbalancer.server.port=80" "$COMPOSE_FILE"; then
        # Insert primary route (priority 20)
        sed -i "/traefik.http.services.${router_prefix}.loadbalancer.server.port=80/i\\
      - \"traefik.http.routers.${router_prefix}.rule=Host(\`34.136.153.216\`) && PathPrefix(\`/api/${service_path}\`)\"\\
      - \"traefik.http.routers.${router_prefix}.entrypoints=web\"\\
      - \"traefik.http.middlewares.${router_prefix}-strip.stripprefix.prefixes=/api/${service_path}\"\\
      - \"traefik.http.routers.${router_prefix}.middlewares=${router_prefix}-strip\"\\
      - \"traefik.http.routers.${router_prefix}.priority=20\"\\
      - \"traefik.http.routers.${router_prefix}-v1.rule=Host(\`34.136.153.216\`) && PathPrefix(\`/api/v1/${service_path}\`)\"\\
      - \"traefik.http.routers.${router_prefix}-v1.entrypoints=web\"\\
      - \"traefik.http.middlewares.${router_prefix}-v1-strip.stripprefix.prefixes=/api/v1/${service_path}\"\\
      - \"traefik.http.routers.${router_prefix}-v1.middlewares=${router_prefix}-v1-strip\"\\
      - \"traefik.http.routers.${router_prefix}-v1.priority=10\"" "$COMPOSE_FILE"
    fi
}

# Update all services
update_service_routes "decision-intelligence" "cde-di" "decision-intelligence"
update_service_routes "patient-clinical-data" "cde-pcd" "patient-clinical-data"
update_service_routes "knowledge-evidence" "cde-ke" "knowledge-evidence"
update_service_routes "workflow-care-pathways" "cde-wcp" "workflow-care-pathways"
update_service_routes "integration-interoperability" "cde-ii" "integration-interoperability"

echo ""
echo "✅ All routes updated!"
EOF

echo ""
echo "🔄 Restarting proxy containers..."
ssh ${VM_USER}@${VM_HOST} "cd ${BASE_DIR} && sudo docker-compose -f docker-compose.traefik-direct.yml restart cde-proxy-decision-intelligence cde-proxy-patient-clinical-data cde-proxy-knowledge-evidence cde-proxy-workflow-care-pathways cde-proxy-integration-interoperability 2>&1 | grep -E '(Restarting|done|error)' || echo 'Containers restarted'"

echo ""
echo "✅ Dual routes applied!"
echo ""
echo "Test endpoints:"
echo "  curl http://${VM_HOST}/api/decision-intelligence/health"
echo "  curl http://${VM_HOST}/api/v1/decision-intelligence/health"

