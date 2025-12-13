# ServicesGen Current State Summary

**Last Updated**: December 2024

## Overview

ServicesGen is a code generation system that generates TypeScript code for Services, Adapters (including Prisma), Tests, and Orchestrators. It follows a modular, configuration-driven architecture with a plugin-based generator system.

## Key Achievements

### ✅ Layered Factory Architecture (Implemented)

The test generator now implements a **three-layer factory architecture**:

1. **Core Domain Entity Factories** (`platform/tests/src/core/{domain}/factories/entities/`)
   - Single source of truth for entity generation
   - Schema-driven using Zod schema introspection
   - Configurable via `.servicesgen/config/test-factory-config.yaml`

2. **Handler Response Factories** (`platform/tests/src/orchestrators/{orchestrator}/factories/handler-responses/`)
   - Wrap entities in DataEnvelope structure
   - Import from core domain factories via `@cuur/factories` path alias

3. **Flow Factories** (`platform/tests/src/orchestrators/{orchestrator}/factories/flows/`)
   - Compose handler response factories
   - Match flow return structure

### ✅ Path Resolution Fixes

- Handles `project_root` being `platform/` vs repo root
- Orchestrator detection checks parent directory when needed
- Correct routing: core domains → `tests/src/core/`, orchestrator domains → `tests/src/orchestrators/`

### ✅ Schema-Driven Factory Generation

- Uses `SchemaIntrospector` to extract field definitions from Zod schemas
- Minimal config file for overrides only (no hardcoded business logic)
- Automatic updates when schemas change

### ✅ Pipeline Integration

- Tests layer processes both core and orchestrator domains
- Core domain factories generated before orchestrator factories
- Automatic dependency resolution

## Current Architecture

### Domain Types

1. **Core Domains** (27 domains)
   - Technical service domains (e.g., `auth`, `identity`, `exchange`, `blockchain`)
   - Defined in `.servicesgen/config/.core-domains.yaml`
   - Generate entity factories in `platform/tests/src/core/{domain}/`

2. **Orchestrator Domains** (30 domains)
   - Business-scenario-driven API aggregation layer
   - Defined in `.servicesgen/config/.orchestrator-domains.yaml`
   - Generate flow tests and factories in `platform/tests/src/orchestrators/{domain}/`

### Generator Structure

```
.servicesgen/src/cuur_codegen/
├── generators/
│   ├── tests/
│   │   ├── test.py                    # Main test generator
│   │   └── builders/
│   │       ├── factory_builder.py     # Handler response & flow factories
│   │       ├── pure_schema_factory_builder.py  # Pure schema-driven factory generator
│   │       ├── zod_schema_extractor.py  # Zod schema parser/extractor
│   │       ├── schema_introspector.py # Zod schema parsing
│   │       └── config_loader.py       # YAML config loading
│   ├── services/
│   ├── adapters/
│   └── orchestrators/
├── core/
│   ├── config.py                      # Configuration model
│   ├── layer_folder_structure.py     # Path resolution (single source of truth)
│   └── core_domains_config.py         # Core domain config loader
└── pipeline/
    ├── pipeline.py                    # Main pipeline orchestrator
    └── stages.py                      # Domain processing stages
```

### Key Files

- **`.servicesgen/config/.core-domains.yaml`**: List of core domains
- **`.servicesgen/config/.orchestrator-domains.yaml`**: Orchestrator domain mappings
- **`.servicesgen/config/test-factory-config.yaml`**: Factory generation overrides
- **`tsconfig.base.json`**: Path alias configuration (`@cuur/factories/*`)

## Usage Examples

### Generate Core Domain Factories

```bash
# Single domain
cuur-codegen generate --domain identity --layer tests

# All core domains
cuur-codegen generate --all --layer tests
```

### Generate Orchestrator Tests

```bash
# Single orchestrator domain (automatically ensures core factories exist)
cuur-codegen generate --domain onboarding-identity --layer tests

# All orchestrator domains
cuur-codegen generate --all --layer tests
```

## Output Structure

### Core Domain Output

```
platform/tests/src/core/{domain}/
├── factories/
│   ├── entities/
│   │   └── {domain}.entity.factory.ts    # Entity factories
│   └── shared/
│       └── faker-helpers.ts              # Shared faker utilities
└── package.json
```

### Orchestrator Domain Output

```
platform/tests/src/orchestrators/{domain}/
├── factories/
│   ├── flows/
│   │   └── *.factory.ts                  # Flow response factories
│   ├── handler-responses/
│   │   └── *.factory.ts                  # Handler response factories
│   └── shared/
│       └── faker-helpers.ts              # Shared faker utilities
├── flows/
│   └── *.flow.test.ts                    # Flow test files
├── mocks/
│   └── index.ts                          # Mock dependencies
└── package.json
```

## Import Paths

### Core Domain Factories

```typescript
import { createAccount } from "@cuur/factories/identity/factories/entities/identity.entity.factory.js";
```

### Handler Response Factories

```typescript
import { createAccount } from "@cuur/factories/identity/factories/entities/identity.entity.factory.js";
```

### Flow Factories

```typescript
import { createCreateAccountResponse } from "../handler-responses/create-account.factory.js";
```

## Configuration

### Path Alias (tsconfig.base.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@cuur/factories/*": ["platform/tests/src/core/*"]
    }
  }
}
```

### Factory Config Overrides (test-factory-config.yaml)

```yaml
id_patterns:
  account:
    prefix: "acc_"
    regex: "^acc_[0-9A-HJKMNP-TV-Z]{26}$"
    char_set: "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
    length: 26

field_overrides:
  account:
    entity_fields:
      email:
        generator: "faker.internet.email()"
        required: true
```

## Key Design Principles

1. **Single Source of Truth**: Core domain factories are the authoritative source
2. **Schema-Driven**: Primary source is Zod schemas, config only for overrides
3. **No Duplication**: Orchestrator factories import from core factories
4. **Type Safety**: TypeScript path aliases ensure correct imports
5. **Determinism**: Shared faker helpers ensure consistent test data

## Related Documentation

- [Test Generator Documentation](./TEST_GENERATOR.md) - Detailed test generator guide
- [Test Factory Architecture](./TEST_FACTORY_ARCHITECTURE.md) - Architecture overview
- [Orchestrator Factory Strategy](./ORCHESTRATOR_FACTORY_STRATEGY.md) - Strategy document (implemented)
- [Schema-Driven Factories](./SCHEMA_DRIVEN_FACTORIES.md) - Schema introspection details
- [AI Agent Maintenance Guide](./AI_AGENT_MAINTENANCE.md) - Generator architecture overview
- [AI Agent Usage Guide](./AI_AGENT_USAGE.md) - CLI usage instructions

## Recent Changes

### December 2024

- ✅ Implemented layered factory architecture
- ✅ Fixed path resolution for `project_root` handling
- ✅ Added core domain factory generation
- ✅ Updated orchestrator factories to import from core factories
- ✅ Refactored from "raw domains" to "core domains" terminology
- ✅ Removed all backward compatibility code
- ✅ Updated all documentation

## Next Steps (Future Enhancements)

- [ ] Generate request/response DTO factories for core domains
- [ ] Add relationship detection for foreign keys
- [ ] Support nested objects and arrays in schema introspection
- [ ] Add smart defaults inference from field names
- [ ] Generate integration test templates
