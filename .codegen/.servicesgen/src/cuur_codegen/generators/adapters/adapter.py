"""
Adapter Generator - Generates DAO repository implementations
"""

from pathlib import Path
from typing import List, Optional

from cuur_codegen.base.generator_bases import FileGenerator
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import kebab_case
from cuur_codegen.utils.file import write_file

from .builders import (
    RepositoryDiscovery,
    RepositoryBuilder,
    IndexBuilder,
    MethodBuilder
)
# Import Prisma builders for schema generation
from cuur_codegen.generators.prisma.builders import PrismaSchemaBuilder


class AdapterGenerator(FileGenerator):
    """Generates DAO repository implementations for adapters package"""

    @property
    def name(self) -> str:
        return "Adapter Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "adapter"

    def should_clean(self) -> bool:
        """Don't clean adapter directory - we want to keep existing files"""
        return False

    def generate_files(
        self, context: GenerationContext, output_dir: Path
    ) -> List[Path]:
        """
        Generate adapter repository files and Prisma schema.

        Args:
            context: Generation context
            output_dir: Output directory (adapters/{domain})

        Returns:
            List of generated file paths
        """
        files: List[Path] = []

        # CRITICAL: Skip orchestrator domains - adapters should ONLY be generated for core domains
        # This check MUST happen before any directory creation or file generation
        if self._is_orchestrator_domain(context.domain_name, context):
            context.logger.warn(
                f"⚠️  SKIPPING adapter generation for orchestrator domain: {context.domain_name}. "
                "Adapters are ONLY generated for core domains. "
                "Orchestrator domains use adapters from their core domains."
            )
            # Return empty list - no files generated
            return files

        # Ensure output directory exists (don't clean - files are written here)
        from cuur_codegen.utils.file import ensure_directory, clean_directory, write_file
        ensure_directory(output_dir)
        context.logger.debug(f"Output directory: {output_dir}")

        # Generate Prisma schema first (before repositories)
        prisma_files = self._generate_prisma_schema(context, output_dir)
        files.extend(prisma_files)

        # Discover repositories from core
        # Use FolderStructureConfig to get core output path
        # For adapters, we need to find repositories in the core package
        # Core package is typically at packages/core/src relative to project root
        # But project_root might be platform/, so we need to go up to find core
        folder_config = context.config.folder_structure
        if not folder_config:
            from cuur_codegen.core.layer_folder_structure import FolderStructureConfig
            folder_config = FolderStructureConfig()

        # Try to find core package - check if packages/core/src exists relative to project_root
        core_base = context.config.paths.project_root / "packages" / "core" / "src"
        if not core_base.exists():
            # If not found, try going up one level (project_root might be platform/)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "src"
        if not core_base.exists():
            # If still not found, try submodule structure (packages/core/packages/core/src)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "packages" / "core" / "src"

        if not core_base.exists():
            context.logger.error(f"Core package not found. Tried: {core_base}")
            return files

        core_package_path = core_base.resolve()
        context.logger.debug(f"Looking for repositories in: {core_package_path}")
        repositories = RepositoryDiscovery.discover_repositories(
            context.domain_name,
            core_package_path
        )

        context.logger.info(f"Discovered {len(repositories)} repositories for {context.domain_name}")
        if not repositories:
            context.logger.warn(f"No repositories found for domain {context.domain_name} in {core_package_path}")
            return files

        # Generate DAO repository files
        context.logger.info(f"Generating {len(repositories)} DAO repository files in {output_dir}")
        for repo in repositories:
            from cuur_codegen.utils.string import kebab_case
            # Pattern: {resource-name}.dao.repository.ts (e.g., auth-account.dao.repository.ts)
            repo_file = output_dir / f"{kebab_case(repo.name)}.dao.repository.ts"
            context.logger.info(f"Generating {repo_file.name} for {repo.interface_name}")
            try:
                # Extract entity fields from OpenAPI spec for selective queries
                entity_fields = MethodBuilder._extract_entity_fields(repo.entity_name, context.spec)

                repo_header = self.generate_header(
                    context,
                    f"DAO adapter for {repo.interface_name}"
                )
                repo_content = RepositoryBuilder.build_repository_file(
                    repo,
                    repo_header,
                    core_package_path,
                    entity_fields
                )
                write_file(repo_file, repo_content)
                # Verify file was written
                if not repo_file.exists():
                    context.logger.error(f"File {repo_file} was not created after write_file!")
                else:
                    file_size = repo_file.stat().st_size
                    context.logger.info(f"✓ Generated {repo_file.name} ({file_size} bytes)")
                files.append(repo_file)
            except Exception as e:
                context.logger.error(f"Failed to generate {repo_file.name}: {e}")
                import traceback
                context.logger.debug(traceback.format_exc())
                continue

        return files

    def generate_index(
        self,
        context: GenerationContext,
        output_dir: Path,
        files: List[Path],
    ) -> Optional[Path]:
        """
        Generate custom index file using IndexBuilder.

        Args:
            context: Generation context
            output_dir: Output directory
            files: List of generated files

        Returns:
            Path to index file or None if not generated
        """
        # CRITICAL: Skip orchestrator domains - adapters should ONLY be generated for core domains
        # This check MUST happen before any index generation
        if self._is_orchestrator_domain(context.domain_name, context):
            context.logger.debug(
                f"Skipping index generation for orchestrator domain: {context.domain_name}. "
                "Adapters are only generated for core domains."
            )
            return None

        # Discover repositories again for index generation
        # Use same logic as generate_files
        core_base = context.config.paths.project_root / "packages" / "core" / "src"
        if not core_base.exists():
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "src"
        if not core_base.exists():
            # If still not found, try submodule structure (packages/core/packages/core/src)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "packages" / "core" / "src"
        core_package_path = core_base
        repositories = RepositoryDiscovery.discover_repositories(
            context.domain_name,
            core_package_path
        )

        if not repositories:
            return None

        # Generate index file using custom builder
        index_file = output_dir / "index.ts"
        index_header = self.generate_header(
            context,
            f"Adapter barrel exports for {context.domain_name}"
        )
        index_content = IndexBuilder.build_index_file(repositories, index_header)
        write_file(index_file, index_content)
        return index_file

    @staticmethod
    def _is_orchestrator_domain(domain_name: str, context: GenerationContext) -> bool:
        """Check if domain is an orchestrator domain"""
        try:
            from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config
            orchestrator_config = load_orchestrator_domains_config(context.config.paths.project_root)
            orchestrator_domain_names = {d.name for d in orchestrator_config.orchestrator_domains}
            return domain_name in orchestrator_domain_names
        except FileNotFoundError:
            # Check if flows directory exists (heuristic)
            flows_path = context.config.paths.project_root / "platform" / "orchestrators" / "domains" / "src" / domain_name / "flows"
            if flows_path.exists():
                return True
            # Also check without platform/ prefix
            flows_path = context.config.paths.project_root / "orchestrators" / "domains" / "src" / domain_name / "flows"
            return flows_path.exists()

    def _generate_prisma_schema(
        self, context: GenerationContext, output_dir: Path
    ) -> List[Path]:
        """
        Generate Prisma schema file as part of adapter generation.

        Args:
            context: Generation context
            output_dir: Output directory (adapters/{domain})

        Returns:
            List of generated file paths (Prisma schema file)
        """
        files: List[Path] = []

        # Prisma schema should be in adapters/{domain}/prisma/schema.prisma
        prisma_dir = output_dir / "prisma"

        # Clean only the prisma subdirectory, not the entire domain directory
        # This prevents deleting DAO repository files
        from cuur_codegen.utils.file import ensure_directory, clean_directory, write_file
        if prisma_dir.exists():
            clean_directory(prisma_dir)

        ensure_directory(prisma_dir)

        schema_file = prisma_dir / "schema.prisma"

        # Generate schema content
        # Prisma only supports // comments, not /** */ block comments
        schema_header = f"""// Prisma schema for database models
// Generated by Adapter Generator v{self.version}
// Domain: {context.domain_name}
//
// ⚠️  DO NOT EDIT THIS FILE MANUALLY
// This file is auto-generated. Any manual changes will be overwritten.

"""

        schema_content = PrismaSchemaBuilder.build_schema(
            context,
            schema_header
        )

        write_file(schema_file, schema_content)
        files.append(schema_file)
        context.logger.info(f"✓ Generated Prisma schema: {schema_file.name}")

        return files
