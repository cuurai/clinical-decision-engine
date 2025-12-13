"""
Dependencies Builder

Generates dependency injection container code
"""

from typing import List
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import pascal_case, camel_case, singularize


class DependenciesBuilder:
    """Builds dependencies.ts file content"""

    @staticmethod
    def build_dependencies(
        context: GenerationContext,
        resources: List[str],
        header: str
    ) -> str:
        """Generate dependencies.ts content"""
        imports = []
        interface_props = []
        factory_params = []
        factory_return = []

        # Track seen repositories to avoid duplicates
        # Use both repo_name and repo_var to catch duplicates from different resource names
        seen_repo_names = set()
        seen_repo_vars = set()

        # Special handling for auth domain to avoid conflicts with identity domain
        # Auth domain's MfaVerificationRepository conflicts with identity's, so use AuthMfaVerificationRepository
        domain_name = context.domain_name.lower()
        auth_conflict_map = {
            "MfaVerificationRepository": "AuthMfaVerificationRepository"
        }

        for resource in resources:
            # Use singular form to match dependencies interface
            resource_singular = singularize(resource)
            repo_name = f"{pascal_case(resource_singular)}Repository"
            repo_var = f"{camel_case(resource_singular)}Repo"

            # Apply auth domain conflict mapping
            if domain_name == "auth" and repo_name in auth_conflict_map:
                repo_name = auth_conflict_map[repo_name]

            # Skip if we've already seen this repository (handles duplicates like on-chain-txs vs on-chain-txes)
            if repo_name in seen_repo_names or repo_var in seen_repo_vars:
                continue

            seen_repo_names.add(repo_name)
            seen_repo_vars.add(repo_var)

            imports.append(f"  {repo_name}")
            interface_props.append(f"  {repo_var}: {repo_name};")
            factory_params.append(f"    {repo_var}: {repo_name};")
            factory_return.append(f"    {repo_var}: repos.{repo_var},")

        imports_str = ",\n".join(imports)
        domain_name = context.domain_name
        return f"""{header}import type {{
{imports_str}
}} from "@cuur/core/{domain_name}/repositories/index.js";

/**
 * Service dependencies interface
 */
export interface Dependencies {{
{chr(10).join(interface_props)}
}}

/**
 * Create dependencies container
 *
 * In production, this would initialize actual repository implementations.
 * For now, we provide a factory function that accepts implementations.
 */
export function createDependencies(
  repos: {{
{chr(10).join(factory_params)}
  }}
): Dependencies {{
  return {{
{chr(10).join(factory_return)}
  }};
}}
"""
