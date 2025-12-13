"""
Generator Setup Utilities - Common setup patterns for generators
"""

from pathlib import Path
from typing import Optional

from pathlib import Path
from typing import Optional

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.layer_folder_structure import FolderStructureConfig
from cuur_codegen.utils.file import ensure_directory, clean_directory


class GeneratorSetup:
    """Common setup utilities for generators"""

    @staticmethod
    def get_output_directory(
        context: GenerationContext,
        generator_type: str,
        layer: str = "services",
        clean: bool = True,
    ) -> Path:
        """
        Get and setup output directory for a generator.

        Args:
            context: Generation context
            generator_type: Type of generator (e.g., "service", "adapter", "test")
            layer: Layer name (default: "services")
            clean: Whether to clean the directory before use (default: True)

        Returns:
            Path to output directory
        """
        # Use FolderStructureConfig from config (single source of truth for output paths)
        folder_config = context.config.folder_structure
        if not folder_config:
            # Fallback to default if not configured
            folder_config = FolderStructureConfig()

        output_dir = folder_config.get_layer_output_path(
            project_root=context.config.paths.project_root,
            layer=layer,
            domain_name=context.domain_name,
            generator_type=generator_type,
        )
        ensure_directory(output_dir)
        if clean:
            clean_directory(output_dir)
        return output_dir

    @staticmethod
    def get_output_directory_no_clean(
        context: GenerationContext,
        generator_type: str,
        layer: str = "services",
    ) -> Path:
        """
        Get output directory without cleaning (for generators that manage cleanup themselves).

        Args:
            context: Generation context
            generator_type: Type of generator
            layer: Layer name (default: "services")

        Returns:
            Path to output directory
        """
        return GeneratorSetup.get_output_directory(
            context, generator_type, layer, clean=False
        )
