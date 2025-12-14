#!/bin/bash
# Transfer images using password authentication

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
SSH_PASS=${SSH_PASS:-"kontnt-mixpost"}
APP_NAME=${APP_NAME:-"clinical-decision-engine"}

if ! command -v sshpass &> /dev/null; then
    echo "❌ sshpass not found. Install with: brew install hudochenkov/sshpass/sshpass"
    exit 1
fi

echo "🚀 Transferring images to VM..."
echo ""

# Save images first (if not already done)
if [ ! -d "/tmp/${APP_NAME}-images" ] || [ -z "$(ls -A /tmp/${APP_NAME}-images/*.tar.gz 2>/dev/null)" ]; then
    echo "📦 Saving images..."
    mkdir -p /tmp/${APP_NAME}-images
    rm -rf /tmp/${APP_NAME}-images/*

    for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
        if docker images | grep -q "${APP_NAME}-${service}"; then
            echo "  Saving ${APP_NAME}-${service}..."
            docker save ${APP_NAME}-${service}:latest | gzip > /tmp/${APP_NAME}-images/${service}.tar.gz
        fi
    done
    echo "✅ Images saved"
    echo ""
fi

# Transfer using sshpass
echo "📤 Transferring to ${VM_USER}@${VM_HOST}..."
export SSHPASS="$SSH_PASS"
sshpass -e scp -o StrictHostKeyChecking=no -r /tmp/${APP_NAME}-images ${VM_USER}@${VM_HOST}:/tmp/

echo ""
echo "✅ Images transferred!"
echo ""
echo "Next steps on VM:"
echo "  cd /tmp/${APP_NAME}-images"
echo "  for img in *.tar.gz; do gunzip -c \$img | docker load; done"
echo "  docker images | grep clinical-decision-engine"
