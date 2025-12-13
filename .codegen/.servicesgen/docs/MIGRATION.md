# Migration Guide: TypeScript → Python

This document describes the migration from the three separate TypeScript generators (`.gencore`, `.servicesgen`, `.testsgen`) to the unified Python-based `cuur-codegen`.

## Overview

**Before:**
- `.gencore` - Core generators (TypeScript)
- `.servicesgen` - Service generators (TypeScript)
- `.testsgen` - Test generators (TypeScript)

**After:**
- `cuur-codegen` - Unified Python-based generator

## Key Changes

### 1. Single Codebase

All three generators are now in one Python codebase, making it easier to:
- Share code and utilities
- Maintain consistency
- Add new generators
- Fix bugs across all generators

### 2. Configuration

**Before:** Separate configs for each generator

**After:** Single unified configuration file `.cuur-codegen.json`

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
coregen generate --domain exchange
servicesgen generate --domain exchange
testsgen generate --domain exchange
```

**After:**
```bash
cuur-codegen generate --domain exchange
# All generators run automatically
```

### 4. Installation

**Before:**
```bash
cd .gencore && pnpm install
cd .servicesgen && pnpm install
cd .testsgen && pnpm install
```

**After:**
```bash
pip install -e cuur-codegen
```

## Migration Steps

### Step 1: Install Python Generator

```bash
cd cuur-codegen
pip install -e .
```

### Step 2: Create Configuration

```bash
cuur-codegen init
```

This creates `.cuur-codegen.json` based on your existing structure.

### Step 3: Update Configuration

Edit `.cuur-codegen.json` to match your project structure:

```json
{
  "domains": [
    {"name": "exchange", "enabled": true},
    {"name": "auth", "enabled": true}
  ],
  "paths": {
    "project_root": ".",
    "openapi_dir": "./openapi",
    "bundled_dir": "./openapi/.bundled",
    "core_output_dir": "./packages/core/src",
    "adapters_output_dir": "./packages/adapters/src",
    "services_output_dir": "./services",
    "tests_output_dir": "./tests"
  }
}
```

### Step 4: Generate Code

```bash
# Generate all domains
cuur-codegen generate --all

# Or specific domain
cuur-codegen generate --domain exchange
```

### Step 5: Update Scripts

Update your `package.json` scripts:

```json
{
  "scripts": {
    "codegen": "cuur-codegen generate --all",
    "codegen:clean": "cuur-codegen generate --all --clean"
  }
}
```

## Feature Parity

All features from the TypeScript generators are available:

✅ Handler generation
✅ Repository generation
✅ Types generation
✅ Validator generation
✅ Converter generation
✅ Service generation
✅ Test generation

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

**Solution:** Run `cuur-codegen init` to create default configuration.

### Issue: Python not found

**Solution:** Install Python 3.11+ and ensure it's in your PATH.

### Issue: Dependencies missing

**Solution:** Run `pip install -r requirements.txt` in the `cuur-codegen` directory.

### Issue: Generated code differs

**Solution:** This is expected - the Python generator may have minor improvements. Review the generated code and adjust templates if needed.

## Support

For issues or questions:
1. Check the README.md
2. Review ARCHITECTURE.md
3. Open an issue on GitHub
