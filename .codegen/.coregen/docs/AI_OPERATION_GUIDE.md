# AI Operation Guide - Quub CoreGen

## Overview

This guide covers the `cuur-coregen` code generation framework for generating TypeScript code from OpenAPI specifications. The framework supports two layers:

1. **Core Layer** - Generates handlers, repositories, DTOs, entities, types, schemas, and converters
2. **SDK Layer** - Generates domain clients, OpenAPI types, and Zod schemas

## Critical Rules

### File Naming Convention

**All generated files use dot notation for file type suffixes:**

| Layer | File Type | Format | Example |
|-------|-----------|--------|---------|
| **Core Handlers** | Handler | `{verb}-{resource}.handler.ts` | `get-chain-adapter-health.handler.ts` |
| **Core DTOs** | DTO | `{verb}-{resource}.dto.ts` | `create-chain.dto.ts` |
| **Core Entities** | Entity | `{resource}.entity.ts` | `chain.entity.ts` |
| **Core Repositories** | Repository | `{resource}.repository.ts` | `chain.repository.ts` |
| **Core Types** | Domain Types | `{domain}.domain.types.ts` | `blockchain.domain.types.ts` |
| **Core Schemas** | Schemas | `{domain}.schemas.ts` | `blockchain.schemas.ts` |
| **SDK Clients** | Client | `{domain}.client.ts` | `blockchain.client.ts` |
| **SDK OpenAPI Types** | OpenAPI Types | `{domain}.openapi.types.ts` | `blockchain.openapi.types.ts` |
| **SDK Zod Schemas** | Zod Schema | `{domain}.zod.schema.ts` | `blockchain.zod.schema.ts` |

**Key Rules:**
- Multi-word resource names use kebab-case: `chain-adapter-health`
- File type suffixes use dot notation: `.handler.ts`, `.dto.ts`, `.entity.ts`
- Domain names use kebab-case: `business-intelligence`

### Pluralization Rules

1. **Entity types**: ALWAYS singular (`Halt`, `Wallet`, `Market`) - use `singularize()`
2. **Params types**: ALWAYS plural (`ListHaltsParams`) - use `pluralize_resource_name()`
3. **Repository names**: ALWAYS plural (`HaltsRepository`) - keep resource plural
4. **Resource extraction**: `"listHalts"` → `"Halts"` (plural), `"createHalt"` → `"Halt"` (singular)

### Layer Selection

The codegen supports two layers:

- **Core Layer** (`--layer core`): Generates handlers, repositories, DTOs, entities, types, schemas, converters
- **SDK Layer** (`--layer sdk`): Generates domain clients, OpenAPI types, Zod schemas

## CLI Usage

### Basic Commands

**Generate Core Layer:**
```bash
cuur-coregen generate --domain <domain-name> --layer core --bundle
```

**Generate SDK Layer:**
```bash
cuur-coregen generate --domain <domain-name> --layer sdk --bundle
```

**Generate All Domains:**
```bash
# Core layer
cuur-coregen generate --all --layer core --bundle

# SDK layer
cuur-coregen generate --all --layer sdk --bundle
```

### Common Flags

- `--domain <name>` - Specify domain(s) to generate (can be used multiple times)
- `--all` - Generate all enabled domains
- `--layer [core|sdk]` - Select layer to generate (default: `core`)
- `--bundle` - Bundle OpenAPI YAML files before generation
- `--no-build` - Skip build validation (faster during development)
- `--clean` - Clean output directories before generation
- `--config <path>` - Specify config file (default: `.codegen/.cuur-coregen.json`)

### Configuration File

The config file is located at `.codegen/.cuur-coregen.json` and is automatically found when running from the project root.

## Generator Order

### Core Layer Execution Sequence

1. **Schemas File** - Copies Zod schemas from OpenAPI extraction
2. **Types** - Generates TypeScript type exports
3. **Schema** - Generates DTO and Entity schema files
4. **Repository** - Generates repository interfaces
5. **Handler** - Generates handler functions
6. **Converter** - Generates entity converters
7. **Index Builder** - Generates domain-level barrel exports

### SDK Layer Execution Sequence

1. **OpenAPI TypeScript Extractor** - Extracts TypeScript types from bundled OpenAPI JSON
2. **OpenAPI Zod Client Extractor** - Extracts Zod schemas from bundled OpenAPI JSON
3. **Domain Client Generator** - Generates domain client classes
4. **SDK Index Builder** - Generates `domains/index.ts` barrel export (post-processing)

## Generator-Specific Guidelines

### Core Layer Generators

#### 1. Schemas File Generator
- **Purpose**: Copies Zod schemas from OpenAPI extraction and removes API client parts
- **Output**: `packages/core/src/{domain}/schemas/{domain}.schemas.ts`
- **Key**: Uses `.schemas.ts` suffix (dot notation)

#### 2. Types Generator
- **Purpose**: Generates TypeScript type exports from OpenAPI types
- **Output**: `packages/core/src/{domain}/types/{domain}.domain.types.ts`
- **Key Rules**:
  - Schema types: Use singular form (`Halt`, `Market`)
  - Params types: Use plural form (`ListHaltsParams`, `ListMarketsParams`)
  - Response types: Match operation naming (`ListHaltsResponse`)
  - Uses `.domain.types.ts` suffix (dot notation)

#### 3. Schema Generator
- **Purpose**: Generates DTO and Entity schema files
- **Output**:
  - DTOs: `packages/core/src/{domain}/schemas/{resource}/dto/{verb}-{resource}.dto.ts`
  - Entities: `packages/core/src/{domain}/schemas/{resource}/entity/{resource}.entity.ts`
- **Key Rules**:
  - Entity schemas: Singular resource name (`halt.entity.ts`)
  - DTO schemas: Match operation verb (`create-halt.dto.ts`, `list-halts.dto.ts`)
  - Directory structure: Pluralized, kebab-cased (`halts/`, `markets/`)
  - Uses `.dto.ts` and `.entity.ts` suffixes (dot notation)

#### 4. Repository Generator
- **Purpose**: Generates repository interfaces
- **Output**: `packages/core/src/{domain}/repositories/{resource}.repository.ts`
- **Key Rules**:
  - **Core Layer**: Generates `ReadRepository<T, ID, Params>` interfaces
    - Entity type: singular (`Halt`)
    - Params type: plural (`ListHaltsParams`)
    - Repository name: plural (`HaltsRepository`)
  - File naming: Singular resource (`halt.repository.ts` for "Halts" resource)
  - Uses `.repository.ts` suffix (dot notation)

#### 5. Handler Generator
- **Purpose**: Generates handler functions from OpenAPI operations
- **Output**: `packages/core/src/{domain}/handlers/{resource}/{verb}-{resource}.handler.ts`
- **Key Rules**:
  - File structure: Pluralized directories (`halts/`, `markets/`)
  - Handler names: Match operation IDs (`listHalts`, `createHalt`)
  - Import types: Use singular entity types, plural params types
  - Import repositories: Use plural repository names
  - Uses `.handler.ts` suffix (dot notation)

#### 6. Converter Generator
- **Purpose**: Generates converters for DAO ↔ Domain entity mapping
- **Output**: `packages/core/src/{domain}/utils/{domain}-converters.ts`
- **Key Rules**:
  - Entity types: Singular (`Halt`, `Wallet`)
  - Converter functions: `daoToDomain`, `domainToDao`
  - Naming: `{resource}DaoToDomain`, `{resource}DomainToDao`

#### 7. Index Builder Generator
- **Purpose**: Generates domain-level barrel export (`index.ts`)
- **Output**: `packages/core/src/{domain}/index.ts`
- **Key**: Exports all domain components (types, repositories, handlers, schemas, converters)

### SDK Layer Generators

#### 1. OpenAPI TypeScript Extractor
- **Purpose**: Extracts TypeScript types from bundled OpenAPI JSON files using `openapi-typescript`
- **Output**:
  - Core: `packages/core/src/{domain}/openapi/{domain}.openapi.types.ts`
  - SDK: `packages/sdk/src/openapi/types/{domain}.openapi.types.ts`
- **Key**: Uses `.openapi.types.ts` suffix (dot notation)

#### 2. OpenAPI Zod Client Extractor
- **Purpose**: Extracts Zod schemas from bundled OpenAPI JSON files using `openapi-zod-client`
- **Output**:
  - Core: `packages/core/src/{domain}/openapi/{domain}.zod.schema.ts`
  - SDK: `packages/sdk/src/openapi/schemas/{domain}.zod.schema.ts`
- **Key**: Uses `.zod.schema.ts` suffix (dot notation)

#### 3. Domain Client Generator
- **Purpose**: Generates TypeScript domain client classes that wrap HTTP calls
- **Output**: `packages/sdk/src/domains/{domain}.client.ts`
- **Key**: Uses `.client.ts` suffix (dot notation)

#### 4. SDK Index Builder Generator
- **Purpose**: Generates barrel export for all domain clients
- **Output**: `packages/sdk/src/domains/index.ts`
- **Key**: Runs in post-processing stage, exports all domain clients

## Error Handling

The codegen includes comprehensive error handling for missing OpenAPI files:

### Missing OpenAPI Directory
- Checks for OpenAPI directory existence
- Suggests alternative locations if found
- Provides git restore commands

### Missing OpenAPI Files
- Lists available YAML files when expected file is missing
- Suggests checking domain name matching
- Provides git restore commands with correct paths

### Missing Bundled Files
- Suggests using `--bundle` flag
- Provides git restore commands
- Explains bundling process

## Output Paths

### Core Layer

All generators output to `packages/core/src/{domain}/`:

- **Schemas**: `{domain}/schemas/{domain}.schemas.ts`
- **Types**: `{domain}/types/{domain}.domain.types.ts`
- **DTOs**: `{domain}/schemas/{resource}/dto/{verb}-{resource}.dto.ts`
- **Entities**: `{domain}/schemas/{resource}/entity/{resource}.entity.ts`
- **Repositories**: `{domain}/repositories/{resource}.repository.ts`
- **Handlers**: `{domain}/handlers/{resource}/{verb}-{resource}.handler.ts`
- **Converters**: `{domain}/utils/{domain}-converters.ts`
- **Index**: `{domain}/index.ts`

### SDK Layer

- **Domain Clients**: `packages/sdk/src/domains/{domain}.client.ts`
- **OpenAPI Types**: `packages/sdk/src/openapi/types/{domain}.openapi.types.ts`
- **Zod Schemas**: `packages/sdk/src/openapi/schemas/{domain}.zod.schema.ts`
- **Domains Index**: `packages/sdk/src/domains/index.ts`

## Common Pitfalls

- ❌ Using plural entity types (`Halts` instead of `Halt`)
- ❌ Using singular params types (`ListHaltParams` instead of `ListHaltsParams`)
- ❌ Using singular repository names (`HaltRepository` instead of `HaltsRepository`)
- ❌ Using dash notation for file type suffixes (`-handler.ts` instead of `.handler.ts`)
- ❌ Forgetting to check layer configuration before generating
- ❌ Not applying singularize/pluralize correctly
- ❌ Mixing up file naming (singular vs plural)
- ❌ Incorrect import paths or type references
- ❌ Not using `--bundle` flag when bundled files don't exist

## Examples

### Complete Flow Example

```python
# Operation: "listHalts"
operation_id = "listHalts"
resource = extract_resource_from_operation_id(operation_id)  # "Halts"

# Entity type (singular)
entity_name = singularize(resource)  # "Halt"

# Params type (plural)
params_type = f"List{pluralize_resource_name(entity_name)}Params"
# "ListHaltsParams"

# Repository name (plural)
repo_name = f"{pascal_case(resource)}Repository"
# "HaltsRepository"

# File paths (using dot notation)
repo_file = f"{kebab_case(singularize(resource))}.repository.ts"
# "halt.repository.ts"
handler_file = f"{kebab_case(verb)}-{kebab_case(resource)}.handler.ts"
# "list-halts.handler.ts"
dto_file = f"{kebab_case(verb)}-{kebab_case(resource)}.dto.ts"
# "list-halts.dto.ts"
```

### Type Imports Example

```typescript
// ✅ CORRECT
import type { Halt, ListHaltsParams } from "../types/index.js";
import type { HaltsRepository } from "../repositories/index.js";

// ❌ WRONG
import type { Halts, ListHaltParams } from "../types/index.js";
import type { HaltRepository } from "../repositories/index.js";
```

### SDK Client Usage Example

```typescript
// Import from domains/index.ts
import { AuthClient, BlockchainClient } from "./domains/index.js";

// Or import individual clients
import { AuthClient } from "./domains/auth.client.js";
```

## Testing Checklist

When modifying generators, verify:

- [ ] Entity types are singular
- [ ] Params types are plural
- [ ] Repository names are plural
- [ ] File names use dot notation for suffixes (`.handler.ts`, `.dto.ts`, etc.)
- [ ] Import paths are correct
- [ ] Layer detection works correctly (`--layer core` vs `--layer sdk`)
- [ ] SDK extractors run when SDK layer is enabled
- [ ] SDK index builder generates `domains/index.ts`
- [ ] Error handling provides helpful messages
- [ ] All 26 domains generate successfully
- [ ] Config file is found automatically (`.codegen/.cuur-coregen.json`)

## Important Notes

1. **No Adapters/Services/Tests Layers**: The codegen only supports `core` and `sdk` layers. All references to adapters, services, and tests have been removed.

2. **Dot Notation**: All file type suffixes use dot notation (`.handler.ts`, `.dto.ts`, `.entity.ts`, etc.), not dash notation (`-handler.ts`).

3. **SDK Post-Processing**: SDK index builder runs in post-processing stage after all domains are generated.

4. **Error Messages**: Error handling includes helpful suggestions and git restore commands when files are missing.

5. **Config Location**: The config file is automatically found at `.codegen/.cuur-coregen.json` when running from project root.
