"""
Folder Structure Configuration

Modular folder structure configuration - each layer has its own config module.
This ensures maintainability as the repository evolves and directories move around.
"""

from cuur_codegen.base.folder_structure.models import (
    ImportPathConfig,
    GeneratorFolderConfig,
    LayerFolderStructure,
)
from cuur_codegen.base.folder_structure.folder_structure_config import FolderStructureConfig

__all__ = [
    "ImportPathConfig",
    "GeneratorFolderConfig",
    "LayerFolderStructure",
    "FolderStructureConfig",
]
