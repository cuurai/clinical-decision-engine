"""
OpenAPI Zod Client Extractor - Extracts Zod schemas from bundled OpenAPI JSON files

Uses openapi-zod-client to extract Zod schemas from bundled OpenAPI JSON files.
Outputs to: packages/core/src/{domain}/openapi/{domain}.zod.schema.ts

This extractor is modular and standalone - can be invoked directly or via pipeline.
"""

from pathlib import Path
from typing import List
import subprocess

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.errors import GenerationError
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.file import ensure_directory, file_exists


class OpenApiZodClientExtractor(BaseGenerator):
    """Extracts Zod schemas from bundled OpenAPI JSON files using openapi-zod-client"""

    @property
    def name(self) -> str:
        return "OpenAPI Zod Client Extractor"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "openapi_zod_client_extractor"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Extract Zod schemas from bundled JSON file"""
        self.validate_context(context)

        files: List[Path] = []
        warnings: List[str] = []

        # Get bundled spec path (resolve to absolute path)
        bundled_path = context.bundled_path.resolve() if not context.bundled_path.is_absolute() else context.bundled_path
        if not file_exists(bundled_path):
            raise GenerationError(
                f"Bundled OpenAPI spec not found: {bundled_path}",
                context.domain_name,
                self.type,
            )

        # Determine output path based on which layer is enabled
        project_root = context.config.paths.project_root.resolve()
        folder_config = FolderStructureConfig()

        # Check if SDK layer is enabled (for SDK-only mode)
        sdk_config = getattr(context.config.layers, 'sdk', None)
        sdk_enabled = sdk_config and sdk_config.enabled

        # Check if core layer is enabled
        core_layer_config = folder_config.get_layer_config("core")
        core_layer = getattr(context.config.layers, 'core', None) or getattr(context.config.layers, 'base', None)
        core_enabled = core_layer and any([
            core_layer.handlers.enabled,
            core_layer.types.enabled,
            core_layer.schemas_file.enabled,
            core_layer.converters.enabled,
            core_layer.schemas.enabled if hasattr(core_layer, 'schemas') else False,
        ])

        # Use SDK layer path if SDK is enabled and core is not, otherwise use core path
        if sdk_enabled and not core_enabled:
            # SDK layer: packages/sdk/src/openapi/schemas/{domain}.zod.schema.ts
            sdk_layer_config = folder_config.get_layer_config("sdk")
            schemas_config = sdk_layer_config.get_generator_config("openapi_zod_client_extractor")
            if schemas_config:
                output_dir = project_root / sdk_layer_config.base_path / schemas_config.output_dir
            else:
                output_dir = project_root / sdk_layer_config.base_path / "schemas"
            ensure_directory(output_dir)
            schemas_file = output_dir / f"{context.domain_name}.zod.schema.ts"
        else:
            # Core layer: packages/core/src/{domain}/openapi/{domain}.zod.schema.ts
            domain_dir = project_root / core_layer_config.base_path / context.domain_name
            output_dir = domain_dir / "openapi"
            ensure_directory(output_dir)
            schemas_file = output_dir / f"{context.domain_name}.zod.schema.ts"
        schemas_file = schemas_file.resolve()

        # Base URL - use SDK config if available, otherwise default
        sdk_config = getattr(context.config.layers, 'sdk', None)
        base_url = sdk_config.base_url if sdk_config and sdk_config.base_url else "https://api.quub.exchange/v2"

        self.logger.info(f"Extracting Zod schemas for {context.domain_name}...")

        # Run openapi-zod-client (without --client flag for schemas only)
        cmd = [
            "npx",
            "--yes",
            "openapi-zod-client@latest",
            str(bundled_path),
            "-o",
            str(schemas_file),
            "--baseUrl",
            base_url,
        ]

        try:
            result = subprocess.run(
                cmd,
                cwd=str(context.config.paths.project_root),
                capture_output=True,
                text=True,
                check=True,
            )
            if file_exists(schemas_file):
                files.append(schemas_file)
                self.logger.info(f"✅ Extracted Zod schemas: {schemas_file}")
            else:
                warnings.append(f"Zod schemas file was not created: {schemas_file}")
        except subprocess.CalledProcessError as e:
            raise GenerationError(
                f"Failed to extract Zod schemas: {e.stderr}",
                context.domain_name,
                self.type,
            )

        return GenerateResult(files=files, warnings=warnings)
