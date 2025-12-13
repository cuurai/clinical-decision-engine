"""
Repository Discovery

Comprehensively discovers repositories from core package by reading actual repository files
and base repository interfaces. Uses pattern matching similar to core discovery patterns.
"""

import re
from pathlib import Path
from typing import List, Dict, Any, Optional, Set, Tuple
from dataclasses import dataclass, field


@dataclass
class RepositoryInfo:
    """Repository information discovered from core package"""
    name: str  # camelCase resource name (e.g., "chainAdapter")
    interface_name: str  # Interface name (e.g., "ChainAdapterRepository")
    entity_name: str  # Entity type name (e.g., "ChainAdapter")
    domain_name: str  # Domain name (e.g., "blockchain")
    create_type: Optional[str] = None  # Create request type name
    update_type: Optional[str] = None  # Update request type name
    create_type_full: Optional[str] = None  # Full type string with generics
    update_type_full: Optional[str] = None  # Full type string with generics
    list_params_type: str = "PaginationParams"  # List params type
    list_params_type_full: Optional[str] = None  # Full type string with generics
    is_crud: bool = False  # Whether extends CrudRepository
    has_create: bool = False  # Whether has create method
    has_update: bool = False  # Whether has update method
    has_delete: bool = False  # Whether has delete method
    update_has_id: bool = True  # Whether update method includes id parameter
    custom_methods: List[Dict[str, str]] = None  # Custom methods
    uses_string_for_org_id: Dict[str, bool] = None  # Which methods use string instead of OrgId


@dataclass
class BaseRepositoryInfo:
    """Information about a base repository interface"""
    name: str  # Interface name (e.g., "CreateReadRepository")
    has_create: bool
    has_update: bool
    has_delete: bool
    create_param_index: Optional[int] = None  # Index of TCreate in generic params (0-based)
    update_param_index: Optional[int] = None  # Index of TUpdate in generic params (0-based)
    update_has_id: bool = True  # Whether update method requires id parameter


class RepositoryDiscovery:
    """
    Comprehensively discovers repositories from core package.

    Similar to core discovery patterns:
    - Reads base repository file to discover all base interfaces
    - Uses pattern matching to extract information
    - Handles all base repository types dynamically
    """

    # Cache for base repository info
    _base_repository_cache: Optional[Dict[str, BaseRepositoryInfo]] = None

    @staticmethod
    def _discover_base_repositories(core_package_path: Path) -> Dict[str, BaseRepositoryInfo]:
        """
        Discover all base repository interfaces by reading _base-repository.ts.
        This is similar to how TypeDiscovery reads export files.
        """
        if RepositoryDiscovery._base_repository_cache is not None:
            return RepositoryDiscovery._base_repository_cache

        base_repo_file = core_package_path / "shared" / "repositories" / "_base-repository.ts"
        if not base_repo_file.exists():
            # Fallback to hardcoded mapping if file doesn't exist
            return RepositoryDiscovery._get_fallback_base_repositories()

        content = base_repo_file.read_text()
        base_repos: Dict[str, BaseRepositoryInfo] = {}

        # Pattern to find repository interface definitions
        # Matches: export interface XxxRepository<TEntity, TCreate?, TUpdate?, ...>
        interface_pattern = r"export\s+interface\s+(\w+Repository)\s*<"

        for match in re.finditer(interface_pattern, content):
            interface_name = match.group(1)
            start_pos = match.end()

            # Find the matching closing bracket for generics
            depth = 1
            end_pos = start_pos
            for i, char in enumerate(content[start_pos:], start_pos):
                if char == '<':
                    depth += 1
                elif char == '>':
                    depth -= 1
                    if depth == 0:
                        end_pos = i + 1
                        break

            generic_params = content[start_pos:end_pos]

            # Extract method requirements from interface body
            # Find the extends clause and method signatures
            interface_end = content.find('}', end_pos)
            if interface_end == -1:
                continue

            interface_body = content[end_pos:interface_end]

            # Determine which methods are required
            has_create = 'create(' in interface_body or 'create:' in interface_body
            has_update = 'update(' in interface_body or 'update:' in interface_body
            has_delete = 'delete(' in interface_body or 'delete:' in interface_body

            # Determine parameter indices from generic signature
            # Pattern: <TEntity, TCreate?, TUpdate?, TId?, TListParams?>
            params = [p.strip() for p in generic_params.strip('<>').split(',')]
            create_param_index = None
            update_param_index = None

            # Find TCreate and TUpdate in generic parameters
            for i, param in enumerate(params):
                if 'TCreate' in param or param.startswith('TCreate'):
                    create_param_index = i
                if 'TUpdate' in param or param.startswith('TUpdate'):
                    update_param_index = i

            # Determine if update has id parameter
            # All base interfaces except ReadRepository have id in update
            update_has_id = interface_name != "ReadRepository" and has_update

            base_repos[interface_name] = BaseRepositoryInfo(
                name=interface_name,
                has_create=has_create,
                has_update=has_update,
                has_delete=has_delete,
                create_param_index=create_param_index,
                update_param_index=update_param_index,
                update_has_id=update_has_id
            )

        # Also check for ReadRepository (no generics in extends)
        if 'export interface ReadRepository<' in content:
            base_repos['ReadRepository'] = BaseRepositoryInfo(
                name='ReadRepository',
                has_create=False,
                has_update=False,
                has_delete=False,
                create_param_index=None,
                update_param_index=None,
                update_has_id=False
            )

        RepositoryDiscovery._base_repository_cache = base_repos
        return base_repos

    @staticmethod
    def _get_fallback_base_repositories() -> Dict[str, BaseRepositoryInfo]:
        """Fallback mapping if base repository file can't be read"""
        return {
            'ReadRepository': BaseRepositoryInfo(
                name='ReadRepository',
                has_create=False,
                has_update=False,
                has_delete=False,
                create_param_index=None,
                update_param_index=None,
                update_has_id=False
            ),
            'CreateReadRepository': BaseRepositoryInfo(
                name='CreateReadRepository',
                has_create=True,
                has_update=False,
                has_delete=False,
                create_param_index=1,
                update_param_index=None,
                update_has_id=False
            ),
            'UpdateReadRepository': BaseRepositoryInfo(
                name='UpdateReadRepository',
                has_create=False,
                has_update=True,
                has_delete=False,
                create_param_index=None,
                update_param_index=1,
                update_has_id=True
            ),
            'DeleteReadRepository': BaseRepositoryInfo(
                name='DeleteReadRepository',
                has_create=False,
                has_update=False,
                has_delete=True,
                create_param_index=None,
                update_param_index=None,
                update_has_id=False
            ),
            'CreateUpdateReadRepository': BaseRepositoryInfo(
                name='CreateUpdateReadRepository',
                has_create=True,
                has_update=True,
                has_delete=False,
                create_param_index=1,
                update_param_index=2,
                update_has_id=True
            ),
            'CreateDeleteReadRepository': BaseRepositoryInfo(
                name='CreateDeleteReadRepository',
                has_create=True,
                has_update=False,
                has_delete=True,
                create_param_index=1,
                update_param_index=None,
                update_has_id=False
            ),
            'UpdateDeleteReadRepository': BaseRepositoryInfo(
                name='UpdateDeleteReadRepository',
                has_create=False,
                has_update=True,
                has_delete=True,
                create_param_index=None,
                update_param_index=1,
                update_has_id=True
            ),
            'CrudRepository': BaseRepositoryInfo(
                name='CrudRepository',
                has_create=True,
                has_update=True,
                has_delete=True,
                create_param_index=1,
                update_param_index=2,
                update_has_id=True
            ),
        }

    @staticmethod
    def discover_repositories(
        domain_name: str,
        core_package_path: Path
    ) -> List[RepositoryInfo]:
        """
        Comprehensively discover repositories for a domain.

        Similar to core discovery patterns:
        - Reads actual repository files
        - Matches against discovered base repository interfaces
        - Extracts types from generic parameters
        """
        repositories: List[RepositoryInfo] = []

        # Discover base repository interfaces (like TypeDiscovery reads exports)
        base_repos = RepositoryDiscovery._discover_base_repositories(core_package_path)

        # Check if repositories exist in core package
        core_repos_path = core_package_path / domain_name / "repositories"

        if not core_repos_path.exists():
            return repositories

        # Find all repository files
        # Support both old format (-repository.ts) and new format (.repository.ts)
        repo_files_old = list(core_repos_path.glob("*-repository.ts"))
        repo_files_new = list(core_repos_path.glob("*.repository.ts"))
        repo_files = repo_files_old + repo_files_new
        repo_files = [f for f in repo_files if f.name != "index.ts"]

        for repo_file in repo_files:
            try:
                repo_content = repo_file.read_text()

                # Extract resource name from filename (support both .repository.ts and -repository.ts)
                repo_name = repo_file.name.replace(".repository.ts", "").replace("-repository.ts", "")
                resource_name = repo_name.replace("-repository", "").replace(".repository", "")
                resource_parts = resource_name.split("-")
                resource_name_camel = resource_parts[0] + "".join(
                    part.capitalize() for part in resource_parts[1:]
                )

                # Extract interface name
                interface_match = re.search(r"export\s+interface\s+(\w+Repository)", repo_content)
                if not interface_match:
                    continue

                interface_name = interface_match.group(1)

                # Extract entity name and base repository type from interface declaration
                # Pattern: interface XxxRepository extends BaseRepository<TEntity, TCreate?, TUpdate?, ...>
                extends_match = re.search(
                    r"interface\s+\w+Repository\s+extends\s+(\w+Repository)\s*<([^>]+)>",
                    repo_content
                )

                if not extends_match:
                    # Try without generics (shouldn't happen, but handle gracefully)
                    entity_match = re.search(
                        r"interface\s+\w+Repository\s+extends\s+\w+<(\w+)",
                        repo_content
                    )
                    entity_name = entity_match.group(1) if entity_match else resource_name_camel.capitalize()
                    base_repo_name = None
                    generic_params_str = ""
                else:
                    base_repo_name = extends_match.group(1)
                    generic_params_str = extends_match.group(2)
                    # Extract entity name (first generic parameter)
                    params = [p.strip() for p in generic_params_str.split(',')]
                    entity_name = params[0] if params else resource_name_camel.capitalize()

                # Get base repository info
                base_repo_info = base_repos.get(base_repo_name) if base_repo_name else None

                # Determine method requirements
                if base_repo_info:
                    has_create = base_repo_info.has_create or "create(" in repo_content
                    has_update = base_repo_info.has_update or "update(" in repo_content
                    has_delete = base_repo_info.has_delete or "delete(" in repo_content
                    update_has_id = base_repo_info.update_has_id
                else:
                    # Fallback: check for explicit methods
                    has_create = "create(" in repo_content
                    has_update = "update(" in repo_content
                    has_delete = "delete(" in repo_content
                    update_has_id = "update(orgId" in repo_content and ", id: string" in repo_content

                # Extract types from generic parameters using base repository info
                create_type = None
                update_type = None
                create_type_full = None
                update_type_full = None

                if base_repo_info and generic_params_str:
                    params = [p.strip() for p in generic_params_str.split(',')]

                    # Extract create type
                    if base_repo_info.create_param_index is not None:
                        if base_repo_info.create_param_index < len(params):
                            create_type_full = params[base_repo_info.create_param_index]
                            create_type = create_type_full.split('<')[0].strip()

                    # Extract update type
                    if base_repo_info.update_param_index is not None:
                        if base_repo_info.update_param_index < len(params):
                            update_type_full = params[base_repo_info.update_param_index]
                            update_type = update_type_full.split('<')[0].strip()

                # Fallback: extract from method signatures if not found in generics
                if has_create and not create_type:
                    create_type, create_type_full = RepositoryDiscovery._extract_method_param_type(
                        repo_content, "create", "data"
                    )
                if has_update and not update_type:
                    update_type, update_type_full = RepositoryDiscovery._extract_method_param_type(
                        repo_content, "update", "data"
                    )

                # Extract list params type
                list_match = re.search(r"list\([^)]*params\?:\s*(\w+)", repo_content)
                list_params_type = list_match.group(1) if list_match else "PaginationParams"
                list_params_type_full = list_params_type

                # Determine if CRUD
                is_crud = (
                    base_repo_name == "CrudRepository" or
                    (has_create and has_update and has_delete)
                )

                # Extract custom methods
                custom_methods = RepositoryDiscovery._extract_custom_methods(repo_content)

                # Check which methods use string instead of OrgId
                uses_string = RepositoryDiscovery._extract_org_id_usage(repo_content)

                repositories.append(RepositoryInfo(
                    name=resource_name_camel,
                    interface_name=interface_name,
                    entity_name=entity_name,
                    domain_name=domain_name,
                    create_type=create_type,
                    update_type=update_type,
                    create_type_full=create_type_full,
                    update_type_full=update_type_full,
                    list_params_type=list_params_type,
                    list_params_type_full=list_params_type_full,
                    is_crud=is_crud,
                    has_create=has_create,
                    has_update=has_update,
                    has_delete=has_delete,
                    update_has_id=update_has_id,
                    custom_methods=custom_methods or [],
                    uses_string_for_org_id=uses_string or {}
                ))
            except Exception as e:
                # Skip files that can't be parsed
                continue

        return repositories

    @staticmethod
    def _extract_method_param_type(
        content: str, method_name: str, param_name: str
    ) -> tuple[Optional[str], Optional[str]]:
        """Extract parameter type from method signature"""
        # Find method line
        lines = content.split('\n')
        for line in lines:
            if f"{method_name}(" in line and f"{param_name}:" in line:
                # Extract type after param_name:
                param_index = line.find(f"{param_name}:")
                after_param = line[param_index + len(param_name) + 1:].strip()
                # Extract type until comma, closing paren, or end
                type_end = len(after_param)
                depth = 0
                for i, char in enumerate(after_param):
                    if char == '<':
                        depth += 1
                    elif char == '>':
                        depth -= 1
                    elif char in (',', ')') and depth == 0:
                        type_end = i
                        break
                type_full = after_param[:type_end].strip()
                # Extract just the type name (before < if present)
                type_name = type_full.split('<')[0].strip()
                return type_name, type_full
        return None, None

    @staticmethod
    def _extract_custom_methods(content: str) -> List[Dict[str, str]]:
        """Extract custom methods from interface"""
        custom_methods = []
        # Standard methods to skip
        standard_methods = ['list', 'findById', 'get', 'create', 'update', 'delete']
        # Simple regex to find method signatures
        method_pattern = r"(\w+)\s*\([^)]*\)\s*:\s*Promise<([^>]+)>"
        for match in re.finditer(method_pattern, content):
            method_name = match.group(1)
            if method_name not in standard_methods:
                custom_methods.append({
                    'name': method_name,
                    'signature': match.group(0)
                })
        return custom_methods

    @staticmethod
    def _extract_org_id_usage(content: str) -> Dict[str, bool]:
        """Extract which methods use string instead of OrgId"""
        usage = {}
        # Check if methods explicitly use 'string' for orgId parameter
        for method in ['list', 'findById', 'get', 'create', 'update', 'delete']:
            # Look for method signature with orgId: string
            pattern = rf"{method}\s*\([^)]*orgId:\s*string"
            usage[method] = bool(re.search(pattern, content))
        return usage
