# Adapters Generator - Modular Architecture

This generator has been refactored from TypeScript (`.servicesgen`) into Python, following the same modular pattern as the core and services generators.

## 📁 Structure

```
adapters/
├── __init__.py
├── adapter.py                    # Main generator (orchestrates builders)
└── builders/
    ├── __init__.py
    ├── repository_discovery.py  # Discovers repositories from core
    ├── repository_builder.py    # Builds DAO class
    ├── method_builder.py         # Builds CRUD methods
    └── index_builder.py         # Builds barrel exports
```

## 🎯 Components

### AdapterGenerator (`adapter.py`)
- **Purpose**: Main orchestrator
- **Responsibilities**:
  - Discovers repositories from core package
  - Coordinates builders
  - Generates DAO repository files
  - **CRITICAL**: Only generates adapters for core domains (26 domains)
  - Automatically skips orchestrator domains (29 domains)

### RepositoryDiscovery (`builders/repository_discovery.py`)
- **Purpose**: Discovers repositories from core package
- **Output**: List of `RepositoryInfo` objects
- **Features**:
  - Scans core repositories directory
  - Extracts interface names, entity types
  - Detects CRUD capabilities
  - Extracts method signatures and types

### RepositoryBuilder (`builders/repository_builder.py`)
- **Purpose**: Builds DAO repository class
- **Output**: Complete DAO class implementation
- **Features**:
  - Imports from `@cuur/core`
  - Implements repository interface
  - Uses `DaoClient` for database access

### MethodBuilder (`builders/method_builder.py`)
- **Purpose**: Builds repository method implementations
- **Output**: List of method strings
- **Features**:
  - List, findById, get methods
  - Create, update, delete methods (if CRUD)
  - Custom method stubs
  - toDomain helper method

### IndexBuilder (`builders/index_builder.py`)
- **Purpose**: Builds barrel exports
- **Output**: `index.ts` with exports
- **Features**:
  - Exports all DAO classes
  - Proper file paths

## 📊 Refactoring Summary

**Before:**
- TypeScript generator in `.servicesgen/src/generators/adapters/`
- Complex discovery and building logic
- Hard to maintain and extend

**After:**
- Python generator with modular builders
- Clear separation of concerns
- Easy to test and extend
- Consistent with core and services generators

## 🔄 Usage

The generator is used via the pipeline:

```python
from quub_codegen.generators.adapters import AdapterGenerator

generator = AdapterGenerator()
result = generator.generate(context)
```

## 🚀 Benefits

1. **Modularity** - Each builder has a single responsibility
2. **Testability** - Can test builders independently
3. **Maintainability** - Easier to find and fix issues
4. **Consistency** - Follows same pattern as core and services generators
5. **Type Safety** - Proper type hints throughout

## 📝 Generated Output

For each **core domain** repository, generates:
- `{resource}.dao.repository.ts` - DAO implementation class (e.g., `auth-account.dao.repository.ts`)
- `index.ts` - Barrel exports
- `prisma/schema.prisma` - Prisma schema file

**Domain Support:**
- ✅ **Core Domains (26)**: Generates adapters for all core domains
  - Examples: `auth`, `blockchain`, `exchange`, `custodian`, `treasury`, etc.
- ❌ **Orchestrator Domains (29)**: Automatically skipped
  - Examples: `accounts-funding`, `analytics-dashboard`, `auth-session`, etc.
  - Orchestrator domains use adapters from their core domains

**Protection Against Leakage:**
- Multiple layers of protection prevent orchestrator domains from being processed:
  1. Pipeline-level filtering (core domains only)
  2. Generator-level early exit (skip before directory creation)
  3. Index builder filtering (excludes orchestrator domains from main index.ts)

Example:
```typescript
export class DaoChainAdapterRepository implements ChainAdapterRepository {
  constructor(private readonly dao: DaoClient) {}

  async list(orgId: OrgId, params?: PaginationParams): Promise<PaginatedResult<ChainAdapter>> {
    // Implementation...
  }
  // ... other methods
}
```
