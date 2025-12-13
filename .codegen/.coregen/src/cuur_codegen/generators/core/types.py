"""
Types Generator - Generates TypeScript type exports
"""

from pathlib import Path
from typing import Dict, Any, List, Set
from cuur_codegen.utils.string import pascal_case, extract_verb_from_operation_id

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.utils.openapi import (
    extract_schemas,
    extract_operations,
    get_request_body_schema_name,
    get_response_schema_name,
)
from cuur_codegen.utils.file import write_file
from cuur_codegen.utils.generator_setup import GeneratorSetup
from cuur_codegen.generators.core.types_builder.types_builder import TypesBuilder


class TypesGenerator(BaseGenerator):
    """Generates TypeScript type exports from OpenAPI types"""

    @property
    def name(self) -> str:
        return "Types Generator"

    @property
    def version(self) -> str:
        return "2.0.0"

    @property
    def type(self) -> str:
        return "types"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate types file"""
        self.validate_context(context)

        files: List[Path] = []
        warnings: List[str] = []

        # Get output directory using GeneratorSetup helper
        output_dir = GeneratorSetup.get_output_directory(
            context, generator_type="types", clean=False
        )

        # Generate types file at types/index.ts
        types_file = output_dir / "index.ts"

        # Remove old types.ts file at domain root if it exists (legacy)
        # Use get_output_dir to get base domain directory
        domain_dir = context.config.get_output_dir("core") / context.domain_name
        legacy_types_file = domain_dir / "types.ts"
        if legacy_types_file.exists():
            legacy_types_file.unlink()

        content = TypesBuilder.build_types_file_content(context, self.version)
        write_file(types_file, content)
        files.append(types_file)

        # Also generate a domain types export file that excludes components/operations for main index.ts
        # This allows main index to export types without duplicate components/operations errors
        domain_types_file = output_dir / f"{context.domain_name}.domain.types.ts"
        domain_content = TypesBuilder.build_flat_types_file_content(context, self.version)
        write_file(domain_types_file, domain_content)
        files.append(domain_types_file)

        return GenerateResult(files=files, warnings=warnings)


    # Old monolithic methods removed - now using modular components:
    # - TypesBuilder.build_types_file_content() replaces _generate_types_file()
    # - TypesBuilder handles all type generation logic
