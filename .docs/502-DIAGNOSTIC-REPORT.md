# 502 Bad Gateway Diagnostic Report
## Patient Clinical Data Service

**Error URL**: `http://34.136.153.216/cde/service/patient-clinical-data/resource/care-teams`

**Error**: 502 Bad Gateway (nginx/1.29.4)

## Root Cause Analysis

A 502 Bad Gateway error means:
- ✅ Traefik/nginx is receiving the request
- ❌ Traefik/nginx cannot reach the backend service
- ❌ The backend service is either not running, crashed, or unreachable

## Expected Routing

Based on Traefik configuration:
- **Traefik Route**: `/api/v1/patient-clinical-data` → `clinical-decision-engine-patient-clinical-data:3001`
- **Service Port**: 3001 (internal), 3101 (external)
- **Service Container**: `clinical-decision-engine-patient-clinical-data`

## Potential Causes

### 1. Service Container Not Running (Most Likely)
The service container may have crashed or failed to start.

**Check**:
```bash
ssh root@34.136.153.216 'docker ps -a | grep patient-clinical-data'
```

**Fix**:
```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose up -d patient-clinical-data'
```

### 2. Database Connection Failure (Very Likely)
Based on previous issues, the service may be failing to connect to Supabase.

**Check logs**:
```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose logs --tail=50 patient-clinical-data'
```

**Look for**:
- `❌ Database connection failed`
- `Can't reach database server at aws-1-ap-south-1.pooler.supabase.com:5432`
- `PrismaClientInitializationError`

**Fix**:
1. Verify `DATABASE_URL` in `.env` file on VM
2. Ensure Supabase IP whitelist includes VM IP: `34.136.153.216`
3. Check database connection string format (no `@v2025@` pattern)

### 3. Service Port Mismatch
Service may not be listening on expected port.

**Check**:
```bash
ssh root@34.136.153.216 'docker-compose ps patient-clinical-data'
ssh root@34.136.153.216 'curl -s http://localhost:3101/health'
```

**Expected**: Service should respond on port 3001 internally, exposed as 3101 externally.

### 4. Network Connectivity Issue
Traefik may not be able to reach the service container.

**Check**:
```bash
ssh root@34.136.153.216 'docker network inspect clinical-decision-engine-network'
ssh root@34.136.153.216 'docker exec mixpost_traefik_1 ping clinical-decision-engine-patient-clinical-data'
```

### 5. Traefik Configuration Issue
Traefik may not have the correct routing rules.

**Check**:
```bash
ssh root@34.136.153.216 'docker inspect clinical-decision-engine-patient-clinical-data | grep -A 20 Labels'
```

**Expected Labels**:
```
traefik.enable=true
traefik.http.routers.patient-clinical-data.rule=PathPrefix(`/api/v1/patient-clinical-data`)
traefik.http.services.patient-clinical-data.loadbalancer.server.port=3001
```

## Immediate Diagnostic Steps

Run these commands on the VM to diagnose:

```bash
# 1. Check container status
docker ps -a | grep patient-clinical-data

# 2. Check service logs (last 50 lines)
cd /opt/clinical-decision-engine
docker-compose logs --tail=50 patient-clinical-data

# 3. Check if service is responding locally
curl -v http://localhost:3101/health

# 4. Check Traefik can reach service
docker exec mixpost_traefik_1 wget -qO- http://clinical-decision-engine-patient-clinical-data:3001/health

# 5. Check docker-compose status
docker-compose ps patient-clinical-data

# 6. Check environment variables
docker-compose exec patient-clinical-data env | grep -E "(DATABASE_URL|PORT|HOST)"
```

## Quick Fixes

### Fix 1: Restart Service
```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose restart patient-clinical-data'
```

### Fix 2: Rebuild and Redeploy Service
If the service has compilation issues or missing files:

```bash
# On local machine
cd /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine

# Build patient-clinical-data service
docker build -f Dockerfile.service \
  --build-arg SERVICE_NAME=patient-clinical-data \
  -t clinical-decision-engine-patient-clinical-data:latest .

# Save and transfer
docker save clinical-decision-engine-patient-clinical-data:latest | gzip > /tmp/patient-clinical-data.tar.gz
scp /tmp/patient-clinical-data.tar.gz root@34.136.153.216:/tmp/

# On VM (via SSH)
ssh root@34.136.153.216 << EOF
gunzip -c /tmp/patient-clinical-data.tar.gz | docker load
cd /opt/clinical-decision-engine
docker-compose up -d --force-recreate patient-clinical-data
rm /tmp/patient-clinical-data.tar.gz
EOF
```

### Fix 3: Verify Database Connection
Ensure `.env` file on VM has correct `DATABASE_URL`:

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && cat .env | grep DATABASE_URL'
```

Expected format:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**Important**:
- URL-encode special characters in password (e.g., `@` → `%40`)
- Ensure VM IP (`34.136.153.216`) is whitelisted in Supabase

## Verification

After applying fixes, verify:

1. **Service Health**:
   ```bash
   curl http://34.136.153.216/api/v1/patient-clinical-data/health
   ```

2. **Care Teams Endpoint**:
   ```bash
   curl http://34.136.153.216/api/v1/patient-clinical-data/care-teams
   ```

3. **Via Dashboard Route**:
   ```bash
   curl http://34.136.153.216/cde/service/patient-clinical-data/resource/care-teams
   ```
   (Note: This may not work if dashboard is proxying - check dashboard logs)

## Next Steps

1. **Immediate**: Check service logs to identify exact error
2. **If database issue**: Fix Supabase connection/whitelist
3. **If service crashed**: Check for compilation errors or missing dependencies
4. **If network issue**: Verify Traefik and service are on same network
5. **If still failing**: Rebuild and redeploy service with latest fixes

## Related Issues

- Previous database connectivity issues with Supabase
- Prisma model name fixes (Input suffix) - should be deployed
- Service compilation issues on VM
