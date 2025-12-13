"""
Folder Structure Configuration

Defines the folder structure and import paths for all generators by layer.
Each layer (core, adapters, services, tests) has its own folder structure
and base path relative to project root.
"""

from typing import Dict, Optional
from pathlib import Path
import os
from pydantic import BaseModel, Field


class ImportPathConfig(BaseModel):
    """Configuration for import paths relative to a generator's output location"""

    # Paths to other generators' outputs (within same layer)
    types: Optional[str] = Field(None, description="Path to types directory")
    repositories: Optional[str] = Field(None, description="Path to repositories directory")
    handlers: Optional[str] = Field(None, description="Path to handlers directory")
    schemas: Optional[str] = Field(None, description="Path to schemas directory")
    validators: Optional[str] = Field(None, description="Path to validators directory")
    converters: Optional[str] = Field(None, description="Path to converters directory")

    # Shared paths (cross-layer)
    shared_helpers: str = Field(description="Path to shared helpers")
    shared_repositories: str = Field(description="Path to shared repositories")
    shared_types: str = Field(description="Path to shared generated types")


class GeneratorFolderConfig(BaseModel):
    """Configuration for a single generator's folder structure"""

    # Output directory name (relative to layer base path)
    output_dir: str = Field(description="Output directory name (e.g., 'handlers', 'types')")

    # File patterns (optional, for generators that create subdirectories)
    subdirectory_pattern: Optional[str] = Field(
        None,
        description="Pattern for subdirectories (e.g., '{resource}/' for handlers)"
    )

    # Main file name (if generator creates a single main file)
    main_file: Optional[str] = Field(
        None,
        description="Main file name (e.g., 'index.ts' for types)"
    )

    # Import paths from this generator's output location
    imports: ImportPathConfig = Field(description="Import paths relative to this generator's output")


class LayerFolderStructure(BaseModel):
    """Folder structure configuration for a single layer"""

    # Base path relative to project root (e.g., "packages/core/src")
    base_path: str = Field(description="Base path relative to project root")

    # Generator folder configurations
    handlers: Optional[GeneratorFolderConfig] = Field(None, description="Handler generator folder structure")
    repositories: Optional[GeneratorFolderConfig] = Field(None, description="Repository generator folder structure")
    types: Optional[GeneratorFolderConfig] = Field(None, description="Types generator folder structure")
    schemas: Optional[GeneratorFolderConfig] = Field(None, description="Schema generator folder structure")
    validators: Optional[GeneratorFolderConfig] = Field(None, description="Validator generator folder structure")
    converters: Optional[GeneratorFolderConfig] = Field(None, description="Converter generator folder structure")
    service: Optional[GeneratorFolderConfig] = Field(None, description="Service generator folder structure")
    prisma: Optional[GeneratorFolderConfig] = Field(None, description="Prisma generator folder structure")
    test: Optional[GeneratorFolderConfig] = Field(None, description="Test generator folder structure")
    index_builder: Optional[GeneratorFolderConfig] = Field(None, description="Index builder generator folder structure")

    def get_generator_config(self, generator_type: str) -> Optional[GeneratorFolderConfig]:
        """Get folder configuration for a specific generator type"""
        config_map: Dict[str, Optional[GeneratorFolderConfig]] = {
            "handler": self.handlers,
            "repository": self.repositories,
            "adapter": self.repositories,  # Adapter generator uses repositories config
            "types": self.types,
            "schema": self.schemas,
            "validator": self.validators,
            "converter": self.converters,
            "service": self.service,
            "prisma": self.prisma,
            "test": self.test,
            "tests": self.test,  # Alias for test
            "index_builder": self.index_builder,
            # Orchestrator generators
            "orchestrator_service_client": self.service,  # Uses service config
            "orchestrator_aggregator": self.service,  # Uses service config
            "orchestrator_rest_routes": self.service,  # Uses service config
            "orchestrator_graphql": self.service,  # Uses service config
            "orchestrator_websocket": self.service,  # Uses service config
            "orchestrator_flow": self.handlers,  # Uses handlers config (outputs to {domain}/)
        }
        return config_map.get(generator_type)


class FolderStructureConfig(BaseModel):
    """Complete folder structure configuration for all layers"""

    # Core layer (handlers, types, validators, converters, schemas, repositories)
    core: LayerFolderStructure = Field(
        default_factory=lambda: LayerFolderStructure(
            base_path="packages/core/src",
            handlers=GeneratorFolderConfig(
                output_dir="handlers",
                subdirectory_pattern="{resource}/",
                imports=ImportPathConfig(
                    types="../../types/index.js",
                    repositories="../../repositories/index.js",
                    handlers="../../handlers/index.js",
                    schemas="../../schemas/index.js",
                    validators="../../validators/openapi-schemas-gen",
                    converters="../../utils/{domain}-converters.js",
                    shared_helpers="../../../shared/helpers/id-generator.js",
                    shared_repositories="../../../shared/repositories/_base-repository.js",
                    shared_types="../../../shared/types/generated-types",
                ),
            ),
            repositories=GeneratorFolderConfig(
                output_dir="repositories",
                main_file="index.ts",
                imports=ImportPathConfig(
                    types="../types/index.js",
                    repositories="../repositories/index.js",
                    handlers="../handlers/index.js",
                    schemas="../schemas/index.js",
                    validators="../validators/openapi-schemas-gen",
                    converters="../utils/{domain}-converters.js",
                    shared_helpers="../../shared/helpers/id-generator.js",
                    shared_repositories="../../shared/repositories/_base-repository.js",
                    shared_types="../../shared/types/generated-types",
                ),
            ),
            types=GeneratorFolderConfig(
                output_dir="types",
                main_file="index.ts",
                imports=ImportPathConfig(
                    types="../types/index.js",
                    repositories="../repositories/index.js",
                    handlers="../handlers/index.js",
                    schemas="../schemas/index.js",
                    validators="../validators/openapi-schemas-gen",
                    converters="../utils/{domain}-converters.js",
                    shared_helpers="../../shared/helpers/id-generator.js",
                    shared_repositories="../../shared/repositories/_base-repository.js",
                    shared_types="../../shared/types/generated-types",
                ),
            ),
            schemas=GeneratorFolderConfig(
                output_dir="schemas",
                subdirectory_pattern="{resource}/",
                imports=ImportPathConfig(
                    types="../../types/index.js",
                    repositories="../../repositories/index.js",
                    handlers="../../handlers/index.js",
                    schemas="../../schemas/index.js",
                    validators="../../validators/openapi-schemas-gen",
                    converters="../../utils/{domain}-converters.js",
                    shared_helpers="../../../shared/helpers/id-generator.js",
                    shared_repositories="../../../shared/repositories/_base-repository.js",
                    shared_types="../../../shared/types/generated-types",
                ),
            ),
            validators=GeneratorFolderConfig(
                output_dir="validators",
                main_file="openapi-schemas-gen.ts",
                imports=ImportPathConfig(
                    types="../types/index.js",
                    repositories="../repositories/index.js",
                    handlers="../handlers/index.js",
                    schemas="../schemas/index.js",
                    validators="../validators/openapi-schemas-gen",
                    converters="../utils/{domain}-converters.js",
                    shared_helpers="../../shared/helpers/id-generator.js",
                    shared_repositories="../../shared/repositories/_base-repository.js",
                    shared_types="../../shared/types/generated-types",
                ),
            ),
            converters=GeneratorFolderConfig(
                output_dir="utils",
                main_file="{domain}-converters.ts",
                imports=ImportPathConfig(
                    types="../types/index.js",
                    repositories="../repositories/index.js",
                    handlers="../handlers/index.js",
                    schemas="../schemas/index.js",
                    validators="../validators/openapi-schemas-gen",
                    converters="../utils/{domain}-converters.js",
                    shared_helpers="../../shared/helpers/core-converters.js",
                    shared_repositories="../../shared/repositories/_base-repository.js",
                    shared_types="../../shared/types/generated-types",
                ),
            ),
        ),
        description="Core layer folder structure",
    )

    # Adapters layer (repositories)
    adapters: LayerFolderStructure = Field(
        default_factory=lambda: LayerFolderStructure(
            base_path="adapters/src",
            repositories=GeneratorFolderConfig(
                output_dir="",
                main_file="index.ts",
                imports=ImportPathConfig(
                    types="@cuur/core",
                    repositories="@cuur/core",
                    handlers="@cuur/core",
                    schemas="@cuur/core",
                    validators="@cuur/core",
                    converters="@cuur/core",
                    shared_helpers="@cuur/core/shared/helpers",
                    shared_repositories="@cuur/core/shared/repositories",
                    shared_types="@cuur/core/shared/types",
                ),
            ),
            prisma=GeneratorFolderConfig(
                output_dir="{domain}",
                main_file="schema.prisma",
                imports=ImportPathConfig(
                    types="@cuur/core",
                    repositories="@cuur/core",
                    handlers="@cuur/core",
                    schemas="@cuur/core",
                    validators="@cuur/core",
                    converters="@cuur/core",
                    shared_helpers="@cuur/core/shared/helpers",
                    shared_repositories="@cuur/core/shared/repositories",
                    shared_types="@cuur/core/shared/types",
                ),
            ),
        ),
        description="Adapters layer folder structure",
    )

    # Services layer
    services: LayerFolderStructure = Field(
        default_factory=lambda: LayerFolderStructure(
            base_path="services/src",
            service=GeneratorFolderConfig(
                output_dir="{domain}",
                main_file="index.ts",
                imports=ImportPathConfig(
                    types="@cuur/core",
                    repositories="@cuur/core",
                    handlers="@cuur/core",
                    schemas="@cuur/core",
                    validators="@cuur/core",
                    converters="@cuur/core",
                    shared_helpers="@cuur/core/shared/helpers",
                    shared_repositories="@cuur/core/shared/repositories",
                    shared_types="@cuur/core/shared/types",
                ),
            ),
            handlers=None,
            repositories=None,
            types=None,
            schemas=None,
            validators=None,
            converters=None,
        ),
        description="Services layer folder structure",
    )

    # Tests layer
    tests: LayerFolderStructure = Field(
        default_factory=lambda: LayerFolderStructure(
            base_path="tests/src",
            test=GeneratorFolderConfig(
                output_dir="",
                subdirectory_pattern="{resource}/",
                imports=ImportPathConfig(
                    types="@cuur/core",
                    repositories="@cuur/core",
                    handlers="@cuur/core",
                    schemas="@cuur/core",
                    validators="@cuur/core",
                    converters="@cuur/core",
                    shared_helpers="@cuur/core/shared/helpers",
                    shared_repositories="@cuur/core/shared/repositories",
                    shared_types="@cuur/core/shared/types",
                ),
            ),
            handlers=None,
            repositories=None,
            types=None,
            schemas=None,
            validators=None,
            converters=None,
        ),
        description="Tests layer folder structure",
    )

    # Orchestrators layer
    orchestrators: LayerFolderStructure = Field(
        default_factory=lambda: LayerFolderStructure(
            base_path="orchestrators/domains/src",
            service=GeneratorFolderConfig(
                output_dir="{domain}/services/clients",
                main_file="index.ts",
                imports=ImportPathConfig(
                    types="@cuur/core",
                    repositories="@cuur/core",
                    handlers="@cuur/core",
                    schemas="@cuur/core",
                    validators="@cuur/core",
                    converters="@cuur/core",
                    shared_helpers="@cuur/core/shared/helpers",
                    shared_repositories="@cuur/core/shared/repositories",
                    shared_types="@cuur/core/shared/types",
                ),
            ),
            handlers=GeneratorFolderConfig(
                output_dir="{domain}",
                main_file="handler.ts",
                imports=ImportPathConfig(
                    types="@cuur/core",
                    repositories="@cuur/core",
                    handlers="@cuur/core",
                    schemas="@cuur/core",
                    validators="@cuur/core",
                    converters="@cuur/core",
                    shared_helpers="@cuur/core/shared/helpers",
                    shared_repositories="@cuur/core/shared/repositories",
                    shared_types="@cuur/core/shared/types",
                ),
            ),
            repositories=None,
            types=None,
            schemas=None,
            validators=None,
            converters=None,
        ),
        description="Orchestrators layer folder structure",
    )

    def get_layer_config(self, layer: str) -> LayerFolderStructure:
        """Get folder structure configuration for a specific layer"""
        layer_map: Dict[str, LayerFolderStructure] = {
            "core": self.core,
            "adapters": self.adapters,
            "prisma": self.adapters,  # Prisma uses adapters folder structure
            "services": self.services,
            "tests": self.tests,
            "orchestrators": self.orchestrators,
        }
        return layer_map.get(layer, self.core)

    def get_layer_output_path(
        self,
        project_root: Path,
        layer: str,
        domain_name: str,
        generator_type: str,
        resource: Optional[str] = None
    ) -> Path:
        """Get the full output path for a generator in a specific layer"""
        layer_config = self.get_layer_config(layer)
        generator_config = layer_config.get_generator_config(generator_type)

        if not generator_config:
            raise ValueError(f"Generator '{generator_type}' not configured for layer '{layer}'")

        # Special handling for tests layer: orchestrator domains go to orchestrators/ subdirectory
        # Core domains go directly to tests/src/core/{domain}/
        if layer == "tests" and generator_type in ("test", "tests"):
            # Check if this is an orchestrator domain
            is_orchestrator = self._is_orchestrator_domain(project_root, domain_name)

            # project_root might be repo root or platform/ directory
            # If project_root name is "platform", it's already platform/, otherwise add it
            if project_root.name == "platform":
                # project_root is already platform/, don't add it again
                if is_orchestrator:
                    base_path = project_root / layer_config.base_path / "orchestrators"
                else:
                    base_path = project_root / layer_config.base_path / "core"
            else:
                # project_root is repo root, add platform/ prefix
                if is_orchestrator:
                    base_path = project_root / "platform" / layer_config.base_path / "orchestrators"
                else:
                    base_path = project_root / "platform" / layer_config.base_path / "core"
        else:
            # For other layers, use the configured base_path
            base_path = project_root / layer_config.base_path

        # Build path: base_path / generator_output_dir
        # Replace {domain} placeholder in output_dir if present
        output_dir = generator_config.output_dir
        if "{domain}" in output_dir:
            output_dir = output_dir.format(domain=domain_name)
            # If output_dir contains domain, don't add domain_name again
            path = base_path / output_dir
        else:
            # Otherwise, add domain_name as subdirectory
            path = base_path / domain_name / output_dir

        if generator_config.subdirectory_pattern and resource:
            # Use NamingConvention for resource directory naming
            from cuur_codegen.utils.naming import NamingConvention
            if generator_type == "handler":
                # Handlers use pluralized, kebab-cased directories
                resource_dir = NamingConvention.handler_directory(resource)
                path = path / resource_dir
            elif generator_type == "schema":
                # Schemas use resource subdirectories
                resource_dir = NamingConvention.handler_directory(resource)  # Same pattern
                path = path / resource_dir
            else:
                # Other generators use the pattern directly
                subdir = generator_config.subdirectory_pattern.format(resource=resource)
                path = path / subdir

        return path

    def _is_orchestrator_domain(self, project_root: Path, domain_name: str) -> bool:
        """Check if a domain is an orchestrator domain"""
        try:
            # project_root might be repo root or platform/ directory
            # Try to find orchestrator config in both locations
            config_paths = [
                project_root / ".servicesgen" / "config" / ".orchestrator-domains.yaml",
            ]

            # If project_root is platform/, also check repo root (parent)
            if project_root.name == "platform":
                config_paths.append(project_root.parent / ".servicesgen" / "config" / ".orchestrator-domains.yaml")

            orchestrator_config_path = None
            for path in config_paths:
                if path.exists():
                    orchestrator_config_path = path
                    break

            if orchestrator_config_path:
                import yaml
                with open(orchestrator_config_path, "r") as f:
                    config = yaml.safe_load(f)
                    orchestrator_domains = config.get("orchestratorDomains", [])
                    return any(d.get("name") == domain_name for d in orchestrator_domains)

            # Fallback: check if flows directory exists (heuristic)
            # If project_root is platform/, flows are at orchestrators/domains/src/{domain}/flows
            # If project_root is repo root, flows are at platform/orchestrators/domains/src/{domain}/flows
            if project_root.name == "platform":
                flows_path = project_root / "orchestrators" / "domains" / "src" / domain_name / "flows"
            else:
                flows_path = project_root / "platform" / "orchestrators" / "domains" / "src" / domain_name / "flows"

            return flows_path.exists()
        except Exception:
            # If anything fails, assume it's not an orchestrator domain
            return False

    def get_layer_import_path(
        self,
        layer: str,
        from_generator: str,
        to_generator: str,
        domain_name: Optional[str] = None,
    ) -> str:
        """Get import path from one generator to another within a specific layer"""
        layer_config = self.get_layer_config(layer)
        from_config = layer_config.get_generator_config(from_generator)

        if not from_config:
            raise ValueError(f"Generator '{from_generator}' not configured for layer '{layer}'")

        # Map generator types to import path keys
        import_map: Dict[str, str] = {
            "handler": "handlers",
            "repository": "repositories",
            "types": "types",
            "schema": "schemas",
            "validator": "validators",
            "converter": "converters",
            "service": "service",
            "test": "test",
            "tests": "test",  # Alias
            "index_builder": "index_builder",
        }

        to_key = import_map.get(to_generator, to_generator)
        import_path = getattr(from_config.imports, to_key, None)

        if not import_path:
            raise ValueError(f"No import path configured from {from_generator} to {to_generator} in layer {layer}")

        # Replace domain placeholder if present
        if domain_name and "{domain}" in import_path:
            import_path = import_path.format(domain=domain_name)

        return import_path

    def get_relative_import_path(
        self,
        from_file_path: Path,
        layer: str,
        to_generator: str,
        domain_name: str,
        domain_root: Path,
    ) -> str:
        """
        Calculate relative import path from a specific file location to another generator's output.

        This method calculates the actual relative path based on file locations,
        accounting for subdirectories (e.g., schemas/{resource}/dto/ or schemas/{resource}/entity/).

        Args:
            from_file_path: The actual file path (absolute or relative to domain_root)
            layer: The layer name (e.g., "core")
            to_generator: The target generator type (e.g., "validator")
            domain_name: The domain name (e.g., "observability")
            domain_root: The domain root directory (e.g., Path("packages/core/src/observability"))

        Returns:
            Relative import path string (e.g., "../../../validators/openapi-schemas-gen")
        """
        layer_config = self.get_layer_config(layer)
        to_config = layer_config.get_generator_config(to_generator)

        if not to_config:
            raise ValueError(f"Generator '{to_generator}' not configured for layer '{layer}'")

        # Get the target directory path
        to_dir = domain_root / to_config.output_dir

        # Get the main file name if configured
        main_file = to_config.main_file
        if main_file and "{domain}" in main_file:
            main_file = main_file.format(domain=domain_name)

        # Calculate relative path from file's directory to target directory
        from_dir = from_file_path.parent

        # Resolve paths relative to domain_root
        # If from_file_path is already absolute, use it as-is
        # Otherwise, resolve it relative to domain_root
        if from_file_path.is_absolute():
            from_dir_abs = Path(from_dir)
        else:
            from_dir_abs = domain_root / from_dir

        # Ensure to_dir is absolute
        if not to_dir.is_absolute():
            to_dir_abs = domain_root / to_dir
        else:
            to_dir_abs = to_dir

        # Calculate relative path
        try:
            rel_path = os.path.relpath(str(to_dir_abs), str(from_dir_abs))

            # Add main file if specified
            if main_file:
                main_file_name = main_file.replace(".ts", "").replace(".js", "")
                rel_path = os.path.join(rel_path, main_file_name)

            # Convert to string with forward slashes (for cross-platform compatibility)
            result = str(rel_path).replace("\\", "/")

            # Remove .js extension if present (user prefers no extension)
            result = result.replace(".js", "")

            return result
        except Exception as e:
            # Fallback to base import path if relative calculation fails
            import_map: Dict[str, str] = {
                "handler": "handlers",
                "repository": "repositories",
                "types": "types",
                "schema": "schemas",
                "validator": "validators",
                "converter": "converters",
            }
            to_key = import_map.get(to_generator, to_generator)
            from_config = layer_config.get_generator_config("schema")  # Assume from schema generator
            if from_config:
                import_path = getattr(from_config.imports, to_key, None)
                if import_path:
                    return import_path.replace(".js", "")
            raise ValueError(f"Could not calculate relative path from {from_file_path} to {to_generator}: {e}")

    def get_layer_shared_import_path(
        self,
        layer: str,
        generator_type: str,
        shared_type: str,
    ) -> str:
        """Get import path to shared resources from a generator in a specific layer"""
        layer_config = self.get_layer_config(layer)
        generator_config = layer_config.get_generator_config(generator_type)

        if not generator_config:
            raise ValueError(f"Generator '{generator_type}' not configured for layer '{layer}'")

        shared_map: Dict[str, str] = {
            "helpers": "shared_helpers",
            "repositories": "shared_repositories",
            "types": "shared_types",
        }

        shared_key = shared_map.get(shared_type, shared_type)
        import_path = getattr(generator_config.imports, shared_key, None)

        if not import_path:
            raise ValueError(f"No shared import path configured for {shared_type} in generator {generator_type} of layer {layer}")

        return import_path
