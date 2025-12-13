"""
Configuration management using Pydantic

Provides type-safe configuration with validation and defaults.

Core Domains Configuration:
    Domains can be loaded from a separate config file for easier maintenance:
    - .servicesgen/config/.core-domains.yaml (preferred)
    - .servicesgen/config/.core-domains.json

    If the core domains config file exists, it takes precedence over domains
    defined in .quub-codegen.json. This allows maintaining domains separately.

    The generator checks the config folder first, then falls back to legacy
    platform locations for backward compatibility.

    See core_domains_config.py for the configuration structure and format.
"""

from enum import Enum
from pathlib import Path
from typing import Optional, Literal, Dict, Any, Union

from pydantic import BaseModel, Field, field_validator, model_validator


class LogLevel(str, Enum):
    """Logging levels"""

    DEBUG = "debug"
    INFO = "info"
    WARN = "warn"
    ERROR = "error"

    @classmethod
    def _missing_(cls, value: str) -> "LogLevel":
        """Handle string values"""
        value_lower = value.lower()
        for member in cls:
            if member.value == value_lower:
                return member
        return cls.INFO  # Default


class GeneratorType(str, Enum):
    """Core generator types"""

    HANDLER = "handler"
    REPOSITORY = "repository"
    SCHEMA = "schema"
    TYPES = "types"
    VALIDATOR = "validator"
    CONVERTER = "converter"
    SERVICE = "service"
    TESTS = "tests"


class PathConfig(BaseModel):
    """
    Path configuration for code generation - INPUT paths only

    Note: Output paths are managed by FolderStructureConfig to ensure single source of truth.
    This keeps input paths (source specs, bundled files) separate from output paths (generated code).
    As the repository evolves and directories move around, only FolderStructureConfig needs updating.

    All paths are stored as absolute Path objects to ensure codegen works regardless of
    where it's executed from or where the config file is located.
    """

    project_root: Path = Field(..., description="Project root directory (absolute path)")
    openapi_dir: Path = Field(..., description="OpenAPI specifications directory (absolute path)")
    bundled_dir: Path = Field(..., description="Bundled OpenAPI JSON directory (absolute path)")

    @field_validator("*", mode="before")
    @classmethod
    def convert_paths(cls, v: Any) -> Path:
        """Convert string paths to Path objects"""
        if isinstance(v, str):
            return Path(v)
        return v

    @field_validator("*", mode="after")
    @classmethod
    def resolve_paths(cls, v: Path) -> Path:
        """Ensure all paths are absolute and resolved"""
        if isinstance(v, Path):
            return v.resolve()
        return v


class GeneratorOptions(BaseModel):
    """Options for individual generators"""

    enabled: bool = Field(True, description="Whether this generator is enabled")
    include_js_docs: bool = Field(True, description="Include JSDoc comments")
    namespace_exports: bool = Field(False, description="Use namespace exports")
    validate_entity_types: bool = Field(True, description="Validate entity types")
    include_validation: bool = Field(True, description="Include validation code")
    filter_shared_types: bool = Field(True, description="Filter shared types")


class CoreLayerConfig(BaseModel):
    """Configuration for core layer (handlers, types, validators, converters)"""

    handlers: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    types: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    validators: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    converters: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())

    # Handler-specific options
    include_repositories: bool = Field(True, description="Include repository imports in handlers")
    include_validation: bool = Field(True, description="Include validation in handlers")
    include_converters: bool = Field(True, description="Include converter usage in handlers")

    # Validator-specific options
    base_url: str = Field("https://api.quub.exchange/v2", description="Base URL for validators")

    # Types-specific options
    re_export_generated_types: bool = Field(True, description="Re-export from generated types")


class AdaptersLayerConfig(BaseModel):
    """Configuration for adapters layer (repositories and Prisma)"""

    repositories: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    prisma: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())

    # Repository-specific options
    include_crud_methods: bool = Field(True, description="Include CRUD methods")
    include_custom_methods: bool = Field(True, description="Include custom query methods")
    interface_prefix: str = Field("", description="Prefix for repository interfaces")
    interface_suffix: str = Field("Repository", description="Suffix for repository interfaces")

    # Prisma-specific options
    generate_enums: bool = Field(True, description="Generate Prisma enum types")
    generate_indexes: bool = Field(True, description="Generate database indexes")
    multi_tenancy: bool = Field(True, description="Add orgId fields for multi-tenancy")


class ServicesLayerConfig(BaseModel):
    """Configuration for services layer"""

    services: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    routes: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    dependencies: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())

    # Service-specific options
    framework: str = Field("fastify", description="Web framework (fastify, express, etc.)")
    generate_main: bool = Field(True, description="Generate main.ts entry point")
    generate_index: bool = Field(True, description="Generate index.ts server setup")
    generate_dependencies: bool = Field(True, description="Generate dependencies.ts")
    generate_routes: bool = Field(True, description="Generate route files")

    # Route-specific options
    route_prefix: str = Field("", description="Prefix for all routes")
    include_middleware: bool = Field(False, description="Include middleware setup")
    include_error_handlers: bool = Field(True, description="Include error handlers")

    # Dependency injection options
    di_framework: str = Field("manual", description="DI framework (manual, tsyringe, etc.)")


class TestsLayerConfig(BaseModel):
    """Configuration for tests layer"""

    tests: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    mocks: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    setup: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())

    # Test-specific options
    test_framework: str = Field("vitest", description="Test framework (vitest, jest, etc.)")
    generate_mocks: bool = Field(True, description="Generate mock repositories")
    generate_setup: bool = Field(True, description="Generate setup files")
    generate_handler_tests: bool = Field(True, description="Generate handler test files")
    generate_integration_tests: bool = Field(False, description="Generate integration tests")

    # Mock-specific options
    mock_prefix: str = Field("mock", description="Prefix for mock repositories")
    use_vi_mock: bool = Field(True, description="Use vitest vi.fn() for mocks")


class GeneratorConfig(BaseModel):
    """Configuration for all generators (legacy - use layers instead)"""

    handler: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    repository: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    schema: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    types: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    validator: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    converter: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    service: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    tests: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())


class LayersConfig(BaseModel):
    """Layer-specific configurations"""

    core: CoreLayerConfig = Field(default_factory=lambda: CoreLayerConfig())
    adapters: AdaptersLayerConfig = Field(default_factory=lambda: AdaptersLayerConfig())
    services: ServicesLayerConfig = Field(default_factory=lambda: ServicesLayerConfig())
    tests: TestsLayerConfig = Field(default_factory=lambda: TestsLayerConfig())


class PipelineOptions(BaseModel):
    """Pipeline execution options"""

    clean: bool = Field(False, description="Clean output directories before generation")
    validate: bool = Field(True, description="Validate generated code")
    skip_build: bool = Field(False, description="Skip build validation step")
    parallel: bool = Field(False, description="Run generators in parallel")
    fail_fast: bool = Field(True, description="Stop on first error")
    rollback: bool = Field(False, description="Rollback on failure")


class DomainConfig(BaseModel):
    """Domain configuration"""

    name: str = Field(..., description="Domain name (e.g., 'exchange', 'auth')")
    enabled: bool = Field(True, description="Whether this domain is enabled")
    spec_path: Optional[Path] = Field(None, description="Path to OpenAPI spec (relative to openapi_dir)")
    bundled_path: Optional[Path] = Field(None, description="Path to bundled spec (relative to bundled_dir)")

    @field_validator("spec_path", "bundled_path", mode="before")
    @classmethod
    def convert_paths(cls, v: Any) -> Optional[Path]:
        """Convert string paths to Path objects"""
        if v is None:
            return None
        if isinstance(v, str):
            return Path(v)
        return v

    @property
    def default_spec_path(self) -> Path:
        """Default spec path if not specified"""
        return Path(f"{self.name}.yaml")

    @property
    def default_bundled_path(self) -> Path:
        """Default bundled path if not specified"""
        return Path(f"{self.name}.json")


class BuildConfig(BaseModel):
    """Build configuration"""

    run_after_generate: bool = Field(True, description="Run build after generation")
    packages: list[str] = Field(default_factory=list, description="Packages to build")


class GitConfig(BaseModel):
    """Git configuration"""

    auto_commit: bool = Field(False, description="Auto-commit generated files")
    commit_message: str = Field("chore: regenerate code", description="Commit message")


class Config(BaseModel):
    """Main configuration model"""

    # Domain selection
    domains: list[DomainConfig] = Field(default_factory=list, description="Domain configurations")

    # Input paths (source files, bundled specs)
    paths: PathConfig = Field(..., description="Input path configuration (source files only)")

    # Generator options (legacy)
    generators: Optional[GeneratorConfig] = Field(None, description="Legacy generator configuration")

    # Layer-specific configurations
    layers: LayersConfig = Field(default_factory=LayersConfig, description="Layer-specific configurations")

    # Folder structure (single source of truth for output paths)
    folder_structure: Optional["FolderStructureConfig"] = Field(
        None,
        description="Folder structure configuration - single source of truth for all output paths"
    )

    # Pipeline options
    pipeline: PipelineOptions = Field(default_factory=PipelineOptions, description="Pipeline options")

    # Build configuration
    build: Optional[BuildConfig] = Field(None, description="Build configuration")

    # Git configuration
    git: Optional[GitConfig] = Field(None, description="Git configuration")

    # Logging
    log_level: Union[LogLevel, str] = Field(LogLevel.INFO, description="Log level")
    verbose: bool = Field(False, description="Verbose logging")

    @field_validator("log_level", mode="before")
    @classmethod
    def validate_log_level(cls, v: Any) -> LogLevel:
        """Convert string to LogLevel enum"""
        if isinstance(v, str):
            return LogLevel(v)
        return v

    # Version tracking
    version: Optional[str] = Field(None, description="Generator version")
    timestamp: Optional[str] = Field(None, description="Generation timestamp")

    @classmethod
    def from_file(cls, config_path: Path | str) -> "Config":
        """Load configuration from JSON file and merge with defaults."""
        import json

        # Convert string to Path if needed
        if isinstance(config_path, str):
            config_path = Path(config_path)

        if not config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {config_path}")

        with open(config_path, "r") as f:
            data = json.load(f)

        # Resolve config path to absolute first
        config_path = config_path.resolve()
        config_dir = config_path.parent

        # Get project root from config or use config file's directory
        # Resolve relative to config file location
        project_root_str = data.get("paths", {}).get("project_root")
        if project_root_str:
            project_root = Path(project_root_str)
            if not project_root.is_absolute():
                project_root = config_dir / project_root
            project_root = project_root.resolve()
        else:
            # Default to config file's directory
            project_root = config_dir

        # Merge with defaults to ensure all paths are set
        default_config = cls.default(project_root)

        # Merge paths from file with defaults (only input paths - output paths come from folder_structure)
        if "paths" in data:
            paths_data = data["paths"].copy()
            # Resolve relative paths relative to config file location
            for key, value in paths_data.items():
                if isinstance(value, str) and not Path(value).is_absolute():
                    paths_data[key] = str(config_dir / value)

            # Merge with default paths
            default_paths = default_config.paths.model_dump()
            default_paths.update(paths_data)
            data["paths"] = default_paths
        else:
            data["paths"] = default_config.paths.model_dump()

        # Ensure folder_structure is initialized
        # If not present, use defaults. If present but missing new fields, merge defaults
        from cuur_codegen.core.layer_folder_structure import FolderStructureConfig

        if "folder_structure" not in data:
            data["folder_structure"] = FolderStructureConfig().model_dump()
        else:
            # Create config from file data, then merge defaults for missing fields
            try:
                file_config = FolderStructureConfig(**data["folder_structure"])
                default_config = FolderStructureConfig()

                # Merge defaults for adapters.prisma if missing (Prisma is part of adapters layer)
                if not hasattr(file_config.adapters, 'prisma') or not file_config.adapters.prisma:
                    if hasattr(default_config.adapters, 'prisma') and default_config.adapters.prisma:
                        file_config.adapters.prisma = default_config.adapters.prisma

                data["folder_structure"] = file_config.model_dump()
            except Exception as e:
                # If parsing fails, use defaults
                import warnings
                warnings.warn(f"Failed to parse folder_structure from config file: {e}. Using defaults.")
                data["folder_structure"] = FolderStructureConfig().model_dump()

        # Load domains from core domains config file if it exists, otherwise use domains from JSON
        # This allows maintaining domains in a separate YAML file for easier management
        from cuur_codegen.core.core_domains_config import load_core_domains_config
        core_domains_config = load_core_domains_config(project_root)
        if core_domains_config:
            # Convert core domains config to DomainConfig objects
            domains_from_file = []
            for core_domain in core_domains_config.domains:
                if core_domain.enabled:
                    domains_from_file.append(DomainConfig(
                        name=core_domain.name,
                        enabled=core_domain.enabled,
                        spec_path=Path(core_domain.spec_path) if core_domain.spec_path else None,
                        bundled_path=Path(core_domain.bundled_path) if core_domain.bundled_path else None,
                    ))
            # Override domains from JSON with domains from YAML config file
            data["domains"] = [d.model_dump() for d in domains_from_file]

        return cls(**data)

    @classmethod
    def default(cls, project_root: Path) -> "Config":
        """Create default configuration"""
        from cuur_codegen.core.layer_folder_structure import FolderStructureConfig

        return cls(
            domains=[],
            paths=PathConfig(
                project_root=project_root,
                openapi_dir=project_root / "openapi",
                bundled_dir=project_root / "openapi" / "src" / ".bundled",
            ),
            generators=None,
            layers=LayersConfig(),
            folder_structure=FolderStructureConfig(),
            pipeline=PipelineOptions(),
            build=BuildConfig(),
            git=GitConfig(),
            log_level=LogLevel.INFO,
            verbose=False,
        )

    def get_output_dir(self, layer: str) -> Path:
        """
        Get output directory for a layer from FolderStructureConfig.

        This is the single source of truth for output paths - all generators should use this
        instead of accessing paths directly.
        """
        if not self.folder_structure:
            # Fallback to default folder structure if not configured
            from cuur_codegen.core.layer_folder_structure import FolderStructureConfig
            self.folder_structure = FolderStructureConfig()

        layer_config = self.folder_structure.get_layer_config(layer)
        return self.paths.project_root / layer_config.base_path
