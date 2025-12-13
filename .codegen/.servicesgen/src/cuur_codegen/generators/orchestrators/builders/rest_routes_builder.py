"""
REST Routes Builder - Builds Fastify routes for Orchestrator REST API
"""

from typing import Dict, Any, List
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, kebab_case, generate_file_name


class RestRoutesBuilder:
    """Builder for REST routes"""

    # Common route patterns
    ROUTE_PATTERNS = {
        "dashboard": {
            "path": "/api/dashboard",
            "method": "GET",
            "handler": "getDashboard",
            "aggregator": "DashboardAggregator",
            "description": "Get dashboard data",
        },
        "portfolio": {
            "path": "/api/portfolio",
            "method": "GET",
            "handler": "getPortfolio",
            "aggregator": "PortfolioAggregator",
            "description": "Get portfolio overview",
        },
        "trading": {
            "path": "/api/trading/context",
            "method": "GET",
            "handler": "getTradingContext",
            "aggregator": "TradingAggregator",
            "description": "Get trading context",
        },
    }

    @staticmethod
    def build_routes(
        context: GenerationContext,
        routes: List[Dict[str, Any]],
        header: str,
    ) -> str:
        """
        Build REST route handlers.

        Args:
            context: Generation context
            routes: List of route definitions
            header: File header comment

        Returns:
            Generated TypeScript code
        """
        # Import aggregators
        aggregator_imports = set()
        aggregator_instances = []

        for route in routes:
            aggregator_name = route.get("aggregator")
            if aggregator_name:
                aggregator_imports.add(aggregator_name)
                aggregator_camel = camel_case(aggregator_name.replace("Aggregator", ""))
                aggregator_instances.append(f"  private {aggregator_camel}Aggregator: {aggregator_name};")

        # Build route handlers
        route_handlers = []
        for route in routes:
            handler_code = RestRoutesBuilder._build_route_handler(route)
            route_handlers.append(handler_code)

        # Build routes file
        routes_content = f"""{header}

/**
 * Orchestrator REST Routes
 *
 * Aggregated routes that combine multiple domain services.
 */

import type {{ FastifyInstance, FastifyRequest, FastifyReply }} from "fastify";
{chr(10).join([f'import {{ {agg} }} from "../../services/aggregators/{generate_file_name(agg.replace("Aggregator", ""), "aggregator").replace(".ts", "")}.js";' for agg in sorted(aggregator_imports)])}

export async function registerOrchestratorRoutes(fastify: FastifyInstance): Promise<void> {{
  // Initialize aggregators
{chr(10).join([f'  const {camel_case(agg.replace("Aggregator", ""))}Aggregator = new {agg}(/* inject service clients */);' for agg in sorted(aggregator_imports)])}

{chr(10).join(route_handlers)}
}}
"""

        return routes_content.strip()

    @staticmethod
    def _build_route_handler(route: Dict[str, Any]) -> str:
        """Build a single route handler"""
        path = route["path"]
        method = route["method"].lower()
        handler_name = route["handler"]
        aggregator_name = route.get("aggregator")
        description = route.get("description", "")

        aggregator_camel = camel_case(aggregator_name.replace("Aggregator", "")) if aggregator_name else None

        # Extract path parameters
        path_params = []
        if "{" in path:
            import re
            params = re.findall(r'\{(\w+)\}', path)
            path_params = [f"{p}: string" for p in params]

        # Build handler
        handler_code = f"""  /**
   * {description}
   */
  fastify.{method}("{path}", async (request: FastifyRequest, reply: FastifyReply) => {{
    try {{
      const userId = (request as any).user?.id || (request.headers as any)['x-user-id'] || '';
      const orgId = (request as any).orgId || (request.headers as any)['x-org-id'] || '';

      const result = await {aggregator_camel}Aggregator.{handler_name}(userId, orgId);

      return reply.code(200).send(result);
    }} catch (error) {{
      request.log.error(error);
      return reply.code(500).send({{ error: 'Internal server error' }});
    }}
  }});"""

        return handler_code
