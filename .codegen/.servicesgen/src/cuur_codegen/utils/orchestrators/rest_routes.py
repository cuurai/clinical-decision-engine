"""
REST Routes Builder - Utility for building REST routes for orchestrators

This is a utility function, not a generator. It can be called by generators
to build REST route files.
"""

from pathlib import Path
from typing import List, Any

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.logger import Logger
from cuur_codegen.utils.file import ensure_directory, write_file
from cuur_codegen.utils.string import pascal_case, kebab_case, generate_file_name


def build_rest_routes(
    context: GenerationContext,
    orchestrator_domain_config: Any,
    output_dir: Path,
    logger: Logger,
) -> List[Path]:
    """
    Build REST route files for an orchestrator domain.

    Args:
        context: Generation context
        orchestrator_domain_config: Orchestrator domain configuration
        output_dir: Output directory for routes
        logger: Logger instance

    Returns:
        List of generated file paths
    """
    files: List[Path] = []

    # Generate routes in orchestrator domain-specific directory
    project_root = context.config.paths.project_root
    orchestrator_domain_routes_dir = (
        project_root / "orchestrators" / "src" / "domains" /
        context.domain_name / "routes"
    )
    ensure_directory(orchestrator_domain_routes_dir)

    # Generate routes file for this orchestrator domain
    routes_file = orchestrator_domain_routes_dir / generate_file_name(context.domain_name, "routes")

    # Generate header
    from cuur_codegen.base.builder import BaseBuilder
    header = BaseBuilder.generate_header(
        context,
        f"REST API Routes for {orchestrator_domain_config.display_name}",
    )

    # Build routes content from orchestrator domain aggregators
    content = _build_orchestrator_domain_routes(
        context,
        orchestrator_domain_config,
        header,
    )

    write_file(routes_file, content)
    files.append(routes_file)

    logger.info(
        f"Generated REST routes: {routes_file.name} "
        f"for orchestrator domain '{context.domain_name}'"
    )

    return files


def _build_orchestrator_domain_routes(
    context: GenerationContext,
    orchestrator_domain_config: Any,
    header: str,
) -> str:
    """Build REST routes TypeScript code from orchestrator domain configuration"""
    domain_pascal = pascal_case(context.domain_name.replace("-", ""))

    # Import aggregators
    aggregator_imports = []
    for agg_config in orchestrator_domain_config.aggregators:
        agg_name = pascal_case(agg_config.name.replace(" ", "").replace("-", ""))
        aggregator_file_name = generate_file_name(agg_config.name, "aggregator").replace(".ts", "")
        aggregator_imports.append(
            f'import {{ {agg_name}Aggregator }} from "../aggregators/{aggregator_file_name}.js";'
        )

    # Build route handlers
    route_handlers = []
    for agg_config in orchestrator_domain_config.aggregators:
        agg_name = pascal_case(agg_config.name.replace(" ", "").replace("-", ""))
        route_path = f"/{context.domain_name}/{kebab_case(agg_config.name)}"
        route_method = "post"  # Default to POST for business operations

        route_handlers.append(f"""  fastify.{route_method}("{route_path}", async (request, reply) => {{
    const aggregator = fastify.diContainer.resolve({agg_name}Aggregator);
    const result = await aggregator.execute(request.body);
    return result;
  }});""")

    routes_content = f"""{header}

/**
 * REST API Routes for {orchestrator_domain_config.display_name}
 *
 * Business-scenario-driven routes that use aggregators to combine
 * multiple core domain service calls.
 */

import {{ FastifyInstance }} from "fastify";
{chr(10).join(aggregator_imports)}

export async function {domain_pascal}Routes(fastify: FastifyInstance) {{
{chr(10).join(route_handlers)}
}}
"""

    return routes_content.strip()
