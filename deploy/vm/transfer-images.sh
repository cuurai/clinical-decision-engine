#!/bin/bash
# Transfer images to VM - run this locally

set -e

VM_HOST=${VM_HOST:-"34.136.153.216"}
VM_USER=${VM_USER:-"info"}
APP_NAME=${APP_NAME:-"clinical-decision-engine"}

echo "🚀 Transferring Docker images to VM"
echo "===================================="
echo ""

# Save images
echo "📦 Saving images..."
mkdir -p /tmp/${APP_NAME}-images
rm -rf /tmp/${APP_NAME}-images/*

for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability dashboard; do
    if docker images | grep -q "${APP_NAME}-${service}"; then
        echo "Saving ${APP_NAME}-${service}..."
        docker save ${APP_NAME}-${service}:latest | gzip > /tmp/${APP_NAME}-images/${service}.tar.gz
    else
        echo "⚠️  Image ${APP_NAME}-${service} not found - skipping"
    fi
done

echo ""
echo "✅ Images saved to /tmp/${APP_NAME}-images/"
echo ""
echo "📤 Now transfer to VM:"
echo "   scp -r /tmp/${APP_NAME}-images ${VM_USER}@${VM_HOST}:/tmp/"
echo ""
echo "Then on VM, run:"
echo "   cd /tmp/${APP_NAME}-images"
echo "   for img in *.tar.gz; do gunzip -c \$img | docker load; done"
