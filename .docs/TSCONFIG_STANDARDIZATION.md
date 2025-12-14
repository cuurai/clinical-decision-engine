# TypeScript Configuration Standardization

This document describes the standardized TypeScript configuration structure across the repository.

## Architecture Overview

The repository uses **TypeScript Project References** for proper dependency management and build ordering. This ensures:

- Strict type checking across package boundaries
- Correct build order (dependencies built before dependents)
- No need for `skipLibCheck: true` workarounds
- Proper isolation between packages

## Configuration Structure

### 1. Root Base Configuration (`tsconfig.json`)

**Location**: Root of repository
**Purpose**: Base configuration shared by all packages

```json
{
  "compilerOptions": {
    /* 🔒 Strictness & Standardization */
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,

    /* 🚀 NodeNext/ESM Configuration */
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2022",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* 📦 Output */
    "lib": ["ES2022"],
    "sourceMap": true,
    "skipLibCheck": true
  }
}
```

**Key Points**:

- No `outDir`, `rootDir`, `composite`, or `declaration` - these are set per-package
- Provides strictness and ESM configuration
- `skipLibCheck: true` to skip checking node_modules types

### 2. Core Library Package (`packages/core/tsconfig.json`)

**Location**: `packages/core/`
**Purpose**: Library package that exports types and code for other packages

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "verbatimModuleSyntax": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

**Key Points**:

- `composite: true` - Makes this package referenceable by others
- `declaration: true` - Generates `.d.ts` files for type exports
- `verbatimModuleSyntax: false` - Allows imports without explicit `.js` extensions in source (but outputs use `.js`)

### 3. Adapters Package (`platform/adapters/tsconfig.json`)

**Location**: `platform/adapters/`
**Purpose**: DAO repository adapters that depend on core

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "verbatimModuleSyntax": false,
    "baseUrl": "../../",
    "paths": {
      "@cuur/core": ["packages/core/src/index.ts"],
      "@cuur/core/*": ["packages/core/src/*"]
    }
  },
  "references": [{ "path": "../../packages/core" }],
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

**Key Points**:

- `references` - Declares dependency on core package
- `paths` - Maps `@cuur/core` imports to source files (for development)
- TypeScript uses `references` to read types from core's `dist` folder
- `composite: true` - Makes this referenceable by services

### 4. Service Packages (`platform/services/src/{service}/tsconfig.json`)

**Location**: `platform/services/src/{service}/`
**Purpose**: Fastify API services (consumers)

```json
{
  "extends": "../../../../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": false,
    "verbatimModuleSyntax": false,
    "resolveJsonModule": true
  },
  "references": [{ "path": "../../../../../packages/core" }, { "path": "../../../../adapters" }],
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

**Key Points**:

- `declaration: false` - Services don't export types
- `references` - Declares dependencies on core and adapters
- No `composite` - Services are leaf nodes, not referenced by others
- `resolveJsonModule: true` - Allows importing JSON files

## Build Process

### Individual Package Builds

Each package can be built independently:

```bash
# Build core
cd packages/core && npm run build

# Build adapters (will build core first if needed)
cd platform/adapters && npm run build

# Build a service (will build core and adapters first if needed)
cd platform/services/src/decision-intelligence && npm run build
```

### Build Scripts

All packages use standardized build scripts in `package.json`:

```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "build:watch": "tsc -p tsconfig.json --watch",
    "clean": "rm -rf dist",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

### Build Order with Project References

When using `tsc -b` (build mode), TypeScript automatically determines build order:

```bash
# Build all referenced projects in correct order
npx tsc -b platform/adapters/tsconfig.json

# This will:
# 1. Build packages/core first (because adapters references it)
# 2. Then build platform/adapters
```

## Import Patterns

### In Source Code

All relative imports must use `.js` extensions (required for NodeNext):

```typescript
import { something } from "./other-file.js";
import { types } from "../../types/index.js";
```

### Package Imports

Use the `@cuur/core` alias (resolved via path mappings):

```typescript
import type { OrgId } from "@cuur/core";
import type { AlertEvaluationRepository } from "@cuur/core/decision-intelligence/repositories/index.js";
```

## Benefits of This Structure

1. **Type Safety**: Full end-to-end type checking without `skipLibCheck`
2. **Build Order**: Automatic dependency resolution
3. **Isolation**: Each package only sees compiled output of dependencies
4. **Standardization**: Consistent configuration across all packages
5. **Maintainability**: Changes to base config propagate to all packages

## Troubleshooting

### "Cannot find module '@cuur/core'"

- Ensure core package is built: `cd packages/core && npm run build`
- Check that path mappings in adapters/services tsconfig are correct
- Verify project references point to correct paths

### "File is not listed within the file list"

- This happens when TypeScript tries to include files outside `rootDir`
- Solution: Use project references instead of importing source files directly
- Ensure `references` array is properly configured

### Build produces no output

- Check that `outDir` and `rootDir` are set correctly
- Verify `include` patterns match your source files
- Ensure no `noEmit: true` in configuration chain
