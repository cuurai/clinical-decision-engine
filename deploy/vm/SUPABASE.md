# Supabase Configuration Guide

## Overview

This project uses **Supabase** as the database provider. All services connect directly to Supabase - no local PostgreSQL container is needed.

## Docker Compose Files for Supabase

Use these docker-compose files (not the ones with local PostgreSQL):

- **`docker-compose-supabase.yml`** - Direct port exposure with Supabase
- **`docker-compose.traefik-supabase.yml`** - Traefik routing with Supabase

## Getting Your Supabase Connection String

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Navigate to**: Settings → Database
4. **Find**: "Connection string" section
5. **Copy**: The connection string (URI format)

### Connection String Format

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

**Example:**
```
postgresql://postgres:your-password@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## .env File Configuration

The `.env` file **MUST** contain your Supabase connection string:

```env
# Supabase Database Connection (CRITICAL - line 3)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
```

### Password URL Encoding

If your Supabase password contains special characters, URL-encode them:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

**Example:**
```
Password: `MyP@ssw0rd#2024`
Encoded: `MyP%40ssw0rd%232024`
Connection String: `postgresql://postgres:MyP%40ssw0rd%232024@db.xxxxx.supabase.co:5432/postgres`
```

## Deployment Steps

### 1. Copy Supabase docker-compose file

**With Traefik:**
```bash
scp deploy/vm/docker-compose.traefik-supabase.yml info@34.136.153.216:/opt/clinical-decision-engine/docker-compose.yml
```

**Direct ports:**
```bash
scp deploy/vm/docker-compose-supabase.yml info@34.136.153.216:/opt/clinical-decision-engine/docker-compose.yml
```

### 2. Create .env file with Supabase connection

```bash
ssh info@34.136.153.216
cd /opt/clinical-decision-engine
nano .env
```

Paste:
```env
APP_NAME=clinical-decision-engine

# Supabase Database Connection (CRITICAL - line 3)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

# Service Ports
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

**Replace:**
- `YOUR_PASSWORD` with your Supabase database password
- `YOUR_PROJECT_REF` with your Supabase project reference

### 3. Deploy

```bash
cd /opt/clinical-decision-engine
docker-compose up -d
docker-compose ps
```

## Verifying Supabase Connection

### Test Connection from VM

```bash
# Test if services can connect to Supabase
docker-compose logs decision-intelligence | grep -i "database\|supabase\|connected"

# Should see: "✅ Database connected"
```

### Check Service Logs

```bash
# Check all services
docker-compose logs | grep -i "database\|error"

# Check specific service
docker-compose logs decision-intelligence
```

## Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED` or `Connection refused`

**Solutions:**
1. Verify `DATABASE_URL` is correct in `.env`
2. Check Supabase project is active
3. Verify password is URL-encoded correctly
4. Check Supabase firewall allows connections from your VM IP

### Authentication Failed

**Error:** `password authentication failed` or `FATAL: password authentication failed`

**Solutions:**
1. Double-check password in `DATABASE_URL`
2. Ensure password is URL-encoded if it has special characters
3. Verify you're using the database password (not API key)
4. Reset password in Supabase Dashboard if needed

### SSL/TLS Errors

**Error:** `SSL connection required` or TLS-related errors

**Solution:** Add `?sslmode=require` to connection string:
```
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

## Supabase vs Local PostgreSQL

| Feature | Supabase | Local PostgreSQL |
|---------|----------|------------------|
| Docker Compose File | `docker-compose-supabase.yml` | `docker-compose.vm.yml` |
| Database Container | ❌ Not needed | ✅ Required |
| Connection String | Supabase URL | `postgresql://postgres:pass@postgres:5432/db` |
| Setup Complexity | ⭐ Simple | ⭐⭐ More complex |
| Scalability | ✅ Managed scaling | ⚠️ Manual scaling |
| Backup | ✅ Automatic | ⚠️ Manual setup |

## Security Best Practices

1. **Never commit `.env` to git** - Contains sensitive credentials
2. **Use connection pooling** - Supabase provides connection pooling URLs
3. **Rotate passwords regularly** - Update in Supabase Dashboard
4. **Restrict IP access** - Configure Supabase firewall rules
5. **Use SSL/TLS** - Always use `?sslmode=require` in production

## Connection Pooling (Optional)

For better performance, use Supabase's connection pooling:

**Pooled Connection String:**
```
postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
```

Note: Port `6543` instead of `5432` for pooled connections.
