# Traefik Path Prefix Strip Fix

## Problem

502 Bad Gateway errors were occurring because Traefik was forwarding requests to backend services **without stripping the path prefix**.

### Example:
- **Request**: `http://34.136.153.216/api/v1/patient-clinical-data/care-teams`
- **Traefik forwarded**: `/api/v1/patient-clinical-data/care-teams` (with prefix)
- **Service expected**: `/care-teams` (without prefix)
- **Result**: 404 or 502 error

## Root Cause

Traefik was configured to route requests matching `/api/v1/{service-name}` to the backend services, but it wasn't stripping the prefix before forwarding. The services expect routes like `/care-teams`, not `/api/v1/patient-clinical-data/care-teams`.

## Solution

Added `stripprefix` middleware to all API services in Traefik configuration. This middleware removes the `/api/v1/{service-name}` prefix before forwarding requests to the backend.

### Configuration Added

For each service, added these labels:
```yaml
- "traefik.http.middlewares.{service}-strip.stripprefix.prefixes=/api/v1/{service-name}"
- "traefik.http.routers.{service}.middlewares={service}-strip"
```

### Example for patient-clinical-data:
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.patient-clinical-data.rule=Host(`34.136.153.216`) && PathPrefix(`/api/v1/patient-clinical-data`)"
  - "traefik.http.routers.patient-clinical-data.entrypoints=web"
  - "traefik.http.middlewares.patient-clinical-data-strip.stripprefix.prefixes=/api/v1/patient-clinical-data"
  - "traefik.http.routers.patient-clinical-data.middlewares=patient-clinical-data-strip"
  - "traefik.http.services.patient-clinical-data.loadbalancer.server.port=3001"
```

## Files Updated

1. **`deploy/vm/docker-compose.traefik-supabase.yml`**
   - Added stripprefix middleware for:
     - `decision-intelligence`
     - `patient-clinical-data`
     - `knowledge-evidence`
     - `integration-interoperability`

2. **`deploy/vm/docker-compose.traefik.yml`**
   - Added stripprefix middleware for:
     - `decision-intelligence`
     - `patient-clinical-data`
     - `knowledge-evidence`
     - `workflow-care-pathways`
     - `integration-interoperability`

## How to Apply

### Option 1: Update docker-compose.yml on VM

If using `docker-compose.traefik-supabase.yml`:

```bash
# Copy updated file to VM
scp deploy/vm/docker-compose.traefik-supabase.yml root@34.136.153.216:/opt/clinical-decision-engine/docker-compose.yml

# Restart services to pick up new Traefik labels
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose up -d'
```

### Option 2: Restart Traefik to pick up new labels

Traefik should automatically detect label changes, but you may need to restart containers:

```bash
ssh root@34.136.153.216 'cd /opt/clinical-decision-engine && docker-compose restart'
```

Or restart Traefik itself:

```bash
ssh root@34.136.153.216 'docker restart mixpost_traefik_1'
```

## Verification

After applying the fix, test the endpoints:

```bash
# Test care-teams endpoint
curl http://34.136.153.216/api/v1/patient-clinical-data/care-teams

# Test health endpoint
curl http://34.136.153.216/api/v1/patient-clinical-data/health

# Test other services
curl http://34.136.153.216/api/v1/decision-intelligence/health
curl http://34.136.153.216/api/v1/knowledge-evidence/health
```

## Expected Behavior

### Before Fix:
- Request: `/api/v1/patient-clinical-data/care-teams`
- Service receives: `/api/v1/patient-clinical-data/care-teams` ❌
- Result: 404 Not Found

### After Fix:
- Request: `/api/v1/patient-clinical-data/care-teams`
- Traefik strips prefix: `/api/v1/patient-clinical-data` → removed
- Service receives: `/care-teams` ✅
- Result: 200 OK

## Notes

- The dashboard already had stripprefix middleware configured (for `/cde` prefix)
- This fix applies the same pattern to all API services
- The fix is backward compatible - existing direct port access (e.g., `:3101`) still works
- Traefik automatically reloads configuration when labels change, but container restart ensures changes are picked up
