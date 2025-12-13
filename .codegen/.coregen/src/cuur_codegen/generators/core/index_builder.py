"""
Index Builder Generator - Generates domain-level barrel export (index.ts)
"""

from pathlib import Path
from typing import Dict, Any, List

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.utils.file import ensure_directory, write_file, file_exists


class IndexBuilderGenerator(BaseGenerator):
    """Generates domain-level barrel export (index.ts) files"""

    @property
    def name(self) -> str:
        return "Index Builder Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "index_builder"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate domain-level barrel export (index.ts)"""
        self.validate_context(context)

        files: List[Path] = []
        warnings: List[str] = []

        # Get domain output directory using FolderStructureConfig
        domain_dir = context.config.get_output_dir("core") / context.domain_name
        ensure_directory(domain_dir)

        # Generate domain-level barrel export (index.ts)
        domain_index_file = domain_dir / "index.ts"
        domain_index_content = self._generate_domain_index(context)
        write_file(domain_index_file, domain_index_content)
        files.append(domain_index_file)

        return GenerateResult(files=files, warnings=warnings)

    def _generate_domain_index(self, context: GenerationContext) -> str:
        """Generate domain-level barrel export (index.ts)"""
        domain_name = context.domain_name
        domain_title = domain_name.replace("-", " ").title()
        domain_schemas_name = domain_name.replace("-", "")

        header = self.generate_header(context, f"{domain_title} Component - Core Export")

        # Check if converter file exists
        converter_filename = NamingConvention.converter_filename(domain_name)
        domain_dir = context.config.get_output_dir("core") / domain_name
        converter_file = domain_dir / "utils" / converter_filename
        converter_export = ""
        if file_exists(converter_file):
            converter_base = converter_filename.replace(".ts", "")
            converter_export = f"\n// Converters\nexport * from \"./utils/{converter_base}.js\";"

        return f"""{header}// Types (Domain layer with Date objects + API operation types)
export * from "./types/index.js";

// Repository Interfaces (only if domain has repositories)
export * from "./repositories/index.js";

// Handlers (API layer - pure functions, no schemas)
export * from "./handlers/index.js";

// Schemas (Zod schemas from OpenAPI) - domain-specific export name
export {{ schemas as {domain_schemas_name}Schemas }} from "./schemas/{domain_name}.schemas.js";{converter_export}
"""
