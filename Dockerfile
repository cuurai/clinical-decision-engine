# Multi-stage Dockerfile for Clinical Decision Engine Monorepo
# Builds all services and dashboard for production deployment

FROM node:20-alpine AS base

# Install dependencies needed for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl \
    libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY platform/adapters/package.json ./platform/adapters/
COPY platform/services/src/*/package.json ./platform/services/src/*/
COPY dashboard/package.json ./dashboard/

# Install root dependencies
RUN npm ci --workspaces=false

# Stage 1: Build core package
FROM base AS core-builder
WORKDIR /app
COPY packages/core ./packages/core
RUN cd packages/core && npm ci && npm run build

# Stage 2: Build adapters
FROM base AS adapters-builder
WORKDIR /app
COPY --from=core-builder /app/packages/core ./packages/core
COPY platform/adapters ./platform/adapters
RUN cd platform/adapters && npm ci && npm run build

# Stage 3: Generate Prisma clients
FROM base AS prisma-generator
WORKDIR /app
COPY --from=core-builder /app/packages/core ./packages/core
COPY --from=adapters-builder /app/platform/adapters ./platform/adapters
COPY platform/adapters/src/*/prisma ./platform/adapters/src/*/prisma
COPY scripts/generate-prisma-clients.sh ./scripts/
RUN chmod +x scripts/generate-prisma-clients.sh && \
    npm ci --workspaces=false && \
    cd packages/core && npm ci && \
    cd ../../platform/adapters && npm ci && \
    cd ../../ && \
    # Generate Prisma clients for all services
    for service in decision-intelligence integration-interoperability knowledge-evidence patient-clinical-data workflow-care-pathways; do \
      if [ -f "platform/adapters/src/${service}/prisma/schema.prisma" ]; then \
        echo "Generating Prisma client for ${service}..."; \
        npx prisma@6 generate --schema="platform/adapters/src/${service}/prisma/schema.prisma" || true; \
      fi; \
    done

# Stage 4: Build all services
FROM base AS services-builder
WORKDIR /app
COPY --from=core-builder /app/packages/core ./packages/core
COPY --from=adapters-builder /app/platform/adapters ./platform/adapters
COPY --from=prisma-generator /app/platform/adapters ./platform/adapters

# Copy shared files and build each service
COPY platform/services/src/shared ./platform/services/src/shared
COPY platform/services/src/decision-intelligence ./platform/services/src/decision-intelligence
COPY platform/services/src/patient-clinical-data ./platform/services/src/patient-clinical-data
COPY platform/services/src/knowledge-evidence ./platform/services/src/knowledge-evidence
COPY platform/services/src/workflow-care-pathways ./platform/services/src/workflow-care-pathways
COPY platform/services/src/integration-interoperability ./platform/services/src/integration-interoperability

# Install and build each service
RUN cd platform/services/src/decision-intelligence && npm ci && npm run build && \
    cd ../patient-clinical-data && npm ci && npm run build && \
    cd ../knowledge-evidence && npm ci && npm run build && \
    cd ../workflow-care-pathways && npm ci && npm run build && \
    cd ../integration-interoperability && npm ci && npm run build

# Stage 5: Build dashboard
FROM base AS dashboard-builder
WORKDIR /app
COPY --from=core-builder /app/packages/core ./packages/core
COPY dashboard ./dashboard
RUN cd dashboard && npm ci && npm run build

# Stage 6: Production runtime
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    libc6-compat \
    dumb-init

WORKDIR /app

# Copy built artifacts (including dist folders)
COPY --from=core-builder /app/packages/core ./packages/core
COPY --from=adapters-builder /app/platform/adapters ./platform/adapters
COPY --from=prisma-generator /app/platform/adapters ./platform/adapters
COPY --from=services-builder /app/platform/services/src ./platform/services/src
COPY --from=dashboard-builder /app/dashboard/dist ./dashboard/dist
COPY --from=dashboard-builder /app/dashboard/package.json ./dashboard/

# Copy package files for runtime
COPY package*.json ./
COPY packages/core/package.json ./packages/core/
COPY platform/adapters/package.json ./platform/adapters/
COPY platform/services/src/*/package.json ./platform/services/src/*/

# Verify core/dist exists and install production dependencies only
RUN test -d packages/core/dist || (echo "ERROR: packages/core/dist not found!" && exit 1) && \
    npm ci --workspaces=false --omit=dev && \
    cd packages/core && npm ci --omit=dev && \
    cd ../../platform/adapters && npm ci --omit=dev && \
    cd ../../platform/services/src/decision-intelligence && npm ci --omit=dev && \
    cd ../patient-clinical-data && npm ci --omit=dev && \
    cd ../knowledge-evidence && npm ci --omit=dev && \
    cd ../workflow-care-pathways && npm ci --omit=dev && \
    cd ../integration-interoperability && npm ci --omit=dev

# Copy startup script
COPY docker/start.sh /app/docker/start.sh
RUN chmod +x /app/docker/start.sh

# Expose ports (services will use different ports via env)
EXPOSE 3000 3001 3002 3003 3004 8080

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/docker/start.sh"]

