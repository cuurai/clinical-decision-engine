# Docker Images Overview

## Total Images: **6**

The Clinical Decision Engine requires **6 Docker images** to be built and packaged.

## ⚠️ IMPORTANT: Environment Configuration (.env)

**CRITICAL:** All Docker deployments **MUST** use a `.env` file for configuration. The `.env` file is **required** and contains essential environment variables for:

- Database connection (lines 3-4: `POSTGRES_USER` and `POSTGRES_PASSWORD`)
- Service ports configuration
- API endpoints
- Database URLs

**The `.env` file must be present in the deployment directory** (`/opt/clinical-decision-engine/.env` on VM) before running `docker-compose up`.

See [Environment Configuration](#environment-configuration) section below for details.

### 1. Domain Services (5 images)

All services use the same `Dockerfile.service` with a `SERVICE_NAME` build argument:

| Service Name | Image Name | Port | Dockerfile |
|-------------|------------|------|------------|
| `decision-intelligence` | `clinical-decision-engine-decision-intelligence:latest` | 3000 | `Dockerfile.service` |
| `patient-clinical-data` | `clinical-decision-engine-patient-clinical-data:latest` | 3001 | `Dockerfile.service` |
| `knowledge-evidence` | `clinical-decision-engine-knowledge-evidence:latest` | 3002 | `Dockerfile.service` |
| `workflow-care-pathways` | `clinical-decision-engine-workflow-care-pathways:latest` | 3003 | `Dockerfile.service` |
| `integration-interoperability` | `clinical-decision-engine-integration-interoperability:latest` | 3004 | `Dockerfile.service` |

**Build Command:**
```bash
docker build --platform linux/amd64 \
  -f Dockerfile.service \
  --build-arg SERVICE_NAME=<service-name> \
  -t clinical-decision-engine-<service-name>:latest .
```

### 2. Dashboard (1 image)

| Service Name | Image Name | Port | Dockerfile |
|-------------|------------|------|------------|
| `dashboard` | `clinical-decision-engine-dashboard:latest` | 8080 | `Dockerfile.dashboard` |

**Build Command:**
```bash
docker build --platform linux/amd64 \
  -f Dockerfile.dashboard \
  -t clinical-decision-engine-dashboard:latest .
```

## Quick Build All Images

### Mac M1 (Apple Silicon) - Recommended

**Use the M1-optimized build script:**
```bash
./deploy/vm/build-images-m1.sh
```

This script:
- ✅ Sets up Docker Buildx for cross-platform builds
- ✅ Builds all 6 images for `linux/amd64` (required for VM)
- ✅ Shows progress and timing
- ✅ Verifies image platforms
- ⚠️ **Note:** Building for amd64 on M1 uses emulation (slower, ~10-20 min)

### Using Standard Helper Script
```bash
./deploy/vm/cleanup-and-rebuild.sh
```

### Manual Build (Mac M1)

**Important:** On Mac M1, use `docker buildx build` instead of `docker build`:

```bash
# Build all services
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability; do
    docker buildx build --platform linux/amd64 --load \
        -f Dockerfile.service \
        --build-arg SERVICE_NAME=$service \
        -t clinical-decision-engine-${service}:latest .
done

# Build dashboard
docker buildx build --platform linux/amd64 --load \
    -f Dockerfile.dashboard \
    -t clinical-decision-engine-dashboard:latest .
```

**Note:** The `--load` flag is required to load the image into local Docker after building with buildx.

### Manual Build (Linux/AMD64)

On Linux/AMD64 systems, you can use standard `docker build`:

```bash
# Build all services
for service in decision-intelligence patient-clinical-data knowledge-evidence workflow-care-pathways integration-interoperability; do
    docker build --platform linux/amd64 \
        -f Dockerfile.service \
        --build-arg SERVICE_NAME=$service \
        -t clinical-decision-engine-${service}:latest .
done

# Build dashboard
docker build --platform linux/amd64 \
    -f Dockerfile.dashboard \
    -t clinical-decision-engine-dashboard:latest .
```

## Image Sizes (Approximate)

- **Service images**: ~200-300 MB each (includes Node.js runtime + dependencies)
- **Dashboard image**: ~150-200 MB (includes static files + serve)

## Image Naming Convention

All images follow the pattern:
```
clinical-decision-engine-<service-name>:latest
```

Where `<service-name>` is one of:
- `decision-intelligence`
- `patient-clinical-data`
- `knowledge-evidence`
- `workflow-care-pathways`
- `integration-interoperability`
- `dashboard`

## Database: Supabase

**⚠️ IMPORTANT:** This project uses **Supabase** as the database provider, not a local PostgreSQL container.

- **No PostgreSQL container needed** - Services connect directly to Supabase
- **Use Supabase docker-compose files**: `docker-compose-supabase.yml` or `docker-compose.traefik-supabase.yml`
- **DATABASE_URL** in `.env` must point to your Supabase connection string

## Environment Configuration

### ⚠️ CRITICAL: .env File Required

**All Docker deployments MUST use a `.env` file.** This file contains essential configuration that Docker Compose reads at runtime.

### Required .env File Location

- **VM Deployment**: `/opt/clinical-decision-engine/.env`
- **Local Development**: Root directory `.env`

### Essential .env Variables

The `.env` file must include (at minimum):

```env
# Database Configuration (CRITICAL - lines 3-4)
# Supabase Connection String - Get this from your Supabase project settings
DATABASE_URL=postgresql://postgres:YOUR_SUPABASE_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Service Ports (VM deployment)
DECISION_INTELLIGENCE_PORT=3100
PATIENT_CLINICAL_DATA_PORT=3101
KNOWLEDGE_EVIDENCE_PORT=3102
WORKFLOW_CARE_PATHWAYS_PORT=3103
INTEGRATION_INTEROPERABILITY_PORT=3104
DASHBOARD_PORT=8081

# API Configuration
VITE_API_BASE_URL=http://34.136.153.216:3100
VM_HOST=34.136.153.216
```

**Supabase Connection String Format:**
```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Where to find your Supabase connection string:**
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Copy the **Connection string** under "Connection string" section
4. Replace `[YOUR-PASSWORD]` with your actual database password

### Creating .env File

**Option 1: Use Helper Script**
```bash
# On VM
./deploy/vm/create-env.sh
```

**Option 2: Manual Creation**
```bash
# On VM
cd /opt/clinical-decision-engine
nano .env
# Paste the content above and update POSTGRES_PASSWORD
```

### ⚠️ Security Notes

1. **Never commit `.env` to git** - it's in `.gitignore`
2. **Change default passwords** - Update `POSTGRES_PASSWORD` from defaults
3. **Set proper permissions**: `chmod 600 .env`
4. **Keep `.env` secure** - Contains sensitive credentials

### Verification

Verify `.env` file exists and contains Supabase connection:
```bash
# On VM
ls -la /opt/clinical-decision-engine/.env
cat /opt/clinical-decision-engine/.env | grep DATABASE_URL

# Should show Supabase connection string like:
# DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

**Without `.env` or with incorrect `DATABASE_URL`, services will fail to connect to Supabase!**

## Verification

After building, verify all images exist:
```bash
docker images | grep clinical-decision-engine
```

You should see 6 images:
```
clinical-decision-engine-dashboard                    latest    ...    ... MB
clinical-decision-engine-decision-intelligence        latest    ...    ... MB
clinical-decision-engine-integration-interoperability latest    ...    ... MB
clinical-decision-engine-knowledge-evidence           latest    ...    ... MB
clinical-decision-engine-patient-clinical-data        latest    ...    ... MB
clinical-decision-engine-workflow-care-pathways       latest    ...    ... MB
```
