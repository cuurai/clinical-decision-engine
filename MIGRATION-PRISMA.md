# Prisma Schema Migration Guide

## Problem
Multiple Prisma schemas were generating to the same `@prisma/client` location, causing overwrites where only the last generated schema's models were available.

## Solution
Created a unified Prisma schema in `packages/database/prisma/schema.prisma` that combines all domain models.

## Migration Steps

### 1. Install dependencies
```bash
pnpm install
```

### 2. Generate unified Prisma client
```bash
cd packages/database
pnpm run generate
```

### 3. Update service imports

**Before:**
```typescript
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
```

**After:**
```typescript
import { prisma } from '@cde/db';
// Or if you need the type:
import type { PrismaClient } from '@cde/db';
```

### 4. Update service main.ts files

Replace Prisma client creation:
```typescript
// Before
const prisma = createPrismaClient();

// After  
import { prisma } from '@cde/db';
// Remove createPrismaClient() function
```

### 5. Update adapter repositories

Adapters should continue using `DaoClient` type, but the Prisma client passed to them should come from `@cde/db`.

## Benefits

1. ✅ Single source of truth for database schema
2. ✅ All models available to all services
3. ✅ No more overwrite conflicts
4. ✅ Type safety across all domains
5. ✅ Easier migrations and schema changes

## Architecture

```
packages/database/
├── prisma/
│   └── schema.prisma    # Unified schema (all models)
├── src/
│   ├── client.ts        # Singleton Prisma client
│   └── index.ts         # Public exports
└── package.json
```

All services import from `@cde/db` instead of `@prisma/client`.
