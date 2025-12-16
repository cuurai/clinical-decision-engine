# Work Session Summary: Service Routing & Database Connection Fixes

**Date:** December 16, 2025
**Branch:** `dev/deploy-docker`
**Commit:** `7a0f243`

## Executive Summary

Successfully resolved critical routing and database connection issues affecting 5 microservices in the Clinical Decision Engine. All services now return **200 OK** on both `/api/{service}` and `/api/v1/{service}` paths.

### Final Status

- ✅ **decision-intelligence**: 200 OK
- ✅ **patient-clinical-data**: 200 OK
- ✅ **knowledge-evidence**: 200 OK
- ✅ **workflow-care-pathways**: 200 OK (was 502)
- ✅ **integration-interoperability**: 200 OK (was 502)

---

## Issues Resolved

### 1. Traefik Routing Configuration

**Problem:** Dashboard calling `/api/{service}` but Traefik only routing `/api/v1/{service}` → 404 errors

**Root Cause:**

- Traefik labels only configured for `/api/v1/{service}` path
- Dashboard hardcoded to use `/api/{service}` (without `/v1`)
- No `stripprefix` middleware, causing backend to receive wrong paths

**Solution:**

- Implemented **dual routing** in Traefik:
  - Primary route: `/api/{service}` (priority 20) - dashboard-compatible
  - Secondary route: `/api/v1/{service}` (priority 10) - future-safe
- Added `stripprefix` middleware to both routes
- Updated `dashboard/src/services/core/api-client.ts` to construct paths correctly
- Set `VITE_API_BASE_URL=http://34.136.153.216` (no `/api` or `/v1` prefix)

**Key Files:**

- `deploy/vm/docker-compose.traefik-supabase.yml`
- `deploy/vm/docker-compose.traefik.yml`
- `dashboard/src/services/core/api-client.ts`

**Lesson:** Always verify routing at **every layer** (Traefik → Nginx → Service). Path prefixes must be stripped before reaching backend.

---

### 2. Missing Compiled Adapter Files

**Problem:** `workflow-care-pathways` and `integration-interoperability` returning 502 with `ERR_MODULE_NOT_FOUND`

**Root Cause:**

- Adapter packages not built/deployed to VM
- Missing files: `workflow-definition-transition.dao.repository.js`
- Workspace dependencies (`@cuur/adapters-*`) not properly linked

**Solution:**

1. Rebuilt adapters locally:
   ```bash
   cd platform/adapters/workflow-care-pathways && npm run build
   cd platform/adapters/integration-interoperability && npm run build
   ```
2. Copied `dist/` folders to VM via `scp`
3. Fixed workspace symlinks:
   - `integration-interoperability` needed a **copy** instead of symlink (ESM resolution issue)
   - Created proper `node_modules/@cuur/adapters-*` links

**Key Files:**

- `platform/adapters/workflow-care-pathways/dist/`
- `platform/adapters/integration-interoperability/dist/`
- `platform/services/*/node_modules/@cuur/`

**Lesson:** In monorepos, **always verify workspace dependencies are built AND deployed**. ESM modules require exact file paths - symlinks can fail.

---

### 3. Corrupted `.env` File

**Problem:** Services failing with `P1000` (authentication failed) despite correct credentials

**Root Cause:**

- `.env` file had **malformed DATABASE_URL**:
  ```
  DATABASE_URL="postgresql:REDACTED@aws-1-ap-south-1.pooler.supabase.com:REDACTED@aws-1-ap-south-1.pooler.supabase.com:..."
  ```
- Missing `//` after `postgresql:`
- Multiple concatenated URLs
- Malformed query string (`sslmode=requireconnect_timeout=10` missing `&`)

**Solution:**

1. Fixed `.env` with single, valid URL
2. **URL-encoded password**: `@` → `%40` (critical!)
   ```
   DATABASE_URL=postgresql://postgres.skxcbvztdnhklffhwkdl:cuurD%40v2025@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&connect_timeout=10
   ```
3. Restarted services to load new env vars

**Key Files:**

- `/opt/clinical-decision-engine-code/clinical-decision-engine-20251215-174550/.env`

**Lesson:**

- **Always URL-encode special characters** in passwords (`@ : / ? # %`)
- Validate `.env` files before deployment
- **Restart services after env changes** - dotenv loads once at startup

---

### 4. Environment Variable Loading

**Problem:** Services showing `P1012` (DATABASE_URL undefined) after `.env` fix

**Root Cause:**

- Services started without loading `.env`:
  ```bash
  PORT=4003 nohup node dist/main.js &  # ❌ No DATABASE_URL
  ```
- Prisma reads `process.env.DATABASE_URL` **immediately** at import
- No dotenv loading in service code

**Solution:**

- Started services with explicit `DATABASE_URL` export:
  ```bash
  export DATABASE_URL="postgresql://..." && PORT=4003 nohup node dist/main.js &
  ```
- Fixed `.env` file for future dotenv usage

**Lesson:**

- Environment variables are **read at process startup** - changing `.env` never affects running processes
- Prisma initializes **before** app code can load dotenv
- Either: export env vars at startup OR load dotenv **before** Prisma imports

---

## Critical Lessons Learned

### 1. Docker Container Label Updates

**❌ WRONG:**

```bash
docker restart container  # Labels don't update
docker-compose up -d       # Without down, labels don't update
```

**✅ CORRECT:**

```bash
docker-compose down        # Stop AND remove containers
docker-compose up -d       # Recreate with new labels
```

**Why:** Traefik reads labels from container metadata. Labels are set **at container creation**, not at runtime.

---

### 2. Environment Variable Debugging

**❌ WRONG:**

```bash
cat /proc/$pid/environ | grep DATABASE_URL  # Shows nothing if loaded via dotenv
```

**✅ CORRECT:**

```bash
# Check from inside Node
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"

# Or check actual process
ps aux | grep "node.*service" | grep DATABASE_URL
```

**Why:** `/proc/$pid/environ` only shows **OS-level env vars**, not variables loaded by Node.js dotenv.

---

### 3. URL Encoding in Connection Strings

**❌ WRONG:**

```
postgresql://user:password@host  # If password contains @
```

**✅ CORRECT:**

```
postgresql://user:password%40value@host  # @ encoded as %40
```

**Special characters that MUST be URL-encoded:**

- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `%` → `%25`

---

### 4. Monorepo Workspace Dependencies

**Common Issues:**

- Adapters not built → `ERR_MODULE_NOT_FOUND`
- Symlinks fail with ESM → use copies for `integration-interoperability`
- Services need `node_modules/@cuur/adapters-*` links

**Best Practice:**

1. Build all adapters before deployment
2. Copy `dist/` folders to VM
3. Verify symlinks/copies exist in `node_modules/@cuur/`
4. Test import from service directory: `node -e "import('@cuur/adapters-*')"`

---

### 5. Service Startup Sequence

**Correct Order:**

1. Stop existing processes: `pkill -f service-name`
2. Set environment variables: `export DATABASE_URL="..."`
3. Start service: `nohup node dist/main.js &`
4. Wait for startup: `sleep 3`
5. Verify: `curl http://localhost:PORT/health`

**Critical:** Always restart services after:

- `.env` file changes
- Environment variable updates
- Prisma client regeneration

---

## Debugging Checklist for Future Agents

### When Services Return 502:

1. ✅ Check if service process is running: `ps aux | grep service-name`
2. ✅ Check service logs: `tail -30 /tmp/service-name.log`
3. ✅ Verify Nginx proxy config: `cat nginx-service-proxy.conf`
4. ✅ Verify Traefik routing: `docker inspect container | grep -A 10 Labels`
5. ✅ Test direct service: `curl http://localhost:PORT/health`
6. ✅ Check adapter dependencies: `ls node_modules/@cuur/adapters-*/dist/`

### When Services Return 404:

1. ✅ Verify Traefik PathPrefix matches request path
2. ✅ Check stripprefix middleware is configured
3. ✅ Verify backend receives correct path (check service logs)
4. ✅ Test both `/api/{service}` and `/api/v1/{service}` paths

### When Database Connection Fails:

1. ✅ Check DATABASE_URL format (URL-encoded password?)
2. ✅ Verify `.env` file is valid (not corrupted/concatenated)
3. ✅ Check if service loaded env vars: `node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"`
4. ✅ Verify Prisma client generated: `ls node_modules/.prisma/client`
5. ✅ Test connection string manually: `psql "$DATABASE_URL"`

---

## Architecture Notes

### Routing Flow

```
Client Request
    ↓
Traefik (Port 80)
    ├─ PathPrefix: /api/{service} → stripprefix → Nginx Proxy
    └─ PathPrefix: /api/v1/{service} → stripprefix → Nginx Proxy
    ↓
Nginx Proxy Container
    ├─ proxy_pass → http://172.18.0.1:4000-4004
    ↓
Node.js Service (Port 4000-4004)
    ├─ Fastify Server
    └─ Prisma Client → Supabase PostgreSQL
```

### Service Ports

- **decision-intelligence**: 4000
- **patient-clinical-data**: 4001
- **knowledge-evidence**: 4002
- **workflow-care-pathways**: 4003
- **integration-interoperability**: 4004

### Environment Variables

- **VITE_API_BASE_URL**: `http://34.136.153.216` (no `/api` prefix)
- **DATABASE_URL**: Must be URL-encoded, single valid connection string
- **NODE_ENV**: `production`
- **PORT**: Service-specific (4000-4004)

---

## Files Modified

### Configuration

- `deploy/vm/docker-compose.traefik-supabase.yml` - Dual routing rules
- `deploy/vm/docker-compose.traefik.yml` - Dual routing rules
- `dashboard/src/services/core/api-client.ts` - Path construction

### Deployment Scripts

- `deploy/vm/apply-dual-traefik-routes.sh`
- `deploy/vm/apply-dual-traefik-routes-direct.sh`
- `deploy/vm/start-all-services.sh`
- `deploy/vm/fix-all-services-ports.sh`

### Documentation

- `.docs/502-DIAGNOSTIC-REPORT.md`
- `.docs/TRAEFIK-PATH-STRIP-FIX.md`
- `.docs/WORK-SESSION-SUMMARY.md` (this file)

---

## Recommendations for Future Work

### 1. Environment Variable Management

- **Use systemd** or **supervisor** for service management
- Store secrets in **AWS SSM** or **HashiCorp Vault**
- Validate DATABASE_URL format at startup

### 2. Deployment Automation

- Create unified deployment script that:
  - Builds all adapters
  - Copies dist folders
  - Validates .env file
  - Restarts services with correct env vars

### 3. Health Checks

- Add startup health check script
- Verify all services before marking deployment complete
- Monitor service logs for errors

### 4. Documentation

- Document all service ports and routing rules
- Create troubleshooting runbook
- Keep `.env` examples with URL-encoded passwords

---

## Key Takeaways

1. **Always restart containers after label changes** - `docker-compose down && up`
2. **URL-encode special characters** in connection strings
3. **Verify workspace dependencies** are built and deployed in monorepos
4. **Check environment variables** from inside Node, not just `/proc`
5. **Test routing at every layer** - Traefik → Nginx → Service
6. **Restart services after env changes** - no hot-reload for env vars
7. **Validate `.env` files** before deployment - corruption causes silent failures

---

## Success Metrics

- ✅ All 5 services returning 200 OK
- ✅ Both routing paths working (`/api/{service}` and `/api/v1/{service}`)
- ✅ Database connections successful
- ✅ No 502 or 404 errors
- ✅ Traefik routing properly configured
- ✅ All adapter dependencies resolved

---

**End of Summary**
