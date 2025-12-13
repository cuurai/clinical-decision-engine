# Quub CodeGen

**Enterprise-grade OpenAPI code generator for TypeScript**

A Python-based code generation framework for generating TypeScript code from OpenAPI specifications:

**Core Layer:**
- **Handlers** - Business logic handler functions (`.handler.ts`)
- **Repositories** - Repository interface definitions (`.repository.ts`)
- **Schemas** - DTO and Entity schema files (`.dto.ts`, `.entity.ts`)
- **Types** - TypeScript type exports (`.domain.types.ts`)
- **Schemas File** - Zod validation schemas (`.schemas.ts`)
- **Converters** - Entity converter utilities

**SDK Layer:**
- **Domain Clients** - TypeScript client classes (`.client.ts`)
- **OpenAPI Types** - TypeScript types from OpenAPI (`.openapi.types.ts`)
- **Zod Schemas** - Zod validation schemas (`.zod.schema.ts`)

## Features

✅ **Dual Layer Support** - Core and SDK layer generation
✅ **Dot Notation Naming** - Consistent file naming with dot notation suffixes
✅ **Python-Powered** - Built with Python for superior text processing
✅ **Type-Safe Configuration** - Pydantic-based configuration with validation
✅ **Rich CLI** - Beautiful terminal output with progress tracking
✅ **Multi-Domain Support** - Process multiple domains in parallel
✅ **OpenAPI 3.x Support** - Full support for OpenAPI 3.0+ specifications
✅ **Deterministic Output** - Reproducible code generation
✅ **Extensible** - Plugin-based architecture for custom generators

## Installation

### Option 1: Editable Install (Recommended for Development)

```bash
cd .codegen
pip install -e .
```

This installs the `cuur-coregen` CLI command globally. The `-e` flag makes it editable, so changes to the source code are immediately available.

### Option 2: Virtual Environment (Best Practice)

```bash
cd .codegen
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
```

### Option 3: Direct Python Module (No Installation)

```bash
# From project root
PYTHONPATH=.codegen/src python3 -m quub_codegen.cli.main generate --domain blockchain --layer core --bundle
```

### Verify Installation

```bash
cuur-coregen --version
# Should output: cuur-coregen, version 1.0.0
```

## Quick Start

> **⚠️ For AI Agents:** See [AI Operation Guide](./docs/AI_OPERATION_GUIDE.md) for comprehensive usage instructions.

### 1. Configuration

The config file is located at `.codegen/.cuur-coregen.json` and is automatically found when running from the project root.

### 2. Generate Core Layer

```bash
# Generate all domains (core layer)
cuur-coregen generate --all --layer core --bundle

# Generate specific domain
cuur-coregen generate --domain blockchain --layer core --bundle

# With useful flags
cuur-coregen generate --domain blockchain --layer core --bundle --no-build
```

### 3. Generate SDK Layer

```bash
# Generate all domains (SDK layer)
cuur-coregen generate --all --layer sdk --bundle

# Generate specific domain
cuur-coregen generate --domain blockchain --layer sdk --bundle
```

## Configuration

### Configuration File Location

**Default location:** `.codegen/.cuur-coregen.json`

The configuration file is automatically found when running from the project root. The CLI searches for it in:
1. `.codegen/.cuur-coregen.json` (default)
2. Current directory `.cuur-coregen.json`
3. Parent directories (up to 5 levels)

**Using a custom config file:**
```bash
# Specify custom config location
cuur-coregen generate --config .codegen/.cuur-coregen.json --domain blockchain --layer core
```

### Configuration Structure

**Example configuration:**

```json
{
  "domains": [
    {
      "name": "exchange",
      "enabled": true
    },
    {
      "name": "auth",
      "enabled": true
    }
  ],
  "paths": {
    "project_root": ".",
    "openapi_dir": "openapi/src",
    "bundled_dir": "openapi/src/.bundled"
  },
  "layers": {
    "core": {
      "handlers": { "enabled": true },
      "types": { "enabled": true },
      "schemas_file": { "enabled": true },
      "converters": { "enabled": true },
      "schemas": { "enabled": true }
    },
    "sdk": {
      "enabled": true,
      "generate_types": true,
      "generate_schemas": true,
      "generate_clients": true,
      "base_url": "https://api.cuur.ai/v2"
    }
  },
  "pipeline": {
    "clean": false,
    "validate": true,
    "skip_build": false
  },
  "log_level": "info",
  "verbose": false
}
```

## Architecture

```
.cuur-coregen/
├── src/quub_codegen/
│   ├── core/              # Core framework
│   │   ├── config.py       # Configuration management
│   │   ├── context.py      # Generation context
│   │   ├── logger.py       # Structured logging
│   │   ├── errors.py       # Custom exceptions
│   │   └── generator.py   # Base generator class
│   ├── generators/         # Code generators
│   │   └── core/           # Core generators only
│   │       ├── handler.py
│   │       ├── repository.py
│   │       ├── schema.py
│   │       ├── types.py
│   │       ├── validator.py
│   │       ├── converter.py
│   │       ├── index_builder.py
│   │       └── main_index_builder.py
│   ├── pipeline/           # Pipeline orchestration
│   │   └── pipeline.py
│   ├── utils/              # Utilities
│   │   ├── string.py       # String manipulation
│   │   ├── openapi.py      # OpenAPI parsing
│   │   └── file.py         # File operations
│   └── cli/                # CLI interface
│       └── main.py
├── tests/                  # Test suite
├── examples/               # Example configurations
└── README.md
```

## Generator Types

### Core Generators

1. **Validator Generator** - Generates Zod validators (uses `openapi-zod-client`)
2. **Types Generator** - Generates TypeScript type exports
3. **Schema Generator** - Generates DTO and Entity schema files
4. **Repository Generator** - Generates repository interfaces
5. **Handler Generator** - Generates TypeScript handler functions
6. **Converter Generator** - Generates entity converters
7. **Index Builder** - Generates domain index files
8. **Main Index Builder** - Generates main package index file

## Pipeline Flow

```
1. Load OpenAPI Spec (bundled JSON)
   ↓
2. Generate Zod Validators
   ↓
3. Generate TypeScript Types
   ↓
4. Generate Schemas (DTOs & Entities)
   ↓
5. Generate Repository Interfaces
   ↓
6. Generate Handler Functions
   ↓
7. Generate Converters
   ↓
8. Generate Domain Index Files
   ↓
9. Generate Main Index File
   ↓
10. Validate Build (optional)
```

## Usage Examples

### Programmatic API

```python
from quub_codegen import Config, Pipeline, PipelineOptions
from pathlib import Path

# Load configuration
config = Config.from_file(Path(".cuur-coregen.json"))

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
from quub_codegen.base.generator import BaseGenerator, GenerateResult
from quub_codegen.base.context import GenerationContext

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
# Generate core layer
cuur-coregen generate --domain blockchain --layer core --bundle

# Generate SDK layer
cuur-coregen generate --domain blockchain --layer sdk --bundle

# Generate all domains (core)
cuur-coregen generate --all --layer core --bundle

# Generate all domains (SDK)
cuur-coregen generate --all --layer sdk --bundle

# With useful flags
cuur-coregen generate --domain blockchain --layer core --bundle --no-build --clean

# Help
cuur-coregen --help
cuur-coregen generate --help
```

**Note:** The config file is automatically found at `.codegen/.cuur-coregen.json`. Use `--config` to override.

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

## File Naming Convention

All generated files use **dot notation** for file type suffixes:

- Handlers: `{verb}-{resource}.handler.ts`
- DTOs: `{verb}-{resource}.dto.ts`
- Entities: `{resource}.entity.ts`
- Repositories: `{resource}.repository.ts`
- Domain Types: `{domain}.domain.types.ts`
- Schemas: `{domain}.schemas.ts`
- SDK Clients: `{domain}.client.ts`
- OpenAPI Types: `{domain}.openapi.types.ts`
- Zod Schemas: `{domain}.zod.schema.ts`

Multi-word resource names use kebab-case, while file type suffixes use dot notation.

## Key Features

- **Dual Layer Support** - Generate core or SDK layer independently
- **Dot Notation Naming** - Consistent file naming conventions
- **Error Handling** - Helpful error messages with suggestions
- **SDK Index Builder** - Automatic barrel export generation
- **Better text processing** with Python
- **Rich terminal output** with progress tracking
- **Type-safe configuration** with Pydantic
- **Easy to extend** and maintain

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.
