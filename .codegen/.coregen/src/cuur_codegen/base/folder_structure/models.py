"""
Base models for folder structure configuration

Shared models used across all layer configurations.
"""

from typing import Dict, Optional
from pydantic import BaseModel, Field


class ImportPathConfig(BaseModel):
    """Configuration for import paths relative to a generator's output location"""

    # Paths to other generators' outputs (within same layer)
    types: Optional[str] = Field(None, description="Path to types directory")
    repositories: Optional[str] = Field(None, description="Path to repositories directory")
    handlers: Optional[str] = Field(None, description="Path to handlers directory")
    schemas: Optional[str] = Field(None, description="Path to schemas directory")
    schemas_file: Optional[str] = Field(None, description="Path to schemas directory", alias="validators")
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

    # Generator folder configurations (core generators only)
    handlers: Optional[GeneratorFolderConfig] = Field(None, description="Handler generator folder structure")
    repositories: Optional[GeneratorFolderConfig] = Field(None, description="Repository generator folder structure")
    types: Optional[GeneratorFolderConfig] = Field(None, description="Types generator folder structure")
    schemas: Optional[GeneratorFolderConfig] = Field(None, description="Schema generator folder structure")
    schemas_file: Optional[GeneratorFolderConfig] = Field(None, description="Schemas generator folder structure")
    converters: Optional[GeneratorFolderConfig] = Field(None, description="Converter generator folder structure")
    index_builder: Optional[GeneratorFolderConfig] = Field(None, description="Index builder generator folder structure")

    def get_generator_config(self, generator_type: str) -> Optional[GeneratorFolderConfig]:
        """Get folder configuration for a specific generator type"""
        config_map: Dict[str, Optional[GeneratorFolderConfig]] = {
            "handler": self.handlers,
            "repository": self.repositories,
            "types": self.types,
            "schema": self.schemas,
            "schemas_file": self.schemas_file,
            "converter": self.converters,
            "index_builder": self.index_builder,
            # SDK extractors and generators
            "openapi_typescript_extractor": self.types,
            "openapi_zod_client_extractor": self.schemas,
            "domain_client": self.handlers,  # Domain clients use handlers config in SDK layer
        }
        return config_map.get(generator_type)
