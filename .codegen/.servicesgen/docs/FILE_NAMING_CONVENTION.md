# File Naming Convention

## Standard: Dot Notation

All generated file names use **dot notation** with dashes only for multi-word resource names.

## Pattern

```
{resource-name}.{file-type}.ts
```

- Single word resources: `halts.routes.ts`, `exchange.schemas.ts`
- Multi-word resources: `transfer-agent.schemas.ts`, `get-chain.dto.ts`

## Examples

| Layer                        | Format                                    |
| ---------------------------- | ----------------------------------------- |
| **Services Routes**          | `halts.routes.ts`                         |
|                              | `market-maker-quotes.routes.ts`           |
| **Core DTOs**                | `get-chain.dto.ts`                        |
|                              | `create-on-chain-tx.dto.ts`               |
| **Core Entities**            | `chain.entity.ts`                         |
|                              | `on-chain-tx.entity.ts`                   |
| **Core Schemas**             | `exchange.schemas.ts`                     |
|                              | `transfer-agent.schemas.ts`               |
| **Orchestrator Aggregators** | `funding-accounts-overview.aggregator.ts` |
| **Orchestrator Clients**     | `fiat-banking.client.ts`                  |
| **Orchestrator Routes**      | `accounts-funding.routes.ts`              |
| **Tests**                    | `list-halts.test.ts`                      |
| **DAO Repositories**         | `auth-account.dao.repository.ts`          |
|                              | `exchange-order.dao.repository.ts`        |
|                              | `chain-adapter-health.dao.repository.ts`  |

## Implementation

Use `generate_file_name()` utility function for all file names:

```python
from cuur_codegen.utils.string import generate_file_name

# Generate file name
file_name = generate_file_name(resource_name, "routes")
# Returns: "halts.routes.ts" or "transfer-agent.routes.ts"
```

## File Types

- `routes` - Service route files
- `dto` - Data Transfer Object schemas
- `entity` - Entity schemas
- `schemas` - Schema definition files
- `aggregator` - Orchestrator aggregator classes
- `client` - Orchestrator service client wrappers
- `test` - Test files
- `repository` - DAO repository implementations
- `handler` - Handler functions (no suffix, just kebab-case)

## Rationale

1. **Consistency** - Dot notation clearly separates resource name from file type
2. **Predictability** - Easy to identify file type by extension pattern
3. **Tooling** - Easy to search/filter by type: `*.routes.ts`, `*.dto.ts`, `*.schemas.ts`
4. **Readability** - Clear separation between resource name and file purpose

## Migration

All generators have been updated to use this convention. Regenerate files to apply the new naming.
