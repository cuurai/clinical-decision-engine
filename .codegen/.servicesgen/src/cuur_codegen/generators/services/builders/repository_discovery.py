"""
Repository Discovery Builder

Discovers repositories from core package by scanning repositories directory
"""

from pathlib import Path
from typing import List, Optional
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import pascal_case, camel_case


class RepositoryInfo:
    """Repository information"""
    def __init__(self, name: str, interface_name: str, dao_name: str):
        self.name = name
        self.interface_name = interface_name
        self.dao_name = dao_name


class RepositoryDiscovery:
    """Discovers repositories from core package"""

    @staticmethod
    def discover_repositories(
        domain_name: str,
        context: GenerationContext
    ) -> List[RepositoryInfo]:
        """
        Discover repositories for a domain by scanning the repositories directory

        Returns list of RepositoryInfo objects
        """
        repositories: List[RepositoryInfo] = []

        # Check if repositories exist in core package by scanning the repositories directory
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
                dao_name = f"Dao{pascal_case(resource_name)}Repository"

                repositories.append(
                    RepositoryInfo(
                        name=camel_case(resource_name),
                        interface_name=repo_interface_name,
                        dao_name=dao_name
                    )
                )

        except Exception as error:
            # Repositories directory doesn't exist or can't be read
            context.logger.debug(f"Error discovering repositories for {domain_name}: {error}")

        return repositories
