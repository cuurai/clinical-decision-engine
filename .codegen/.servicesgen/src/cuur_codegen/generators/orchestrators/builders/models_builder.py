"""
Models Builder - Generates model files
"""

from pathlib import Path
from typing import List, Dict, Any
from cuur_codegen.utils.file import ensure_directory


class ModelsBuilder:
    """Builds model files"""

    @staticmethod
    def generate_models(output_dir: Path, domain_name: str, spec: Dict[str, Any]) -> List[Path]:
        """Generate model files"""
        models_dir = output_dir / "models"
        ensure_directory(models_dir)

        files = []
        # TODO: Extract request/response models from OpenAPI spec
        return files
