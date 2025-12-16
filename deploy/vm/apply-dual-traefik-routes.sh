#!/bin/bash
# Apply dual Traefik routes: /api/{service} (primary) and /api/v1/{service} (backward compatibility)
# This ensures dashboard works without changes while supporting future /v1 paths

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
BASE_DIR="/opt/clinical-decision-engine-code/clinical-decision-engine-20251215-174550"
COMPOSE_FILE="${BASE_DIR}/docker-compose.traefik-direct.yml"

echo "🔧 Applying Dual Traefik Routes"
echo "================================"
echo ""
echo "This will add routes for:"
echo "  Primary: /api/{service} (dashboard-compatible)"
echo "  Secondary: /api/v1/{service} (backward/future compatibility)"
echo ""

# Service configuration mapping
declare -A SERVICES=(
    ["decision-intelligence"]="cde-di"
    ["patient-clinical-data"]="cde-pcd"
    ["knowledge-evidence"]="cde-ke"
    ["workflow-care-pathways"]="cde-wcp"
    ["integration-interoperability"]="cde-ii"
)

ssh ${VM_USER}@${VM_HOST} << 'EOF'
set -e
BASE_DIR="/opt/clinical-decision-engine-code/clinical-decision-engine-20251215-174550"
COMPOSE_FILE="${BASE_DIR}/docker-compose.traefik-direct.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: $COMPOSE_FILE not found"
    exit 1
fi

# Backup original
cp "$COMPOSE_FILE" "${COMPOSE_FILE}.backup.$(date +%Y%m%d-%H%M%S)"

echo "📝 Updating Traefik routes for all services..."

# Function to add dual routes for a service
add_dual_routes() {
    local service_name=$1
    local router_prefix=$2
    local service_path=$3
    
    # Check if primary route already exists
    if grep -q "traefik.http.routers.${router_prefix}.rule.*PathPrefix.*/api/${service_path}" "$COMPOSE_FILE"; then
        echo "  ✅ ${service_name}: Primary route already exists"
    else
        echo "  ➕ ${service_name}: Adding primary route /api/${service_path}"
        
        # Find the labels section for this service
        # Add primary route labels before the existing service port label
        sed -i "/traefik.http.services.${router_prefix}.loadbalancer.server.port=80/i\\
      - \"traefik.http.routers.${router_prefix}.rule=Host(\`34.136.153.216\`) && PathPrefix(\`/api/${service_path}\`)\"\\
      - \"traefik.http.routers.${router_prefix}.entrypoints=web\"\\
      - \"traefik.http.middlewares.${router_prefix}-strip.stripprefix.prefixes=/api/${service_path}\"\\
      - \"traefik.http.routers.${router_prefix}.middlewares=${router_prefix}-strip\"\\
      - \"traefik.http.routers.${router_prefix}.priority=20\"" "$COMPOSE_FILE"
    fi
    
    # Check if secondary route already exists
    if grep -q "traefik.http.routers.${router_prefix}-v1.rule.*PathPrefix.*/api/v1/${service_path}" "$COMPOSE_FILE"; then
        echo "  ✅ ${service_name}: Secondary route already exists"
    else
        echo "  ➕ ${service_name}: Adding secondary route /api/v1/${service_path}"
        
        # Add secondary route labels
        sed -i "/traefik.http.routers.${router_prefix}.priority=20/a\\
      - \"traefik.http.routers.${router_prefix}-v1.rule=Host(\`34.136.153.216\`) && PathPrefix(\`/api/v1/${service_path}\`)\"\\
      - \"traefik.http.routers.${router_prefix}-v1.entrypoints=web\"\\
      - \"traefik.http.middlewares.${router_prefix}-v1-strip.stripprefix.prefixes=/api/v1/${service_path}\"\\
      - \"traefik.http.routers.${router_prefix}-v1.middlewares=${router_prefix}-v1-strip\"\\
      - \"traefik.http.routers.${router_prefix}-v1.priority=10\"" "$COMPOSE_FILE"
    fi
}

# Update each service
add_dual_routes "decision-intelligence" "cde-di" "decision-intelligence"
add_dual_routes "patient-clinical-data" "cde-pcd" "patient-clinical-data"
add_dual_routes "knowledge-evidence" "cde-ke" "knowledge-evidence"
add_dual_routes "workflow-care-pathways" "cde-wcp" "workflow-care-pathways"
add_dual_routes "integration-interoperability" "cde-ii" "integration-interoperability"

echo ""
echo "✅ Traefik routes updated!"
echo ""
echo "Restarting proxy containers to pick up new routes..."
cd "$BASE_DIR"
docker-compose -f docker-compose.traefik-direct.yml restart cde-proxy-decision-intelligence cde-proxy-patient-clinical-data cde-proxy-knowledge-evidence cde-proxy-workflow-care-pathways cde-proxy-integration-interoperability 2>/dev/null || echo "Note: Some containers may not exist yet"

echo ""
echo "✅ Configuration applied!"
EOF

echo ""
echo "🎉 Dual routes applied!"
echo ""
echo "Test endpoints:"
echo "  curl http://${VM_HOST}/api/decision-intelligence/health"
echo "  curl http://${VM_HOST}/api/v1/decision-intelligence/health"

