"""
Handler Types Builder - Builds parameter and return types for handlers
"""

from typing import Dict, Any
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.utils.string import pascal_case, build_type_name, camel_case, pluralize_resource_name
from cuur_codegen.utils.openapi import get_response_schema_name, get_request_body_schema_name


class HandlerTypesBuilder:
    """Builds parameter and return types for handler functions"""

    @staticmethod
    def build_parameters(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        verb: str,
        operation_id: str = None
    ) -> str:
        """Build function parameters"""
        params = []

        # Repository parameter (skip for operations that don't have repositories)
        # Skip for:
        # 1. OAuth operations that return OAuth responses (not entities)
        # 2. Operations that return Response DTOs (LoginResponse, RefreshResponse, etc.)
        # 3. Operations with empty responses (no JSON content)
        is_oauth_operation = False
        is_response_dto_operation = False
        is_empty_response = False

        if operation_id:
            from cuur_codegen.utils.openapi import get_response_schema_name, get_response_schema
            from cuur_codegen.utils.openapi import extract_schemas

            response_schema_name = get_response_schema_name(operation, context.spec, "200")
            if not response_schema_name:
                response_schema_name = get_response_schema_name(operation, context.spec, "201")

            # Check for empty response (no JSON content)
            # Skip this check for delete operations (they return 204 but still need repo)
            if verb != "delete":
                if not response_schema_name:
                    responses = operation.get("responses", {})
                    has_json_content = False
                    for status_code in ["200", "201", "202"]:
                        if status_code in responses:
                            response = responses[status_code]
                            if isinstance(response, dict):
                                content = response.get("content", {})
                                if "application/json" in content:
                                    has_json_content = True
                                    break
                    if not has_json_content:
                        is_empty_response = True

            # Check for OAuth response
            if response_schema_name and "oauth" in response_schema_name.lower():
                is_oauth_operation = True

            # Check for Response DTOs (LoginResponse, RefreshResponse, EntitlementEvaluateResponse, MetricQueryResponse)
            # Also check inner schema if wrapped in data
            response_schema = get_response_schema(operation, context.spec, "200")
            if not response_schema:
                response_schema = get_response_schema(operation, context.spec, "201")

            # Use semantic analysis to determine if this is a Response DTO operation
            # BUT: List operations always need repositories (they read entities)
            # Skip repository check for list operations
            if verb != "list":
                from cuur_codegen.utils.schema_analyzer import SchemaAnalyzer
                if SchemaAnalyzer.should_skip_repository_generation(operation, context.spec, operation_id):
                    is_response_dto_operation = True

        # List operations always need repositories (they read entities)
        # Other operations skip repositories only if they're OAuth, Response DTOs, or empty responses
        if verb == "list" or not (is_oauth_operation or is_response_dto_operation or is_empty_response):
            repo_name = NamingConvention.repository_type_name(resource)
            params.append(f"repo: {repo_name}")

        # Organization ID (always second)
        params.append("orgId: string")

        # Entity ID (for specific entity operations)
        # Check actual path parameters - only add id if it exists in the path
        if verb in ["get", "update", "delete"]:
            # Check if path has an ID parameter (e.g., {id}, {userId}, {subscriptionId})
            parameters = operation.get("parameters", [])
            has_id_param = False
            for param in parameters:
                if isinstance(param, dict):
                    if param.get("in") == "path" and param.get("name") not in ["orgId"]:
                        has_id_param = True
                        break
                    elif "$ref" in param:
                        # Handle $ref parameters
                        from cuur_codegen.utils.openapi import resolve_ref
                        resolved_param = resolve_ref(context.spec, param["$ref"])
                        if resolved_param and resolved_param.get("in") == "path":
                            param_name = resolved_param.get("name", "")
                            if param_name and param_name not in ["orgId"]:
                                has_id_param = True
                                break

            if has_id_param:
                params.append("id: string")

        # Input parameter (for create/update operations)
        if verb in ["create", "update", "patch"]:
            schema_name = get_request_body_schema_name(operation, context.spec)
            if schema_name:
                params.append(f"input: {schema_name}")
            else:
                params.append("input: unknown")

        # Query parameters (for list operations with query parameters)
        if verb == "list":
            parameters = operation.get("parameters", [])
            has_query = any(p.get("in") == "query" for p in parameters if isinstance(p, dict))
            if has_query:
                if operation_id:
                    list_params_type = f"{pascal_case(operation_id)}Params"
                else:
                    plural_resource = pluralize_resource_name(resource)
                    list_params_type = f"List{pascal_case(plural_resource)}Params"
                params.append(f"params?: {list_params_type}")

        return ",\n  ".join(params)

    @staticmethod
    def build_return_type(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        verb: str,
        operation_id: str = None
    ) -> str:
        """Build return type - uses operation_id to match types generator naming"""
        responses = operation.get("responses", {})

        # Determine status code based on verb
        status_code = HandlerTypesBuilder._determine_status_code(verb, responses)

        # Check if response has application/json content
        if status_code:
            response = responses.get(status_code, {})
            content = response.get("content", {}) if isinstance(response, dict) else {}

            if "application/json" in content:
                # Use operation_id-based naming to match types generator (line 411 in types.py)
                # Types generator always exports as: {pascal_case(operation_id)}Response
                if operation_id:
                    return f"{pascal_case(operation_id)}Response"
                else:
                    return build_type_name(resource, verb.capitalize()) + "Response"

        # No application/json content - use any as fallback
        return "any"

    @staticmethod
    def _determine_status_code(verb: str, responses: Dict[str, Any]) -> str:
        """Determine status code based on verb"""
        if verb == "create":
            if "201" in responses:
                return "201"
            elif "200" in responses:
                return "200"
            elif "202" in responses:
                return "202"
        elif verb == "delete":
            if "204" in responses:
                return "204"
            elif "200" in responses:
                return "200"
        else:
            if "200" in responses:
                return "200"
            elif "204" in responses:
                return "204"
        return None
