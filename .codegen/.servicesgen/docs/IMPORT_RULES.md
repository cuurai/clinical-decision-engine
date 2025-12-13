# Import Rules for .servicesgen Generators

## Rule

**If the import is from outside of the layer (cross-layer), use `@cuur/*` aliases. Otherwise, use local/relative imports (same-layer).**

## Layer Definitions

- **Core Layer**: `packages/core/packages/core/src/`
- **Adapters Layer**: `platform/adapters/src/`
- **Services Layer**: `platform/services/src/`
- **Orchestrators Layer**: `platform/orchestrators/domains/src/`
- **Tests Layer**: `platform/tests/src/`

## Examples

### ✅ Cross-Layer Imports → Use `@cuur/*`

1. **Adapters importing from Core**:
   ```typescript
   import { SomeType } from "@cuur/core/{domain}/types/index.js";
   ```

2. **Services importing from Core**:
   ```typescript
   import { createOrder } from "@cuur/core/{domain}/handlers/index.js";
   ```

3. **Services importing from Adapters**:
   ```typescript
   import { PrismaClient } from "@cuur/adapters/{domain}/prisma/generated/index.js";
   import type { DaoClient } from "@cuur/adapters/shared/dao-client.js";
   ```

4. **Orchestrators importing from Core**:
   ```typescript
   import { createOrder } from "@cuur/core/{domain}/handlers/index.js";
   ```

5. **Orchestrators importing from Adapters**:
   ```typescript
   import { DaoOrderRepository } from "@cuur/adapters";
   ```

6. **Orchestrators importing from Services**:
   ```typescript
   import { ServiceClient } from "@cuur/services/client/service-client.js";
   ```

7. **Tests importing from Orchestrators**:
   ```typescript
   import { someFlow } from "@cuur/orchestrators/{domain}/flows/{flow}.flow.js";
   import type { Dependencies } from "@cuur/orchestrators/{domain}/deps.js";
   ```

8. **Tests importing from Core**:
   ```typescript
   import { createOrder } from "@cuur/core/{domain}/handlers/index.js";
   ```

### ✅ Same-Layer Imports → Use Relative Paths

1. **Within same orchestrator domain**:
   ```typescript
   import type { Dependencies } from "../deps.js";
   import type { RequestContext } from "../context.js";
   import { FlowError } from "../errors/flow-error.js";
   import { logger } from "../logger.js";
   ```

2. **Within same service domain**:
   ```typescript
   import type { Dependencies } from "../dependencies/{domain}.dependencies.js";
   import { startService } from "./index.js";
   ```

3. **Within same test domain**:
   ```typescript
   import { seedFaker } from "../factories/shared/faker-helpers.js";
   import { createMockDependencies } from "../mocks/index.js";
   ```

4. **Within same adapter domain**:
   ```typescript
   import type { DaoClient } from "../shared/dao-client.js";
   ```

5. **Within same orchestrator domain (aggregators, services/clients)**:
   ```typescript
   import { SomeAggregator } from "../../services/aggregators/{aggregator}.js";
   import { SomeClient } from "../services/clients/{client}.js";
   ```

## Violations Fixed

1. ✅ `mock_dependencies_builder.py` - Changed to `@cuur/orchestrators/*` (cross-layer: tests → orchestrators)
2. ✅ `main_builder.py` - Changed to `@cuur/adapters/*` (cross-layer: services → adapters)
3. ✅ `service_client_builder.py` - Changed to `@cuur/services/*` (cross-layer: orchestrators → services)

## Verification Checklist

- [ ] All cross-layer imports use `@cuur/*` aliases
- [ ] All same-layer imports use relative paths (`../`)
- [ ] No relative paths cross layer boundaries
- [ ] Path mappings in `tsconfig.base.json` support all `@cuur/*` aliases

