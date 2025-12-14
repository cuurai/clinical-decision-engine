#!/bin/bash
# Clean up Docker resources on remote VM
# Run this locally to execute cleanup commands on the remote VM

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
APP_NAME=${APP_NAME:-"clinical-decision-engine"}
SSH_PASS=${SSH_PASS:-"kontnt-mixpost"}

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Cleaning up Docker resources on remote VM${NC}"
echo "VM: ${VM_USER}@${VM_HOST}"
echo ""

# Function to execute command on remote VM
remote_exec() {
    if command -v sshpass &> /dev/null && [ -n "$SSH_PASS" ]; then
        export SSHPASS="$SSH_PASS"
        sshpass -e ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_HOST} "$@"
    else
        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_HOST} "$@"
    fi
}

# Show disk space before cleanup
echo -e "${YELLOW}📊 Disk space before cleanup:${NC}"
remote_exec "df -h / | tail -1"

echo ""
echo -e "${YELLOW}📦 Docker images before cleanup:${NC}"
remote_exec "docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}' | head -10"

echo ""
echo -e "${GREEN}🧹 Starting cleanup...${NC}"
echo ""

# Stop and remove containers (if any)
echo -e "${BLUE}1. Stopping containers...${NC}"
remote_exec "cd /opt/${APP_NAME} 2>/dev/null && docker-compose down 2>/dev/null || true" || true
remote_exec "docker ps -a --filter 'name=${APP_NAME}' -q | xargs -r docker rm -f 2>/dev/null || true"

# Remove app-specific images
echo -e "${BLUE}2. Removing app images...${NC}"
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
    remote_exec "docker rmi ${APP_NAME}-${service}:latest 2>/dev/null || true"
done

# Remove dangling images
echo -e "${BLUE}3. Removing dangling images...${NC}"
remote_exec "docker image prune -af"

# Remove unused volumes
echo -e "${BLUE}4. Removing unused volumes...${NC}"
remote_exec "docker volume prune -f"

# Remove unused networks
echo -e "${BLUE}5. Removing unused networks...${NC}"
remote_exec "docker network prune -f"

# Remove build cache
echo -e "${BLUE}6. Removing build cache...${NC}"
remote_exec "docker builder prune -af"

# Clean up temporary image files
echo -e "${BLUE}7. Cleaning up temporary files...${NC}"
remote_exec "rm -rf /tmp/${APP_NAME}-images 2>/dev/null || true"
remote_exec "rm -rf /tmp/*.tar.gz 2>/dev/null || true"

# System prune (everything unused)
echo -e "${BLUE}8. Final system prune...${NC}"
remote_exec "docker system prune -af --volumes"

echo ""
echo -e "${GREEN}✅ Cleanup complete!${NC}"
echo ""

# Show disk space after cleanup
echo -e "${YELLOW}📊 Disk space after cleanup:${NC}"
remote_exec "df -h / | tail -1"

echo ""
echo -e "${YELLOW}📦 Remaining Docker images:${NC}"
remote_exec "docker images --format 'table {{.Repository}}\t{{.Tag}}\t{{.Size}}' | head -10"

echo ""
echo -e "${GREEN}🎉 Remote cleanup finished!${NC}"
