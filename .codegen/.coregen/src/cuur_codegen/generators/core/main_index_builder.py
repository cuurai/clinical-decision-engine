"""
Main Index Builder Generator - Generates the main packages/core/src/index.ts file
"""

from pathlib import Path
from typing import List, Set, Optional, Dict

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.utils.file import ensure_directory, write_file, file_exists


class MainIndexBuilderGenerator(BaseGenerator):
    """Generates the main packages/core/src/index.ts barrel export file"""

    @property
    def name(self) -> str:
        return "Main Index Builder Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "main_index_builder"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate method required by BaseGenerator (not used for main index)"""
        # This generator is called directly via generate_main_index, not through the normal pipeline
        raise NotImplementedError("Use generate_main_index() instead")

    def generate_main_index(self, config, all_domains: Optional[List[str]] = None) -> GenerateResult:
        """Generate main index.ts file after all domains are processed"""
        files: List[Path] = []
        warnings: List[str] = []
        errors: List[str] = []

        try:
            # Get core output directory using get_output_dir
            core_output_dir = config.get_output_dir("core")
            ensure_directory(core_output_dir)

            # Always discover ALL domains from filesystem to ensure complete exports
            # This ensures the main index.ts exports all domains, not just ones processed in current run
            discovered_domains = self._discover_domains(core_output_dir)

            # Use discovered domains, or merge with provided domains if any
            if all_domains:
                # Merge and deduplicate
                all_domains = sorted(list(set(discovered_domains + all_domains)))
            else:
                all_domains = discovered_domains

            if not all_domains:
                warnings.append("No domains found to export")
                return GenerateResult(files=files, warnings=warnings)

            # Generate main index file at root of packages/core (not in src/)
            # This allows rootDir to be "." and include both src/**/* and index.ts
            project_root = config.paths.project_root
            main_index_file = project_root / "packages" / "core" / "index.ts"
            ensure_directory(main_index_file.parent)
            main_index_content = self._generate_main_index_content(config, all_domains)
            write_file(main_index_file, main_index_content)
            files.append(main_index_file)
        except Exception as e:
            errors.append(str(e))
            if self.logger:
                self.logger.error(f"Failed to generate main index: {str(e)}")

        return GenerateResult(files=files, warnings=warnings, errors=errors)

    def _discover_domains(self, core_output_dir: Path) -> List[str]:
        """Discover all domains from the core output directory"""
        domains = []
        if not core_output_dir.exists():
            return domains

        for item in core_output_dir.iterdir():
            # Skip non-directories and special directories
            if not item.is_dir() or item.name in ["shared", "cache", "storage", ".git"]:
                continue

            # Check if it has an index.ts file (indicates it's a domain)
            if (item / "index.ts").exists():
                domains.append(item.name)

        return sorted(domains)

    def _generate_main_index_content(self, config, domains: List[str]) -> str:
        """Generate main index.ts content"""
        # Sort domains for consistent output
        domains = sorted(domains)

        # Shared types that should not be exported from domains
        shared_types = {
            "AccountId", "OrgId", "PageInfo", "components", "operations",
            "WalletId", "ChainId", "EscrowAccountId", "OfferingId", "SubscriptionId"
        }

        header = self._generate_header()

        # Build namespace imports
        namespace_imports = []
        namespace_exports = []

        for domain in domains:
            # Convert domain name to camelCase for namespace
            namespace_name = self._to_camel_case(domain)
            # Use ./src/ prefix since index.ts is at root of packages/core
            namespace_imports.append(f"import * as _{namespace_name} from \"./src/{domain}/index.js\";")
            namespace_exports.append(f"export const {namespace_name} = _{namespace_name};")

        # Build flat exports (handlers, repositories, schemas only - not types to avoid conflicts)
        # Track exports to detect duplicates and skip them
        flat_exports = []
        seen_exports: Set[str] = set()
        duplicate_domains: Set[str] = set()
        components_operations_exported = False  # Track if components/operations have been exported
        exported_types: Set[str] = set()  # Track exported types to avoid duplicates

        # First pass: detect which domains have duplicate exports
        # Known duplicates: MFA (auth/identity), CorporateActions (governance/transfer-agent), EscrowAccounts (escrow/treasury)
        # Also track duplicate types: DecimalString, TokenClassId, MilestoneId, ProjectId
        known_duplicate_exports = {
            "createMfaVerification": {"auth", "identity"},
            "MfaVerificationRepository": {"auth", "identity"},
            "createCorporateAction": {"governance", "transfer-agent"},
            "getCorporateAction": {"governance", "transfer-agent"},
            "listCorporateActions": {"governance", "transfer-agent"},
            "updateCorporateAction": {"governance", "transfer-agent"},
            "CorporateActionRepository": {"governance", "transfer-agent"},
            "listEscrowAccounts": {"escrow", "treasury"},
            "EscrowAccountRepository": {"escrow", "treasury"},
        }

        # Types that are duplicated across domains (should only be exported once)
        # Format: {type_name: {domain1, domain2, ...}}
        duplicate_types = {
            "DecimalString": {"custodian", "treasury"},
            "TokenClassId": {"compliance", "escrow", "primary-market", "treasury"},
            "MilestoneId": {"escrow", "primary-market"},
            "ProjectId": {"market-oracles", "primary-market", "treasury"},
            "SettlementStatus": {"fiat-banking", "settlements"},
            "CreateApiKeyRequest": {"identity", "tenancy-trust"},
        }

        # Determine which domain should export each duplicate type (first alphabetically)
        type_export_domains: Dict[str, str] = {}
        for type_name, domains_with_type in duplicate_types.items():
            primary_domain = min(sorted(domains_with_type))
            type_export_domains[type_name] = primary_domain

        # Determine which domains should skip flat exports due to duplicates
        # Priority: identity > auth, governance > transfer-agent, escrow > treasury
        domain_priority = {
            "identity": 1,  # Higher priority
            "auth": 2,
            "governance": 1,
            "transfer-agent": 2,
            "escrow": 1,
            "treasury": 2,
        }

        for export_name, domains_with_export in known_duplicate_exports.items():
            # Find the domain with highest priority (lowest number)
            primary_domain = min(domains_with_export, key=lambda d: domain_priority.get(d, 999))
            duplicate_domains.update(domains_with_export - {primary_domain})

        # Second pass: build flat exports, skipping domains with duplicates
        # NOTE: We do NOT export types in flat exports to avoid TS2308 duplicate export errors.
        # Types are already available via namespace exports (e.g., auth.types, blockchain.types).
        # Only export handlers, repositories, schemas, and converters for backward compatibility.
        for domain in domains:
            domain_title = domain.replace("-", " ").title()
            # Convert domain name to PascalCase for schema export (e.g., "business-intelligence" -> "BusinessIntelligence")
            from cuur_codegen.utils.string import pascal_case
            domain_schemas_name = pascal_case(domain)

            # Check if domain has handlers, repositories, converters, schemas, types
            # Use core_output_dir which is packages/core/src
            core_output_dir = config.get_output_dir("core")
            handlers_exist = file_exists(core_output_dir / domain / "handlers" / "index.ts")
            repositories_exist = file_exists(core_output_dir / domain / "repositories" / "index.ts")
            schemas_exist = file_exists(core_output_dir / domain / "schemas" / f"{domain}.schemas.ts")
            converters_exist = file_exists(core_output_dir / domain / "utils" / f"{domain.replace('-', '')}-converters.ts")
            types_exist = file_exists(core_output_dir / domain / "types" / "index.ts")

            # For domains with duplicates, only export schemas (handlers/repositories/types have duplicates)
            # For other domains, export handlers, repositories, types, schemas, converters
            if domain in duplicate_domains:
                # Export schemas only for duplicate domains (schemas are safe because they use domain-specific names)
                if schemas_exist:
                    flat_exports.append(f"// {domain_title} Service (schemas only - handlers/repositories/types have duplicates)")
                    # Use ./src/ prefix since index.ts is at root of packages/core
                    flat_exports.append(f"export {{ schemas as {domain_schemas_name}Schemas }} from \"./src/{domain}/schemas/{domain}.schemas.js\";")
                    flat_exports.append("")
            else:
                # Export handlers, repositories, schemas, converters, and types for non-duplicate domains
                # Types are now safe to export since shared types are separated into shared/types/index.ts
                if handlers_exist or repositories_exist or schemas_exist or converters_exist or types_exist:
                    flat_exports.append(f"// {domain_title} Service")
                    # Use ./src/ prefix since index.ts is at root of packages/core
                    if handlers_exist:
                        flat_exports.append(f"export * from \"./src/{domain}/handlers/index.js\";")
                    if repositories_exist:
                        flat_exports.append(f"export * from \"./src/{domain}/repositories/index.js\";")
                    if types_exist:
                        # Export types using {domain}.domain.types.ts which excludes components/operations
                        # Check if this domain has duplicate types that should be skipped
                        domain_types_file = core_output_dir / domain / "types" / f"{domain}.domain.types.ts"
                        if domain_types_file.exists():
                            # Check if this domain should skip type exports due to duplicate types
                            should_skip_types = False
                            domain_types_content = domain_types_file.read_text()
                            for type_name, primary_domain in type_export_domains.items():
                                if domain != primary_domain and f'export type {type_name}' in domain_types_content:
                                    should_skip_types = True
                                    break

                            if not should_skip_types:
                                flat_exports.append(f"export * from \"./src/{domain}/types/{domain}.domain.types.js\";")
                            # If should_skip_types, types are still available via namespace
                        else:
                            # Fallback to full types export if domain.types.ts doesn't exist
                            # Only export from first domain to avoid components/operations duplicates
                            if not components_operations_exported:
                                flat_exports.append(f"export * from \"./src/{domain}/types/index.js\";")
                                components_operations_exported = True
                            # For other domains without domain.types.ts, types are available via namespace
                    # Schemas are exported with domain-specific names in PascalCase - safe to export
                    if schemas_exist:
                        flat_exports.append(f"export {{ schemas as {domain_schemas_name}Schemas }} from \"./src/{domain}/schemas/{domain}.schemas.js\";")
                    if converters_exist:
                        flat_exports.append(f"export * from \"./src/{domain}/utils/{domain.replace('-', '')}-converters.js\";")
                    flat_exports.append("")

        return f"""{header}/**
 * @cuur/core - Main Barrel Export
 *
 * Central export point for all core business logic, handlers, repositories, and types
 * Organized by domain/service for easy importing
 *
 * Usage:
 *   // Namespace imports (recommended for new code)
 *   import {{ auth, exchange }} from "@cuur/core";
 *   const {{ handlers, repositories }} = auth;
 *
 *   // Flat imports (for direct imports)
 *   import {{ MarketRepository, OrderRepository }} from "@cuur/core";
 *   import {{ authSchemas, exchangeSchemas }} from "@cuur/core";
 */

// ============================================================================
// DOMAIN EXPORTS (using namespace to avoid duplicate shared type conflicts)
// ============================================================================
// Export domains as namespaces to prevent TS2308 errors from duplicate exports
// of shared types (AccountId, OrgId, PageInfo, components, operations)
// NOTE: shared, cache, and storage are NOT domains and are excluded from namespace exports

{chr(10).join(namespace_imports)}

// Export as namespaces
{chr(10).join(namespace_exports)}

// ============================================================================
// FLAT EXPORTS (for direct imports)
// ============================================================================
// Export handlers, repositories, types, schemas, and converters from each domain
// Types are now safe to export since shared types are separated into shared/types/index.ts

{chr(10).join(flat_exports)}"""

    def _to_camel_case(self, domain_name: str) -> str:
        """Convert domain name to camelCase"""
        parts = domain_name.split("-")
        return parts[0] + "".join(word.capitalize() for word in parts[1:])

    def _generate_header(self) -> str:
        """Generate file header"""
        return f"""/**
 * Main Core Package Index
 *
 * Auto-generated by Main Index Builder Generator v{self.version}
 *
 * ⚠️  DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated. Any manual changes will be overwritten.
 */

"""
