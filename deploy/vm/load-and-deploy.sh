#!/bin/bash
# Load images and deploy - run this ON THE VM after images are transferred

set -e

APP_NAME=${APP_NAME:-"clinical-decision-engine"}
DEPLOY_DIR=${DEPLOY_DIR:-"/opt/${APP_NAME}"}

echo "🚀 Loading Images and Deploying"
echo "================================"
echo ""

# Load images
echo "📥 Loading Docker images..."
cd /tmp/${APP_NAME}-images

for img in *.tar.gz; do
    if [ -f "$img" ]; then
        echo "Loading $img..."
        gunzip -c "$img" | docker load
    fi
done

echo ""
echo "✅ Images loaded!"
echo ""
docker images | grep ${APP_NAME}

echo ""
echo "📁 Setting up deployment directory..."
sudo mkdir -p ${DEPLOY_DIR}
sudo chown $USER:$USER ${DEPLOY_DIR}

echo ""
echo "📋 Next steps:"
echo "1. Copy docker-compose.vm.yml to ${DEPLOY_DIR}/docker-compose.yml"
echo "2. Create .env file in ${DEPLOY_DIR}"
echo "3. Run: cd ${DEPLOY_DIR} && docker-compose up -d"
echo ""
echo "To copy docker-compose.yml, run on your local machine:"
echo "  scp deploy/vm/docker-compose.vm.yml info@34.136.153.216:${DEPLOY_DIR}/docker-compose.yml"
