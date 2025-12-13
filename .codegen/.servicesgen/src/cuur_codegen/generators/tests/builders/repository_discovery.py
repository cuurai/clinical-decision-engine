"""
Repository Discovery Builder

Discovers repositories from core package with type extraction
"""

from pathlib import Path
from typing import List, Optional
from dataclasses import dataclass
import re
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import pascal_case, camel_case


@dataclass
class RepositoryInfo:
    """Repository information"""
    name: str
    interface_name: str
    entity_name: str
    create_type: Optional[str] = None
    update_type: Optional[str] = None
    list_params_type: Optional[str] = None
    is_crud: bool = False
    has_create: bool = False
    has_update: bool = False
    has_delete: bool = False


class RepositoryDiscovery:
    """Discovers repositories from core package"""

    @staticmethod
    def discover_repositories(
        domain_name: str,
        context: GenerationContext
    ) -> List[RepositoryInfo]:
        """
        Discover repositories for a domain by scanning the repositories directory

        Returns list of RepositoryInfo objects with type information
        """
        repositories: List[RepositoryInfo] = []

        # Check if repositories exist in core package
        # Core package is typically at packages/core/src relative to project root
        # But project_root might be platform/, so we need to go up to find core
        core_base = context.config.paths.project_root / "packages" / "core" / "src"
        if not core_base.exists():
            # If not found, try going up one level (project_root might be platform/)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "src"
        if not core_base.exists():
            # If still not found, try submodule structure (packages/core/packages/core/src)
            core_base = context.config.paths.project_root.parent / "packages" / "core" / "packages" / "core" / "src"
        core_repos_path = core_base / domain_name / "repositories"

        try:
            if not core_repos_path.exists():
                context.logger.debug(f"No repositories directory found for {domain_name}")
                return repositories

            # Find all repository files
            repo_files = [
                f for f in core_repos_path.iterdir()
                if f.is_file() and (f.name.endswith(".repository.ts") or f.name.endswith("-repository.ts")) and f.name != "index.ts"
            ]

            for repo_file in repo_files:
                # Extract resource name from filename (support both .repository.ts and -repository.ts)
                repo_name = repo_file.name.replace(".repository.ts", "").replace("-repository.ts", "")
                resource_name_parts = repo_name.split("-")
                resource_name = "".join(
                    part if idx == 0 else part[0].upper() + part[1:]
                    for idx, part in enumerate(resource_name_parts)
                )

                repo_interface_name = f"{pascal_case(resource_name)}Repository"
                entity_name = pascal_case(resource_name)

                # Read repository file to determine type and methods
                repo_content = repo_file.read_text()

                # Check if extends CrudRepository, CreateUpdateReadRepository, or has create/update methods
                has_create = "create(" in repo_content or "create:" in repo_content or "CreateUpdateReadRepository" in repo_content or "CreateReadRepository" in repo_content or "CreateDeleteReadRepository" in repo_content or "CrudRepository" in repo_content
                has_update = "update(" in repo_content or "update:" in repo_content or "CreateUpdateReadRepository" in repo_content or "UpdateDeleteReadRepository" in repo_content or "CrudRepository" in repo_content
                is_crud = "CrudRepository" in repo_content
                has_delete = "delete(" in repo_content or "delete:" in repo_content or "CreateDeleteReadRepository" in repo_content or "UpdateDeleteReadRepository" in repo_content or "CrudRepository" in repo_content

                # Extract type parameters from interface declaration
                create_type: Optional[str] = None
                update_type: Optional[str] = None
                list_params_type: Optional[str] = None

                # Extract from interface generics
                interface_match = re.search(
                    r"export\s+interface\s+\w+Repository\s+extends\s+\w+Repository\s*<[^>]+>",
                    repo_content
                )

                if interface_match:
                    generic_match = re.search(r"<([^>]+)>", interface_match.group(0))
                    if generic_match:
                        params = [p.strip() for p in generic_match.group(1).split(",")]

                        is_crud_repository = "CrudRepository" in repo_content
                        if is_crud_repository:
                            # CrudRepository format: <Entity, CreateType, UpdateType, IdType, ListParamsType>
                            if len(params) >= 2:
                                create_type = params[1]
                            if len(params) >= 3:
                                update_type = params[2]
                            if len(params) >= 5:
                                list_params_type = params[4]
                        else:
                            # ReadRepository format: <Entity, IdType, ListParamsType>
                            if len(params) >= 3:
                                list_params_type = params[2]

                # Extract from method signatures (fallback)
                if not create_type:
                    create_match = re.search(
                        r"create\([^)]*,\s*data:\s*([A-Z][A-Za-z0-9]*)",
                        repo_content
                    )
                    create_type = create_match.group(1) if create_match else None

                if not update_type:
                    update_match = re.search(
                        r"update\([^)]*,\s*[^,)]+,\s*data:\s*([A-Z][A-Za-z0-9]*)",
                        repo_content
                    )
                    update_type = update_match.group(1) if update_match else None

                if not list_params_type:
                    list_match = re.search(r"list\([^)]*params\?:\s*(\w+)", repo_content)
                    list_params_type = list_match.group(1) if list_match else "PaginationParams"

                repositories.append(
                    RepositoryInfo(
                        name=camel_case(resource_name),
                        interface_name=repo_interface_name,
                        entity_name=entity_name,
                        create_type=create_type,
                        update_type=update_type,
                        list_params_type=list_params_type or "PaginationParams",
                        is_crud=is_crud,
                        has_create=has_create,
                        has_update=has_update,
                        has_delete=has_delete,
                    )
                )

        except Exception as error:
            context.logger.debug(f"Error discovering repositories for {domain_name}: {error}")

        return repositories
