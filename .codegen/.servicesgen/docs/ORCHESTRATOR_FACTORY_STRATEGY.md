# Orchestrator Factory Strategy: Using Core Domain Factories

## Executive Summary

**Status**: ✅ **IMPLEMENTED** - The generator now uses a **composition-based factory strategy** where orchestrator test factories **import and reuse** core domain factories, rather than regenerating entity factories. This ensures:

1. **Single Source of Truth**: Core domain factories are the authoritative source
2. **Determinism**: Same seed → same output across all tests
3. **Predictability**: Changes to core domain factories automatically propagate
4. **Maintainability**: No duplication of factory logic

## Current Architecture (Implemented)

### Core Domains

- **Location**: `packages/core/packages/core/src/{domain}/openapi/{domain}.zod.schema.ts`
- **Factories**: Generated per core domain in `platform/tests/src/core/{domain}/factories/entities/`
- **Structure**: One factory file per core domain with all entities
- **Generation**: Pure schema-driven using `PureSchemaFactoryBuilder`
- **Import Path**: `@cuur/factories/{core-domain}/factories/entities/{core-domain}.entity.factory.js`

### Orchestrator Domains

- **Location**: `platform/orchestrators/domains/src/{orchestrator-domain}/flows/`
- **Core Domain Mapping**: Defined in `.servicesgen/config/.orchestrator-domains.yaml` (uses `coreDomains` key)
- **Factories**: Handler response factories import from core domain factories
- **Output**: `platform/tests/src/orchestrators/{orchestrator}/factories/`

### Example: `onboarding-identity`

```yaml
orchestratorDomains:
  - name: onboarding-identity
    coreDomains: [auth, identity, compliance]
```

**Current Flow**: Uses handlers from:

- `identity` domain: `createAccount`, `createOrg`
- `compliance` domain: `createKycCase`

## Proposed Architecture

### Three-Layer Factory Composition

```
┌─────────────────────────────────────────────────────────┐
│ Layer 3: Flow Factories (Orchestrator-Specific)        │
│ - Compose handler response factories                    │
│ - Match flow return structure                           │
│ Example: createOnboardingStartResponse()                 │
└─────────────────────────────────────────────────────────┘
                        ↓ imports
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Handler Response Factories (Orchestrator)    │
│ - Wrap raw domain entities in response envelopes       │
│ - Use raw domain entity factories                      │
│ Example: createCreateAccountResponse()                  │
└─────────────────────────────────────────────────────────┘
                        ↓ imports
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Entity Factories (Raw Domain)                 │
│ - Single source of truth                               │
│ - Schema-driven generation                             │
│ - Located in raw domain test packages                  │
│ Example: @cuur/factories/identity/account.factory.ts │
└─────────────────────────────────────────────────────────┘
```

## Implementation Strategy

### Phase 1: Core Domain Factory Generation

**Goal**: Ensure core domain factories exist and are accessible

1. **Generate core domain factories** (if not already generated):

   ```bash
   cuur-codegen generate --domain identity --layer tests
   cuur-codegen generate --domain auth --layer tests
   cuur-codegen generate --domain compliance --layer tests
   ```

2. **Factory Location Structure**:

   ```
   platform/tests/src/core/{core-domain}/
   ├── factories/
   │   ├── entities/
   │   │   └── {core-domain}.entity.factory.ts  # All entities for this domain
   │   └── shared/
   │       └── faker-helpers.ts                  # Shared faker utilities
   └── ...
   ```

3. **Import Strategy**: Use TypeScript path aliases
   ```typescript
   // Import from core domain factories
   import { createAccount } from "@cuur/factories/identity/factories/entities/identity.entity.factory.js";
   ```

### Phase 2: Orchestrator Factory Composition

**Goal**: Orchestrator factories import and compose raw domain factories

#### 2.1 Handler Response Factories → Import Core Domain Factories

**Current Implementation**:

```typescript
// platform/tests/src/orchestrators/onboarding-identity/factories/handler-responses/create-account.factory.ts
import { createAccount } from "@cuur/factories/identity/factories/entities/identity.entity.factory.js";

export function createCreateAccountResponse(item?: any): any {
  const defaultItem = item || createAccount(); // Core domain factory
  return { data: defaultItem, meta: {...} };
}
```

**Benefits**:
- No duplication: Uses core domain factories directly
- Single source of truth: Changes propagate automatically
- Type safety: TypeScript ensures imports are correct

#### 2.3 Flow Factories → Compose Handler Responses

**No Change Needed** (already composes correctly):

```typescript
import { createCreateAccountResponse } from "./handler-responses/create-account.factory.js";
import { createCreateOrgResponse } from "./handler-responses/create-org.factory.js";
import { createCreateKycCaseResponse } from "./handler-responses/create-kyc-case.factory.js";

export function createOnboardingStartResponse(overrides?: Partial<any>): any {
  return {
    account: createCreateAccountResponse(),
    org: createCreateOrgResponse(),
    kycCase: createCreateKycCaseResponse(),
    ...overrides,
  };
}
```

## Generator Changes Required

### 1. Update Test Generator Logic

**File**: `.servicesgen/src/cuur_codegen/generators/tests/test.py`

**Change**: For orchestrator domains, check if raw domain factories exist and import them instead of regenerating.

```python
def _generate_orchestrator_entity_factories(
    orchestrator_domain: str,
    entities_map: Dict[str, str],
    factories_dir: Path,
    context: GenerationContext
) -> Path:
    """
    Generate entity factories for orchestrator domain.

    Strategy:
    1. Check if raw domain factories exist
    2. If yes: Generate re-export file that imports raw domain factories
    3. If no: Generate full factories (fallback)
    """
    orchestrator_config = load_orchestrator_domains_config(context.config.paths.project_root)
    orchestrator_domain_config = next(
        (d for d in orchestrator_config.orchestrator_domains
         if d.name == orchestrator_domain),
        None
    )

    if not orchestrator_domain_config:
        # Fallback: generate full factories
        return _generate_full_entity_factories(entities_map, factories_dir, context)

    # Group entities by raw domain
    raw_domain_to_entities = {}
    for entity_name, raw_domain_name in entities_map.items():
        if raw_domain_name not in raw_domain_to_entities:
            raw_domain_to_entities[raw_domain_name] = []
        raw_domain_to_entities[raw_domain_name].append(entity_name)

    # Check if raw domain factories exist
    project_root = context.config.paths.project_root
    re_exports = []
    local_factories = []

    for raw_domain_name, entity_names in raw_domain_to_entities.items():
        raw_domain_factory_path = (
            project_root / "platform" / "tests" / "src" / raw_domain_name /
            "factories" / f"{raw_domain_name}.entity.factory.ts"
        )

        if raw_domain_factory_path.exists():
            # Re-export from raw domain
            re_exports.append({
                'raw_domain': raw_domain_name,
                'entities': entity_names,
                'import_path': f"@cuur/factories/{raw_domain_name}/entity.factory"
            })
        else:
            # Generate local factories (fallback)
            local_factories.extend(entity_names)

    # Generate re-export file
    if re_exports:
        return _generate_re_export_file(
            orchestrator_domain,
            re_exports,
            local_factories,
            factories_dir,
            context
        )
    else:
        # Fallback: generate full factories
        return _generate_full_entity_factories(entities_map, factories_dir, context)
```

### 2. Path Alias Configuration

**File**: `tsconfig.base.json` or `platform/tests/tsconfig.json`

**Add**:

```json
{
  "compilerOptions": {
    "paths": {
      "@cuur/factories/*": [
        "platform/tests/src/*/factories/*",
        "platform/tests/src/*/factories"
      ]
    }
  }
}
```

### 3. Handler Response Factory Generator

**File**: `.servicesgen/src/cuur_codegen/generators/tests/builders/factory_builder.py`

**Change**: Update import paths to use raw domain factories:

```python
def build_handler_response_factory(...):
    # Detect if entity comes from raw domain
    raw_domain_factory_path = _find_raw_domain_factory(entity_name, raw_domain_name)

    if raw_domain_factory_path:
        import_path = f"@cuur/factories/{raw_domain_name}/entity.factory"
    else:
        import_path = f"../{orchestrator_domain}.entity.factory"

    return f"""
import {{ create{entity_pascal} }} from "{import_path}";
...
"""
```

## Benefits

### 1. **Single Source of Truth**

- Raw domain factories define entity generation logic once
- Changes propagate automatically to all orchestrator tests
- No risk of drift between raw and orchestrator factories

### 2. **Determinism**

- Same faker seed → same output across all tests
- Raw domain factories use shared faker helpers
- Orchestrator tests inherit determinism

### 3. **Predictability**

- Schema changes in raw domains automatically reflect in orchestrator tests
- No need to regenerate orchestrator factories when raw domain schemas change
- Clear dependency chain: Flow → Handler → Entity

### 4. **Maintainability**

- Less code to maintain (no duplication)
- Easier to debug (single factory implementation)
- Clear separation of concerns

### 5. **Type Safety**

- TypeScript ensures imports are correct
- Compile-time errors if raw domain factories don't exist
- Better IDE support

## Migration Path

### Step 1: Generate Raw Domain Factories

```bash
# Generate factories for all raw domains used by orchestrators
for domain in identity auth compliance; do
  cuur-codegen generate --domain $domain --layer tests
done
```

### Step 2: Update Generator Logic

- Implement re-export strategy in test generator
- Update handler response factory imports
- Add path alias configuration

### Step 3: Regenerate Orchestrator Factories

```bash
# Regenerate orchestrator factories (will now import raw domain factories)
cuur-codegen generate --domain onboarding-identity --layer tests
```

### Step 4: Verify

- Run tests to ensure imports work
- Check that determinism is preserved
- Verify no duplication

## Edge Cases & Considerations

### 1. **Raw Domain Factory Doesn't Exist**

**Solution**: Fallback to generating full factories locally (current behavior)

### 2. **Orchestrator-Specific Entities**

**Solution**: Generate local factories only for orchestrator-specific entities, import rest from raw domains

### 3. **Multiple Raw Domains with Same Entity Name**

**Solution**: Use explicit imports with aliases:

```typescript
import { createAccount as createIdentityAccount } from "@cuur/factories/identity/account.factory";
import { createAccount as createAuthAccount } from "@cuur/factories/auth/account.factory";
```

### 4. **Raw Domain Factory Location**

**Solution**: Standardize on `platform/tests/src/{raw-domain}/factories/{raw-domain}.entity.factory.ts`

### 5. **Handler Response Factories**

**Solution**: Keep in orchestrator domain (they're orchestrator-specific), but import entities from raw domains

## Example: Complete Flow

### Raw Domain Factory (`identity`)

```typescript
// platform/tests/src/identity/factories/identity.entity.factory.ts
export function createAccount(overrides?: Partial<Account>): Account {
  // Schema-driven generation
  const raw = { id: `acc_${...}`, email: faker.internet.email(), ... };
  return ZAccount.parse(raw);
}
```

### Orchestrator Entity Factory (`onboarding-identity`)

```typescript
// platform/tests/src/onboarding-identity/factories/onboarding-identity.entity.factory.ts
// Re-export raw domain factories
export {
  createAccount,
  createOrg,
} from "@cuur/factories/identity/entity.factory";
export { createKycCase } from "@cuur/factories/compliance/entity.factory";
```

### Handler Response Factory (`onboarding-identity`)

```typescript
// platform/tests/src/onboarding-identity/factories/handler-responses/create-account.factory.ts
import { createAccount } from "@cuur/factories/identity/entity.factory";

export function createCreateAccountResponse(item?: any): any {
  return { data: item || createAccount(), meta: {...} };
}
```

### Flow Factory (`onboarding-identity`)

```typescript
// platform/tests/src/onboarding-identity/factories/onboarding-start.factory.ts
import { createCreateAccountResponse } from "./handler-responses/create-account.factory";
// ... other imports

export function createOnboardingStartResponse(): any {
  return {
    account: createCreateAccountResponse(),
    org: createCreateOrgResponse(),
    kycCase: createCreateKycCaseResponse(),
  };
}
```

## Conclusion

**Recommended Approach**: Implement composition-based factory strategy where orchestrator factories import and reuse raw domain factories. This ensures:

✅ Single source of truth
✅ Deterministic test data
✅ Predictable behavior
✅ Maintainable codebase

**Next Steps**:

1. Review and approve this strategy
2. Implement generator changes
3. Generate raw domain factories
4. Regenerate orchestrator factories
5. Verify tests pass with new structure
