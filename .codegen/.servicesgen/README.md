# ServicesGen

**Services, Adapters, and Tests code generator for TypeScript**

A Python-based code generation framework focused on generating:

- **Services** - Fastify routes, dependencies, server setup
- **Adapters** - DAO repository implementations
- **Tests** - Test suites, mocks, test factories
- **Orchestrators** - Business-scenario-driven API aggregation layer (flows, routes, handlers, deps, GraphQL, WebSocket)

**Note**: ServicesGen is **TOTALLY INDEPENDENT** from `.codegen` but follows the **EXACT SAME DESIGN PRINCIPLES**. Core generators (handlers, repositories, types, validators, converters) belong to `.codegen` and are NOT part of `servicesgen`.

## Features

✅ **Focused Architecture** - Services, adapters, tests, and orchestrators generation
✅ **Python-Powered** - Built with Python for superior text processing
✅ **Type-Safe Configuration** - Pydantic-based configuration with validation
✅ **Rich CLI** - Beautiful terminal output with progress tracking
✅ **Multi-Domain Support** - Process multiple domains in parallel
✅ **OpenAPI 3.x Support** - Full support for OpenAPI 3.0+ specifications (expects pre-bundled specs)
✅ **Deterministic Output** - Reproducible code generation
✅ **Extensible** - Plugin-based architecture for custom generators
✅ **Independent** - Totally independent from `.codegen` but follows same design principles

## Installation

```bash
# Install from source
pip install -e .

# Or install dependencies
pip install -r requirements.txt
```

## Quick Start

### 1. Initialize Configuration

```bash
cuur-codegen init
```

This creates a `.cuur-codegen.json` configuration file.

### 2. Generate Code

```bash
# Generate all domains
cuur-codegen generate --all

# Generate specific domain
cuur-codegen generate --domain exchange

# Generate multiple domains
cuur-codegen generate --domain exchange --domain auth

# Generate orchestrators layer
cuur-codegen generate --all --layer orchestrators

# Clean and regenerate
cuur-codegen generate --all --clean
```

### 3. Run Pipeline

```bash
# Run complete pipeline
cuur-codegen pipeline --all

# With options
cuur-codegen pipeline --all --clean --no-build
```

## Configuration

Configuration file: `.cuur-codegen.json` (default location: `.cuur-codegen.json` or `platform/.cuur-codegen.json`)

```json
{
  "domains": [
    {
      "name": "auth",
      "enabled": true,
      "spec_path": "src/auth.yaml",
      "bundled_path": "auth.json"
    }
  ],
  "paths": {
    "project_root": ".",
    "openapi_dir": "../openapi/src",
    "bundled_dir": "../openapi/src/.bundled"
  },
  "folder_structure": {
    "services": {
      "base_path": "services/src",
      "service": {
        "output_dir": "{domain}",
        "main_file": "index.ts"
      }
    },
    "adapters": {
      "base_path": "adapters/src",
      "repositories": {
        "output_dir": "{domain}",
        "main_file": "index.ts"
      }
    },
    "tests": {
      "base_path": "tests/src",
      "test": {
        "output_dir": "{domain}",
        "main_file": "index.ts"
      }
    }
  },
  "layers": {
    "services": {
      "services": { "enabled": true },
      "routes": { "enabled": true },
      "dependencies": { "enabled": true },
      "framework": "fastify"
    },
    "adapters": {
      "repositories": { "enabled": true }
    },
    "tests": {
      "tests": { "enabled": true },
      "mocks": { "enabled": true },
      "setup": { "enabled": true },
      "test_framework": "vitest"
    }
  },
  "pipeline": {
    "clean": false,
    "skip_build": true
  }
}
```

**Key Points**:

- `paths` only contains **INPUT paths** (openapi_dir, bundled_dir)
- `folder_structure` is the **single source of truth** for all output paths
- All imports use `@cuur/core` package (resolves to `packages/core/dist/index.js`)

## Architecture

```
servicesgen/
├── src/quub_codegen/
│   ├── base/                    # Base infrastructure (matches .codegen design)
│   │   ├── generator_bases.py   # FileGenerator, SingleFileGenerator, PostProcessingGenerator
│   │   ├── generator_registry.py # GeneratorRegistry for plugin architecture
│   │   ├── context_factory.py   # ContextFactory for context creation
│   │   └── builder.py          # Builder protocol and BaseBuilder
│   ├── core/                    # Core framework (shared with .codegen concepts)
│   │   ├── config.py           # Config, PathConfig, DomainConfig
│   │   ├── context.py          # GenerationContext
│   │   ├── generator.py        # BaseGenerator, GenerateResult
│   │   ├── logger.py           # Logger, create_logger
│   │   ├── errors.py           # GenerationError
│   │   └── layer_folder_structure.py # FolderStructureConfig (single source of truth)
│   ├── generators/              # Code generators (servicesgen-specific)
│   │   ├── services/           # ServiceGenerator
│   │   ├── adapters/           # AdapterGenerator, AdaptersMainIndexBuilderGenerator
│   │   └── tests/              # TestGenerator
│   ├── pipeline/               # Pipeline orchestration
│   │   ├── pipeline.py         # Pipeline class
│   │   └── stages.py           # DomainProcessingStage, PostProcessingStage
│   ├── utils/                  # Utilities
│   │   ├── generator_setup.py  # GeneratorSetup (uses FolderStructureConfig)
│   │   ├── index_file_generator.py # IndexFileGenerator
│   │   └── ...                 # Other utilities
│   └── cli/                    # CLI interface
│       └── main.py             # Click-based CLI (matches .codegen structure)
├── docs/                       # Documentation
│   ├── AI_AGENT_MAINTENANCE.md # Comprehensive maintenance guide
│   ├── AI_AGENT_USAGE.md       # CLI usage guide
│   └── ...                     # Other documentation
└── README.md
```

## Generator Types

### Services Layer

1. **ServiceGenerator** - Generates Fastify service layer:
   - `src/routes/*.routes.ts` - Route handlers
   - `src/dependencies/dependencies.ts` - Dependency injection container
   - `src/index.ts` - Service exports
   - `src/main.ts` - Service entry point (optional)
   - `package.json` - Package configuration

### Adapters Layer

2. **AdapterGenerator** - Generates DAO repository implementations:

   - `dao-*-repository.ts` - DAO repository classes
   - `index.ts` - Barrel exports

3. **AdaptersMainIndexBuilderGenerator** - Generates main adapters index.ts (post-processing)

### Tests Layer

4. **TestGenerator** - Generates test infrastructure:
   - `mocks/index.ts` - Mock repository implementations
   - `__setup__/*.ts` - Test setup files (vitest.setup.ts, test-db.setup.ts)
   - `handlers/*/*.test.ts` - Handler test files (raw domains)
   - `flows/*.test.ts` - Flow test files (orchestrator domains)
   - `factories/entities.factory.ts` - Single file with all entity factories (flow-based discovery)
   - `factories/handler-responses/*.factory.ts` - Handler response factories
   - `factories/*.factory.ts` - Flow factories
   - `index.ts` - Test barrel exports
   - `package.json` - Test package configuration

**Note**: Core generators (handlers, repositories, types, validators, converters) belong to `.codegen` and are NOT part of `servicesgen`.

## Pipeline Flow

```
1. Load bundled OpenAPI Spec (expects pre-bundled JSON from .codegen)
   ↓
2. Process Domain:
   - Generate Adapters (DAO repositories)
   - Generate Services (routes, dependencies)
   - Generate Tests (mocks, test files)
   ↓
3. Post-Processing:
   - Generate adapters main index.ts
   ↓
4. Complete
```

**Note**: ServicesGen expects **pre-bundled** OpenAPI specs. Bundling should be done separately (by `.codegen` or manually).

## Usage Examples

### Programmatic API

```python
from quub_codegen import Config, Pipeline, PipelineOptions
from pathlib import Path

# Load configuration
config = Config.from_file(Path(".cuur-codegen.json"))

# Create pipeline
pipeline = Pipeline(config)

# Execute
result = pipeline.execute(
    domains=["exchange", "auth"],
    options=PipelineOptions(clean=True, validate=True)
)

if result.success:
    print(f"Generated {result.domains_succeeded} domains")
else:
    print(f"Failed: {result.errors}")
```

### Custom Generator

```python
from quub_codegen.core.generator import BaseGenerator, GenerateResult
from quub_codegen.core.context import GenerationContext

class MyCustomGenerator(BaseGenerator):
    @property
    def name(self) -> str:
        return "My Custom Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "custom"

    def generate(self, context: GenerationContext) -> GenerateResult:
        # Your generation logic here
        return GenerateResult(files=[], warnings=[])
```

## CLI Commands

```bash
# Initialize configuration
cuur-codegen init

# Generate code
cuur-codegen generate --domain exchange

# Run pipeline
cuur-codegen pipeline --all --clean

# Help
cuur-codegen --help
cuur-codegen generate --help
```

## Development

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black src/

# Lint code
ruff check src/

# Type check
mypy src/
```

## Output Structure

All generated files go into `platform/` directory:

```
platform/
├── services/src/
│   ├── auth/src/
│   │   ├── routes/
│   │   ├── dependencies/
│   │   ├── index.ts
│   │   ├── main.ts
│   │   └── package.json
│   └── blockchain/src/
│       └── ...
├── adapters/src/
│   ├── auth/
│   │   ├── dao-*-repository.ts
│   │   └── index.ts
│   └── blockchain/
│       └── ...
├── tests/src/
│   ├── auth/
│   │   ├── handlers/
│   │   ├── mocks/
│   │   ├── __setup__/
│   │   ├── index.ts
│   │   └── package.json
│   └── blockchain/
│       └── ...
└── orchestrators/
    ├── domains/src/          # Orchestrator domain folders
    │   └── {domain}/        # Per-domain folder (e.g., trading-markets/, accounts-funding/)
    │       ├── flows/        # Business workflow files (*.flow.ts)
    │       ├── routes.ts     # API Gateway route → flow mapping
    │       ├── handler.ts    # Lambda entrypoint
    │       ├── deps.ts       # Dependency injection (DAO repositories)
    │       ├── context.ts    # JWT context extraction
    │       ├── logger.ts     # Structured logging
    │       ├── errors/        # Error handling
    │       ├── config/        # Configuration
    │       ├── package.json  # Package configuration
    │       └── tsconfig.json # TypeScript configuration
    └── openapi/src/yaml/     # Orchestrator OpenAPI YAML specs (input)
```

## Imports

All generated code uses `@cuur/core` package imports:

```typescript
// Services
import { createAuthAccount, getAuthAccount } from "@cuur/core";
import type { AuthAccountRepository } from "@cuur/core";

// Adapters
import type { Account, AuthAccountRepository } from "@cuur/core";
import type { PaginatedResult } from "@cuur/core/shared/helpers";

// Tests
import { createAuthAccount } from "@cuur/core";
import type { AuthAccountRepository } from "@cuur/core";
```

The `@cuur/core` package resolves to `packages/core/dist/index.js` (built package).

## Documentation

- **[AI Agent Maintenance Guide](./docs/AI_AGENT_MAINTENANCE.md)** - Comprehensive architecture and maintenance guide
- **[AI Agent Usage Guide](./docs/AI_AGENT_USAGE.md)** - CLI usage, workflows, examples
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - Detailed architecture documentation
- **[Generators Documentation](./GENERATORS.md)** - Generator list and details
- **[Generators Documentation](./GENERATORS.md)** - Complete generator documentation including orchestrators
- **[File Naming Convention](./docs/FILE_NAMING_CONVENTION.md)** - Standard file naming convention (kebab-case)

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.
