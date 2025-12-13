# ServicesGen CLI Usage Guide for AI Agents

⚠️ **IMPORTANT**: Always use the proper CLI command `cuur-codegen`. Do NOT use primitive methods like `PYTHONPATH` or `python -m`.

## Quick Start

### 1. Installation

```bash
cd servicesgen
pip install -e .
```

This installs the `cuur-codegen` CLI command globally. Verify installation:

```bash
cuur-codegen --version
# Should output: cuur-codegen, version 1.0.0
```

### 2. Proper CLI Usage

✅ **CORRECT** - Use the CLI command:

```bash
# From project root
cuur-codegen generate --all --no-build --config platform/.cuur-codegen.json

# From platform directory (auto-discovers config)
cd platform
cuur-codegen generate --domain auth --layer services --layer adapters --layer tests --no-build

# Generate specific domain
cuur-codegen generate --domain blockchain --layer all --no-build

# Generate all domains
cuur-codegen generate --all --layer all --no-build
```

❌ **WRONG** - Do NOT use these primitive methods:

```bash
# DON'T use PYTHONPATH workarounds
PYTHONPATH=servicesgen/src python3 -m cuur_codegen.cli.main generate --all

# DON'T run Python modules directly
python3 -m cuur_codegen.cli.main generate --all

# DON'T use relative imports
cd servicesgen && python3 -m cuur_codegen.cli.main generate --all
```

## Why Use the CLI?

The `cuur-codegen` CLI provides:

1. **Automatic path resolution** - Works from any directory, automatically finds project root
2. **Config file discovery** - Searches multiple locations for `.cuur-codegen.json`
3. **Proper entry point** - Uses Python's standard entry point system
4. **Consistent behavior** - Same behavior regardless of where it's executed
5. **Error handling** - Better error messages and validation
6. **Future-proof** - Will work with future updates and improvements

## Key Features

### Config File Discovery

The CLI automatically searches for config files in this order:

1. Default path (`.cuur-codegen.json` from `--config` option)
2. Current directory (`.cuur-codegen.json`)
3. `platform/.cuur-codegen.json` (from current directory)
4. Walks up directories to find `platform/.cuur-codegen.json` (up to 5 levels)

**Example**:
```bash
# From project root - finds platform/.cuur-codegen.json automatically
cuur-codegen generate --domain auth --layer services

# From platform directory - finds .cuur-codegen.json automatically
cd platform
cuur-codegen generate --domain auth --layer services

# Explicit config path
cuur-codegen generate --config platform/.cuur-codegen.json --domain auth
```

### Project Root Detection

The codegen uses `project_root` from config file. All paths in config are resolved relative to the config file's location.

**Important**: If `project_root` is `"."` in `platform/.cuur-codegen.json`, it means the project root is `platform/` itself.

## Common Commands

### Generate Code

```bash
# Generate all domains, all layers
cuur-codegen generate --all --layer all --no-build

# Generate specific domain(s)
cuur-codegen generate --domain auth --domain blockchain --layer services --no-build

# Generate specific layer(s)
cuur-codegen generate --domain auth --layer services --layer adapters --no-build

# Generate with build validation (default)
cuur-codegen generate --domain auth --layer services

# Clean and regenerate
cuur-codegen generate --domain auth --layer all --clean --no-build

# Verbose output
cuur-codegen generate --domain auth --layer all --verbose --no-build
```

### Initialize Configuration

```bash
# Create default config in current directory
cuur-codegen init

# Create config at custom location
cuur-codegen init --output platform/.cuur-codegen.json
```

### Pipeline

```bash
# Run complete pipeline (alias for generate)
cuur-codegen pipeline --all --layer all --no-build

# With options
cuur-codegen pipeline --all --clean --no-build --verbose
```

## Layer Options

ServicesGen supports these layers:

- `services` - Generate service routes, dependencies, server setup
- `adapters` - Generate DAO repository implementations
- `prisma` - Generate Prisma schema files
- `tests` - Generate test suites, mocks, test factories
- `orchestrators` - Generate orchestrator domains (service clients, aggregators, REST routes, GraphQL, WebSocket)
- `all` - Generate all layers

**Example**:
```bash
# Generate only services
cuur-codegen generate --domain auth --layer services --no-build

# Generate services and adapters
cuur-codegen generate --domain auth --layer services --layer adapters --no-build

# Generate orchestrator domains
cuur-codegen generate --all --layer orchestrators --no-build

# Generate all layers
cuur-codegen generate --domain auth --layer all --no-build
```

## Output Structure

All generated files go into `platform/` directory:

```
platform/
├── services/src/              # Raw domain services
│   ├── auth/src/
│   │   ├── routes/
│   │   ├── dependencies/
│   │   ├── index.ts
│   │   ├── main.ts
│   │   └── package.json
│   └── blockchain/src/
│       └── ...
├── adapters/src/              # DAO repository implementations
│   ├── auth/
│   │   ├── dao-*-repository.ts
│   │   └── index.ts
│   └── blockchain/
│       └── ...
├── tests/src/                 # Test suites
│   ├── {raw-domain}/         # Raw domain tests
│   │   ├── handlers/         # Handler test files
│   │   ├── mocks/            # Mock repositories
│   │   ├── __setup__/        # Test setup files
│   │   ├── index.ts          # Test index
│   │   ├── package.json      # Test package config
│   │   └── tsconfig.json     # TypeScript config
│   └── {orchestrator-domain}/ # Orchestrator domain tests
│       ├── flows/            # Flow test files (*.flow.test.ts)
│       ├── mocks/            # Mock dependencies (from deps.ts)
│       └── tsconfig.json     # TypeScript config with @quub paths
│   ├── auth/
│   │   ├── handlers/
│   │   ├── mocks/
│   │   ├── __setup__/
│   │   ├── index.ts
│   │   └── package.json
│   └── blockchain/
│       └── ...
└── orchestrators/
    ├── domains/src/           # Orchestrator domains
    │   └── {domain}/
    │       ├── flows/         # Business workflow files (*.flow.ts)
    │       ├── routes.ts      # API Gateway route → flow mapping
    │       ├── handler.ts     # Lambda entrypoint
    │       ├── deps.ts        # Dependency injection (DAO repositories)
    │       ├── context.ts     # JWT context extraction
    │       ├── logger.ts      # Structured logging
    │       ├── errors/        # Error handling
    │       ├── config/        # Configuration
    │       ├── package.json   # Package configuration
    │       └── tsconfig.json  # TypeScript configuration
    └── openapi/src/yaml/      # Orchestrator OpenAPI YAML specs (input)
```

## Troubleshooting

### CLI Not Found

If `cuur-codegen` command is not found:

1. **Verify installation**:
   ```bash
   pip show cuur-codegen
   ```

2. **Reinstall**:
   ```bash
   cd servicesgen
   pip install -e . --force-reinstall
   ```

3. **Check PATH**:
   ```bash
   which cuur-codegen
   ```

### Config File Not Found

If you see "Configuration file not found":

1. **Check config file exists** in one of:
   - Current directory: `.cuur-codegen.json`
   - `platform/.cuur-codegen.json`
   - Parent directories: `platform/.cuur-codegen.json`

2. **Specify explicitly**:
   ```bash
   cuur-codegen generate --config platform/.cuur-codegen.json --domain auth
   ```

3. **Initialize config**:
   ```bash
   cuur-codegen init --output platform/.cuur-codegen.json
   ```

### Files Not Generated in Platform Folder

If files are generated in wrong location:

1. **Check `project_root` in config**:
   - Should be `"."` if config is in `platform/.cuur-codegen.json`
   - Should be absolute path or relative to config file location

2. **Verify `folder_structure` config**:
   - Check `base_path` values match expected structure
   - Services: `base_path: "services/src"`
   - Adapters: `base_path: "adapters/src"`
   - Tests: `base_path: "tests/src"`

3. **Check path resolution**:
   ```bash
   # Run with verbose to see paths
   cuur-codegen generate --domain auth --layer services --verbose --no-build
   ```

### Core Package Not Found

If you see "No repositories found" or "No handlers found":

1. **Verify core package exists**:
   ```bash
   ls -la packages/core/src/auth/repositories/
   ls -la packages/core/src/auth/handlers/
   ```

2. **Check path resolution**:
   - Core package should be at `packages/core/src/` relative to project root
   - If `project_root` is `platform/`, core should be at `../packages/core/src/`

3. **Generate core package first**:
   ```bash
   # Generate core package using .codegen
   cd .codegen
   quub-coregen generate --all --no-build
   ```

### Domain Not Found

If you see "Domain 'X' not found":

1. **Check OpenAPI spec exists**:
   ```bash
   ls -la openapi/src/.bundled/*.json
   ```

2. **Verify domain name**:
   - Domain name must match OpenAPI spec filename (without `.json`)
   - Example: `auth.json` → domain name is `auth`

3. **List available domains**:
   ```bash
   ls openapi/src/.bundled/*.json | xargs -n1 basename | sed 's/.json$//'
   ```

## Best Practices for AI Agents

1. **Always use `cuur-codegen` command** - Never use `PYTHONPATH` or `python -m` workarounds
2. **Run from any directory** - The CLI handles path resolution automatically
3. **Use `--no-build` flag** - Skip build validation during generation (faster)
4. **Use `--verbose` for debugging** - Shows detailed output including paths
5. **Specify layers explicitly** - Use `--layer services --layer adapters` instead of `--layer all` when you only need specific layers
6. **Clean before regenerating** - Use `--clean` flag to ensure fresh generation
7. **Check config file location** - Ensure config file is in expected location or specify with `--config`

## Common Workflows

### Workflow 1: Generate All Services

```bash
cd platform
cuur-codegen generate --all --layer services --no-build
```

### Workflow 2: Generate Specific Domain

```bash
cd platform
cuur-codegen generate --domain auth --layer all --no-build
```

### Workflow 3: Regenerate After Core Changes

```bash
# 1. Regenerate core package
cd .codegen
quub-coregen generate --domain auth --no-build

# 2. Regenerate services/adapters/tests
cd ../../platform
cuur-codegen generate --domain auth --layer all --clean --no-build
```

### Workflow 4: Generate Orchestrator Domains

```bash
# Generate all orchestrator domains
cuur-codegen generate --all --layer orchestrators --no-build

# Generate specific orchestrator domain
cuur-codegen generate --domain trading-markets --layer orchestrators --no-build

# Verify output
ls -la platform/orchestrators/domains/src/trading-markets/flows/
ls -la platform/orchestrators/domains/src/trading-markets/routes.ts
ls -la platform/orchestrators/domains/src/trading-markets/deps.ts
```

### Workflow 5: Test Generation

#### Generate Tests for Core Domains

```bash
# Generate tests for all core domains (entity factories)
cuur-codegen generate --all --layer tests --no-build --clean

# Generate tests for specific core domain
cuur-codegen generate --domain identity --layer tests --no-build --clean

# Verify output
ls -la platform/tests/src/core/identity/factories/entities/
ls -la platform/tests/src/core/identity/factories/shared/
```

#### Generate Tests for Orchestrator Domains

```bash
# Generate tests for all orchestrator domains
cuur-codegen generate --all --layer tests --no-build --clean

# Generate tests for specific orchestrator domain
cuur-codegen generate --domain trading-markets --layer tests --no-build --clean

# Verify output
ls -la tests/src/trading-markets/flows/
ls -la tests/src/trading-markets/mocks/
ls -la tests/src/trading-markets/tsconfig.json
```

#### Test Generator Features

- **Automatic Domain Detection**: Test generator automatically detects if a domain is an orchestrator or core domain
- **Core Domain Factories**: For core domains, generates entity factories using schema introspection
- **Flow Tests**: For orchestrator domains, generates flow tests that test orchestrator flow orchestration
- **Handler Response Factories**: For orchestrator domains, generates handler response factories that import from core domain factories
- **Flow Factories**: For orchestrator domains, generates flow factories that compose handler response factories
- **Mock Dependencies**: For orchestrator domains, reads `deps.ts` to generate accurate mock dependencies
- **Path Mappings**: Generates `tsconfig.json` with proper `@quub` path aliases for both types
- **Import Strategy**: Handler response factories import from core domain factories via `@cuur/factories` path alias

## Command Reference

### Global Options

- `--version` - Show version and exit
- `--help` - Show help message and exit

### Generate Command

```bash
cuur-codegen generate [OPTIONS]
```

**Options**:
- `-c, --config PATH` - Configuration file path (default: `.cuur-codegen.json`)
- `-d, --domain TEXT` - Domain(s) to process (can be specified multiple times)
- `--all` - Process all domains
- `-l, --layer [adapters|prisma|services|tests|orchestrators|all]` - Layer(s) to generate (can be specified multiple times)
- `--clean` - Clean output directories before generation
- `--no-build` - Skip build validation
- `-v, --verbose` - Verbose output
- `--log-level [DEBUG|INFO|WARNING|ERROR]` - Set log level

### Init Command

```bash
cuur-codegen init [OPTIONS]
```

**Options**:
- `-o, --output PATH` - Output configuration file path

### Pipeline Command

```bash
cuur-codegen pipeline [OPTIONS]
```

**Options**: Same as `generate` command (alias for generate)

## Examples

### Example 1: Generate Services for Auth Domain

```bash
cuur-codegen generate --domain auth --layer services --no-build
```

**Output**: Generates `platform/services/src/auth/src/` with routes, dependencies, index.ts, main.ts, package.json

### Example 2: Generate All Layers for All Domains

```bash
cuur-codegen generate --all --layer all --no-build
```

**Output**: Generates services, adapters, and tests for all domains in `platform/`

**Note**: The `tests` layer automatically detects domain type:
- **Core domains**: Generates entity factories in `platform/tests/src/core/{domain}/`
- **Orchestrator domains**: Generates flow tests and factories in `platform/tests/src/orchestrators/{domain}/`

### Example 3: Clean Regeneration

```bash
cuur-codegen generate --domain auth --layer all --clean --no-build
```

**Output**: Cleans existing files and regenerates fresh code

### Example 4: Verbose Debugging

```bash
cuur-codegen generate --domain auth --layer services --verbose --no-build
```

**Output**: Shows detailed logging including paths, file generation, and warnings

## Orchestrator-Specific Usage

### Generating Orchestrator Domains

Orchestrator domains are generated from YAML OpenAPI specifications located in `platform/orchestrators/openapi/src/yaml/`.

```bash
# Generate all orchestrator domains
cuur-codegen generate --all --layer orchestrators --no-build

# Generate specific orchestrator domain
cuur-codegen generate --domain trading-markets --layer orchestrators --no-build

# Regenerate after YAML changes
cuur-codegen generate --domain trading-markets --layer orchestrators --clean --no-build
```

### Orchestrator Domain Structure

Each orchestrator domain contains:
- **`flows/*.flow.ts`** - Business workflow files that orchestrate core handler calls
- **`routes.ts`** - Maps API Gateway events to flow handlers
- **`handler.ts`** - Lambda entrypoint with JWT context extraction
- **`deps.ts`** - Auto-discovered DAO repositories
- **`context.ts`** - JWT context extraction utilities
- **`logger.ts`** - Structured logging setup
- **`errors/flow-error.ts`** - Custom error handling
- **`config/index.ts`** - Configuration loaders

### Key Features

1. **Direct Handler Calls** - Orchestrators import and call core handlers directly from `@cuur/core`
2. **JWT Security** - `orgId` and `accountId` extracted from JWT context, never from URL
3. **Request Validation** - Uses core Zod schemas for request body validation
4. **DAO Integration** - Auto-discovered DAO repositories from handler usage
5. **TypeScript Path Mappings** - Properly configured `@cuur/core` and `@cuur/adapters` imports

### Updating Handler Names in YAML

Use the script to update handler names based on actual core handler exports:

```bash
cd .servicesgen
python scripts/update_yaml_handlers.py
```

This updates `x-handler` and `handler` fields in all orchestrator YAML files to match actual core handler names.

## Related Documentation

- [AI Agent Maintenance Guide](./AI_AGENT_MAINTENANCE.md) - Comprehensive architecture and maintenance guide
- [Architecture Documentation](./ARCHITECTURE.md) - Detailed architecture documentation
- [Layers Configuration](./LAYERS_CONFIG.md) - Layer configuration details

---

**Last Updated**: 2024-12-30
**Version**: 1.1.0
