"""
Route Handler Builder

Builds individual route handler registrations with proper parameter extraction
"""

from typing import Dict, Any, Set, Optional
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, singularize, kebab_case
from cuur_codegen.utils.openapi import get_request_body_schema_name


class RouteHandlerBuilder:
    """Builds individual route handler code"""

    @staticmethod
    def build_route_handler(
        context: GenerationContext,
        op_data: Dict[str, Any],
        resource: str,
        handler_name: str,
        needs_repo: bool,
        needs_org_id: bool,
        available_repos: Set[str]
    ) -> str:
        """Generate a single route handler registration"""
        operation = op_data.get("operation", {})
        operation_id = operation.get("operationId") or op_data.get("operation_id", "")
        method = op_data.get("method", "get").lower()
        path_str = op_data.get("path", "")

        # Convert OpenAPI path to Fastify path
        route_path = RouteHandlerBuilder._convert_openapi_path_to_fastify(path_str)
        http_method = method.lower()

        # Determine handler parameters
        has_org_id_in_path = "{orgId}" in path_str or ":orgId" in path_str
        has_entity_id = RouteHandlerBuilder._has_entity_id(path_str)
        has_request_body = operation.get("requestBody") is not None
        has_query_params = RouteHandlerBuilder._has_query_params(operation)

        # Check if this is a computed endpoint (doesn't need ID from path)
        is_computed_endpoint = operation.get("x-handler-type") == "computed" or operation.get("x-repository") == "none"

        # Special handling for /me endpoints - they need user ID from authenticated request
        is_me_endpoint = path_str.endswith("/me") or path_str.endswith("/me}")
        needs_user_id = is_me_endpoint and not has_entity_id

        # Check handler signature to see if it requires an ID parameter even when path doesn't have one
        # This handles cases like password change operations where ID comes from authenticated user
        # For update/patch operations without ID in path, check if handler signature requires id
        if not has_entity_id and (method in ["put", "patch", "post"] and ("update" in handler_name.lower() or "patch" in handler_name.lower())):
            from .handler_signature_checker import HandlerSignatureChecker
            try:
                handlers_dir = HandlerSignatureChecker._get_core_handlers_dir(context)
                # Try to find handler file
                handler_file = None
                for possible_dir in [resource, singularize(resource), kebab_case(resource)]:
                    possible_path = handlers_dir / kebab_case(possible_dir) / f"{kebab_case(handler_name)}.ts"
                    if possible_path.exists():
                        handler_file = possible_path
                        break

                if handler_file:
                    handler_content = handler_file.read_text()
                    # Check if handler signature has 'id: string' parameter (3rd param for update handlers)
                    import re
                    func_match = re.search(
                        r"export\s+async\s+function\s+\w+\s*\(([^)]+)\)",
                        handler_content
                    )
                    if func_match:
                        params_str = func_match.group(1)
                        param_list = [p.strip() for p in params_str.split(",")]
                        # Update handlers typically have: repo, orgId, id, input (4 params)
                        # If we have 4+ params and 3rd param contains 'id: string', handler needs ID
                        if len(param_list) >= 4 and "id: string" in param_list[2]:
                            needs_user_id = True
            except Exception:
                pass  # If we can't check, assume it doesn't need user ID

        # Check if handler actually needs orgId (from handler signature, not just path)
        needs_org_id_flag = needs_org_id or has_org_id_in_path

        # Extract entity ID parameter name if exists
        entity_id_param = None
        parameters = operation.get("parameters", [])
        for param in parameters:
            if isinstance(param, dict) and param.get("in") == "path":
                param_name = param.get("name", "")
                if param_name.endswith("Id") and param_name != "orgId":
                    entity_id_param = param_name
                    break

        # Build handler call
        handler_call = RouteHandlerBuilder._build_handler_call(
            handler_name,
            needs_org_id_flag,
            has_entity_id or needs_user_id,  # /me endpoints need entity ID parameter
            has_request_body,
            has_query_params,
            operation,
            available_repos,
            needs_repo,
            resource,
            context,  # Pass context for schema name extraction
            needs_user_id,  # Pass flag for special handling
            is_computed_endpoint  # Pass flag for computed endpoints
        )

        # Build route handler code
        route_lines = []
        route_lines.append(f"  // {method.upper()} {path_str}")
        route_lines.append(f'  fastify.{http_method}("{route_path}", async (request, reply) => {{')

        # Add proper param extraction with types
        # If orgId is needed but not in path, extract from request (auth context or headers)
        if needs_org_id_flag and not has_org_id_in_path:
            route_lines.append(
                "    const orgId = (request as any).orgId || (request.headers as any)['x-org-id'] || '';"
            )

        # Special handling for /me endpoints - extract user ID from authenticated request
        if needs_user_id:
            route_lines.append(
                "    // Extract user ID from authenticated request (typically from JWT token or session)"
            )
            route_lines.append(
                "    const userId = (request as any).user?.id || (request.headers as any)['x-user-id'] || '';"
            )
            route_lines.append(
                "    if (!userId) {"
            )
            route_lines.append(
                "      return reply.code(401).send({ error: 'Unauthorized' });"
            )
            route_lines.append(
                "    }"
            )

        # Extract path parameters
        if has_org_id_in_path or entity_id_param:
            param_types = []
            param_names = []
            if has_org_id_in_path:
                param_types.append("orgId: string")
                param_names.append("orgId")
            if entity_id_param:
                param_types.append(f"{entity_id_param}: string")
                param_names.append(entity_id_param)

            route_lines.append(
                f"    const {{ {', '.join(param_names)} }} = request.params as {{ {'; '.join(param_types)} }};"
            )

        # Replace param references in handler call
        final_handler_call = handler_call
        if needs_org_id_flag and not has_org_id_in_path:
            final_handler_call = final_handler_call.replace(
                "request.params.orgId as string",
                "orgId"
            )
        elif has_org_id_in_path:
            final_handler_call = final_handler_call.replace(
                "request.params.orgId as string",
                "orgId"
            )

        if entity_id_param:
            final_handler_call = final_handler_call.replace(
                f"request.params.{entity_id_param} as string",
                entity_id_param
            )

        # Replace user ID placeholder for /me endpoints
        if needs_user_id:
            final_handler_call = final_handler_call.replace(
                "request.params.userId as string",
                "userId"
            )

        route_lines.append(f"    {final_handler_call}")
        route_lines.append("  });")
        route_lines.append("")

        return "\n".join(route_lines)

    @staticmethod
    def _convert_openapi_path_to_fastify(path_str: str) -> str:
        """Convert OpenAPI path to Fastify path"""
        import re
        return re.sub(r"\{(\w+)\}", r":\1", path_str)

    @staticmethod
    def _has_entity_id(path_str: str) -> bool:
        """Check if path has entity ID parameter"""
        import re
        matches = re.findall(r"\{(\w+Id)\}", path_str)
        return any(m != "orgId" for m in matches)

    @staticmethod
    def _has_query_params(operation: Dict[str, Any]) -> bool:
        """Check if operation has query parameters"""
        parameters = operation.get("parameters", [])
        return any(
            isinstance(p, dict) and p.get("in") == "query"
            for p in parameters
        )

    @staticmethod
    def _build_handler_call(
        handler_name: str,
        has_org_id: bool,
        has_entity_id: bool,
        has_request_body: bool,
        has_query_params: bool,
        operation: Dict[str, Any],
        available_repos: Set[str],
        needs_repo: bool,
        resource: str,
        context: GenerationContext,
        needs_user_id: bool = False,
        is_computed_endpoint: bool = False
    ) -> str:
        """Build handler call with proper parameters"""
        params = []

        # Extract entity ID parameter name if exists
        entity_id_param = None
        parameters = operation.get("parameters", [])
        for param in parameters:
            if isinstance(param, dict) and param.get("in") == "path":
                param_name = param.get("name", "")
                if param_name.endswith("Id") and param_name != "orgId":
                    entity_id_param = param_name
                    break

        # Check if handler needs repository - only add if handler needs it AND repository exists in dependencies
        if needs_repo:
            # Extract resource from handler name to get repo name
            # Use singular form to match dependencies interface
            import re
            resource_match = re.match(r"^(list|get|create|update|delete|patch)([A-Z]\w+)", handler_name)
            if resource_match:
                # Convert to singular form to match dependencies
                resource_singular = singularize(camel_case(resource_match.group(2)))
                repo_name = f"{resource_singular}Repo"

                # Try exact match first
                if repo_name in available_repos:
                    params.append(f"deps.{repo_name}")
                else:
                    # Try to find a matching repository
                    resource_lower = resource_singular.lower()

                    # First try: find repo that ends with the resource name
                    matching_repo = None
                    for repo in available_repos:
                        repo_base = repo.replace("Repo", "").lower()
                        if repo_base.endswith(resource_lower):
                            matching_repo = repo
                            break

                    # Second try: find repo that contains the resource name
                    if not matching_repo:
                        for repo in available_repos:
                            repo_base = repo.replace("Repo", "").lower()
                            if resource_lower in repo_base and len(repo_base) > len(resource_lower):
                                matching_repo = repo
                                break

                    if matching_repo:
                        params.append(f"deps.{matching_repo}")

        if has_org_id:
            params.append("request.params.orgId as string")

        if has_entity_id and entity_id_param:
            params.append(f"request.params.{entity_id_param} as string")
        elif needs_user_id:
            # For /me endpoints, use userId variable that will be extracted above
            params.append("userId")
        elif is_computed_endpoint:
            # For computed endpoints, check if handler signature requires ID
            # Try to source ID from query parameters if available, otherwise skip if optional
            from .handler_signature_checker import HandlerSignatureChecker
            try:
                handlers_dir = HandlerSignatureChecker._get_core_handlers_dir(context)
                handler_file = None
                for possible_dir in [resource, singularize(resource), kebab_case(resource)]:
                    possible_path = handlers_dir / kebab_case(possible_dir) / f"{kebab_case(handler_name)}.ts"
                    if possible_path.exists():
                        handler_file = possible_path
                        break

                if handler_file:
                    handler_content = handler_file.read_text()
                    import re
                    func_match = re.search(
                        r"export\s+async\s+function\s+\w+\s*\(([^)]+)\)",
                        handler_content
                    )
                    if func_match:
                        params_str = func_match.group(1)
                        param_list = [p.strip() for p in params_str.split(",")]
                        # Check if handler has id parameter (3rd param after repo and orgId)
                        if len(param_list) >= 3:
                            id_param = param_list[2]
                            # Check if ID is optional (id?: string) - if so, skip it
                            if "id?:" in id_param or "id?: string" in id_param:
                                # Parameter is optional, skip it for computed endpoints
                                pass
                            elif "id: string" in id_param:
                                # Parameter is required - try to source from query params or use empty string
                                # Check if there's an 'id' query parameter
                                query_params = operation.get("parameters", [])
                                has_id_query = any(
                                    isinstance(p, dict) and p.get("in") == "query" and p.get("name") == "id"
                                    for p in query_params
                                )
                                if has_id_query:
                                    params.append("(request.query as any).id as string")
                                else:
                                    # No ID available - pass empty string as fallback
                                    # TODO: Fix handler generator to not require ID for computed endpoints
                                    params.append('""')
            except Exception:
                pass  # If we can't check, don't add ID parameter

        if has_request_body:
            # Extract input type from operation's requestBody schema for proper type assertion
            input_type = get_request_body_schema_name(operation, context.spec)
            if input_type:
                # Use proper type assertion instead of 'as any' for better type safety
                # This maintains type safety while allowing Fastify's runtime validation
                params.append(f"request.body as {input_type}")
            else:
                # Fallback: use 'as unknown' to indicate we don't know the type
                # Runtime validation should catch invalid data
                params.append("request.body as unknown")

        if has_query_params:
            params.append("request.query || {}")

        params_str = ", ".join(params)
        status_code = RouteHandlerBuilder._get_status_code(operation)

        return f"const result = await {handler_name}({params_str});\n    return reply.code({status_code}).send(result);"

    @staticmethod
    def _get_status_code(operation: Dict[str, Any]) -> int:
        """Get HTTP status code for operation"""
        responses = operation.get("responses", {})
        if "201" in responses:
            return 201
        if "204" in responses:
            return 204
        return 200
