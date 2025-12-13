# Architecture Overview

## Design Principles

1. **Focused Architecture** - Core SDK generation only
2. **Type Safety** - Pydantic for configuration validation
3. **Modularity** - Each generator is independent and testable
4. **Extensibility** - Easy to add new generators
5. **Enterprise-Grade** - Proper error handling, logging, and validation

## Core Components

### 1. Configuration (`core/config.py`)

- **Config**: Main configuration model with Pydantic validation
- **DomainConfig**: Domain-specific settings
- **GeneratorConfig**: Per-generator options
- **PathConfig**: Path configuration for outputs
- **PipelineOptions**: Pipeline execution options

### 2. Context (`core/context.py`)

- **GenerationContext**: Shared state across generators
  - Config reference
  - Domain configuration
  - Logger instance
  - OpenAPI spec
  - Metadata and state storage

### 3. Logging (`core/logger.py`)

- **Logger**: Rich-based structured logger
  - Colored output
  - Progress bars
  - Tables
  - Panels

### 4. Base Generator (`core/generator.py`)

- **BaseGenerator**: Abstract base class
  - `generate()` method (abstract)
  - `generate_header()` helper
  - `validate_context()` helper

## Generators

### Core Generators

1. **HandlerGenerator** (`generators/core/handler.py`)
   - Generates TypeScript handler functions
   - Extracts operations from OpenAPI
   - Builds function signatures
   - Generates handler bodies

2. **RepositoryGenerator** (`generators/core/repository.py`)
   - Generates repository interfaces
   - CRUD method definitions
   - Type-safe interfaces

3. **TypesGenerator** (`generators/core/types.py`)
   - Generates type exports
   - Re-exports from generated types
   - Domain-specific type aliases

4. **ValidatorGenerator** (`generators/core/validator.py`)
   - Wraps `openapi-zod-client`
   - Generates Zod validators
   - Configurable base URL

5. **ConverterGenerator** (`generators/core/converter.py`)
   - Generates DAO ↔ Domain converters
   - Bidirectional conversion functions

### SDK Generators

6. **DomainClientGenerator** (`generators/sdk/domain_client.py`)
   - Generates SDK domain client classes
   - HTTP client wrappers
   - Type-safe API calls

## Pipeline

### Pipeline Orchestrator (`pipeline/pipeline.py`)

- **Pipeline**: Main orchestrator class
- **PipelineOptions**: Execution options
- **PipelineResult**: Execution results

**Execution Flow:**
1. Load OpenAPI spec
2. Create generation context
3. Run generators in sequence
4. Validate build (optional)
5. Return results

## Utilities

### String Utilities (`utils/string.py`)

- `camel_case()` - Convert to camelCase
- `pascal_case()` - Convert to PascalCase
- `kebab_case()` - Convert to kebab-case
- `snake_case()` - Convert to snake_case
- `pluralize()` / `singularize()` - Word inflection
- `extract_resource_from_operation_id()` - Parse operation IDs

### OpenAPI Utilities (`utils/openapi.py`)

- `load_openapi_spec()` - Load and parse OpenAPI files
- `extract_operations()` - Extract all operations
- `extract_schemas()` - Extract all schemas
- `resolve_ref()` - Resolve $ref references
- `get_request_body_schema()` - Get request body schema
- `get_response_schema()` - Get response schema

### File Utilities (`utils/file.py`)

- `ensure_directory()` - Create directory if needed
- `write_file()` - Write file with encoding
- `read_file()` - Read file content
- `file_exists()` - Check file existence
- `clean_directory()` - Clean directory contents

## CLI

### CLI Interface (`cli/main.py`)

- **Commands:**
  - `generate` - Generate code for domains
  - `pipeline` - Run complete pipeline
  - `init` - Initialize configuration

- **Options:**
  - `--config` - Configuration file path
  - `--domain` - Domain(s) to process
  - `--all` - Process all domains
  - `--clean` - Clean output directories
  - `--no-build` - Skip build validation
  - `--verbose` - Verbose logging
  - `--log-level` - Log level

## Extension Points

### Adding a New Generator

1. Create generator class inheriting from `BaseGenerator`
2. Implement required properties (`name`, `version`, `type`)
3. Implement `generate()` method
4. Register in pipeline

### Custom Utilities

- Add to `utils/` directory
- Export from `utils/__init__.py`
- Use in generators

## Error Handling

- **CodeGenError**: Base exception
- **ValidationError**: Configuration validation errors
- **GenerationError**: Code generation errors
- **OpenAPIError**: OpenAPI parsing errors
- **FileSystemError**: File operation errors

## Testing Strategy

- Unit tests for each generator
- Integration tests for pipeline
- Mock OpenAPI specs for testing
- Test utilities and fixtures
