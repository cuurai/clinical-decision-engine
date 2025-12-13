# Schema-Driven Factory Generation

## Overview

The test factory generator now uses **schema introspection** as the primary source of truth, with configuration files providing only **overrides**. This eliminates hardcoded business logic from the generator code.

## Architecture

### Primary Source: Schema Introspection

The generator introspects Zod schema files to extract:
- **Field definitions** (names, types, required/optional)
- **Regex patterns** (especially for IDs)
- **Enum values**
- **Field constraints** (min/max length, min/max value)
- **Default values**

**Source**: `packages/core/packages/core/src/{domain}/openapi/{domain}.zod.schema.ts`

### Override Source: Configuration File

A minimal YAML config file provides overrides only when needed:
- **ID generation patterns** (prefix, regex, char set)
- **Field generation overrides** (custom faker functions)
- **Domain mappings** (when entity exists in multiple domains)
- **Input schema name overrides** (when naming doesn't follow convention)

**Source**: `.servicesgen/config/test-factory-config.yaml`

## How It Works

### 1. Schema Introspection

```python
# Introspects Zod schemas to extract entity information
introspector = SchemaIntrospector()
entities = introspector.introspect_all_entities(project_root)

# For each entity, extracts:
# - Field names and types
# - Required vs optional fields
# - Regex patterns (especially for IDs)
# - Enum values
# - Field constraints
```

### 2. Config Overrides

```python
# Loads minimal config for overrides only
config_loader = TestFactoryConfigLoader()
config = config_loader.load()

# Provides:
# - ID pattern overrides
# - Field generation overrides
# - Domain mappings
```

### 3. Factory Generation

```python
# Generates factory code using schema + config
builder = PureSchemaFactoryBuilder(context)
factory_code = builder.build_entity_factory(
    entity_name="Account",
    domain_name="identity",
    entity_info=introspected_info
)
```

## Benefits

1. **No Hardcoded Logic**: All entity information comes from schemas
2. **Single Source of Truth**: Zod schemas define entities
3. **Minimal Config**: Only specify what needs overriding
4. **Automatic Updates**: Schema changes automatically reflected in factories
5. **Type Safety**: Uses actual Zod schemas for validation

## Configuration File Structure

```yaml
# ID Generation Patterns (only when needed)
id_patterns:
  account:
    prefix: "acc_"
    regex: "^acc_[0-9A-HJKMNP-TV-Z]{26}$"
    char_set: "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
    length: 26

# Domain Mappings (only when entity exists in multiple domains)
entity_domains:
  account:
    identity: "identity"
    auth: "auth"
    default: "identity"

# Field Overrides (only for custom generation logic)
field_overrides:
  org:
    entity_fields:
      legalName:
        generator: "faker.company.name()"
        required: true

# Input Schema Overrides (only when naming doesn't follow convention)
input_schema_overrides:
  documentsignature:
    schema_name: "CreateSignatureRequestRequest"
```

## Migration Path

1. **Phase 1**: New schema-driven builder works alongside old builder
2. **Phase 2**: Update test generator to use schema-driven builder
3. **Phase 3**: Remove old hardcoded factory_mappings.py
4. **Phase 4**: Keep only minimal config file for overrides

## Example: Account Entity

### Schema (Source of Truth)
```typescript
const Account = z.object({
  id: AccountId.regex(/^acc_[0-9A-HJKMNP-TV-Z]{26}$/),
  email: z.string().email(),
  status: AccountStatus, // enum
  createdAt: Timestamp.datetime({ offset: true }),
  // ...
});
```

### Introspected Info
```python
EntitySchemaInfo(
  entity_name="Account",
  domain_name="identity",
  fields={
    "id": FieldInfo(regex_pattern="^acc_[0-9A-HJKMNP-TV-Z]{26}$", ...),
    "email": FieldInfo(zod_type="z.string().email()", ...),
    "status": FieldInfo(enum_values=["ACTIVE", "INACTIVE", ...], ...),
    # ...
  },
  id_field="id",
  id_regex="^acc_[0-9A-HJKMNP-TV-Z]{26}$",
  id_prefix="acc_"
)
```

### Generated Factory
```typescript
export function createAccount(overrides?: Partial<Account>): Account {
  const faker = getFaker();
  const validIdChars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const accountIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validIdChars.split(""))
  ).join("");

  const raw = {
    id: `acc_${accountIdSuffix}`,
    email: faker.internet.email(),
    status: faker.helpers.arrayElement(["ACTIVE", "INACTIVE", ...]),
    createdAt: new Date().toISOString(),
    ...overrides,
  };

  return ZAccount.parse(raw);
}
```

## Advanced Field Generation Patterns

The generator implements sophisticated field generation patterns based on schema introspection:

### Conditional Field Generation

Some fields are conditionally generated based on other field values:

**Example: `deprecationReason`**
```typescript
// Status is declared before raw object
const status = overrides.status ?? faker.helpers.arrayElement(["ACTIVE", "DEPRECATED", "DISABLED"]);

const raw = {
  // ... other fields
  status: status,
  // Only populate deprecationReason if status is DEPRECATED
  deprecationReason: status === "DEPRECATED"
    ? (overrides.deprecationReason ?? faker.word.words(3))
    : undefined,
  // ...
};
```

### Special Field Handling

**Audit Fields (`createdBy`, `updatedBy`)**
- Uses `"system"` instead of random strings for realistic test data
- Pattern: `createdBy: overrides.createdBy ?? "system"`

**ID Fields**
- Detects regex patterns (e.g., `^BL_`, `^ID_`, `^acc_`)
- Generates appropriate ID helper functions (`makeBLId()`, `makeIDId()`, `makeAccId()`)
- Uses correct character sets and lengths from schema

**Numeric String Fields**
- `chainId`: Uses `faker.string.numeric({ length: { min: 1, max: 3 } })` for realistic chain IDs (e.g., "1", "137", "56")

**Nested Objects**
- Extracts nested object structure from schema
- Generates proper nested object with all fields
- Example: `rpcFeatures: { EIP1559: faker.datatype.boolean(), PRIORITY_FEE: faker.datatype.boolean() }`

**Enum Fields**
- Extracts enum values from schema
- Uses `faker.helpers.arrayElement([...])` with actual enum values
- Handles multi-line enum definitions

**URL Fields**
- Detects `.url()` modifier or field name containing "url"
- Uses `faker.internet.url()` for realistic URLs

**Hash Fields**
- Detects field names containing "hash"
- Uses `faker.string.hexadecimal({ length: 64 })` for realistic hashes

**Datetime Fields**
- Detects `.datetime()` modifier or field names ending in "at"
- Uses `new Date().toISOString()` for ISO timestamps

### Schema Default Values

The generator respects schema default values:
- **Numeric defaults**: Uses schema default directly (e.g., `decimals: 18`)
- **String/enum defaults**: Uses schema default with proper quoting (e.g., `chainNamespace: "EVM"`)

### All Optional Fields Included

Unlike previous versions, the generator now includes **all optional fields** for realistic test data:
- Optional fields without defaults are still generated with appropriate faker functions
- Ensures comprehensive test coverage

## Models-Based Factory Generation

The generator reads entity and DTO definitions from the `models/` directory structure:

**Source Structure**:
```
packages/core/packages/core/src/{domain}/models/
├── {entity-name}/
│   ├── entity/
│   │   └── {entity-name}.entity.ts
│   └── dto/
│       ├── create-{entity-name}.dto.ts
│       ├── list-{entity-name}.dto.ts
│       └── ...
```

**Generated Structure**:
```
platform/tests/src/core/{domain}/factories/
├── {entity-name}/
│   ├── entity/
│   │   └── {entity-name}.entity.factory.ts
│   └── dto/
│       ├── create-{entity-name}.dto.factory.ts
│       ├── list-{entity-name}.dto.factory.ts
│       └── ...
```

**Benefits**:
- Mirrors the source structure for easy navigation
- One factory file per entity/DTO
- Clear separation between entities and DTOs
- Easy to locate and maintain factories

## Future Enhancements

1. **Input Schema Introspection**: Also introspect Create{Entity}Request schemas
2. **Relationship Detection**: Auto-detect foreign key relationships
3. **Smart Defaults**: Infer better defaults from field names and types
4. **Field Dependencies**: Detect and handle field dependencies (e.g., `replacedByChainId` when `status === "DEPRECATED"`)
