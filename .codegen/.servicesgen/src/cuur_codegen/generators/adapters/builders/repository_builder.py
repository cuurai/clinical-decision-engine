"""
Repository Builder

Builds DAO repository class implementations
"""

from pathlib import Path
from typing import Set, Dict, Optional
from .repository_discovery import RepositoryInfo
from .method_builder import MethodBuilder
from .type_discovery import TypeDiscovery


class RepositoryBuilder:
    """Builds DAO repository class content"""

    @staticmethod
    def build_repository_file(
        repo: RepositoryInfo,
        header: str,
        core_package_path: Path,
        entity_fields: Optional[Set[str]] = None
    ) -> str:
        """Generate repository file content"""
        dao_class_name = f"Dao{repo.interface_name}"
        entity_pascal = repo.entity_name
        create_type = repo.create_type or f"Create{entity_pascal}Request"
        update_type = repo.update_type or f"Update{entity_pascal}Request"
        list_params_type = repo.list_params_type or "PaginationParams"

        # Build methods with entity fields for selective queries
        methods = MethodBuilder.build_methods(repo, entity_fields)

        # Build imports
        imports: Set[str] = {repo.interface_name, entity_pascal}

        # Skip built-in TypeScript types
        built_in_types = {'Record', 'Array', 'Promise', 'Partial', 'Pick', 'Omit', 'Readonly'}

        # Add createType if repository has create method
        if (repo.is_crud or repo.create_type) and create_type and create_type.split('<')[0] not in built_in_types:
            imports.add(create_type)

        # Add updateType if repository has update method
        if (repo.is_crud or repo.update_type) and update_type and update_type.split('<')[0] not in built_in_types:
            imports.add(update_type)

        # Add listParamsType
        if list_params_type and list_params_type.split('<')[0] not in built_in_types:
            imports.add(list_params_type)

        # Add PaginatedResult to imports so it gets discovered through type discovery
        imports.add("PaginatedResult")

        # Add OrgId if any method uses it
        uses_org_id = (
            not repo.uses_string_for_org_id.get('list', False) or
            not repo.uses_string_for_org_id.get('findById', False) or
            not repo.uses_string_for_org_id.get('get', False) or
            not (repo.uses_string_for_org_id.get('create', False) and
                 repo.uses_string_for_org_id.get('update', False) and
                 repo.uses_string_for_org_id.get('delete', False))
        )

        if uses_org_id:
            imports.add("OrgId")

        # Sort imports for consistent output
        imports_array = sorted(list(imports))

        # Dynamically discover import paths by reading actual exports from core
        type_groups = TypeDiscovery.separate_types_by_import_path(
            set(imports_array),
            repo.domain_name,
            core_package_path
        )

        # Build import statements grouped by import path
        import_statements = []
        for import_path, type_names in sorted(type_groups.items()):
            if type_names:  # Only add if there are types for this path
                imports_str = chr(10).join([f"  {t}," for t in sorted(type_names)])
                import_statements.append(f"""import type {{
{imports_str}
}} from "{import_path}";""")

        imports_block = chr(10).join(import_statements) if import_statements else ""

        # Check if we need NotFoundError import (for get() method)
        needs_not_found_error = True  # get() method always throws NotFoundError

        # Build shared imports
        shared_imports = ["handleDatabaseError"]
        if needs_not_found_error:
            shared_imports.append("NotFoundError")
        # Add TransactionManager for transaction support
        shared_imports.append("TransactionManager")

        shared_imports_str = ", ".join(sorted(shared_imports))

        return f"""{header}{imports_block}
import type {{ DaoClient }} from "../shared/dao-client.js";
import {{ {shared_imports_str} }} from "../shared/index.js";

const DEFAULT_LIMIT = 50;

export class {dao_class_name} implements {repo.interface_name} {{
  private transactionManager: TransactionManager;

  constructor(private readonly dao: DaoClient) {{
    this.transactionManager = new TransactionManager(dao);
  }}

{chr(10).join(methods)}
}}
"""
