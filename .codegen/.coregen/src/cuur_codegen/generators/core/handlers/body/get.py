"""
Get Body Builder - Builds handler body for get operations
"""

from typing import Dict, Any
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.generators.core.handlers.body.response_analyzer import ResponseAnalyzer


class GetBodyBuilder:
    """Builds get handler body"""

    @staticmethod
    def build(
        context: GenerationContext,
        operation: Dict[str, Any],
        entity_var: str,
        id_function: str,
        operation_id: str = None
    ) -> str:
        """Build get handler body"""
        # Check if this operation returns a Response DTO (not an entity)
        # This check is independent of whether repo access is needed
        is_response_dto_operation = False
        needs_repo_access = False

        if operation_id:
            from cuur_codegen.utils.schema_analyzer import SchemaAnalyzer

            # Check if response is a Response DTO (regardless of repo access needs)
            is_response_dto_operation = SchemaAnalyzer.is_response_dto_operation(
                operation, context.spec, operation_id
            )

            # Check if operation needs repository access (even for Response DTOs)
            needs_repo_access = SchemaAnalyzer.operation_needs_repository_access(operation_id)

        if is_response_dto_operation:
            if needs_repo_access:
                # Response DTO that needs repo access (e.g., validate, evaluate, query)
                return GetBodyBuilder._build_response_dto_with_repo_body(
                    context, operation, entity_var, id_function, operation_id
                )
            else:
                # Response DTO without repo access
                return GetBodyBuilder._build_response_dto_body(id_function)

        # Check if response data is an array
        is_array_response = ResponseAnalyzer.is_array_response(operation, context, "200")

        if is_array_response:
            return GetBodyBuilder._build_array_response_body(context, operation, entity_var, id_function)
        else:
            return GetBodyBuilder._build_normal_response_body(context, operation, entity_var, id_function)

    @staticmethod
    def _build_array_response_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        entity_var: str,
        id_function: str
    ) -> str:
        """Build array response body"""
        # Extract entity type and converter function
        from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
        from cuur_codegen.utils.openapi import extract_schemas, get_response_schema_name
        from cuur_codegen.utils.string import camel_case

        entity_type = None
        converter_func = None

        response_schema_name = get_response_schema_name(operation, context.spec, "200")
        if response_schema_name:
            schemas_dict = extract_schemas(context.spec)
            response_schema = schemas_dict.get(response_schema_name)
            if response_schema:
                entity_type = SchemaResolver.extract_entity_from_response_schema(response_schema, schemas_dict)
                if entity_type:
                    converter_func = f"{camel_case(entity_type)}ToApi"

        # Build converter code if entity type found
        converter_code = ""
        converted_var = f"[{entity_var}]"
        if converter_func:
            converter_code = f"""  // Convert domain entity to API format (Date → ISO string)
  const convertedItem = {converter_func}({entity_var});
  const convertedArray = [convertedItem];"""
            converted_var = "convertedArray"

        return f"""  const {entity_var} = await repo.findById(orgId, id);
  if (!{entity_var}) {{
    throw new Error("Not found");
  }}
{converter_code}
  return {{
    data: {converted_var},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_response_dto_body(id_function: str) -> str:
        """Build response DTO body (operations that return Response DTOs, not entities)"""
        return f"""  // TODO: Implement validation logic
  // This operation returns a Response DTO (not an entity)
  // Implement business logic to generate the response DTO

  return {{
    data: {{
      isValid: false,
      status: "invalid" as const,
      canRefresh: false,
      // TODO: Populate other response DTO properties based on validation logic
      // Example: tokenExpiresAt, lastValidatedAt, issues
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_response_dto_with_repo_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        entity_var: str,
        id_function: str,
        operation_id: str = None
    ) -> str:
        """Build response DTO body for operations that need repo access but return Response DTOs"""
        # Check if operation has id parameter
        parameters = operation.get("parameters", [])
        has_id_param = False
        for param in parameters:
            if isinstance(param, dict):
                if "$ref" in param:
                    # Handle $ref parameters
                    from cuur_codegen.utils.openapi import resolve_ref
                    resolved_param = resolve_ref(context.spec, param["$ref"])
                    if resolved_param and resolved_param.get("in") == "path":
                        param_name = resolved_param.get("name", "")
                        if param_name and param_name not in ["orgId"]:
                            has_id_param = True
                            break
                elif param.get("in") == "path" and param.get("name") not in ["orgId"]:
                    has_id_param = True
                    break

        # Use appropriate repository call based on whether id parameter exists
        if has_id_param:
            repo_call = f"repo.findById(orgId, id)"
        else:
            # Org-scoped resource - use orgId as id
            repo_call = f"repo.findById(orgId, orgId)"

        return f"""  // Read entity from repository to compute Response DTO
  const {entity_var} = await {repo_call};
  if (!{entity_var}) {{
    throw new Error("Not found");
  }}

  // TODO: Implement business logic to compute Response DTO from entity
  // This operation returns a Response DTO (not the entity itself)
  // Example: Validate provider account, evaluate entitlements, query metrics

  return {{
    data: {{
      isValid: false, // TODO: Compute from {entity_var}
      status: "invalid" as const, // TODO: Compute from {entity_var}
      canRefresh: false, // TODO: Compute from {entity_var}
      // TODO: Populate other response DTO properties based on entity state
      // Example: tokenExpiresAt, lastValidatedAt, issues
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_normal_response_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        entity_var: str,
        id_function: str
    ) -> str:
        """Build normal single object response body"""
        # Check if operation has id parameter
        parameters = operation.get("parameters", [])
        has_id_param = False
        for param in parameters:
            if isinstance(param, dict):
                if "$ref" in param:
                    # Handle $ref parameters
                    from cuur_codegen.utils.openapi import resolve_ref
                    resolved_param = resolve_ref(context.spec, param["$ref"])
                    if resolved_param and resolved_param.get("in") == "path":
                        param_name = resolved_param.get("name", "")
                        if param_name and param_name not in ["orgId"]:
                            has_id_param = True
                            break
                elif param.get("in") == "path" and param.get("name") not in ["orgId"]:
                    has_id_param = True
                    break

        # Extract entity type and converter function
        from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
        from cuur_codegen.utils.openapi import extract_schemas, get_response_schema_name
        from cuur_codegen.utils.string import camel_case

        entity_type = None
        converter_func = None

        response_schema_name = get_response_schema_name(operation, context.spec, "200")
        if response_schema_name:
            schemas_dict = extract_schemas(context.spec)
            response_schema = schemas_dict.get(response_schema_name)
            if response_schema:
                entity_type = SchemaResolver.extract_entity_from_response_schema(response_schema, schemas_dict)
                if entity_type:
                    converter_func = f"{camel_case(entity_type)}ToApi"

        # Build converter code if entity type found
        converter_code = ""
        converted_var = entity_var
        if converter_func:
            converter_code = f"""  // Convert domain entity to API format (Date → ISO string)
  let {converted_var}Converted = {entity_var};
  try {{
    {converted_var}Converted = {converter_func}({entity_var});
  }} catch (error) {{
    // Log conversion error but continue with original entity
    if (process.env.NODE_ENV === "development") {{
      console.warn(`[Handler] Failed to convert entity:`, error);
    }}
  }}"""
            converted_var = f"{converted_var}Converted"

        # Use appropriate repository call based on whether id parameter exists
        if has_id_param:
            repo_call = f"repo.findById(orgId, id)"
        else:
            # Org-scoped resource - use orgId as id (workaround until repository interface supports org-scoped resources)
            repo_call = f"repo.findById(orgId, orgId)"

        return f"""  const {entity_var} = await {repo_call};
  if (!{entity_var}) {{
    throw new Error("Not found");
  }}
{converter_code}
  return {{
    data: {converted_var},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
