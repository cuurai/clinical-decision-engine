"""
Deps Builder - Generates deps.ts with DAO layer (core handlers called directly)
"""

from pathlib import Path
import os
from typing import Optional, List, Dict, Any, Set
from cuur_codegen.utils.file import write_file
from cuur_codegen.utils.string import camel_case, pascal_case
from ..config_reader import load_orchestrator_domains_config
from ..flows.dao_discovery import DaoDiscovery
from ..flows.handler_mapper import HandlerMapper
from ..flows.handler_discovery import HandlerDiscovery
from cuur_codegen.utils.string import extract_verb_from_operation_id


class DepsBuilder:
    """Builds deps.ts file with DAO layer (core handlers are called directly, no service clients)"""

    @staticmethod
    def _calculate_relative_path(from_path: Path, to_path: Path) -> str:
        """
        Calculate relative path from from_path to to_path

        Args:
            from_path: Starting path (file or directory)
            to_path: Target path (file or directory)

        Returns:
            Relative path string (e.g., "../../../../adapters/src/index.js")
        """
        from_p = Path(from_path).resolve()
        to_p = Path(to_path).resolve()

        # If from_path is a file, use its parent directory
        if from_p.is_file():
            from_dir = from_p.parent
        else:
            from_dir = from_p

        # If to_path is a file, extract directory and filename
        if to_p.is_file():
            to_dir = to_p.parent
            file_name = to_p.name
        else:
            to_dir = to_p
            file_name = None

        # Use os.path.relpath for reliable relative path calculation
        # This handles all edge cases including paths that don't share a common root
        relative_str = os.path.relpath(str(to_dir), str(from_dir))
        relative_str = relative_str.replace(os.sep, "/")
        if relative_str == ".":
            relative_str = ""

        # Add filename if to_path was a file
        if file_name:
            if relative_str:
                return f"{relative_str}/{file_name}"
            else:
                return file_name

        return relative_str if relative_str else "."

    @staticmethod
    def generate_deps(output_dir: Path, domain_name: str, spec: Dict[str, Any], project_root: Path) -> Optional[Path]:
        """Generate deps.ts with proper DAO layer implementation"""
        # Resolve project_root to absolute path first
        project_root_abs = Path(project_root).resolve()

        # Resolve output_dir - it may already include platform/ in the path
        # so we resolve it directly rather than prepending project_root
        output_dir_resolved = Path(output_dir).resolve()

        deps_file = output_dir_resolved / "deps.ts"

        # Calculate relative paths from deps.ts to adapters
        # With tsconfig baseUrl set to platform/, we can use relative paths without platform/ prefix
        # From: platform/orchestrators/domains/src/trading-markets/deps.ts
        # To: platform/adapters/src/shared/dao-client.ts
        # Relative: ../../../../adapters/src/shared/dao-client.js (up 4 levels to platform/, then down)
        platform_dir = project_root_abs / "platform"
        adapters_shared = platform_dir / "adapters/src/shared/dao-client.ts"
        adapters_index = platform_dir / "adapters/src/index.ts"

        # Ensure paths are resolved before calculating relative paths
        # Always resolve to get absolute paths for accurate relative calculation
        deps_file_resolved = Path(deps_file).resolve()
        adapters_shared_resolved = Path(adapters_shared).resolve()

        # Use @quub/adapters path aliases instead of relative paths
        # This matches the pattern used in flow files and works with tsconfig path mappings
        dao_client_rel = "@quub/adapters/shared/dao-client.js"

        # Load orchestrator config to get core domains
        core_domains = []
        primary_core_domain = None

        try:
            orchestrator_config = load_orchestrator_domains_config(project_root)
            for domain_config in orchestrator_config.orchestrator_domains:
                if domain_config.name == domain_name:
                    # Extract core domain names from CoreDomainConfig objects
                    core_domains = [cd.name for cd in domain_config.core_domains]
                    primary_core_domain = core_domains[0] if core_domains else None
                    break
        except Exception:
            # Fallback: no core domains found
            core_domains = []
            primary_core_domain = None

        # Discover repositories from handlers used in flows
        # This scans the OpenAPI spec's x-orchestration-flow steps to find all handlers
        # and maps them to their required repositories
        dao_repos = DepsBuilder._discover_repositories_from_flows(spec, project_root)

        # Also include repositories from core domains
        core_domain_repos = DaoDiscovery.discover_dao_repositories(core_domains)

        # Merge and deduplicate by repository variable name
        repo_map = {}
        for repo in dao_repos + core_domain_repos:
            var_name = repo['var']
            if var_name not in repo_map:
                repo_map[var_name] = repo

        dao_repos = list(repo_map.values())
        # Sort by variable name for consistent output
        dao_repos.sort(key=lambda r: r['var'])

        # Use @quub/adapters path alias instead of relative paths
        adapters_index_rel = "@quub/adapters"
        dao_imports = DepsBuilder._generate_dao_imports(dao_repos, adapters_index_rel)
        dao_initializations = DepsBuilder._generate_dao_initializations(dao_repos)
        dao_interface_props = DepsBuilder._generate_dao_interface_props(dao_repos)

        # Generate PrismaClient import and initialization
        prisma_import = ""
        prisma_init = ""
        if primary_core_domain:
            # Use relative paths that work with tsconfig baseUrl (set to platform/)
            platform_dir = project_root_abs / "platform"
            adapters_prisma = platform_dir / f"adapters/src/{primary_core_domain}/prisma/generated/index.js"
            # Use @quub/adapters path alias instead of relative paths
            prisma_rel = f"@quub/adapters/{primary_core_domain}/prisma/generated/index.js"
            prisma_import = f'''// Import Prisma client from primary core domain adapter
import {{ PrismaClient }} from "{prisma_rel}";'''
            prisma_init = f'''  // Initialize Prisma client for {primary_core_domain} domain
  const prisma = new PrismaClient({{
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
    errorFormat: process.env.NODE_ENV === "development" ? "pretty" : "minimal",
  }});

  // Cast PrismaClient to DaoClient for type compatibility
  const dao = prisma as unknown as DaoClient;'''

        content = f'''/**
 * Common dependency injector
 *
 * Creates and provides dependencies (DaoClient, repositories) for flows.
 *
 * Note: Core handlers are called directly from flows (imported from @cuur/core).
 * No service clients needed since orchestrators and services are deployed together.
 */

import type {{ DaoClient }} from "{dao_client_rel}";
{prisma_import}
{dao_imports}

export interface Dependencies {{
  dao: DaoClient;
{chr(10).join(dao_interface_props)}
}}

/**
 * Creates dependencies for the {domain_name} orchestrator
 *
 * Initializes:
 * - PrismaClient and casts to DaoClient
 * - DAO repository instances
 *
 * Note: Core handlers are imported directly in flows from @cuur/core.
 */
export function createDependencies(): Dependencies {{
{prisma_init}

  // Initialize DAO repositories
{chr(10).join(dao_initializations)}

  return {{
    dao,
{chr(10).join([f"    {repo['var']}: {repo['var']}" + ("," if i < len(dao_repos) - 1 else "") for i, repo in enumerate(dao_repos)]) if dao_repos else "    // No DAO repositories configured"}
  }};
}}
'''
        write_file(deps_file, content)
        return deps_file

    @staticmethod
    def _generate_dao_imports(dao_repos: List[Dict[str, str]], adapters_index_rel: str) -> str:
        """Generate imports for DAO repositories"""
        if not dao_repos:
            return ""

        repo_names = [repo["name"] for repo in dao_repos]
        return f'''import {{
{chr(10).join([f"  {name}," for name in repo_names])}
}} from "{adapters_index_rel}";'''

    @staticmethod
    def _generate_dao_interface_props(dao_repos: List[Dict[str, str]]) -> List[str]:
        """Generate interface properties for DAO repositories"""
        props = []
        for repo in dao_repos:
            # Get repository interface type from @cuur/core
            # For now, use any - in production, we'd look up the interface type
            props.append(f"  {repo['var']}: any; // {repo['name']}")
        return props

    @staticmethod
    def _generate_dao_initializations(dao_repos: List[Dict[str, str]]) -> List[str]:
        """Generate DAO repository initialization code"""
        init_lines = []
        for repo in dao_repos:
            init_lines.append(f"  const {repo['var']} = new {repo['name']}(dao);")
        return init_lines

    @staticmethod
    def _discover_repositories_from_flows(spec: Dict[str, Any], project_root: Path) -> List[Dict[str, str]]:
        """Discover repositories by scanning handlers used in orchestration flows"""
        repos = []
        seen_repo_vars: Set[str] = set()

        paths = spec.get("paths", {})
        for path, methods in paths.items():
            for method, operation in methods.items():
                flow_steps = operation.get("x-orchestration-flow", [])
                if not flow_steps:
                    continue

                for step in flow_steps:
                    if step.get("kind") != "backend-call":
                        continue

                    service = step.get("service", "")
                    operation_id_call = step.get("operationId", "")
                    handler_field = step.get("handler", "")
                    method_http = step.get("method", "").upper()

                    # Map service to domain
                    domain = HandlerMapper.map_service_to_domain(service)

                    # Map handler name
                    handler_name = HandlerDiscovery.map_handler_name(
                        handler_field if handler_field else operation_id_call,
                        domain,
                        operation_id_call,
                        project_root
                    )

                    # Map handler to repository variable name
                    repo_var = HandlerMapper.map_handler_to_repo(operation_id_call, handler_field)
                    if not repo_var or repo_var in seen_repo_vars:
                        continue

                    seen_repo_vars.add(repo_var)

                    # Convert repo variable name to DAO repository class name
                    # e.g., preTradeCheckLogRepo -> DaoPreTradeCheckLogRepository
                    repo_class_name = DepsBuilder._repo_var_to_class_name(repo_var)

                    repos.append({
                        "name": repo_class_name,
                        "var": repo_var,
                        "domain": domain
                    })

        return repos

    @staticmethod
    def _repo_var_to_class_name(repo_var: str) -> str:
        """
        Convert repository variable name to DAO repository class name

        Examples:
            orderRepo -> DaoOrderRepository
            preTradeCheckLogRepo -> DaoPreTradeCheckLogRepository
            eventReplayRepo -> DaoEventReplayRepository
        """
        # Remove "Repo" suffix
        resource_name = repo_var.replace("Repo", "")
        # Convert camelCase to PascalCase and add Dao prefix and Repository suffix
        resource_pascal = pascal_case(resource_name)
        return f"Dao{resource_pascal}Repository"
