# Service Generator - Modular Architecture

This generator has been refactored from a monolithic structure into modular components, following the same pattern as the core generators.

## 📁 Structure

```
services/
├── __init__.py
├── service.py                    # Main generator (orchestrates builders)
├── builders/
│   ├── __init__.py
│   ├── dependencies_builder.py  # Builds dependencies.ts
│   ├── index_builder.py          # Builds index.ts
│   └── main_builder.py           # Builds main.ts
└── routes/
    ├── __init__.py
    ├── routes_builder.py         # Builds route files
    └── route_handler_builder.py  # Builds individual route handlers
```

## 🎯 Components

### ServiceGenerator (`service.py`)
- **Purpose**: Main orchestrator
- **Responsibilities**:
  - Validates context
  - Sets up directories
  - Coordinates builders
  - Generates files

### DependenciesBuilder (`builders/dependencies_builder.py`)
- **Purpose**: Generates dependency injection container
- **Output**: `src/dependencies/dependencies.ts`
- **Features**:
  - Repository interface imports
  - Dependencies interface
  - Factory function

### IndexBuilder (`builders/index_builder.py`)
- **Purpose**: Generates Fastify server setup
- **Output**: `src/index.ts`
- **Features**:
  - Server creation
  - Route registration
  - Health check endpoint
  - Service configuration

### MainBuilder (`builders/main_builder.py`)
- **Purpose**: Generates service entry point
- **Output**: `src/main.ts` (only if doesn't exist)
- **Features**:
  - Prisma client setup
  - DAO repository wiring
  - Graceful shutdown
  - Environment configuration

### RoutesBuilder (`routes/routes_builder.py`)
- **Purpose**: Generates route files
- **Output**: `src/routes/{resource}.routes.ts` and `src/routes/index.ts`
- **Features**:
  - Resource-based route grouping
  - Handler imports
  - Route registration

### RouteHandlerBuilder (`routes/route_handler_builder.py`)
- **Purpose**: Builds individual route handlers
- **Output**: Fastify route handler code
- **Features**:
  - HTTP method mapping
  - Handler function calls
  - Parameter extraction (basic)

## 📊 Refactoring Summary

**Before:**
- Single monolithic file: `service.py` (253 lines)
- All logic in one class
- Hard to test individual components
- Difficult to maintain

**After:**
- Modular structure with focused builders
- `service.py`: 80 lines (orchestration only)
- `builders/`: 3 focused builder classes
- `routes/`: 2 focused route builder classes
- **Total**: ~300 lines (similar size, better organization)

## 🔄 Usage

The generator is used the same way:

```python
from quub_codegen.generators.services import ServiceGenerator

generator = ServiceGenerator()
result = generator.generate(context)
```

## 🚀 Benefits

1. **Modularity** - Each builder has a single responsibility
2. **Testability** - Can test builders independently
3. **Maintainability** - Easier to find and fix issues
4. **Extensibility** - Easy to add new builders or modify existing ones
5. **Consistency** - Follows same pattern as core generators

## 📝 Next Steps

Future enhancements can be added as new builders:
- **ValidatorsBuilder** - Generate request/response validators
- **MiddlewareBuilder** - Generate middleware setup
- **ConfigBuilder** - Generate service configuration files
