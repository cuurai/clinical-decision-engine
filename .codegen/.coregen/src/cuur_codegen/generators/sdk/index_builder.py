"""
SDK Index Builder Generator - Generates domains/index.ts barrel export for SDK
"""

from pathlib import Path
from typing import List

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.utils.file import ensure_directory, write_file, file_exists


class SdkIndexBuilderGenerator(BaseGenerator):
    """Generates SDK domains/index.ts barrel export file"""

    @property
    def name(self) -> str:
        return "SDK Index Builder Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "sdk_index_builder"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate SDK domains/index.ts barrel export"""
        # Don't validate context - we don't need spec for index generation
        if not context.config:
            raise ValueError("Config is required")

        files: List[Path] = []
        warnings: List[str] = []

        # Get SDK domains directory (in src/domains/)
        project_root = context.config.paths.project_root.resolve()

        # Domain clients are in packages/sdk/src/domains/
        domains_dir = project_root / "packages" / "sdk" / "src" / "domains"
        ensure_directory(domains_dir)

        # Generate domains/index.ts (in src/domains/)
        index_file = domains_dir / "index.ts"
        index_content = self._generate_domains_index(context, domains_dir)
        write_file(index_file, index_content)
        files.append(index_file)

        return GenerateResult(files=files, warnings=warnings)

    def _generate_domains_index(self, context: GenerationContext, domains_dir: Path) -> str:
        """Generate domains/index.ts with exports for all domain clients"""
        header = self.generate_header(context, "SDK Domain Clients - Barrel Export")

        # Find all domain client files
        client_files = sorted(domains_dir.glob("*.client.ts"))

        exports = []
        for client_file in client_files:
            domain_name = client_file.stem.replace(".client", "")
            class_name = self._get_client_class_name(domain_name)
            export_name = client_file.stem.replace(".client", "")

            exports.append(f'export {{ {class_name} }} from "./{export_name}.client.js";')

        if not exports:
            exports.append("// No domain clients found")

        return f"""{header}{chr(10).join(exports)}
"""

    def _get_client_class_name(self, domain_name: str) -> str:
        """Get the client class name from domain name"""
        # Convert kebab-case to PascalCase
        parts = domain_name.split("-")
        return "".join(word.capitalize() for word in parts) + "Client"
