# ServicesGen AI Agent Maintenance Guide

## Overview

**ServicesGen** is a code generation system focused exclusively on generating:

- **Services** - Fastify routes, dependencies, server setup
- **Adapters** - DAO repository implementations
- **Prisma** - Prisma schema files
- **Tests** - Test suites, mocks, test factories
- **Orchestrators** - Business-scenario-driven API aggregation layer (flows, routes, handlers, deps, GraphQL, WebSocket)

**Key Principle**: ServicesGen is **TOTALLY INDEPENDENT** from `.codegen` but follows the **EXACT SAME DESIGN PRINCIPLES**.

## Architecture

### Design Principles (MUST MATCH .codegen)

1. **Single Source of Truth**: `FolderStructureConfig` manages ALL output paths
2. **Input vs Output Separation**: `PathConfig` only has INPUT paths (openapi_dir, bundled_dir)
3. **Plugin Architecture**: `GeneratorRegistry` for extensible generator management
4. **Stage-Based Pipeline**: `DomainProcessingStage` and `PostProcessingStage` for separation of concerns
5. **Base Classes**: `FileGenerator`, `SingleFileGenerator`, `PostProcessingGenerator` for common patterns
6. **Context Factory**: `ContextFactory` for consistent context creation
7. **Builder Pattern**: `Builder` protocol and `BaseBuilder` for standardized builders

### Core Components

```
servicesgen/
├── src/cuur_codegen/
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
```

## Configuration System

### PathConfig (INPUT PATHS ONLY)

```python
class PathConfig(BaseModel):
    """INPUT paths only - output paths come from FolderStructureConfig"""
    project_root: Path          # Project root directory (absolute)
    openapi_dir: Path            # OpenAPI specs directory (absolute)
    bundled_dir: Path            # Bundled OpenAPI JSON directory (absolute)
```

**CRITICAL**: `PathConfig` does NOT contain output paths like `core_output_dir`, `services_output_dir`, etc. These are managed by `FolderStructureConfig`.

### FolderStructureConfig (OUTPUT PATHS - SINGLE SOURCE OF TRUTH)

```python
class FolderStructureConfig(BaseModel):
    """Single source of truth for ALL output paths"""
    services: LayerFolderStructure   # base_path="services/src"
    adapters: LayerFolderStructure  # base_path="adapters/src"
    tests: LayerFolderStructure     # base_path="tests/src"
```

**Default paths**:

- Services: `services/src/{domain}/src/`
- Adapters: `adapters/src/{domain}/`
- Prisma: `adapters/src/{domain}/schema.prisma`
- Tests: `tests/src/{domain}/`
  - Raw domains: `handlers/{handler}/*.test.ts`, `mocks/index.ts`, `__setup__/vitest.setup.ts`
  - Orchestrator domains: `flows/*.flow.test.ts`, `mocks/index.ts`
- Orchestrators: `orchestrators/domains/src/{domain}/`
  - Flows: `{domain}/flows/*.flow.ts`
  - Routes: `{domain}/routes.ts`
  - Handler: `{domain}/handler.ts`
  - Dependencies: `{domain}/deps.ts`
  - Context: `{domain}/context.ts`
  - Logger: `{domain}/logger.ts`
  - Errors: `{domain}/errors/flow-error.ts`
  - Config: `{domain}/config/index.ts`
  - GraphQL: `orchestrators/src/api/graphql/` (cross-domain)
  - WebSocket: `orchestrators/src/api/websocket/` (cross-domain)

### Config Structure

```python
class Config(BaseModel):
    paths: PathConfig                    # INPUT paths only
    folder_structure: FolderStructureConfig  # OUTPUT paths (single source of truth)
    domains: list[DomainConfig]
    layers: LayersConfig
    pipeline: PipelineOptions
    # ... other config
```

## Generator Architecture

### Base Generator Classes

#### FileGenerator

For generators that create multiple files + index file.

```python
class FileGenerator(BaseGenerator):
    def generate(self, context: GenerationContext) -> GenerateResult:
        # 1. Setup output directory (uses FolderStructureConfig)
        output_dir = GeneratorSetup.get_output_directory(
            context, generator_type=self.type, layer=self.get_layer(), clean=self.should_clean()
        )
        # 2. Generate files (implemented by subclass)
        files = self.generate_files(context, output_dir)
        # 3. Generate index file (if needed)
        if self.should_generate_index():
            index_file = self.generate_index(context, output_dir, files)
        return GenerateResult(files=files, warnings=warnings)
```

**Subclasses must implement**:

- `generate_files(context, output_dir) -> List[Path]`
- `get_layer() -> str` (returns "services", "adapters", or "tests")

**Optional overrides**:

- `should_clean() -> bool` (default: True)
- `should_generate_index() -> bool` (default: True)
- `generate_index()` (default: auto-generates from files)

#### SingleFileGenerator

For generators that create a single file.

```python
class SingleFileGenerator(BaseGenerator):
    def generate(self, context: GenerationContext) -> GenerateResult:
        output_dir = GeneratorSetup.get_output_directory(...)
        content = self.generate_content(context)  # Implemented by subclass
        filename = self.get_filename(context)      # Implemented by subclass
        write_file(output_dir / filename, content)
        return GenerateResult(files=[output_dir / filename])
```

**Subclasses must implement**:

- `generate_content(context) -> str`
- `get_filename(context) -> str`
- `get_layer() -> str`

#### PostProcessingGenerator

For generators that run after all domains are processed (e.g., main index builders).

```python
class PostProcessingGenerator(BaseGenerator):
    def generate(self, context: GenerationContext) -> GenerateResult:
        raise NotImplementedError("Use specialized methods instead")
```

**Example**: `AdaptersMainIndexBuilderGenerator.generate_main_index()`

### Current Generators

#### ServiceGenerator (FileGenerator)

- **Type**: `"service"`
- **Layer**: `"services"`
- **Output**: `services/src/{domain}/src/`
- **Files**: routes/\*.routes.ts, dependencies/dependencies.ts, index.ts, main.ts, package.json

#### AdapterGenerator (FileGenerator)

- **Type**: `"adapter"`
- **Layer**: `"adapters"`
- **Output**: `adapters/src/{domain}/`
- **Files**: dao-\*-repository.ts, index.ts
- **Custom**: Overrides `generate_index()` to use custom IndexBuilder

#### TestGenerator (FileGenerator)

- **Type**: `"tests"`
- **Layer**: `"tests"`
- **Output Path Resolution**:
  - **Core Domains**: `platform/tests/src/core/{domain}/`
  - **Orchestrator Domains**: `platform/tests/src/orchestrators/{domain}/`
  - Path resolution handled by `FolderStructureConfig.get_layer_output_path()` with special logic for tests layer
- **Supports**: Both core domain factories and orchestrator flow tests
- **For Core Domains** (`_generate_core_domain_factories`):
  - **Purpose**: Generate entity factories for core domains
  - **Files**:
    - `factories/entities/{domain}.entity.factory.ts` - Entity factories using schema introspection
    - `factories/shared/faker-helpers.ts` - Shared faker utilities
    - `package.json` - Package configuration
  - **Architecture**: Pure schema-driven factory generation using `PureSchemaFactoryBuilder`
  - **Source**: Zod schemas from `packages/core/packages/core/src/{domain}/openapi/{domain}.zod.schema.ts`
  - **Config**: Overrides from `.servicesgen/config/test-factory-config.yaml`
  - **Import Path**: `@cuur/factories/{domain}/factories/entities/{domain}.entity.factory.js`
- **For Orchestrator Domains** (`_generate_orchestrator_flow_tests`):
  - **Purpose**: Generate flow tests and handler response factories
  - **Files**:
    - `factories/flows/*.factory.ts` - Flow response factories (compose handler responses)
    - `factories/handler-responses/*.factory.ts` - Handler response factories (wrap entities)
    - `factories/shared/faker-helpers.ts` - Shared faker utilities
    - `flows/*.flow.test.ts` - Flow test files
    - `mocks/index.ts` - Mock dependencies
    - `package.json` - Package configuration
  - **Architecture**: Three-layer factory composition
    1. **Core Domain Entity Factories** (imported via `@cuur/factories/{core-domain}/factories/entities/`)
    2. **Handler Response Factories** (wrap entities in DataEnvelope structure)
    3. **Flow Factories** (compose handler response factories)
  - **Uses**: `FlowDiscovery` to discover flows from `platform/orchestrators/domains/src/{domain}/flows/`
  - **Uses**: `MockDependenciesBuilder` to generate mocks from `deps.ts`
  - **Uses**: `FlowTestBuilder` to generate flow test files
  - **Ensures**: Core domain factories exist before generating orchestrator factories (via `_ensure_core_domain_factories`)
- **Custom**: Overrides `should_generate_index()` to use custom TestIndexBuilder
- **Key Features**:
  - Automatically detects if domain is orchestrator or core domain
  - For orchestrator domains, skips OpenAPI spec validation
  - For core domains, generates entity factories using schema introspection
  - Generates tests with proper `@quub` path aliases
  - Handler response factories import from core domain factories (no duplication)
  - Path resolution handles `project_root` being `platform/` vs repo root

#### AdaptersMainIndexBuilderGenerator (PostProcessingGenerator)

- **Type**: `"adapters_main_index_builder"`
- **Method**: `generate_main_index(config, all_domains) -> GenerateResult`
- **Output**: `adapters/src/index.ts` (main index for all domains)

#### OrchestratorFlowGenerator (FileGenerator)

- **Type**: `"orchestrator_flow"`
- **Layer**: `"orchestrators"`
- **Output**: `orchestrators/domains/src/{domain}/`
- **Input**: YAML OpenAPI specs from `platform/orchestrators/openapi/src/yaml/{domain}.yaml`
- **Files**:
  - `flows/*.flow.ts` - Business workflow files
  - `routes.ts` - API Gateway route → flow mapping
  - `handler.ts` - Lambda entrypoint
  - `deps.ts` - Dependency injection (auto-discovers DAO repositories)
  - `context.ts` - JWT context extraction
  - `logger.ts` - Structured logging setup
  - `errors/flow-error.ts` - Custom error class
  - `config/index.ts` - Configuration loaders
  - `package.json` - Package configuration
  - `tsconfig.json` - TypeScript configuration with path mappings
- **Key Features**:
  - Direct handler calls from `@cuur/core` (no service clients)
  - JWT-based security (orgId from context, never URL)
  - Request validation using core Zod schemas
  - Auto-discovery of DAO repositories from handler usage
  - Modular builder architecture (FlowBuilder, RoutesBuilder, DepsBuilder, etc.)

#### GraphQLGenerator (FileGenerator)

- **Type**: `"orchestrator_graphql"`
- **Layer**: `"orchestrators"`
- **Output**: `orchestrators/src/api/graphql/` (cross-domain)
- **Files**: `schema.ts`, `resolvers.ts`

#### WebSocketGenerator (FileGenerator)

- **Type**: `"orchestrator_websocket"`
- **Layer**: `"orchestrators"`
- **Output**: `orchestrators/src/api/websocket/` (cross-domain)
- **Files**: `market-data.handler.ts`, `notifications.handler.ts`

## Pipeline Architecture

### Pipeline Class

```python
class Pipeline:
    def __init__(self, config: Config, logger: Logger):
        self.registry = GeneratorRegistry(logger)
        # Register generators
        self.registry.register("adapter", AdapterGenerator)
        self.registry.register("service", ServiceGenerator)
        self.registry.register("tests", TestGenerator)

        # Initialize stages
        self.domain_stage = DomainProcessingStage(config, logger, self.registry.get_all())
        self.post_processing_stage = PostProcessingStage(config, logger, self.registry.get_all())

    def execute(self, domains: List[str], options: PipelineOptions) -> PipelineResult:
        # Process each domain
        for domain in domains:
            self.domain_stage.process_domain(domain_config, options)

        # Post-processing (e.g., main index builders)
        self.post_processing_stage.run_post_processing(domains, options.layers)
```

### DomainProcessingStage

Handles processing of individual domains:

1. **Load bundled OpenAPI spec** (expects pre-bundled, no bundling in servicesgen)
2. **Create context** using `ContextFactory`
3. **Clean directories** if `options.clean`
4. **Determine generators to run** based on `options.layers`
5. **Run generators** in order: adapter → service → tests
6. **Track results** and errors

### PostProcessingStage

Handles post-generation tasks:

1. **Main index builders** (e.g., adapters main index.ts)
2. **Cross-domain operations**
3. **Final validation**

## Adding a New Generator

### Step 1: Create Generator Class

```python
from cuur_codegen.base.generator_bases import FileGenerator
from cuur_codegen.core.context import GenerationContext
from pathlib import Path
from typing import List

class MyNewGenerator(FileGenerator):
    @property
    def name(self) -> str:
        return "My New Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "my_new_generator"

    def get_layer(self) -> str:
        return "services"  # or "adapters" or "tests"

    def generate_files(
        self, context: GenerationContext, output_dir: Path
    ) -> List[Path]:
        """Generate files - implement your logic here"""
        files = []
        # Your generation logic
        return files
```

### Step 2: Register Generator

In `pipeline/pipeline.py`:

```python
from cuur_codegen.generators.my_new import MyNewGenerator

# In __init__:
self.registry.register("my_new_generator", MyNewGenerator)
```

### Step 3: Update FolderStructureConfig (if needed)

If your generator needs a custom folder structure, update `core/layer_folder_structure.py`:

```python
# In LayerFolderStructure.get_generator_config():
config_map = {
    # ... existing mappings
    "my_new_generator": self.my_new_config,  # Add your config
}
```

### Step 4: Update Layer Mapping

In `pipeline/stages.py`:

```python
layer_to_generators = {
    "adapters": ["adapter"],
    "services": ["service", "my_new_generator"],  # Add here
    "tests": ["tests"],
}
```

## Common Patterns

### Pattern 1: Discovering Core Package Files

**Problem**: Generators need to find files in `packages/core/src/` but `project_root` might be `platform/`.

**Solution**: Use fallback path resolution:

```python
# Try project_root first
core_base = context.config.paths.project_root / "packages" / "core" / "src"
if not core_base.exists():
    # Fallback: go up one level
    core_base = context.config.paths.project_root.parent / "packages" / "core" / "src"
```

**Used in**:

- `AdapterGenerator` (discovering repositories)
- `TestGenerator` (discovering repositories and handlers)
- `ServiceGenerator` (discovering repositories and handlers)

### Pattern 2: Custom Index Generation

**Problem**: Generator needs custom index file format.

**Solution**: Override `generate_index()`:

```python
def generate_index(
    self, context: GenerationContext, output_dir: Path, files: List[Path]
) -> Optional[Path]:
    # Custom index generation logic
    index_content = CustomIndexBuilder.build_index(...)
    index_file = output_dir / "index.ts"
    write_file(index_file, index_content)
    return index_file
```

**Used in**:

- `AdapterGenerator` (uses IndexBuilder.build_index_file())
- `TestGenerator` (uses TestIndexBuilder.build_test_index())

### Pattern 3: Conditional File Generation

**Problem**: Generate file only if it doesn't exist (e.g., main.ts, package.json).

**Solution**: Check before writing:

```python
main_file = output_dir / "main.ts"
if not file_exists(main_file):
    write_file(main_file, content)
    files.append(main_file)
    context.logger.debug("Generated main.ts - review and customize")
else:
    context.logger.debug("main.ts already exists - skipping")
```

**Used in**:

- `ServiceGenerator` (main.ts, package.json)
- `TestGenerator` (package.json)

### Pattern 4: Post-Processing Generators

**Problem**: Generate file that aggregates all domains (e.g., main index.ts).

**Solution**: Use `PostProcessingGenerator`:

```python
class MyMainIndexBuilder(PostProcessingGenerator):
    def generate_main_index(
        self, config: Config, all_domains: Optional[List[str]]
    ) -> GenerateResult:
        # Discover all domains from filesystem
        domains = self._discover_domains(output_dir)
        # Generate main index
        index_content = self._build_index(domains)
        write_file(output_dir / "index.ts", index_content)
        return GenerateResult(files=[output_dir / "index.ts"])
```

**Used in**:

- `AdaptersMainIndexBuilderGenerator`

## Path Resolution

### How Output Paths Are Resolved

1. **Generator calls**: `GeneratorSetup.get_output_directory(context, generator_type, layer)`
2. **GeneratorSetup uses**: `context.config.folder_structure.get_layer_output_path(...)`
3. **FolderStructureConfig resolves**:
   - Gets `layer_config` (e.g., services layer)
   - Gets `generator_config` (e.g., service generator)
   - Builds path: `project_root / layer_config.base_path / domain_name / generator_config.output_dir`
   - Handles `{domain}` placeholder in `output_dir`

### Example Path Resolution

For `ServiceGenerator` generating `auth` domain:

1. `generator_type = "service"`
2. `layer = "services"`
3. `layer_config.base_path = "services/src"`
4. `generator_config.output_dir = "{domain}"` → `"auth"`
5. Final path: `project_root / "services/src" / "auth"` = `platform/services/src/auth`

But ServiceGenerator has custom structure, so it creates:

- `platform/services/src/auth/src/` (routes, dependencies, etc.)

## CLI Structure

### Commands

1. **`cuur-codegen generate`** - Generate code for domains

   - Options: `--domain`, `--all`, `--layer`, `--clean`, `--no-build`, `--verbose`, `--log-level`
   - Uses `find_config_file()` to discover config in multiple locations

2. **`cuur-codegen pipeline`** - Alias for generate

3. **`cuur-codegen init`** - Initialize config file

### Config File Discovery

`find_config_file()` searches:

1. Default path (`.cuur-codegen.json`)
2. Current directory (`.cuur-codegen.json`)
3. `platform/.cuur-codegen.json` (from project root)
4. Walks up directories to find `platform/.cuur-codegen.json`

## Dependencies and Relationships

### ServicesGen → Core Package

ServicesGen generators **read** from `packages/core/src/` but **never write** to it:

- `AdapterGenerator` reads repositories from `packages/core/src/{domain}/repositories/`
- `ServiceGenerator` reads handlers from `packages/core/src/{domain}/handlers/`
- `TestGenerator` reads repositories and handlers from core

### ServicesGen → OpenAPI Specs

ServicesGen **expects pre-bundled** OpenAPI JSON files:

- No bundling functionality in servicesgen
- Reads from `bundled_dir` (typically `openapi/src/.bundled/`)
- Bundling should be done separately (by `.codegen` or manually)

### Independence from .codegen

**CRITICAL**: ServicesGen is **TOTALLY INDEPENDENT**:

- No imports from `.codegen` package
- Own implementations of base classes
- Own config system (but same design)
- Own pipeline (but same patterns)

## Troubleshooting

### Issue: Files Not Generated in Platform Folder

**Symptoms**: Pipeline succeeds but no files created.

**Causes**:

1. `project_root` in config is wrong (should be `"."` for platform/)
2. `FolderStructureConfig` defaults don't match expected paths
3. Path resolution fails silently

**Solution**:

- Check `config.paths.project_root` resolves correctly
- Verify `FolderStructureConfig` base_paths match expected structure
- Add debug logging to `GeneratorSetup.get_output_directory()`

### Issue: "Generator 'X' not configured for layer 'Y'"

**Symptoms**: Error about generator not configured.

**Causes**:

1. Generator type not mapped in `LayerFolderStructure.get_generator_config()`
2. Layer doesn't have config for that generator type

**Solution**:

- Add mapping in `get_generator_config()`:
  ```python
  "adapter": self.repositories,  # Adapter uses repositories config
  ```

### Issue: Core Package Not Found

**Symptoms**: "No repositories found" or "No handlers found".

**Causes**:

1. Core package not generated yet
2. Path resolution incorrect (project_root is platform/, core is at ../packages/core/src/)

**Solution**:

- Use fallback path resolution:
  ```python
  core_base = project_root / "packages" / "core" / "src"
  if not core_base.exists():
      core_base = project_root.parent / "packages" / "core" / "src"
  ```

### Issue: Config File Not Found

**Symptoms**: "Configuration file not found".

**Causes**:

1. Config file not in expected location
2. `find_config_file()` not finding it

**Solution**:

- Check config file exists in one of:
  - Current directory: `.cuur-codegen.json`
  - `platform/.cuur-codegen.json`
- Or specify explicitly: `--config /path/to/config.json`

## Testing Guidelines

### Unit Tests

Test generators in isolation:

```python
def test_service_generator():
    context = create_test_context(domain="auth")
    generator = ServiceGenerator(logger)
    result = generator.generate(context)
    assert result.success
    assert len(result.files) > 0
```

### Integration Tests

Test full pipeline:

```python
def test_pipeline_auth_domain():
    config = Config.from_file(Path("test-config.json"))
    pipeline = Pipeline(config, logger)
    result = pipeline.execute(["auth"], PipelineOptions())
    assert result.success
    assert result.domains_succeeded == 1
```

### Manual Testing

1. **Clean test**: `rm -rf platform/services platform/adapters platform/tests`
2. **Generate**: `cuur-codegen generate --domain auth --layer all --no-build`
3. **Verify**: Check files exist in `platform/` directory
4. **Check structure**: Verify directory structure matches expectations

## Code Organization Rules

### DO

✅ Use `FolderStructureConfig` for ALL output paths
✅ Use `GeneratorSetup.get_output_directory()` instead of manual path building
✅ Use `ContextFactory.create_domain_context()` for context creation
✅ Register generators in `GeneratorRegistry`
✅ Use base generator classes (`FileGenerator`, `SingleFileGenerator`)
✅ Follow `.codegen` design patterns exactly
✅ Keep servicesgen independent from `.codegen`

### DON'T

❌ Access `config.paths.core_output_dir` directly (use FolderStructureConfig)
❌ Hardcode output paths in generators
❌ Import from `.codegen` package
❌ Add bundling functionality (servicesgen doesn't bundle)
❌ Add core generators (handlers, types, validators belong to `.codegen`)
❌ Mix input and output paths in `PathConfig`

## Extension Points

### Adding a New Layer

1. Add layer config to `FolderStructureConfig`:

   ```python
   my_new_layer: LayerFolderStructure = Field(...)
   ```

2. Update `get_layer_config()`:

   ```python
   layer_map = {
       # ... existing
       "my_new_layer": self.my_new_layer,
   }
   ```

3. Create generators for the layer
4. Register generators in pipeline
5. Update `layer_to_generators` in stages

### Adding a New Generator Type

1. Create generator class (inherit from `FileGenerator` or `SingleFileGenerator`)
2. Implement required methods
3. Register in `GeneratorRegistry`
4. Add to `layer_to_generators` mapping
5. Update `FolderStructureConfig` if needed

### Customizing Folder Structure

Override `FolderStructureConfig` in config file:

```json
{
  "folder_structure": {
    "services": {
      "base_path": "custom/services/path",
      "service": {
        "output_dir": "{domain}"
      }
    }
  }
}
```

## Key Files Reference

### Core Files

- `core/config.py` - Config, PathConfig, DomainConfig
- `core/layer_folder_structure.py` - FolderStructureConfig (single source of truth)
- `core/context.py` - GenerationContext
- `core/generator.py` - BaseGenerator, GenerateResult

### Base Infrastructure

- `base/generator_bases.py` - FileGenerator, SingleFileGenerator, PostProcessingGenerator
- `base/generator_registry.py` - GeneratorRegistry
- `base/context_factory.py` - ContextFactory
- `base/builder.py` - Builder protocol

### Utilities

- `utils/generator_setup.py` - GeneratorSetup (uses FolderStructureConfig)
- `utils/index_file_generator.py` - IndexFileGenerator

### Pipeline

- `pipeline/pipeline.py` - Pipeline orchestrator
- `pipeline/stages.py` - DomainProcessingStage, PostProcessingStage

### Generators

- `generators/services/service.py` - ServiceGenerator
- `generators/adapters/adapter.py` - AdapterGenerator
- `generators/adapters/main_index_builder.py` - AdaptersMainIndexBuilderGenerator
- `generators/tests/test.py` - TestGenerator

## Maintenance Checklist

When modifying servicesgen:

- [ ] Does it follow `.codegen` design patterns?
- [ ] Are output paths using `FolderStructureConfig`?
- [ ] Are input paths in `PathConfig` only?
- [ ] Is it independent from `.codegen`?
- [ ] Are generators registered in `GeneratorRegistry`?
- [ ] Are base classes used correctly?
- [ ] Does it work with `project_root` in platform/?
- [ ] Are core package paths resolved correctly?
- [ ] Does CLI match `.codegen` structure?
- [ ] Are all files generated in platform/ folder?

## Orchestrator Architecture

### Key Principles

1. **Direct Handler Calls** - Orchestrators import and call core handlers directly from `@cuur/core`. No service clients, no HTTP calls, no domain wrappers.
2. **JWT-Based Security** - `orgId` and `accountId` are extracted from JWT context, NEVER from URL parameters.
3. **Request Validation** - Uses core Zod schemas from `@cuur/core` for request body validation.
4. **DAO Integration** - Uses DAO repositories from `@cuur/adapters` for direct database access.
5. **Modular Structure** - Each orchestrator domain is self-contained with flows, routes, deps, and handlers.

### Flow Files

Flow files (`flows/*.flow.ts`) contain business workflows that:

1. Extract `orgId` and `accountId` from JWT context (never from URL)
2. Validate request body using core Zod schemas (e.g., `exchangeSchemas.CreateOrderRequest.parse(body)`)
3. Call core handlers directly (e.g., `createOrder(deps.orderRepo, orgId, validatedBody)`)
4. Use DAO repositories for database access when needed
5. Compose responses from multiple handler calls
6. Handle errors consistently using `FlowError`

### Validation Schema Naming

Core exports schemas with a specific naming pattern:

- Remove hyphens from domain name
- Keep lowercase
- Add "Schemas" suffix

Examples:

- `fiat-banking` → `fiatbankingSchemas`
- `risk-limits` → `risklimitsSchemas`
- `exchange` → `exchangeSchemas`

Import pattern:

```typescript
import { fiatbankingSchemas } from "@cuur/core/fiat-banking/index.js";
const validatedBody = fiatbankingSchemas.CreateFiatDepositRequest.parse(body);
```

### DAO Repository Auto-Discovery

The `DepsBuilder` automatically discovers required DAO repositories by:

1. Parsing `x-orchestration-flow` steps in OpenAPI YAML
2. Identifying handlers used in flows
3. Mapping handlers to their corresponding DAO repositories
4. Generating imports and initialization code

No manual configuration needed - repositories are discovered from handler usage.

### TypeScript Configuration

Generated `tsconfig.json` files include:

- **baseUrl**: `../../..` (points to `platform/`)
- **Path Mappings**:
  - `@cuur/core`: Points to core package (both src and dist)
  - `@cuur/core/*`: Points to core package source files
  - `@cuur/adapters`: Points to adapters package
  - `@cuur/adapters/*`: Points to adapters package files

### Configuration Files

Orchestrator domains are configured in `.servicesgen/config/.orchestrator-domains.yaml`:

- Defines orchestrator domain names
- Maps orchestrator domains to raw domains
- Specifies OpenAPI YAML file locations

Raw domains are configured in `.servicesgen/config/.raw-domains.yaml`:

- Lists all technical service domains
- Used by services, adapters, tests, prisma generators

### Removed Components

The following components have been removed from orchestrators:

- ❌ **Service Clients** - Orchestrators call handlers directly
- ❌ **Domain Wrappers** - Not needed with direct handler calls
- ❌ **Models Directory** - Use core types directly
- ❌ **Validation Directory** - Use core schemas directly

## Future Improvements

### Potential Enhancements

1. **Validation**: Add validation for generated code structure
2. **Templates**: Extract templates to separate files for easier customization
3. **Plugins**: Make generator registration more plugin-like
4. **Testing**: Add more comprehensive test coverage
5. **Documentation**: Generate API documentation for generated services
6. **Type Safety**: Improve TypeScript type generation
7. **Performance**: Optimize for large numbers of domains

### Areas to Watch

1. **Path Resolution**: Ensure robust path resolution for different project structures
2. **Error Handling**: Improve error messages for common issues
3. **Config Validation**: Better validation of config file structure
4. **Logging**: More detailed logging for debugging
5. **Schema Naming**: Ensure validation schema naming matches core exports
6. **Handler Discovery**: Maintain accurate handler name mapping from YAML to core

## Contact and Support

For questions or issues:

1. Check this document first
2. Review `.codegen` documentation for design patterns
3. Check generator-specific documentation in `generators/*/README.md`
4. Review code examples in existing generators

---

**Last Updated**: 2024-12-30
**Version**: 1.1.0
**Maintainer**: Quub Development Team
