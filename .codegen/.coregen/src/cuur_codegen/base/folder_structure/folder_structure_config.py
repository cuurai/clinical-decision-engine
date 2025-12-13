"""
Folder Structure Configuration - Main Coordinator

Aggregates all layer configurations into a single FolderStructureConfig.
Each layer's configuration is defined in its own module for maintainability.
"""

from typing import Dict, Optional
from pathlib import Path
import os
from pydantic import BaseModel, Field

from cuur_codegen.base.folder_structure.models import LayerFolderStructure
from cuur_codegen.base.folder_structure.core_config import get_core_layer_config
from cuur_codegen.base.folder_structure.sdk_config import get_sdk_layer_config


class FolderStructureConfig(BaseModel):
    """
    Complete folder structure configuration for all layers.

    Each layer's configuration is defined in its own module:
    - core_config.py: Core layer (handlers, types, schemas_file, converters, schemas, repositories)
    - sdk_config.py: SDK layer (types and schemas extractors)

    This modular approach ensures maintainability as the repository evolves.
    """

    # Core layer (handlers, types, schemas_file, converters, schemas, repositories)
    # Generates foundational API code for packages/core
    core: LayerFolderStructure = Field(
        default_factory=get_core_layer_config,
        description="Core layer folder structure",
    )

    # SDK layer (for extractors)
    sdk: LayerFolderStructure = Field(
        default_factory=get_sdk_layer_config,
        description="SDK layer folder structure",
    )

    def get_layer_config(self, layer: str) -> LayerFolderStructure:
        """Get folder structure configuration for a specific layer"""
        layer_map: Dict[str, LayerFolderStructure] = {
            "core": self.core,
            "base": self.core,  # Alias for backward compatibility
            "sdk": self.sdk,
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

        # Build path: project_root / layer_base_path / domain_name / generator_output_dir
        path = project_root / layer_config.base_path / domain_name / generator_config.output_dir

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
            "schema": "schemas",  # Property name stays "schemas", but paths point to "models" folder
            "schemas_file": "schemas",
            "converter": "converters",
            "index_builder": "index_builder",
            "openapi_typescript_extractor": "types",
            "openapi_zod_client_extractor": "schemas",
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
            layer: The layer name (e.g., "core" or "sdk")
            to_generator: The target generator type (e.g., "schemas_file")
            domain_name: The domain name (e.g., "observability")
            domain_root: The domain root directory (e.g., Path("packages/core/src/observability"))

        Returns:
            Relative import path string (e.g., "../../../schemas/{domain}.schemas")
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
                "schemas_file": "schemas",
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
