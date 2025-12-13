# Layer-Based Configuration

The generator now supports **layer-specific configurations** that allow you to configure each layer (core, adapters, services, tests) independently.

## Configuration Structure

```json
{
  "layers": {
    "core": { ... },
    "adapters": { ... },
    "services": { ... },
    "tests": { ... }
  }
}
```

## Core Layer Configuration

Controls handlers, types, validators, and converters:

```json
{
  "core": {
    "handlers": {
      "enabled": true,
      "include_js_docs": true,
      "include_validation": true
    },
    "types": {
      "enabled": true,
      "re_export_generated_types": true
    },
    "validators": {
      "enabled": true,
      "base_url": "https://kontent.com"
    },
    "converters": {
      "enabled": true
    },
    "include_repositories": true,
    "include_validation": true,
    "include_converters": true
  }
}
```

### Options:
- **handlers**: Handler generator options
- **types**: Types generator options
- **validators**: Validator generator options (includes `base_url`)
- **converters**: Converter generator options
- **include_repositories**: Include repository imports in handlers
- **include_validation**: Include validation code
- **include_converters**: Include converter usage

## Adapters Layer Configuration

Controls repository generation:

```json
{
  "adapters": {
    "repositories": {
      "enabled": true,
      "include_js_docs": true
    },
    "include_crud_methods": true,
    "include_custom_methods": true,
    "interface_prefix": "",
    "interface_suffix": "Repository"
  }
}
```

### Options:
- **repositories**: Repository generator options
- **include_crud_methods**: Generate CRUD methods
- **include_custom_methods**: Generate custom query methods
- **interface_prefix**: Prefix for repository interfaces
- **interface_suffix**: Suffix for repository interfaces (default: "Repository")

## Services Layer Configuration

Controls service, route, and dependency generation:

```json
{
  "services": {
    "services": {
      "enabled": true
    },
    "routes": {
      "enabled": true
    },
    "dependencies": {
      "enabled": true
    },
    "framework": "fastify",
    "generate_main": true,
    "generate_index": true,
    "generate_dependencies": true,
    "generate_routes": true,
    "route_prefix": "",
    "include_middleware": false,
    "include_error_handlers": true,
    "di_framework": "manual"
  }
}
```

### Options:
- **services**: Service generator options
- **routes**: Route generator options
- **dependencies**: Dependency injection generator options
- **framework**: Web framework ("fastify", "express", etc.)
- **generate_main**: Generate main.ts entry point
- **generate_index**: Generate index.ts server setup
- **generate_dependencies**: Generate dependencies.ts
- **generate_routes**: Generate route files
- **route_prefix**: Prefix for all routes
- **include_middleware**: Include middleware setup
- **include_error_handlers**: Include error handlers
- **di_framework**: DI framework ("manual", "tsyringe", etc.)

## Tests Layer Configuration

Controls test infrastructure generation:

```json
{
  "tests": {
    "tests": {
      "enabled": true
    },
    "mocks": {
      "enabled": true
    },
    "setup": {
      "enabled": true
    },
    "test_framework": "vitest",
    "generate_mocks": true,
    "generate_setup": true,
    "generate_handler_tests": true,
    "generate_integration_tests": false,
    "mock_prefix": "mock",
    "use_vi_mock": true
  }
}
```

### Options:
- **tests**: Test generator options
- **mocks**: Mock generator options
- **setup**: Setup file generator options
- **test_framework**: Test framework ("vitest", "jest", etc.)
- **generate_mocks**: Generate mock repositories
- **generate_setup**: Generate setup files
- **generate_handler_tests**: Generate handler test files
- **generate_integration_tests**: Generate integration tests
- **mock_prefix**: Prefix for mock repositories (default: "mock")
- **use_vi_mock**: Use vitest vi.fn() for mocks

## Usage Examples

### Disable a specific layer:

```json
{
  "layers": {
    "tests": {
      "tests": {
        "enabled": false
      }
    }
  }
}
```

### Change validator base URL:

```json
{
  "layers": {
    "core": {
      "validators": {
        "base_url": "https://api.example.com"
      }
    }
  }
}
```

### Use Express instead of Fastify:

```json
{
  "layers": {
    "services": {
      "framework": "express"
    }
  }
}
```

### Customize repository interface naming:

```json
{
  "layers": {
    "adapters": {
      "interface_prefix": "I",
      "interface_suffix": "Repo"
    }
  }
}
```

## Backward Compatibility

The legacy `generators` configuration is still supported for backward compatibility. However, **layer-based configuration takes precedence** when both are present.

## Migration

To migrate from legacy `generators` config to `layers` config:

1. Copy generator settings to appropriate layer
2. Remove legacy `generators` section (optional)
3. Add layer-specific options as needed

Example:
```json
// Before (legacy)
{
  "generators": {
    "handler": { "enabled": true }
  }
}

// After (layers)
{
  "layers": {
    "core": {
      "handlers": { "enabled": true }
    }
  }
}
```
