"""
Configuration management using Pydantic

Provides type-safe configuration with validation and defaults.
"""

from enum import Enum
from pathlib import Path
from typing import Optional, Literal, Dict, Any, Union, TYPE_CHECKING

from pydantic import BaseModel, Field, field_validator, model_validator

if TYPE_CHECKING:
    from cuur_codegen.base.folder_structure import FolderStructureConfig


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
    SCHEMAS_FILE = "schemas_file"
    CONVERTER = "converter"


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
    """Configuration for core layer (handlers, types, schemas_file, converters)

    This layer generates the foundational API code for packages/core.
    """

    handlers: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    types: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    schemas_file: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions(), alias="validators")
    converters: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    schemas: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())

    # Handler-specific options
    include_repositories: bool = Field(True, description="Include repository imports in handlers")
    include_validation: bool = Field(True, description="Include validation in handlers")
    include_converters: bool = Field(True, description="Include converter usage in handlers")

    # Validator-specific options
    base_url: str = Field("https://api.quub.exchange/v0", description="Base URL for schemas")

    # Types-specific options
    re_export_generated_types: bool = Field(True, description="Re-export from generated types")




class GeneratorConfig(BaseModel):
    """Configuration for all generators (legacy - use layers instead)"""

    handler: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    repository: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    schema: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    types: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    validator: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())
    converter: GeneratorOptions = Field(default_factory=lambda: GeneratorOptions())


class SdkLayerConfig(BaseModel):
    """Configuration for SDK layer (types, schemas extractors, and domain clients)"""

    enabled: bool = Field(False, description="Enable SDK generation")
    generate_types: bool = Field(True, description="Generate TypeScript types for SDK")
    generate_schemas: bool = Field(True, description="Generate Zod schemas for SDK")
    generate_clients: bool = Field(True, description="Generate domain clients for SDK")
    base_url: str = Field("https://api.quub.exchange/v2", description="Base URL for SDK clients/schemas")


class LayersConfig(BaseModel):
    """Layer-specific configurations"""

    core: CoreLayerConfig = Field(default_factory=lambda: CoreLayerConfig())
    base: CoreLayerConfig = Field(default_factory=lambda: CoreLayerConfig())  # Alias for backward compatibility
    sdk: SdkLayerConfig = Field(default_factory=lambda: SdkLayerConfig())


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
        from cuur_codegen.utils.file import find_project_root

        # Convert string to Path if needed
        if isinstance(config_path, str):
            config_path = Path(config_path)

        if not config_path.exists():
            raise FileNotFoundError(f"Configuration file not found: {config_path}")

        # Resolve config path to absolute
        config_path = config_path.resolve()

        with open(config_path, "r") as f:
            data = json.load(f)

        # Find project root - always resolve relative to actual project structure
        # This ensures codegen works regardless of where it's run from or where config is located
        config_project_root = data.get("paths", {}).get("project_root")

        if config_project_root:
            # If project_root is specified in config, resolve it relative to config file location first
            project_root_candidate = Path(config_project_root)
            if not project_root_candidate.is_absolute():
                project_root_candidate = config_path.parent / project_root_candidate

            # Try to resolve it, but if it doesn't exist or isn't valid, fall back to auto-detection
            try:
                project_root_candidate = project_root_candidate.resolve()
                # Validate it's actually a project root by checking for packages directory
                # More flexible - only requires packages/ directory (works with different structures)
                if (project_root_candidate / "packages").exists():
                    project_root = project_root_candidate
                else:
                    # Not a valid project root, auto-detect instead
                    project_root = find_project_root(config_path)
            except (OSError, ValueError):
                # Path doesn't exist or is invalid, auto-detect instead
                project_root = find_project_root(config_path)
        else:
            # No project_root in config, auto-detect from config file location
            project_root = find_project_root(config_path)

        # Ensure project_root is absolute and resolved
        project_root = project_root.resolve()

        # Merge with defaults to ensure all paths are set
        default_config = cls.default(project_root)

        # Merge paths from file with defaults
        if "paths" in data:
            paths_data = data["paths"].copy()

            # Resolve all path values relative to project_root (not config_dir)
            # This ensures paths are always relative to project root, regardless of config location
            for key, value in paths_data.items():
                if isinstance(value, str):
                    path_value = Path(value)
                    if path_value.is_absolute():
                        # Already absolute, use as-is but validate it's within project
                        paths_data[key] = str(path_value.resolve())
                    else:
                        # Relative path - resolve relative to project_root
                        resolved = (project_root / path_value).resolve()
                        paths_data[key] = str(resolved)

            # Remove any legacy output_dir keys that might be in the config file BEFORE validation
            paths_data.pop("core_output_dir", None)
            paths_data.pop("sdk_output_dir", None)

            # Always set project_root to the resolved absolute path
            paths_data["project_root"] = str(project_root)

            # Merge with default paths (only input paths - output paths come from folder_structure)
            default_paths = default_config.paths.model_dump()
            default_paths.update(paths_data)
            data["paths"] = default_paths
        else:
            # No paths in config, use defaults (which use project_root)
            data["paths"] = default_config.paths.model_dump()

        # Ensure folder_structure is initialized if not in config file
        if "folder_structure" not in data:
            from cuur_codegen.base.folder_structure import FolderStructureConfig
            data["folder_structure"] = FolderStructureConfig().model_dump()

        return cls(**data)

    @classmethod
    def default(cls, project_root: Path) -> "Config":
        """Create default configuration"""
        from cuur_codegen.base.folder_structure import FolderStructureConfig

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
        instead of accessing paths.core_output_dir or paths.sdk_output_dir directly.
        """
        if not self.folder_structure:
            # Fallback to default folder structure if not configured
            from cuur_codegen.base.folder_structure import FolderStructureConfig
            self.folder_structure = FolderStructureConfig()

        layer_config = self.folder_structure.get_layer_config(layer)
        return self.paths.project_root / layer_config.base_path
