# Test Factory Architecture

## Overview

The test generator implements a **layered factory architecture** that separates core domain entity factories from orchestrator-specific factories. This ensures a single source of truth, eliminates duplication, and provides predictable, maintainable test data generation.

## Architecture Layers

### Layer 1: Core Domain Entity Factories

**Location**: `platform/tests/src/core/{core-domain}/factories/entities/{core-domain}.entity.factory.ts`

**Purpose**: Single source of truth for entity generation

**Generation**:
- Uses `PureSchemaFactoryBuilder` for pure Zod schema extraction
- Reads Zod schemas from `packages/core/packages/core/src/{domain}/openapi/{domain}.zod.schema.ts`
- Applies overrides from `.servicesgen/config/test-factory-config.yaml`
- Generates Zod-validated entity factories

**Example**:
```typescript
// platform/tests/src/core/blockchain/factories/chain/entity/chain.entity.factory.ts
import { faker } from "@faker-js/faker";
import { ChainEntity } from "@cuur/core/blockchain/models/chain/index.js";
import { blockchainSchemas as schemas } from "@cuur/core/blockchain/index.js";
import { z } from "zod";

export function makeBLId() {
  return (
    "BL_" +
    Array.from({ length: 26 }, () =>
      ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
    ).join("")
  );
}

export function createChain(overrides: Partial<ChainEntity> = {}) {
  // Status declared before raw object for conditional field generation
  const status = overrides.status ??
    faker.helpers.arrayElement(["ACTIVE", "DEPRECATED", "DISABLED"]);

  const raw = {
    id: overrides.id ?? makeBLId(),
    chainId: overrides.chainId ?? faker.string.numeric({ length: { min: 1, max: 3 } }),
    name: overrides.name ?? faker.word.noun(),
    chainNamespace: overrides.chainNamespace ?? "EVM",
    decimals: overrides.decimals ?? 18, // Schema default
    confirmations: overrides.confirmations ?? 12, // Schema default
    rpcFeatures: overrides.rpcFeatures ?? {
      EIP1559: faker.datatype.boolean(),
      PRIORITY_FEE: faker.datatype.boolean(),
    },
    status: status, // Reuse status variable
    // Conditional: only populate if status is DEPRECATED
    deprecationReason: status === "DEPRECATED"
      ? (overrides.deprecationReason ?? faker.word.words(3))
      : undefined,
    createdBy: overrides.createdBy ?? "system", // Realistic audit field
    updatedBy: overrides.updatedBy ?? "system",
    createdAt: overrides.createdAt ?? new Date().toISOString(),
    updatedAt: overrides.updatedAt ?? new Date().toISOString(),
    ...overrides,
  };
  return schemas.Chain.parse(raw);
}
```

**Import Path**: `@cuur/factories/{core-domain}/factories/entities/{core-domain}.entity.factory.js`

### Layer 2: Handler Response Factories

**Location**: `platform/tests/src/orchestrators/{orchestrator}/factories/handler-responses/*.factory.ts`

**Purpose**: Wrap entities in DataEnvelope structure

**Composition**: Imports core domain entity factories

**Structure**:
- **Create handlers**: `{ data: entity, meta: {...} }`
- **List handlers**: `{ data: { items: [...] }, meta: {...} }`

**Example**:
```typescript
// platform/tests/src/orchestrators/onboarding-identity/factories/handler-responses/create-account.factory.ts
import { createAccount } from "@cuur/factories/identity/factories/entities/identity.entity.factory.js";
import { getFaker } from "../shared/faker-helpers.js";

export function createCreateAccountResponse(
  item?: any,
  overrides?: Partial<any>
): any {
  const defaultItem = item || createAccount();
  return {
    data: defaultItem,
    meta: {
      correlationId: faker.string.alphanumeric(26),
      timestamp: new Date().toISOString(),
      ...overrides,
    },
  };
}
```

### Layer 3: Flow Factories

**Location**: `platform/tests/src/orchestrators/{orchestrator}/factories/flows/*.factory.ts`

**Purpose**: Compose handler response factories to match flow return structure

**Composition**: Reuses handler response factories

**Example**:
```typescript
// platform/tests/src/orchestrators/onboarding-identity/factories/flows/onboarding-start.factory.ts
import { createCreateAccountResponse } from "../handler-responses/create-account.factory.js";
import { createCreateOrgResponse } from "../handler-responses/create-org.factory.js";
import { createCreateKycCaseResponse } from "../handler-responses/create-kyc-case.factory.js";

export function createOnboardingStartResponse(overrides?: Partial<any>): any {
  return {
    account: createCreateAccountResponse(),
    org: createCreateOrgResponse(),
    kycCase: createCreateKycCaseResponse(),
    ...overrides,
  };
}
```

## Path Resolution

The generator handles path resolution correctly for different `project_root` scenarios:

### When `project_root` is repo root:
- Core domains: `project_root / "platform" / "tests" / "src" / "core" / {domain}`
- Orchestrator domains: `project_root / "platform" / "tests" / "src" / "orchestrators" / {domain}`

### When `project_root` is `platform/`:
- Core domains: `project_root / "tests" / "src" / "core" / {domain}`
- Orchestrator domains: `project_root / "tests" / "src" / "orchestrators" / {domain}`

**Implementation**: `FolderStructureConfig.get_layer_output_path()` with special handling for tests layer

## Domain Detection

The generator automatically detects domain type:

### Core Domain Detection:
- Checks `.servicesgen/config/.core-domains.yaml`
- Falls back to checking if domain exists in core package

### Orchestrator Domain Detection:
- Checks `.servicesgen/config/.orchestrator-domains.yaml`
- Falls back to checking if `flows/` directory exists
- Handles `project_root` being `platform/` vs repo root

**Implementation**: `FolderStructureConfig._is_orchestrator_domain()`

## Pipeline Integration

The tests layer processes both core and orchestrator domains:

### Domain Resolution (`Pipeline._resolve_domains()`):
- When `--layer tests` is used:
  - Includes all orchestrator domains (for flow tests)
  - Includes all core domains (for entity factories)
  - Removes duplicates

### Generation Flow:
1. **Core Domains**: Generate entity factories using `_generate_core_domain_factories()`
2. **Orchestrator Domains**:
   - Ensure core domain factories exist (via `_ensure_core_domain_factories()`)
   - Generate handler response factories (import from core factories)
   - Generate flow factories (compose handler responses)
   - Generate flow tests

## Schema-Driven Generation

Core domain factories use schema introspection:

### Schema Introspection (`SchemaIntrospector`):
- Reads Zod schema files
- Extracts field definitions, types, constraints
- Identifies regex patterns, enum values, default values

### Config Overrides (`TestFactoryConfigLoader`):
- Loads `.servicesgen/config/test-factory-config.yaml`
- Provides ID patterns, field generators, domain mappings
- Only specifies what needs overriding

### Factory Generation (`PureSchemaFactoryBuilder`):
- Uses introspected schema info as primary source
- Applies config overrides when present
- Generates Zod-validated factory code

## Import Path Strategy

Orchestrator factories import core domain factories using TypeScript path aliases:

### Path Alias Configuration:
```json
// tsconfig.base.json
{
  "compilerOptions": {
    "paths": {
      "@cuur/factories/*": ["platform/tests/src/core/*"]
    }
  }
}
```

### Import Format:
```typescript
import { createAccount } from "@cuur/factories/identity/factories/entities/identity.entity.factory.js";
```

### Benefits:
- Clear dependency chain
- TypeScript ensures imports are correct
- Easy to refactor
- IDE support for navigation

## Benefits

### 1. Single Source of Truth
- Core domain factories define entity generation logic once
- Changes propagate automatically to all orchestrator tests
- No risk of drift between core and orchestrator factories

### 2. Determinism
- Same faker seed → same output across all tests
- Core domain factories use shared faker helpers
- Orchestrator tests inherit determinism

### 3. Predictability
- Schema changes in core domains automatically reflect in orchestrator tests
- No need to regenerate orchestrator factories when core domain schemas change
- Clear dependency chain: Flow → Handler → Entity

### 4. Maintainability
- Less code to maintain (no duplication)
- Easier to debug (single factory implementation)
- Clear separation of concerns

### 5. Type Safety
- TypeScript ensures imports are correct
- Compile-time errors if core domain factories don't exist
- Better IDE support

## Usage

### Generate Core Domain Factories
```bash
cuur-codegen generate --domain identity --layer tests
cuur-codegen generate --domain auth --layer tests
```

### Generate Orchestrator Factories
```bash
# Automatically ensures core domain factories exist
cuur-codegen generate --domain onboarding-identity --layer tests
```

### Generate All Tests
```bash
# Generates both core and orchestrator factories
cuur-codegen generate --all --layer tests
```

## Related Documentation

- [Test Generator Documentation](./TEST_GENERATOR.md) - Detailed test generator guide
- [Orchestrator Factory Strategy](./ORCHESTRATOR_FACTORY_STRATEGY.md) - Strategy document (now implemented)
- [Schema-Driven Factories](./SCHEMA_DRIVEN_FACTORIES.md) - Schema introspection details
- [AI Agent Maintenance Guide](./AI_AGENT_MAINTENANCE.md) - Generator architecture overview
