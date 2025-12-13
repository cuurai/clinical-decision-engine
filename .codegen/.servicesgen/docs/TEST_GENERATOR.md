# Test Generator Documentation

## Overview

The **TestGenerator** generates comprehensive test infrastructure using a **layered factory architecture** that separates **core domain factories** from **orchestrator factories**. It automatically detects the domain type and generates appropriate test files.

## Architecture: Layered Factory Pattern

The test generator implements a **three-layer factory architecture**:

```
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Flow Factories (Orchestrator-Specific)        │
│ Location: platform/tests/src/orchestrators/{domain}/   │
│          factories/flows/*.factory.ts                  │
│ Purpose: Compose handler response factories             │
└─────────────────────────────────────────────────────────┘
                        ↓ imports
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Handler Response Factories (Orchestrator)     │
│ Location: platform/tests/src/orchestrators/{domain}/   │
│          factories/handler-responses/*.factory.ts       │
│ Purpose: Wrap entities in DataEnvelope structure        │
│ Imports: @cuur/factories/{core-domain}/factories/      │
│          entities/{core-domain}.entity.factory.js       │
└─────────────────────────────────────────────────────────┘
                        ↓ imports
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Core Domain Entity Factories                  │
│ Location: platform/tests/src/core/{domain}/factories/   │
│          entities/{domain}.entity.factory.ts            │
│ Purpose: Single source of truth for entity generation   │
│ Source: Schema introspection + config overrides         │
└─────────────────────────────────────────────────────────┘
```

## Features

### Automatic Domain Detection

The test generator automatically detects whether a domain is:
- **Core Domain**: Technical service domain (e.g., `exchange`, `auth`, `identity`, `blockchain`)
- **Orchestrator Domain**: Business-scenario-driven API aggregation layer (e.g., `trading-markets`, `accounts-funding`, `onboarding-identity`)

### Core Domain Factory Generation

For core domains, the generator creates:

- **Entity Factories**: `factories/entities/{domain}.entity.factory.ts`
  - **Source**: Schema introspection from Zod schemas
  - **Location**: `packages/core/packages/core/src/{domain}/openapi/{domain}.zod.schema.ts`
  - **Config Overrides**: `.servicesgen/config/test-factory-config.yaml`
  - **Architecture**: Uses `PureSchemaFactoryBuilder` for pure schema-driven generation
  - **Features**:
    - Extracts field definitions, types, constraints from Zod schemas
    - Applies config overrides for ID patterns, field generators
    - Generates Zod-validated entity factories
    - **Models-based structure**: Mirrors `models/` directory structure (one factory per entity/DTO)
    - **Advanced field generation**: Conditional fields, nested objects, realistic defaults
    - **All optional fields included**: Comprehensive test data generation

- **Shared Faker Helpers**: `factories/shared/faker-helpers.ts`
  - Deterministic faker instance with seed support

- **Package Configuration**: `package.json`
  - Test dependencies (vitest, faker, etc.)

- **Output Location**: `platform/tests/src/core/{domain}/`

### Orchestrator Domain Test Generation

For orchestrator domains, the generator creates:

- **Flow Tests**: `flows/*.flow.test.ts`
  - Tests orchestrator flow orchestration
  - Tests business workflows end-to-end
  - Uses mock dependencies (not repositories directly)

- **Test Factories** (Three-Layer Architecture):
  - **Flow Factories** (`factories/flows/*.factory.ts`): Compose handler response factories
    - Matches flow return structure
    - Reuses handler response factories for consistency
  - **Handler Response Factories** (`factories/handler-responses/*.factory.ts`): Wrap entities in DataEnvelope structure
    - **Imports**: Core domain entity factories via `@cuur/factories/{core-domain}/factories/entities/{core-domain}.entity.factory.js`
    - Generates standard handler response structure (`{ data: entity, meta: {...} }` for create, `{ data: { items: [...] }, meta: {...} }` for list)
  - **Core Domain Entity Factories**: Imported from `platform/tests/src/core/{core-domain}/factories/entities/`
    - Ensured to exist before generating orchestrator factories
    - Single source of truth for entity generation

- **Mock Dependencies**: `mocks/index.ts`
  - Mock implementations of `Dependencies` interface
  - Auto-generated from orchestrator `deps.ts`

- **Output Location**: `platform/tests/src/orchestrators/{domain}/`

- **Mock Dependencies**: `mocks/index.ts`
  - Mock implementations of `Dependencies` interface
  - Auto-generated from orchestrator `deps.ts`
  - Includes all DAO repositories used by flows

- **TypeScript Configuration**: `tsconfig.json`
  - Path mappings for `@cuur/core`, `@cuur/adapters`, `@cuur/orchestrators/*`, `@cuur/factories`
  - Project references to orchestrator domains
  - Test-specific compiler options

## Usage

### Generate Tests for All Domains

```bash
# Generate tests for all domains (raw + orchestrator)
cuur-codegen generate --all --layer tests --no-build --clean
```

### Generate Tests for Specific Domain

```bash
# Raw domain
cuur-codegen generate --domain exchange --layer tests --no-build --clean

# Orchestrator domain
cuur-codegen generate --domain trading-markets --layer tests --no-build --clean
```

### Verify Generated Tests

```bash
# Raw domain tests
ls -la tests/src/exchange/handlers/
ls -la tests/src/exchange/mocks/
ls -la tests/src/exchange/__setup__/

# Orchestrator domain tests
ls -la tests/src/trading-markets/flows/
ls -la tests/src/trading-markets/mocks/
cat tests/src/trading-markets/tsconfig.json
```

## Architecture

### Flow Discovery

The test generator uses `FlowDiscovery` to discover orchestrator flows:

```python
# Discovers flows from:
platform/orchestrators/domains/src/{domain}/flows/*.flow.ts

# Extracts:
- Flow name (e.g., "tradingPlaceOrderFlow")
- HTTP verb (GET, POST, PUT, DELETE, etc.)
- Resource name
- Whether flow has body, params, query
```

### Mock Dependencies Builder

For orchestrator domains, `MockDependenciesBuilder`:

1. Reads `deps.ts` from orchestrator domain
2. Parses `Dependencies` interface
3. Generates mock objects for all DAO repositories
4. Creates `createMockDependencies()` function

### Factory Builder Architecture

The factory generation uses a **layered composition pattern**:

#### 1. Core Domain Entity Factories (Layer 1 - Base)

- **Location**: `platform/tests/src/core/{core-domain}/factories/entities/{core-domain}.entity.factory.ts`
- **Purpose**: Single source of truth for entity generation
- **Generation**: Uses `PureSchemaFactoryBuilder` with pure Zod schema extraction
- **Source**: Zod schemas from `packages/core/packages/core/src/{domain}/openapi/{domain}.zod.schema.ts`
- **Config**: Overrides from `.servicesgen/config/test-factory-config.yaml`
- **Features**:
  - Schema-driven: Extracts field definitions, types, constraints from Zod
  - Configurable: ID patterns, field generators via YAML config
  - Validated: Uses Zod schemas for runtime validation
  - Import Path: `@cuur/factories/{core-domain}/factories/entities/{core-domain}.entity.factory.js`

#### 2. Handler Response Factories (Layer 2 - Middle)

- **Location**: `platform/tests/src/orchestrators/{orchestrator}/factories/handler-responses/*.factory.ts`
- **Purpose**: Wrap entities in DataEnvelope structure
- **Composition**: Imports core domain entity factories via `@cuur/factories` path alias
- **Structure**:
  - **Create handlers**: `{ data: entity, meta: {...} }`
  - **List handlers**: `{ data: { items: [...] }, meta: {...} }`
- **Discovery**: Generated from handlers referenced in flow YAML specs
- **Example**:
  ```typescript
  import { createAccount } from "@cuur/factories/identity/factories/entities/identity.entity.factory.js";

  export function createCreateAccountResponse(item?: any): any {
    return {
      data: item || createAccount(),
      meta: { correlationId: "...", timestamp: "..." }
    };
  }
  ```

#### 3. Flow Factories (Layer 3 - Top)

- **Location**: `platform/tests/src/orchestrators/{orchestrator}/factories/flows/*.factory.ts`
- **Purpose**: Compose handler response factories to match flow return structure
- **Composition**: Reuses handler response factories
- **Benefits**: No duplication, consistent structure across all flows
- **Example**:
  ```typescript
  import { createCreateAccountResponse } from "../handler-responses/create-account.factory.js";
  import { createCreateOrgResponse } from "../handler-responses/create-org.factory.js";

  export function createOnboardingStartResponse(): any {
    return {
      account: createCreateAccountResponse(),
      org: createCreateOrgResponse(),
    };
  }
  ```

### Entity Discovery

Entity discovery uses a **flow-based approach**:

1. **Discover Flows**: Reads orchestrator domain flow files (`*.flow.ts`)
2. **Extract Handlers**: Identifies all handlers used in flow steps
3. **Map to Entities**: Maps handler names to entity names (e.g., `createAccount` → `Account`)
4. **Map to Core Domains**: Determines which core domain each entity belongs to
5. **Ensure Core Factories**: Generates core domain factories if they don't exist
6. **Generate Handler Responses**: Creates handler response factories that import from core factories

### Flow Test Builder

`FlowTestBuilder` generates flow test files with:

- **Happy Path Tests**: Tests successful flow execution
- **Org Isolation Tests**: Ensures `orgId` is correctly passed
- **Error Handling Tests**: Tests `ZodError` and `FlowError` handling
- **Proper Imports**: Uses `@quub` path aliases
- **Factory Integration**: Uses generated flow factories for test data

### Test TsConfig Builder

`TestTsConfigBuilder` generates `tsconfig.json` with:

- **Base URL**: Points to `platform/` directory
- **Path Mappings**:
  - `@cuur/core` → core package
  - `@cuur/adapters` → adapters package
  - `@cuur/orchestrators/*` → orchestrator domains (for orchestrator tests)
  - `@cuur/factories` → test factories
- **Project References**: References to core, adapters, and orchestrator domains
- **Module Resolution**: Uses `bundler` mode for ESM support

## Generated Test Structure

### Raw Domain Test Example

```typescript
// tests/src/exchange/handlers/order/create-order.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createOrder } from "@cuur/core/exchange/handlers/index.js";
import { createMockDependencies } from "../../mocks/index.js";

describe("createOrder", () => {
  let deps: Dependencies;

  beforeEach(() => {
    deps = createMockDependencies();
  });

  it("should create order successfully", async () => {
    // Test implementation
  });
});
```

### Orchestrator Domain Test Example

```typescript
// tests/src/trading-markets/flows/trading-place-order.flow.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { tradingPlaceOrderFlow } from "@cuur/orchestrators/trading-markets/flows/trading-place-order.flow.js";
import type { Dependencies } from "@cuur/orchestrators/trading-markets/deps.js";
import type { RequestContext } from "@cuur/orchestrators/trading-markets/context.js";
import { FlowError } from "@cuur/orchestrators/trading-markets/errors/flow-error.js";
import { createMockDependencies } from "../mocks/index.js";
import { createTradingPlaceOrderResponse } from "../factories/trading-place-order.factory.js";

describe("tradingPlaceOrderFlow - Flow Orchestration", () => {
  let deps: Dependencies;
  let context: RequestContext;

  beforeEach(() => {
    deps = createMockDependencies();
    context = {
      orgId: "test-org-id",
      accountId: "test-account-id",
    };
  });

  it("should execute flow successfully", async () => {
    const expectedResponse = createTradingPlaceOrderResponse();
    const result = await tradingPlaceOrderFlow({ context }, deps);
    expect(result).toMatchObject(expectedResponse);
  });

  it("should enforce org isolation", async () => {
    // Test orgId is correctly passed
  });

  it("should handle validation errors", async () => {
    // Test ZodError handling
  });

  it("should handle flow errors", async () => {
    // Test FlowError handling
  });
});
```

### Factory Example

```typescript
// factories/chain/entity/chain.entity.factory.ts
import { faker } from "@faker-js/faker";
import { ChainEntity } from "@cuur/core/blockchain/models/chain/index.js";
import { blockchainSchemas as schemas } from "@cuur/core/blockchain/index.js";
import { z } from "zod";

export function createChain(overrides: Partial<ChainEntity> = {}) {
  // Status declared before raw object for conditional field generation
  const status = overrides.status ??
    faker.helpers.arrayElement(["ACTIVE", "DEPRECATED", "DISABLED"]);

  const raw = {
    id: overrides.id ?? makeBLId(),
    chainId: overrides.chainId ?? faker.string.numeric({ length: { min: 1, max: 3 } }),
    name: overrides.name ?? faker.word.noun(),
    chainNamespace: overrides.chainNamespace ?? "EVM", // Schema default
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

// factories/handler-responses/list-fiat-accounts.factory.ts
import { createFiatAccount } from "../entities.factory.js";

export function createListFiatAccountsResponse(items?: any[]): any {
  const defaultItems = items || [createFiatAccount(), createFiatAccount()];
  return {
    data: { items: defaultItems },
    meta: { correlationId: "...", timestamp: "...", pagination: {...} },
  };
}

// factories/funding-balances.factory.ts
import { createListFiatAccountsResponse } from "./handler-responses/list-fiat-accounts.factory.js";
import { createListCustodyAccountsResponse } from "./handler-responses/list-custody-accounts.factory.js";
import { createListWalletsResponse } from "./handler-responses/list-wallets.factory.js";

export function createFundingBalancesResponse(overrides?: Partial<any>): any {
  return {
    fiatAccounts: createListFiatAccountsResponse(),
    custodyAccounts: createListCustodyAccountsResponse(),
    wallets: createListWalletsResponse(),
    ...overrides,
  };
}
```

## Configuration

### Pipeline Configuration

The test generator is configured in `pipeline.py`:

```python
# Tests layer can process both raw and orchestrator domains
if is_tests_layer:
    # Include both raw and orchestrator domains
    orchestrator_domain_list = [d.name for d in orchestrator_config.orchestrator_domains]
    all_domains.extend(orchestrator_domain_list)
```

### Domain Detection

The generator detects orchestrator domains by:

1. Checking if domain exists in orchestrator config
2. Checking if `flows/` directory exists in orchestrator domain
3. Skipping OpenAPI spec validation for orchestrator domains

## Factory Architecture Benefits

### Three-Layer Architecture

The factory system uses a three-layer architecture for maximum reusability and consistency:

1. **Entity Factories** (Base Layer)
   - Single file (`entities.factory.ts`) with all entity factories
   - Only includes entities used by flows (flow-based discovery)
   - Uses Zod schemas from `@cuur/core` for validation
   - **Benefit**: Minimal footprint, single source of truth

2. **Handler Response Factories** (Middle Layer)
   - Wraps entities in standard DataEnvelope structure
   - Reuses entity factories internally
   - **Benefit**: Consistent handler response structure across all flows

3. **Flow Factories** (Top Layer)
   - Composes handler response factories
   - Matches flow return structure
   - **Benefit**: No duplication, easy to maintain

### Flow-Based Entity Discovery

Entities are discovered from handlers used in flows, not from all available schemas:

- **Before**: Generated factories for all 227 entities from schemas
- **After**: Only generates factories for entities actually used (e.g., 11 entities for `accounts-funding`)
- **Benefit**: Smaller codebase, faster tests, easier maintenance

### Schema-Based Validation

All factories use Zod schemas from `@cuur/core`:

- Ensures test data matches production schemas
- Automatic validation of generated test data
- Type safety with TypeScript

## Best Practices

### Running Tests

```bash
# Run all tests
cd platform/tests
pnpm test

# Run tests for specific domain
pnpm test trading-markets

# Run tests with coverage
pnpm test --coverage
```

### Writing Custom Tests

The generated tests provide a solid foundation. You can:

1. **Extend Generated Tests**: Add more test cases to generated files
2. **Add Integration Tests**: Create integration test files manually
3. **Custom Mocks**: Extend mock dependencies for specific test scenarios

### Maintaining Tests

- **Regenerate After Changes**: Regenerate tests after updating handlers or flows
- **Keep Mocks Updated**: Ensure mock dependencies match actual `deps.ts`
- **Update Test Constants**: Update test constants in `test_constants.py` if needed
- **Use Flow Factories**: Always use generated flow factories in tests for consistency
- **Entity Discovery**: Adding new handlers to flows automatically includes their entities in factories

### Factory Usage

- **Entity Factories**: Use for creating individual entities in tests
- **Handler Response Factories**: Use when testing handler responses directly
- **Flow Factories**: Use in flow tests to match expected response structure
- **Overrides**: All factories support partial overrides for test-specific data

### Field Generation Patterns

The generator implements sophisticated field generation patterns:

**Conditional Fields**: Fields that depend on other field values
- Example: `deprecationReason` only populated when `status === "DEPRECATED"`
- Status variable declared before raw object for reuse

**Audit Fields**: Realistic audit trail fields
- `createdBy`/`updatedBy`: Use `"system"` instead of random strings
- `createdAt`/`updatedAt`: Use `new Date().toISOString()`

**ID Fields**: Proper ID generation based on regex patterns
- Detects prefixes (`BL_`, `ID_`, `acc_`)
- Generates appropriate helper functions
- Uses correct character sets and lengths

**Nested Objects**: Properly generates nested object structures
- Extracts nested field definitions from schema
- Generates complete nested objects with all fields

**Schema Defaults**: Respects default values from schemas
- Numeric defaults used directly
- String/enum defaults properly quoted

**All Optional Fields**: Includes all optional fields for comprehensive test data
- Optional fields without defaults still generated
- Ensures realistic test coverage

## Troubleshooting

### Tests Not Found

If tests are not generated:

1. Check domain exists in config
2. Verify flows exist for orchestrator domains
3. Check generator logs for errors

### Import Errors

If imports fail:

1. Verify `tsconfig.json` has correct path mappings
2. Check `baseUrl` points to `platform/`
3. Ensure project references are correct

### Mock Dependencies Missing

If mock dependencies are incomplete:

1. Regenerate orchestrator domain `deps.ts`
2. Regenerate tests
3. Check `MockDependenciesBuilder` logs

## Related Documentation

- [AI Agent Usage Guide](./AI_AGENT_USAGE.md) - General usage instructions
- [AI Agent Maintenance Guide](./AI_AGENT_MAINTENANCE.md) - Generator architecture
- [Architecture Documentation](./ARCHITECTURE.md) - System architecture overview
