"""
Main Builder

Generates main.ts service entry point
"""

import re
import os
from pathlib import Path
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import pascal_case, camel_case, singularize
from typing import List, Dict, Set


class MainBuilder:
    """Builds main.ts file content"""

    @staticmethod
    def _discover_dao_repositories(domain_name: str, adapters_base: Path) -> Dict[str, str]:
        """
        Discover DAO repository class names from adapters package.

        Returns:
            Dict mapping repository interface name to DAO class name
            e.g., {"ChainRepository": "DaoChainRepository"}
        """
        dao_map: Dict[str, str] = {}

        # Read adapters/{domain}/index.ts
        adapters_index = adapters_base / domain_name / "index.ts"
        if not adapters_index.exists():
            return dao_map

        content = adapters_index.read_text()

        # Extract exports: export { DaoChainRepository } from "./dao-chain-repository.js";
        # Pattern matches: DaoChainRepository -> captures "ChainRepository"
        pattern = r'export\s+\{\s*(Dao\w+Repository)\s*\}\s+from'
        matches = re.findall(pattern, content)

        for dao_name in matches:
            # Extract interface name by removing "Dao" prefix
            # DaoChainRepository -> ChainRepository
            interface_name = dao_name[3:]  # Remove "Dao" prefix
            dao_map[interface_name] = dao_name

        return dao_map

    @staticmethod
    def _discover_dependencies_mapping(domain_name: str, service_dir: Path) -> Dict[str, str]:
        """
        Discover repository variable names from dependencies.ts.

        Returns:
            Dict mapping repository interface name to variable name
            e.g., {"ChainRepository": "chainRepo"}
        """
        mapping: Dict[str, str] = {}

        # Use domain-scoped dependencies file: {domain}.dependencies.ts
        deps_file = service_dir / "src" / "dependencies" / f"{domain_name}.dependencies.ts"
        if not deps_file.exists():
            return mapping

        content = deps_file.read_text()

        # Extract interface properties: chainRepo: ChainRepository;
        pattern = r'(\w+Repo):\s*(\w+Repository);'
        matches = re.findall(pattern, content)

        for repo_var, repo_interface in matches:
            mapping[repo_interface] = repo_var

        return mapping

    @staticmethod
    def build_main(
        context: GenerationContext,
        resources: List[str],
        header: str
    ) -> str:
        """Generate main.ts content"""
        domain_name = context.domain_name
        service_name = pascal_case(domain_name)

        # Discover DAO repositories from adapters package
        config = context.config
        project_root = config.paths.project_root
        adapters_base = project_root / "platform" / "adapters" / "src"
        dao_map = MainBuilder._discover_dao_repositories(domain_name, adapters_base)

        # Discover repository variable mappings from dependencies.ts
        service_dir = project_root / "platform" / "services" / "src" / domain_name
        deps_mapping = MainBuilder._discover_dependencies_mapping(domain_name, service_dir)

        # Build imports and repository wiring
        dao_imports: Set[str] = set()
        prisma_repos: List[str] = []

        # Use dependencies mapping as source of truth if available
        if deps_mapping:
            for repo_interface, repo_var in deps_mapping.items():
                dao_name = dao_map.get(repo_interface)
                if not dao_name:
                    # Fallback: construct DAO name from interface name
                    dao_name = f"Dao{repo_interface}"

                dao_imports.add(dao_name)
                prisma_repos.append(f"    {repo_var}: new {dao_name}(daoClient),")
        else:
            # Fallback: construct from resources list (used when dependencies.ts doesn't exist yet)
            from cuur_codegen.utils.string import singularize
            for resource in resources:
                resource_singular = singularize(resource)
                repo_interface = f"{pascal_case(resource_singular)}Repository"
                repo_var = f"{camel_case(resource_singular)}Repo"
                dao_name = dao_map.get(repo_interface, f"Dao{repo_interface}")

                dao_imports.add(dao_name)
                prisma_repos.append(f"    {repo_var}: new {dao_name}(daoClient),")

        # Sort imports and repos for consistent output
        dao_imports_sorted = sorted(dao_imports)
        prisma_repos_sorted = sorted(prisma_repos)

        # Calculate Prisma client import path using folder structure config
        # Service main.ts location: services/src/{domain}/src/main.ts
        # Prisma generated location: adapters/src/{domain}/prisma/generated/index.js
        config = context.config
        folder_structure = config.folder_structure

        if not folder_structure:
            from cuur_codegen.core.layer_folder_structure import FolderStructureConfig
            folder_structure = FolderStructureConfig()

        # Get project root
        project_root = config.paths.project_root

        # Get service layer config
        services_layer = folder_structure.get_layer_config("services")
        services_base = project_root / services_layer.base_path

        # Get adapters layer config
        adapters_layer = folder_structure.get_layer_config("adapters")
        adapters_base = project_root / adapters_layer.base_path

        # Build paths
        # Service main.ts: services/src/{domain}/src/main.ts
        service_main_dir = services_base / domain_name / "src"

        # Prisma generated: adapters/src/{domain}/prisma/generated/index.js
        prisma_generated_file = adapters_base / domain_name / "prisma" / "generated" / "index.js"

        # Calculate relative path from service main.ts directory to prisma generated file
        try:
            rel_path = os.path.relpath(str(prisma_generated_file), str(service_main_dir))
            # Convert to forward slashes and ensure .js extension
            prisma_import_path = str(rel_path).replace("\\", "/")
            if not prisma_import_path.endswith(".js"):
                prisma_import_path += ".js"
        except Exception:
            # Fallback to @quub/adapters alias
            # Service: platform/services/src/{domain}/src/main.ts
            # Prisma: platform/adapters/src/{domain}/prisma/generated/index.js
            # Use @quub/adapters alias for consistency
            prisma_import_path = f"@quub/adapters/{domain_name}/prisma/generated/index.js"

        return f"""{header}/**
 * {service_name} Service - Main Entry Point
 *
 * Environment-specific service startup with:
 * - Prisma database connection
 * - DAO repository wiring
 * - Fastify server initialization
 * - Graceful shutdown handling
 */

// Import Prisma client from adapters-generated client
import {{ PrismaClient }} from "{prisma_import_path}";
import {{ startService, createDependencies }} from "./index.js";
import type {{ DaoClient }} from "@quub/adapters/shared/dao-client.js";
import {{
{chr(10).join(f"  {dao}," for dao in dao_imports_sorted)}
}} from "@quub/adapters";

/**
 * Initialize Prisma client with environment-specific configuration
 */
function createPrismaClient(): PrismaClient {{
  const isDevelopment = process.env.NODE_ENV === "development";
  const isTest = process.env.NODE_ENV === "test";

  return new PrismaClient({{
    log: isDevelopment ? ["query", "info", "warn", "error"] : ["error"],
    errorFormat: isDevelopment ? "pretty" : "minimal",
  }});
}}

/**
 * Main service startup
 */
async function main() {{
  console.log("🚀 Starting {service_name} Service...");
  console.log(`   Environment: ${{process.env.NODE_ENV || "production"}}`);
  console.log(`   Node Version: ${{process.version}}`);

  // Initialize database connection
  const prisma = createPrismaClient();

  try {{
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected");
  }} catch (error) {{
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }}

  // Wire up DAO repositories
  // Cast PrismaClient to DaoClient for type compatibility
  const daoClient = prisma as unknown as DaoClient;
  const deps = createDependencies({{
{chr(10).join(prisma_repos_sorted)}
  }});

  // Start Fastify server
  const host = process.env.HOST || "0.0.0.0";
  const port = parseInt(process.env.PORT || "3000", 10);

  const server = await startService(deps, {{
    host,
    port,
    logger: process.env.NODE_ENV !== "test",
  }});

  // Graceful shutdown
  const shutdown = async (signal: string) => {{
    console.log(`\\n${{signal}} received, shutting down gracefully...`);

    try {{
      await server.close();
      console.log("✅ HTTP server closed");

      await prisma.$disconnect();
      console.log("✅ Database disconnected");

      process.exit(0);
    }} catch (error) {{
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }}
  }};

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}}

// Start the service
main().catch((error) => {{
  console.error("❌ Fatal error:", error);
  process.exit(1);
}});
"""
