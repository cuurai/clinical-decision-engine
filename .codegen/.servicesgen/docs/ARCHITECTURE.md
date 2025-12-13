# Architecture Overview

## Design Principles

1. **Unified Codebase** - Single Python codebase combining all three generators
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

### Core Domain Generators

1. **ServiceGenerator** (`generators/services/service.py`)

   - Generates Fastify service layer
   - Dependency injection container
   - Route handlers
   - Server setup

2. **AdapterGenerator** (`generators/adapters/adapter.py`)

   - Generates DAO repository implementations
   - Prisma-based data access (includes Prisma schema generation)

3. **TestGenerator** (`generators/tests/test.py`)
   - **For Core Domains**: Generates entity factories in `platform/tests/src/core/{domain}/factories/entities/`
   - **For Orchestrator Domains**: Generates flow tests, handler response factories, and flow factories in `platform/tests/src/orchestrators/{domain}/`
   - Automatically detects domain type and generates appropriate tests
   - Uses `PureSchemaFactoryBuilder` for core domain factories (pure Zod schema extraction)
   - Uses `FlowDiscovery` to discover orchestrator flows
   - Uses `FlowTestBuilder` to generate flow test files
   - Uses `MockDependenciesBuilder` to generate mocks from orchestrator `deps.ts`
   - Handler response factories import from core domain factories via `@cuur/factories` path alias

### Orchestrator Generators

4. **OrchestratorFlowGenerator** (`generators/orchestrators/orchestrator_flow.py`)

   - Generates complete orchestrator domain structure
   - Flow files that call core handlers directly
   - Routes, handlers, deps, context, logger, errors
   - Input: YAML OpenAPI specs
   - Output: Self-contained orchestrator domains

5. **GraphQLGenerator** (`generators/orchestrators/graphql.py`)

   - Generates GraphQL schema and resolvers
   - Cross-domain GraphQL API

6. **WebSocketGenerator** (`generators/orchestrators/websocket.py`)
   - Generates WebSocket handlers
   - Market data and notifications

**Note**: Core generators (handlers, repositories, types, validators, converters, schemas) belong to `.codegen` and are NOT part of `servicesgen`.

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

## Orchestrator Architecture

### Flow-Based Architecture

Orchestrator domains use a flow-based architecture where:

1. **YAML OpenAPI Specs** define business workflows using `x-orchestration-flow`
2. **Flow Files** (`flows/*.flow.ts`) implement workflows that:

   - Extract JWT context (orgId, accountId)
   - Validate request bodies using core Zod schemas
   - Call core handlers directly from `@cuur/core`
   - Use DAO repositories for database access
   - Compose responses from multiple handler calls
   - Handle errors consistently

3. **Routes** (`routes.ts`) map API Gateway events to flow handlers using path-to-regexp

4. **Dependencies** (`deps.ts`) auto-discover required DAO repositories from handler usage

### Key Design Decisions

- **Direct Handler Calls**: No service clients, no HTTP calls, no domain wrappers
- **JWT Security**: orgId always from JWT context, never from URL
- **Core Schema Validation**: Uses existing Zod schemas from `@cuur/core`
- **Auto-Discovery**: DAO repositories discovered automatically from handler usage
- **Modular Builders**: FlowBuilder, RoutesBuilder, DepsBuilder, etc. for maintainability

## Extension Points

### Adding a New Generator

1. Create generator class inheriting from `BaseGenerator` or `FileGenerator`
2. Implement required properties (`name`, `version`, `type`)
3. Implement `generate()` or `generate_files()` method
4. Register in pipeline
5. Update `FolderStructureConfig` if needed

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
