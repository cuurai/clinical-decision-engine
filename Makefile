# Makefile for Clinical Decision Engine Docker operations

.PHONY: help build build-all build-service build-dashboard up down logs clean test

# Default target
help:
	@echo "Clinical Decision Engine - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  make build-all          - Build all Docker images"
	@echo "  make build-service      - Build a specific service (SERVICE=decision-intelligence)"
	@echo "  make build-dashboard    - Build dashboard image"
	@echo "  make up                 - Start all services with docker-compose"
	@echo "  make down               - Stop all services"
	@echo "  make logs               - View logs from all services"
	@echo "  make clean              - Remove all containers and images"
	@echo "  make test               - Run tests in containers"
	@echo ""

# Build all images
build-all:
	docker-compose build

# Build a specific service
build-service:
	@if [ -z "$(SERVICE)" ]; then \
		echo "Error: SERVICE variable is required"; \
		echo "Usage: make build-service SERVICE=decision-intelligence"; \
		exit 1; \
	fi
	docker build -f Dockerfile.service \
		--build-arg SERVICE_NAME=$(SERVICE) \
		-t clinical-decision-engine-$(SERVICE):latest .

# Build dashboard
build-dashboard:
	docker build -f Dockerfile.dashboard \
		-t clinical-decision-engine-dashboard:latest .

# Start all services
up:
	docker-compose up -d

# Stop all services
down:
	docker-compose down

# View logs
logs:
	docker-compose logs -f

# Clean up
clean:
	docker-compose down -v
	docker system prune -f

# Run tests
test:
	docker-compose exec decision-intelligence npm test || true
	docker-compose exec patient-clinical-data npm test || true

# GCP deployment commands
.PHONY: gcp-build gcp-deploy gcp-setup

# Setup GCP
gcp-setup:
	@echo "Setting up GCP..."
	gcloud services enable cloudbuild.googleapis.com
	gcloud services enable run.googleapis.com
	gcloud services enable containerregistry.googleapis.com

# Build on GCP
gcp-build:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID variable is required"; \
		echo "Usage: make gcp-build PROJECT_ID=your-project-id"; \
		exit 1; \
	fi
	gcloud builds submit --config cloudbuild.yaml \
		--substitutions=_GCP_PROJECT_ID=$(PROJECT_ID)

# Deploy to GCP
gcp-deploy:
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "Error: PROJECT_ID variable is required"; \
		echo "Usage: make gcp-deploy PROJECT_ID=your-project-id DATABASE_URL=postgresql://..."; \
		exit 1; \
	fi
	export GCP_PROJECT_ID=$(PROJECT_ID) && \
	export DATABASE_URL=$(DATABASE_URL) && \
	./deploy/gcp/deploy.sh

# VM deployment commands
.PHONY: vm-deploy vm-setup

# Deploy to VM
vm-deploy:
	@if [ -z "$(VM_HOST)" ]; then \
		echo "Error: VM_HOST variable is required"; \
		echo "Usage: make vm-deploy VM_HOST=34.136.153.216 VM_USER=root"; \
		exit 1; \
	fi
	export VM_HOST=$(VM_HOST) && \
	export VM_USER=$(VM_USER:-root) && \
	export SSH_KEY=$(SSH_KEY) && \
	./deploy/vm/deploy.sh

# Setup VM (first time)
vm-setup:
	@if [ -z "$(VM_HOST)" ]; then \
		echo "Error: VM_HOST variable is required"; \
		echo "Usage: make vm-setup VM_HOST=34.136.153.216 VM_USER=root"; \
		exit 1; \
	fi
	ssh $(VM_USER:-root)@$(VM_HOST) "mkdir -p /opt/clinical-decision-engine && docker --version && docker-compose --version"
