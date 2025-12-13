"""
Routes Builder

Builds route files for resources with comprehensive handler discovery
"""

from typing import Dict, Any, List, Set
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, kebab_case, pascal_case
from cuur_codegen.utils.openapi import get_request_body_schema_name
from .operation_grouper import OperationGrouper
from .handler_signature_checker import HandlerSignatureChecker
from .route_handler_builder import RouteHandlerBuilder


class RoutesBuilder:
    """Builds route files"""

    @staticmethod
    def build_routes_file(
        context: GenerationContext,
        resource: str,
        operations: List[Dict[str, Any]],
        header: str,
        available_repos: Set[str],
        handler_needs_repo: Dict[str, bool],
        handler_needs_org_id: Dict[str, bool],
        handler_name_map: Dict[str, str]
    ) -> str:
        """Generate route file for a resource"""
        route_function_name = f"{camel_case(resource)}Routes"
        route_handlers = []

        # Get handler imports
        handler_names = []
        type_names = []
        for op_data in operations:
            operation = op_data.get("operation", {})
            operation_id = operation.get("operationId") or op_data.get("operation_id", "")
            handler_name = handler_name_map.get(operation_id) or RoutesBuilder._get_handler_name(operation_id)
            if handler_name:
                handler_names.append(handler_name)

            # Collect request body type names for type imports
            if operation.get("requestBody"):
                schema_name = get_request_body_schema_name(operation, context.spec)
                if schema_name:
                    type_names.append(schema_name)

        handler_imports = ", ".join(sorted(set(handler_names)))
        type_imports = ", ".join(sorted(set(type_names))) if type_names else ""

        # Build route handlers
        for op_data in operations:
            operation = op_data.get("operation", {})
            operation_id = operation.get("operationId") or op_data.get("operation_id", "")
            handler_name = handler_name_map.get(operation_id) or RoutesBuilder._get_handler_name(operation_id)

            needs_repo = handler_needs_repo.get(operation_id, True)
            needs_org_id = handler_needs_org_id.get(operation_id, True)

            handler_code = RouteHandlerBuilder.build_route_handler(
                context,
                op_data,
                resource,
                handler_name,
                needs_repo,
                needs_org_id,
                available_repos
            )
            route_handlers.append(handler_code)

        # Build type import statement if we have types (use domain-specific subpath with /index.js)
        type_import_stmt = ""
        if type_imports:
            domain_name = context.domain_name
            type_import_stmt = f'import type {{ {type_imports} }} from "@cuur/core/{domain_name}/types/index.js";\n'

        # Use domain-specific subpath for handlers (include /index.js for TypeScript resolution)
        domain_name = context.domain_name
        handler_import_path = f"@cuur/core/{domain_name}/handlers/index.js"

        return f"""{header}import type {{ FastifyInstance }} from "fastify";
import type {{ Dependencies }} from "../dependencies/{domain_name}.dependencies.js";
import {{ {handler_imports} }} from "{handler_import_path}";
{type_import_stmt}export async function {route_function_name}(
  fastify: FastifyInstance,
  deps: Dependencies
) {{
{''.join(route_handlers)}
}}
"""

    @staticmethod
    def build_routes_index(
        context: GenerationContext,
        resource_routes: Dict[str, List[Dict[str, Any]]],
        header: str
    ) -> str:
        """Generate routes index.ts"""
        imports = []
        registrations = []
        exports = []

        from cuur_codegen.utils.string import generate_file_name
        domain_name = context.domain_name
        for resource in resource_routes.keys():
            route_function_name = f"{camel_case(resource)}Routes"
            file_name = generate_file_name(resource, "routes").replace(".ts", "")
            imports.append(
                f'import {{ {route_function_name} }} from "./{file_name}.js";'
            )
            registrations.append(f"  await {route_function_name}(fastify, deps);")
            exports.append(f"export {{ {route_function_name} }};")

        return f"""{header}import type {{ FastifyInstance }} from "fastify";
import type {{ Dependencies }} from "../dependencies/{domain_name}.dependencies.js";

{chr(10).join(imports)}

/**
 * Register all routes for {context.domain_name} service
 */
export async function registerRoutes(
  fastify: FastifyInstance,
  deps: Dependencies
) {{
{chr(10).join(registrations)}
}}

// Re-export individual route modules
{chr(10).join(exports)}
"""

    @staticmethod
    def _get_handler_name(operation_id: str) -> str:
        """Get handler name from operationId - handlers are camelCase"""
        return camel_case(operation_id)
