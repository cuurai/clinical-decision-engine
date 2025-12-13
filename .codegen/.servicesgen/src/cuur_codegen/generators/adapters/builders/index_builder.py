"""
Index Builder

Generates adapter index barrel exports
"""

from .repository_discovery import RepositoryInfo
from cuur_codegen.utils.string import kebab_case


class IndexBuilder:
    """Builds index file content"""

    @staticmethod
    def build_index_file(repositories: list[RepositoryInfo], header: str) -> str:
        """Generate index file with barrel exports"""
        exports = []
        for repo in repositories:
            dao_class_name = f"Dao{repo.interface_name}"
            kebab = kebab_case(repo.name)
            # Pattern: {resource-name}.dao.repository.ts (e.g., auth-account.dao.repository.ts)
            exports.append(f'export {{ {dao_class_name} }} from "./{kebab}.dao.repository.js";')

        return f"""{header}{chr(10).join(exports)}
"""
