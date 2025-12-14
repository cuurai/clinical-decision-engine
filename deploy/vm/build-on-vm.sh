#!/bin/bash
# Build images directly on VM - run this ON THE VM

set -e

APP_NAME=${APP_NAME:-"clinical-decision-engine"}
REPO_URL=${REPO_URL:-"https://github.com/your-org/clinical-decision-engine.git"}
BRANCH=${BRANCH:-"deploy/docker-container"}

echo "🚀 Building Docker images on VM"
echo "================================"
echo ""

# Check if repo exists
if [ -d "/tmp/${APP_NAME}" ]; then
    echo "📁 Repository exists, updating..."
    cd /tmp/${APP_NAME}
    git pull
else
    echo "📥 Cloning repository..."
    cd /tmp
    git clone ${REPO_URL} ${APP_NAME}
    cd ${APP_NAME}
    git checkout ${BRANCH} 2>/dev/null || echo "Branch not found, using default"
fi

cd /tmp/${APP_NAME}

echo ""
echo "📦 Building service images..."
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability; do
    echo "Building ${service}..."
    docker build -f Dockerfile.service \
        --build-arg SERVICE_NAME=$service \
        -t ${APP_NAME}-${service}:latest .
done

echo ""
echo "📦 Building dashboard..."
docker build -f Dockerfile.dashboard \
    -t ${APP_NAME}-dashboard:latest .

echo ""
echo "✅ All images built!"
echo ""
echo "Verify:"
docker images | grep clinical-decision-engine

echo ""
echo "Next: Deploy with docker-compose"
echo "  cd /opt/clinical-decision-engine"
echo "  docker-compose up -d"
