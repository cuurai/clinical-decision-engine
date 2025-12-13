# Layer-Based Configuration

The generator supports **layer-specific configurations** for core and SDK layers.

## Configuration Structure

```json
{
  "layers": {
    "core": { ... },
    "base": { ... },
    "sdk": { ... }
  }
}
```

**Note**: Only `core`, `base`, and `sdk` layers are supported. The `base` layer is an alias for `core` layer configuration.

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

## SDK Layer Configuration

Controls SDK client generation:

```json
{
  "sdk": {
    "enabled": false,
    "generate_types": true,
    "generate_schemas": true,
    "generate_clients": true,
    "base_url": "https://api.cuur.ai/v2"
  }
}
```

### Options:

- **enabled**: Enable SDK layer generation
- **generate_types**: Generate TypeScript types from OpenAPI
- **generate_schemas**: Generate Zod schemas from OpenAPI
- **generate_clients**: Generate domain client classes
- **base_url**: Base URL for API clients

## Usage Examples

### Disable a specific layer:

```json
{
  "layers": {
    "core": {
      "handlers": {
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

### Enable SDK layer:

```json
{
  "layers": {
    "sdk": {
      "enabled": true,
      "generate_clients": true,
      "base_url": "https://api.cuur.ai/v2"
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
