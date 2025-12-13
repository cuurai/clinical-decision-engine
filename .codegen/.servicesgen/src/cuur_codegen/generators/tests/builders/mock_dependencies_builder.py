"""
Mock Dependencies Builder

Generates mock dependencies for orchestrator flow testing
"""

from pathlib import Path
from typing import List, Set
import re
from cuur_codegen.core.context import GenerationContext


class MockDependenciesBuilder:
    """Builds mock dependencies for orchestrator flows"""

    @staticmethod
    def build_mock_dependencies(
        repositories: List,
        orchestrator_domain: str,
        header: str,
        context: GenerationContext
    ) -> str:
        """
        Build mock dependencies file for orchestrator flows

        Args:
            repositories: List of repository info dicts (from DaoDiscovery)
            orchestrator_domain: Orchestrator domain name (e.g., "trading-markets")
            header: File header comment
            context: Generation context

        Returns:
            Mock dependencies file content
        """
        # Try to read actual deps.ts to get exact repository structure
        deps_file = context.config.paths.project_root / "orchestrators" / "domains" / "src" / orchestrator_domain / "deps.ts"

        repo_vars = set()
        if deps_file.exists():
            try:
                deps_content = deps_file.read_text()
                # Extract repository variable names from Dependencies interface
                interface_match = re.search(r"export interface Dependencies\s*\{([^}]+)\}", deps_content, re.DOTALL)
                if interface_match:
                    interface_body = interface_match.group(1)
                    # Find all repo variables (e.g., "orderRepo: any;")
                    repo_matches = re.findall(r"(\w+Repo)\s*:", interface_body)
                    repo_vars.update(repo_matches)
            except Exception as e:
                context.logger.debug(f"Error reading deps.ts: {e}")

        # Also add repositories from discovery
        if repositories:
            for repo in repositories:
                if isinstance(repo, dict):
                    repo_vars.add(repo.get('var', ''))
                else:
                    # Handle RepositoryInfo objects
                    repo_var = camel_case(repo.name.replace("Repository", "")) + "Repo"
                    repo_vars.add(repo_var)

        # Remove empty strings
        repo_vars = {v for v in repo_vars if v}

        if not repo_vars:
            return f"""{header}
/**
 * Mock Dependencies for {orchestrator_domain}
 *
 * No repositories found - create empty mock dependencies
 */

import type {{ Dependencies }} from "@quub/orchestrators/{orchestrator_domain}/deps.js";

export function createMockDependencies(): Dependencies {{
  return {{
    dao: {{}} as any,
  }};
}}
"""

        # Build mock repository properties
        repo_mocks = []
        for repo_var in sorted(repo_vars):
            repo_mocks.append(f"    {repo_var}: {{}} as any,")

        mocks_str = "\n".join(repo_mocks)

        return f"""{header}
/**
 * Mock Dependencies for {orchestrator_domain}
 *
 * Creates mock DAO repositories for testing orchestrator flows.
 * All repositories are mocked as empty objects - implement mock behavior in tests as needed.
 */

import type {{ Dependencies }} from "@quub/orchestrators/{orchestrator_domain}/deps.js";

export function createMockDependencies(): Dependencies {{
  return {{
    dao: {{}} as any,
{mocks_str}
  }};
}}
"""


def camel_case(text: str) -> str:
    """Convert text to camelCase"""
    if not text:
        return ""
    parts = text.split("-")
    return parts[0].lower() + "".join(word.capitalize() for word in parts[1:])
