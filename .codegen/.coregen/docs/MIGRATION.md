# Migration Guide: TypeScript → Python

This document describes the migration from separate TypeScript generators to the unified Python-based `cuur-coregen`.

## Overview

**Before:**
- Separate TypeScript-based generators
- Multiple codebases to maintain

**After:**
- Unified Python-based generator (`cuur-coregen`)

**After:**
- `quub-codegen` - Unified Python-based generator

## Key Changes

### 1. Single Codebase

All three generators are now in one Python codebase, making it easier to:
- Share code and utilities
- Maintain consistency
- Add new generators
- Fix bugs across all generators

### 2. Configuration

**Before:** Separate configs for each generator

**After:** Single unified configuration file `.cuur-coregen.json`

```json
{
  "domains": [...],
  "paths": {...},
  "generators": {
    "handler": {...},
    "repository": {...},
    "service": {...},
    "tests": {...}
  }
}
```

### 3. CLI Commands

**Before:**
```bash
# Multiple separate generators
coregen generate --domain exchange
```

**After:**
```bash
cuur-coregen generate --domain exchange --layer core
# Or for SDK:
cuur-coregen generate --domain exchange --layer sdk
```

### 4. Installation

**After:**
```bash
cd .codegen
pip install -e .
```

## Migration Steps

### Step 1: Install Python Generator

```bash
cd .codegen
pip install -e .
```

### Step 2: Create Configuration

The configuration file `.cuur-coregen.json` should already exist in your project.

### Step 3: Update Configuration

Edit `.cuur-coregen.json` to match your project structure:

```json
{
  "domains": [
    {"name": "exchange", "enabled": true},
    {"name": "auth", "enabled": true}
  ],
    "paths": {
      "project_root": ".",
      "openapi_dir": "./openapi/src",
      "bundled_dir": "./openapi/src/.bundled"
    }
}
```

### Step 4: Generate Code

```bash
# Generate all domains (core layer)
cuur-coregen generate --all --layer core --bundle

# Or specific domain
cuur-coregen generate --domain exchange --layer core --bundle

# For SDK layer
cuur-coregen generate --domain exchange --layer sdk --bundle
```

### Step 5: Update Scripts

Update your `package.json` scripts:

```json
{
  "scripts": {
    "codegen": "cuur-coregen generate --all --layer core --bundle",
    "codegen:sdk": "cuur-coregen generate --all --layer sdk --bundle",
    "codegen:clean": "cuur-coregen generate --all --layer core --clean --bundle"
  }
}
```

## Feature Parity

All features from the TypeScript generators are available:

✅ Handler generation (core layer)
✅ Repository generation (core layer)
✅ Types generation (core layer)
✅ DTO/Entity generation (core layer)
✅ Schema generation (core layer)
✅ SDK client generation (SDK layer)
✅ OpenAPI types extraction (SDK layer)
✅ Zod schema extraction (SDK layer)

## Benefits

1. **Better Text Processing** - Python excels at text manipulation
2. **Unified Configuration** - Single config file for all generators
3. **Rich CLI** - Beautiful terminal output with progress tracking
4. **Type Safety** - Pydantic for configuration validation
5. **Easier Maintenance** - Single codebase to maintain
6. **Better Error Messages** - Rich error reporting

## Backward Compatibility

The generated code is **100% compatible** with the TypeScript generators. The output format is identical, so no changes are needed to your existing codebase.

## Troubleshooting

### Issue: Configuration not found

**Solution:** Ensure `.cuur-coregen.json` exists in your project root or `.codegen` directory.

### Issue: Python not found

**Solution:** Install Python 3.11+ and ensure it's in your PATH.

### Issue: Dependencies missing

**Solution:** Run `pip install -r requirements.txt` in the `quub-codegen` directory.

### Issue: Generated code differs

**Solution:** This is expected - the Python generator may have minor improvements. Review the generated code and adjust templates if needed.

## Support

For issues or questions:
1. Check the README.md
2. Review ARCHITECTURE.md
3. Open an issue on GitHub
