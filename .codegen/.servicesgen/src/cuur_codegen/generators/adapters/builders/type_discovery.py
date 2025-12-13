"""
Type Discovery

Dynamically discovers exported types from core package by reading actual export files.
This ensures the import paths are always correct based on what's actually exported.
"""

import re
from pathlib import Path
from typing import Set, Dict, Optional


class TypeDiscovery:
    """
    Discovers exported types from core package by reading actual export files
    """

    @staticmethod
    def discover_shared_types(core_package_path: Path) -> Set[str]:
        """
        Discover types exported from @cuur/core/shared/types/index.js

        Args:
            core_package_path: Path to packages/core/src

        Returns:
            Set of type names exported from shared/types/index.ts
        """
        shared_types: Set[str] = set()

        # Read shared/types/index.ts directly (this is the source of shared types)
        shared_types_index = core_package_path / "shared" / "types" / "index.ts"
        if shared_types_index.exists():
            content = shared_types_index.read_text()
            # Extract direct exports
            shared_types.update(TypeDiscovery._extract_exported_types(content))

            # Follow re-exports if any
            re_exports = TypeDiscovery._extract_re_exports(content, shared_types_index.parent)
            for re_export_path in re_exports:
                if re_export_path.exists() and re_export_path.is_file():
                    re_export_content = re_export_path.read_text()
                    shared_types.update(TypeDiscovery._extract_exported_types(re_export_content))

        return shared_types

    @staticmethod
    def discover_domain_types(domain_name: str, core_package_path: Path) -> Set[str]:
        """
        Discover types exported from domain-specific path (@cuur/core/{domain}/types)

        Args:
            domain_name: Domain name (e.g., "blockchain")
            core_package_path: Path to packages/core/src

        Returns:
            Set of type names exported from domain/types/index.ts
        """
        domain_types: Set[str] = set()

        # Read domain/types/index.ts
        domain_types_index = core_package_path / domain_name / "types" / "index.ts"
        if domain_types_index.exists():
            content = domain_types_index.read_text()
            # Extract direct exports
            domain_types.update(TypeDiscovery._extract_exported_types(content))

            # Follow re-exports if any
            re_exports = TypeDiscovery._extract_re_exports(content, domain_types_index.parent)
            for re_export_path in re_exports:
                if re_export_path.exists():
                    re_export_content = re_export_path.read_text()
                    domain_types.update(TypeDiscovery._extract_exported_types(re_export_content))

        return domain_types

    @staticmethod
    def discover_repository_interfaces(domain_name: str, core_package_path: Path) -> Set[str]:
        """
        Discover repository interface names exported from domain

        Args:
            domain_name: Domain name (e.g., "blockchain")
            core_package_path: Path to packages/core/src

        Returns:
            Set of repository interface names
        """
        repository_interfaces: Set[str] = set()

        # Read domain/repositories/index.ts
        repos_index = core_package_path / domain_name / "repositories" / "index.ts"
        if repos_index.exists():
            content = repos_index.read_text()
            # Extract exported interfaces from named exports (e.g., export { ChainRepository } from ...)
            pattern = r'export\s+\{\s*([^}]+)\s*\}\s+from'
            matches = re.findall(pattern, content)
            for match in matches:
                # Split by comma and clean up
                interfaces = [i.strip() for i in match.split(',')]
                repository_interfaces.update(interfaces)

            # Also check for export * from statements and read the actual repository files
            # to discover interface names (e.g., export * from "./chain-repository.js")
            export_star_pattern = r'export\s+\*\s+from\s+["\']\./([^"\']+)["\']'
            export_star_matches = re.findall(export_star_pattern, content)
            repos_dir = repos_index.parent
            for repo_file_rel in export_star_matches:
                repo_file = repos_dir / repo_file_rel
                if repo_file.exists():
                    repo_content = repo_file.read_text()
                    # Extract interface name from "export interface XxxRepository"
                    interface_pattern = r'export\s+interface\s+(\w+Repository)'
                    interface_matches = re.findall(interface_pattern, repo_content)
                    repository_interfaces.update(interface_matches)

        # Always check domain repositories directory directly (more reliable than checking main index)
        repos_dir = core_package_path / domain_name / "repositories"
        if repos_dir.exists():
            # Support both old format (-repository.ts) and new format (.repository.ts)
            repo_files_old = list(repos_dir.glob("*-repository.ts"))
            repo_files_new = list(repos_dir.glob("*.repository.ts"))
            for repo_file in repo_files_old + repo_files_new:
                if repo_file.name == "index.ts":
                    continue
                repo_content = repo_file.read_text()
                # Extract interface name
                interface_match = re.search(r'export\s+interface\s+(\w+Repository)', repo_content)
                if interface_match:
                    repository_interfaces.add(interface_match.group(1))

        return repository_interfaces

    @staticmethod
    def _extract_re_exports(content: str, base_path: Path) -> list[Path]:
        """
        Extract paths from re-export statements (export * from "...")

        Args:
            content: File content
            base_path: Base path for resolving relative imports

        Returns:
            List of resolved file paths
        """
        re_export_paths = []

        # Pattern 1: export * from "./types" or export * from "./types/index.js"
        pattern1 = r'export\s+\*\s+from\s+["\']([^"\']+)["\']'
        matches = re.findall(pattern1, content)

        # Pattern 2: export type { Type1, Type2 } from "..."
        pattern2 = r'export\s+type\s+\{[^}]+\}\s+from\s+["\']([^"\']+)["\']'
        matches.extend(re.findall(pattern2, content))

        for match in matches:
            # Remove .js extension if present
            import_path = match.replace('.js', '')

            # Resolve relative to base_path
            if import_path.startswith('./'):
                resolved = base_path / import_path[2:]
            elif import_path.startswith('../'):
                resolved = base_path.parent / import_path[3:]
            else:
                resolved = base_path / import_path

            # Handle directories and files
            if resolved.is_dir():
                # If it's a directory, look for index.ts
                index_file = resolved / "index.ts"
                if index_file.exists():
                    re_export_paths.append(index_file)
            elif resolved.exists():
                # It's a file
                re_export_paths.append(resolved)
            else:
                # File doesn't exist, try variations
                if resolved.suffix == '':
                    # Try index.ts
                    index_file = resolved / "index.ts"
                    if index_file.exists():
                        re_export_paths.append(index_file)
                    else:
                        # Try .ts extension
                        ts_file = Path(str(resolved) + ".ts")
                        if ts_file.exists():
                            re_export_paths.append(ts_file)
                else:
                    # Try without extension
                    no_ext = resolved.with_suffix('')
                    index_file = no_ext / "index.ts"
                    if index_file.exists():
                        re_export_paths.append(index_file)

        return re_export_paths

    @staticmethod
    def _extract_exported_types(content: str) -> Set[str]:
        """
        Extract exported type names from TypeScript file content

        Args:
            content: File content

        Returns:
            Set of exported type names
        """
        types: Set[str] = set()

        # Pattern 1: export type { Type1, Type2 } from "..."
        pattern1 = r'export\s+type\s+\{\s*([^}]+)\s*\}\s+from'
        matches = re.findall(pattern1, content)
        for match in matches:
            # Split by comma and clean up
            type_names = [t.strip() for t in match.split(',')]
            types.update(type_names)

        # Pattern 2: export type TypeName = ...
        pattern2 = r'export\s+type\s+(\w+)\s*='
        matches = re.findall(pattern2, content)
        types.update(matches)

        # Pattern 3: export type { TypeName } (without from)
        pattern3 = r'export\s+type\s+\{\s*([^}]+)\s*\}'
        matches = re.findall(pattern3, content)
        for match in matches:
            # Check if it's not followed by 'from'
            if 'from' not in match:
                type_names = [t.strip() for t in match.split(',') if t.strip()]
                types.update(type_names)

        # Pattern 4: export * from (re-exports - we'll handle these separately)
        # This is handled by reading the imported files

        return types

    @staticmethod
    def discover_shared_helpers_types(core_package_path: Path) -> Set[str]:
        """
        Discover types exported from shared/helpers (these need subpath imports)

        Args:
            core_package_path: Path to packages/core/src

        Returns:
            Set of type names exported from shared/helpers/index.ts
        """
        helpers_types: Set[str] = set()

        # Read shared/helpers/index.ts directly
        helpers_index = core_package_path / "shared" / "helpers" / "index.ts"
        if helpers_index.exists():
            content = helpers_index.read_text()
            # Extract direct exports
            helpers_types.update(TypeDiscovery._extract_exported_types(content))

            # Follow re-exports
            re_exports = TypeDiscovery._extract_re_exports(content, helpers_index.parent)
            for re_export_path in re_exports:
                if re_export_path.exists() and re_export_path.is_file():
                    re_export_content = re_export_path.read_text()
                    helpers_types.update(TypeDiscovery._extract_exported_types(re_export_content))

        return helpers_types

    @staticmethod
    def build_type_mapping(domain_name: str, core_package_path: Path) -> Dict[str, str]:
        """
        Build a mapping of type names to their import paths

        Args:
            domain_name: Domain name (e.g., "blockchain")
            core_package_path: Path to packages/core/src

        Returns:
            Dictionary mapping type names to import paths
            e.g., {"OrgId": "@cuur/core", "PaginatedResult": "@cuur/core/shared/helpers", "Chain": "@cuur/core/blockchain/types"}
        """
        type_mapping: Dict[str, str] = {}

        # Discover shared helpers types first (these need subpath imports)
        helpers_types = TypeDiscovery.discover_shared_helpers_types(core_package_path)
        for type_name in helpers_types:
            type_mapping[type_name] = "@cuur/core/shared/helpers/index.js"

        # Discover shared types (from @cuur/core/shared/types/index.js)
        # These take precedence over helpers, but only if not already mapped
        shared_types = TypeDiscovery.discover_shared_types(core_package_path)
        for type_name in shared_types:
            # Only map if not already mapped (helpers types take precedence)
            if type_name not in type_mapping:
                type_mapping[type_name] = "@cuur/core/shared/types/index.js"

        # Discover domain-specific types (from @cuur/core/{domain}/types/index.js)
        domain_types = TypeDiscovery.discover_domain_types(domain_name, core_package_path)
        for type_name in domain_types:
            # Only add if not already in shared (shared types take precedence)
            if type_name not in type_mapping:
                type_mapping[type_name] = f"@cuur/core/{domain_name}/types/index.js"

        # Discover repository interfaces (from @cuur/core/{domain}/repositories/index.js)
        # Use domain-specific subpath imports for consistency
        repo_interfaces = TypeDiscovery.discover_repository_interfaces(domain_name, core_package_path)
        for interface_name in repo_interfaces:
            # Only map if not already mapped
            if interface_name not in type_mapping:
                type_mapping[interface_name] = f"@cuur/core/{domain_name}/repositories/index.js"

        return type_mapping

    @staticmethod
    def get_import_path(type_name: str, domain_name: str, core_package_path: Path) -> str:
        """
        Get the import path for a specific type

        Args:
            type_name: Type name to look up
            domain_name: Domain name
            core_package_path: Path to packages/core/src

        Returns:
            Import path string, or empty string if type not found
        """
        # Remove generic parameters for lookup
        base_type = type_name.split('<')[0].split('[')[0].strip()

        # Build mapping
        type_mapping = TypeDiscovery.build_type_mapping(domain_name, core_package_path)

        return type_mapping.get(base_type, "")

    @staticmethod
    def separate_types_by_import_path(
        types: Set[str],
        domain_name: str,
        core_package_path: Path
    ) -> Dict[str, Set[str]]:
        """
        Separate types into groups based on their import paths

        Uses type discovery to determine the correct import path for each type.

        Args:
            types: Set of type names to separate
            domain_name: Domain name (e.g., "blockchain")
            core_package_path: Path to packages/core/src

        Returns:
            Dictionary with import paths as keys and sets of types as values
            Types are grouped by their actual import paths (e.g., "@cuur/core", "@cuur/core/shared/helpers")
        """
        grouped: Dict[str, Set[str]] = {}

        # Build type mapping to get correct import paths
        type_mapping = TypeDiscovery.build_type_mapping(domain_name, core_package_path)

        for type_name in types:
            # Remove generic parameters for lookup
            base_type = type_name.split('<')[0].split('[')[0].strip()

            # Check if it's a built-in TypeScript type
            built_in_types = {
                'Record', 'Array', 'Promise', 'Partial', 'Pick', 'Omit',
                'Readonly', 'ReadonlyArray', 'NonNullable', 'Required',
                'string', 'number', 'boolean', 'null', 'undefined', 'void',
                'any', 'unknown', 'never', 'object'
            }

            if base_type in built_in_types:
                continue  # Skip built-in types

            # Get import path from type mapping, default to @cuur/core if not found
            # Note: We keep @cuur/core as fallback for truly shared types that aren't domain-specific
            import_path = type_mapping.get(base_type, "@cuur/core")

            # Group by import path
            if import_path not in grouped:
                grouped[import_path] = set()
            grouped[import_path].add(type_name)

        # Remove empty groups
        return {k: v for k, v in grouped.items() if v}
