"""
Adapters Main Index Builder - Utility for building main adapters index.ts file

This is a shared utility, not a generator. It builds the main barrel export file
for the adapters package after all domains have been processed.
"""

from pathlib import Path
from typing import List, Optional
import re

from cuur_codegen.core.config import Config
from cuur_codegen.core.logger import Logger
from cuur_codegen.utils.file import ensure_directory, write_file


class AdaptersIndexBuilder:
    """Utility for building the main adapters index.ts barrel export file"""

    def __init__(self, logger: Optional[Logger] = None):
        """
        Initialize the adapters index builder.

        Args:
            logger: Optional logger instance
        """
        self.logger = logger

    def build_main_index(
        self, config: Config, all_domains: Optional[List[str]] = None
    ) -> tuple[List[Path], List[str], List[str]]:
        """
        Build main index.ts file after all domains are processed.

        Args:
            config: Configuration object
            all_domains: Optional list of domain names (will be discovered if not provided)

        Returns:
            Tuple of (files, warnings, errors)
        """
        files: List[Path] = []
        warnings: List[str] = []
        errors: List[str] = []

        try:
            # Use FolderStructureConfig to get adapters output path
            folder_config = config.folder_structure
            if not folder_config:
                from cuur_codegen.core.layer_folder_structure import FolderStructureConfig
                folder_config = FolderStructureConfig()
            adapters_base = config.paths.project_root / folder_config.get_layer_config("adapters").base_path
            ensure_directory(adapters_base)

            # Always discover ALL domains from filesystem to ensure complete exports
            # This ensures the main index.ts exports all domains, not just ones processed in current run
            # NOTE: _discover_domains() automatically filters out orchestrator domains
            discovered_domains = self._discover_domains(adapters_base, config.paths.project_root)

            # Use discovered domains, or merge with provided domains if any
            if all_domains:
                # CRITICAL: Filter out orchestrator domains from provided list
                # Adapters should ONLY include core domains, never orchestrator domains
                filtered_provided_domains = [
                    d for d in all_domains
                    if not self._is_orchestrator_domain(d, config.paths.project_root)
                ]
                if len(filtered_provided_domains) < len(all_domains):
                    filtered_count = len(all_domains) - len(filtered_provided_domains)
                    if self.logger:
                        self.logger.warn(
                            f"Filtered out {filtered_count} orchestrator domain(s) from adapters main index. "
                            "Adapters are only generated for core domains."
                        )
                # Merge and deduplicate
                all_domains = sorted(list(set(discovered_domains + filtered_provided_domains)))
            else:
                all_domains = discovered_domains

            if not all_domains:
                warnings.append("No domains found to export")
                return files, warnings, errors

            # Generate main index file
            main_index_file = adapters_base / "index.ts"
            main_index_content = self._generate_main_index_content(config, all_domains)
            write_file(main_index_file, main_index_content)
            files.append(main_index_file)

            if self.logger:
                self.logger.debug(f"Generated adapters main index: {main_index_file}")

        except Exception as e:
            errors.append(str(e))
            if self.logger:
                self.logger.error(f"Failed to generate main index: {str(e)}")

        return files, warnings, errors

    def _is_orchestrator_domain(self, domain_name: str, project_root: Path) -> bool:
        """Check if domain is an orchestrator domain"""
        try:
            from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config
            orchestrator_config = load_orchestrator_domains_config(project_root)
            orchestrator_domain_names = {d.name for d in orchestrator_config.orchestrator_domains}
            return domain_name in orchestrator_domain_names
        except FileNotFoundError:
            # Check if flows directory exists (heuristic)
            flows_path = project_root / "platform" / "orchestrators" / "domains" / "src" / domain_name / "flows"
            if flows_path.exists():
                return True
            flows_path = project_root / "orchestrators" / "domains" / "src" / domain_name / "flows"
            return flows_path.exists()

    def _discover_domains(self, adapters_base: Path, project_root: Path) -> List[str]:
        """Discover all domains from the adapters output directory, excluding orchestrator domains"""
        domains = []
        if not adapters_base.exists():
            return domains

        for item in adapters_base.iterdir():
            # Skip non-directories and special directories
            if not item.is_dir() or item.name in ["shared", "common", "resource-prefixes", ".git"]:
                continue

            # Skip orchestrator domains - adapters should only be for core domains
            if self._is_orchestrator_domain(item.name, project_root):
                continue

            # Check if it has an index.ts file (indicates it's a domain)
            if (item / "index.ts").exists():
                domains.append(item.name)

        return sorted(domains)

    def _generate_main_index_content(self, config: Config, domains: List[str]) -> str:
        """Generate main index.ts content"""
        header = """/**
 * Main Adapters Package Index
 *
 * Auto-generated by AdaptersIndexBuilder
 *
 * ⚠️  DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated. Any manual changes will be overwritten.
 */

/**
 * @quub/adapters - Main Barrel Export
 *
 * Central export point for all adapter implementations (DAO repositories)
 * Organized by domain for easy importing
 *
 * Usage:
 *   // Import adapters directly (recommended)
 *   import { DaoWalletRepository, DaoChainRepository } from "@quub/adapters";
 *
 *   // Or import from a specific domain subpath
 *   import { DaoWalletRepository, DaoChainRepository } from "@quub/adapters/blockchain";
 *
 *   // Or import as namespace
 *   import { blockchain } from "@quub/adapters";
 *   const { DaoWalletRepository } = blockchain;
 */

"""

        # Generate domain namespace exports
        domain_namespace_exports = []
        for domain in domains:
            domain_namespace_exports.append(f"export * as {domain.replace('-', '_')} from \"./{domain}/index.js\";")

        # Generate individual class exports (re-export all DAO classes from each domain)
        individual_exports = []
        folder_config = config.folder_structure
        if not folder_config:
            from cuur_codegen.core.layer_folder_structure import FolderStructureConfig
            folder_config = FolderStructureConfig()
        adapters_base = config.paths.project_root / folder_config.get_layer_config("adapters").base_path

        for domain in domains:
            domain_index = adapters_base / domain / "index.ts"
            if domain_index.exists():
                # Read the domain index to get all exports
                content = domain_index.read_text()
                # Extract all exports: export { DaoXxxRepository } from ...
                pattern = r'export\s+\{\s*([^}]+)\s*\}\s+from'
                matches = re.findall(pattern, content)
                for match in matches:
                    # Split by comma and clean up
                    exports = [e.strip() for e in match.split(',')]
                    for export_name in exports:
                        if export_name.strip():
                            individual_exports.append(f"export {{ {export_name.strip()} }} from \"./{domain}/index.js\";")

        return f"""{header}// ============================================================================
// INDIVIDUAL EXPORTS (Direct imports)
// ============================================================================
// Export all DAO classes directly for convenient importing

{chr(10).join(sorted(set(individual_exports)))}

// ============================================================================
// DOMAIN NAMESPACE EXPORTS
// ============================================================================
// Export adapters from each domain as namespaces

{chr(10).join(domain_namespace_exports)}
"""
