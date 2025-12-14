# Manual Rebuild Workflow for Decision Intelligence Service

## Step-by-Step Commands

Execute these commands in order. Each step should complete successfully before proceeding.

---

## STEP 1: Clean Local Build Artifacts

```bash
cd /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine

# Remove all dist folders
find . -type d -name "dist" -not -path "*/node_modules/*" -exec rm -rf {} + 2>/dev/null

# Verify cleanup
find . -type d -name "dist" -not -path "*/node_modules/*" | wc -l
# Should output: 0
```

---

## STEP 2: Build Locally (Verify ESM Output)

```bash
cd /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/platform/services/src/decision-intelligence

# Build the service
npm run build

# Verify ESM output (should show import statements, NOT exports/require)
head -30 dist/main.js | grep -E "^import"

# Verify NO CommonJS (should output nothing)
head -50 dist/main.js | grep -E "(Object.defineProperty|exports\.|require\()" || echo "✅ ESM confirmed"
```

**Expected:** Should see `import` statements, no `exports` or `require`

---

## STEP 3: Build Docker Image Locally

```bash
cd /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine

# Build Docker image
docker build --platform linux/amd64 \
  -f Dockerfile.service \
  --build-arg SERVICE_NAME=decision-intelligence \
  -t clinical-decision-engine-decision-intelligence:latest .

# Verify image exists
docker images clinical-decision-engine-decision-intelligence:latest

# Verify ESM in Docker image
docker run --rm clinical-decision-engine-decision-intelligence:latest \
  head -50 /app/platform/services/src/decision-intelligence/dist/main.js | \
  grep -E "(Object.defineProperty|exports\.|require\()" || echo "✅ Docker image has ESM"
```

**Expected:** Image built successfully, ESM output confirmed

---

## STEP 4: Clean Remote VM

```bash
# SSH to VM and clean up
export SSHPASS=kontnt-mixpost
sshpass -e ssh -o StrictHostKeyChecking=no info@34.136.153.216 << 'EOF'
cd /opt/clinical-decision-engine

# Stop container
docker-compose stop decision-intelligence

# Remove old image
docker rmi clinical-decision-engine-decision-intelligence:latest

# Verify cleanup
docker images | grep decision-intelligence

echo "✅ Remote cleanup complete"
EOF
```

**Expected:** Container stopped, old image removed

---

## STEP 5: Save and Transfer Image

```bash
cd /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine

# Save image to tar.gz
mkdir -p /tmp/cde-images
docker save clinical-decision-engine-decision-intelligence:latest | \
  gzip > /tmp/cde-images/decision-intelligence.tar.gz

# Transfer to VM
export SSHPASS=kontnt-mixpost
sshpass -e scp -o StrictHostKeyChecking=no \
  /tmp/cde-images/decision-intelligence.tar.gz \
  info@34.136.153.216:/tmp/

echo "✅ Image transferred"
```

**Expected:** File transferred successfully (~200MB)

---

## STEP 6: Load Image on VM and Deploy

```bash
export SSHPASS=kontnt-mixpost
sshpass -e ssh -o StrictHostKeyChecking=no info@34.136.153.216 << 'EOF'
cd /opt/clinical-decision-engine

# Load image
echo "Loading image..."
gunzip -c /tmp/decision-intelligence.tar.gz | docker load

# Remove transfer file
rm /tmp/decision-intelligence.tar.gz

# Verify image loaded
docker images clinical-decision-engine-decision-intelligence:latest

# Start service
docker-compose up -d decision-intelligence

# Wait a moment
sleep 5

# Check status
docker-compose ps decision-intelligence

# Check logs
docker-compose logs --tail=20 decision-intelligence
EOF
```

**Expected:** Container starts without errors, logs show service listening

---

## STEP 7: Verify Service is Running

```bash
# Test via Traefik
curl -v http://34.136.153.216/api/decision-intelligence/health

# Test direct port
curl -v http://34.136.153.216:3100/health

# Check container logs
export SSHPASS=kontnt-mixpost
sshpass -e ssh -o StrictHostKeyChecking=no info@34.136.153.216 \
  'cd /opt/clinical-decision-engine && docker-compose logs --tail=10 decision-intelligence'
```

**Expected:** HTTP 200 responses with JSON health check data

---

## Troubleshooting

### If container crashes:

```bash
# Check logs for errors
sshpass -e ssh -o StrictHostKeyChecking=no info@34.136.153.216 \
  'cd /opt/clinical-decision-engine && docker-compose logs decision-intelligence'

# Verify image has ESM
sshpass -e ssh -o StrictHostKeyChecking=no info@34.136.153.216 \
  'docker run --rm clinical-decision-engine-decision-intelligence:latest \
   head -50 /app/platform/services/src/decision-intelligence/dist/main.js | \
   grep -E "(Object.defineProperty|exports\.|require\()" || echo "✅ ESM"'
```

### If image transfer fails:

- Check disk space: `df -h` on VM
- Check network connectivity
- Try transferring in smaller chunks or use `rsync`

### If service doesn't start:

- Check DATABASE_URL in `.env` on VM
- Verify PostgreSQL is accessible
- Check network connectivity between containers

---

## Iterative Workflow

After establishing this workflow, you can iterate:

1. **Make code changes locally**
2. **Rebuild locally** (Step 2)
3. **Rebuild Docker** (Step 3)
4. **Clean VM** (Step 4)
5. **Transfer & Deploy** (Steps 5-6)
6. **Verify** (Step 7)

This ensures a clean build every time and eliminates stale image issues.
