# Docker Build Artifacts Reference

This document explains what artifacts are copied into Docker containers and how dependencies are resolved.

## Core Package (`packages/core`)

### Build Process

1. **Source copied**: `packages/core` (TypeScript source files)
2. **Built**: `npm run build` creates `packages/core/dist/` folder
3. **Copied to production**: Entire `packages/core` directory including:
   - `dist/` folder (compiled JavaScript)
   - `package.json` (with `main: "./dist/index.js"`)
   - `node_modules/` (production dependencies only)

### Import Resolution

Services import from `@cuur/core` using:

```typescript
import { ... } from "@cuur/core/decision-intelligence/handlers/index.js";
```

This resolves to: `packages/core/dist/decision-intelligence/handlers/index.js`

### Verification

The Dockerfiles include a verification step:

```bash
test -d packages/core/dist || (echo "ERROR: packages/core/dist not found!" && exit 1)
```

## Adapters Package (`platform/adapters`)

### Build Process

1. **Source copied**: `platform/adapters` (TypeScript source files)
2. **Built**: `npm run build` creates compiled output
3. **Prisma clients generated**: For each service's Prisma schema
4. **Copied to production**: Entire `platform/adapters` directory including:
   - Built TypeScript output
   - Generated Prisma clients in `platform/adapters/src/{service}/prisma/generated/`
   - `package.json`
   - `node_modules/` (production dependencies only)

## Services (`platform/services/src/{service-name}`)

### Build Process

1. **Dependencies copied**:
   - Built `packages/core` (with dist)
   - Built `platform/adapters` (with Prisma clients)
2. **Shared files copied**: `platform/services/src/shared/` (e.g., `extract-org-id.ts`)
3. **Source copied**: Service-specific source files
4. **Built**: `npm run build` creates `dist/` folder
5. **Copied to production**: Entire service directory including:
   - `dist/` folder (compiled JavaScript)
   - `package.json`
   - `node_modules/` (production dependencies only)
   - Plus `platform/services/src/shared/` folder

### Shared Files

The `platform/services/src/shared/` folder contains utilities used by all services:

- `extract-org-id.ts` - Extracts organization ID from JWT tokens or headers

Services import these using relative paths:

```typescript
import { extractOrgId } from "../../../shared/extract-org-id.js";
```

### Runtime

Services run with:

```bash
node platform/services/src/{SERVICE_NAME}/dist/main.js
```

## Dashboard (`dashboard`)

### Build Process

1. **Dependencies copied**: Built `packages/core` (for TypeScript types during build)
2. **Source copied**: Dashboard React/Vite source files
3. **Built**: `npm run build` creates `dashboard/dist/` folder (static files)
4. **Copied to production**: Only `dashboard/dist/` folder

### API Client

The dashboard's API client (`dashboard/src/services/core/api-client.ts`) is:

- Bundled into the static build during Vite compilation
- Included in `dashboard/dist/` as JavaScript
- No separate API service needed - it's client-side code

## What Gets Copied

### For Each Service Container:

```
/app/
├── packages/
│   └── core/
│       ├── dist/              ✅ Built core package
│       ├── package.json
│       └── node_modules/      ✅ Production deps only
├── platform/
│   ├── adapters/
│   │   ├── src/
│   │   │   └── {service}/
│   │   │       └── prisma/
│   │   │           └── generated/  ✅ Prisma client
│   │   ├── package.json
│   │   └── node_modules/
│   └── services/
│       └── src/
│           ├── shared/            ✅ Shared utilities (extract-org-id.ts)
│           └── {service-name}/
│               ├── dist/          ✅ Built service
│               ├── package.json
│               └── node_modules/
└── package.json
```

### For Dashboard Container:

```
/app/
└── dashboard/
    └── dist/              ✅ Static files (includes bundled API client)
```

## Dependency Chain

```
packages/core (built → dist/)
    ↓
platform/adapters (built, uses core)
    ↓
platform/services/src/{service} (built, uses core + adapters)
    ↓
Runtime: node dist/main.js
```

## Verification Commands

To verify builds locally:

```bash
# Check core/dist exists
ls -la packages/core/dist/

# Check service dist exists
ls -la platform/services/src/decision-intelligence/dist/

# Check Prisma clients generated
ls -la platform/adapters/src/decision-intelligence/prisma/generated/

# Check dashboard dist
ls -la dashboard/dist/
```

## Common Issues

### Issue: "Cannot find module '@cuur/core'"

**Cause**: `packages/core/dist` not copied or not built
**Fix**: Ensure core-builder stage runs `npm run build` successfully

### Issue: "Prisma client not found"

**Cause**: Prisma clients not generated
**Fix**: Ensure prisma-generator stage runs for the service's schema

### Issue: "Service dist/main.js not found"

**Cause**: Service not built or dist folder not copied
**Fix**: Ensure service-builder stage runs `npm run build` successfully

