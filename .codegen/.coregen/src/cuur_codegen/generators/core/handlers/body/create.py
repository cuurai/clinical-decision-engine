"""
Create Body Builder - Builds handler body for create operations
"""

from typing import Dict, Any
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.generators.core.handlers.body.response_analyzer import ResponseAnalyzer
from cuur_codegen.utils.openapi import get_response_schema_name


class CreateBodyBuilder:
    """Builds create handler body"""

    @staticmethod
    def build(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        entity_var: str,
        id_function: str,
        operation_id: str = None,
        verb: str = None,
        has_id_param: bool = True
    ) -> str:
        """Build create handler body"""
        # Determine if operation has id parameter by checking path parameters
        if verb in ["update", "delete"]:
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
        # Check if this operation should use a repository
        # Skip repository for:
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
            from cuur_codegen.utils.schema_analyzer import SchemaAnalyzer
            if SchemaAnalyzer.should_skip_repository_generation(operation, context.spec, operation_id):
                # Check if operation needs repository access despite returning Response DTO
                # (e.g., search, query, evaluate operations that read entities to compute result)
                if SchemaAnalyzer.operation_needs_repository_access(operation_id):
                    # Don't mark as Response DTO - it needs repository access
                    is_response_dto_operation = False
                else:
                    is_response_dto_operation = True

        # Build appropriate body based on operation type
        if is_oauth_operation:
            return CreateBodyBuilder._build_oauth_body(operation, context, id_function)
        elif is_response_dto_operation or is_empty_response:
            # Operations that don't use repositories - return TODO or empty response
            if is_empty_response:
                return CreateBodyBuilder._build_empty_response_body(id_function)
            else:
                return CreateBodyBuilder._build_response_dto_body(id_function)

        # Check if this is a search/query operation that needs repository access
        # but shouldn't use create() - should read from repositories instead
        from cuur_codegen.utils.schema_analyzer import SchemaAnalyzer
        if SchemaAnalyzer.operation_needs_repository_access(operation_id):
            return CreateBodyBuilder._build_search_query_body(
                context, operation, entity_var, id_function, operation_id
            )

        # Check for 202 task response first
        is_202_task_response = ResponseAnalyzer.is_202_task_response(operation, context)

        # Get response schema name
        if is_202_task_response:
            response_schema_name = get_response_schema_name(operation, context.spec, "202")
        else:
            response_schema_name = ResponseAnalyzer.get_response_schema_name_for_verb(
                operation, context, "create"
            )

        # Check for OperationSuccessResponse
        if response_schema_name:
            uses_operation_success = ResponseAnalyzer.uses_operation_success(
                operation, context, "201" if not is_202_task_response else "202"
            )
            if uses_operation_success:
                return CreateBodyBuilder._build_operation_success_body(id_function)

        # Check for 202 task response
        if is_202_task_response:
            return CreateBodyBuilder._build_task_response_body(id_function)

        # Check for empty data response
        # For create operations: check 201 first, then 202 if it's a 202 response
        if response_schema_name:
            status_to_check = "202" if is_202_task_response or "202" in operation.get("responses", {}) else "201"
            is_empty = ResponseAnalyzer.is_empty_data_response(operation, context, status_to_check)
            if is_empty:
                return CreateBodyBuilder._build_empty_data_body(id_function)

        # Check for array response
        if response_schema_name:
            is_array = ResponseAnalyzer.is_array_response(operation, context, "201")
            if is_array:
                return CreateBodyBuilder._build_array_response_body(entity_var, id_function)

        # Check for data.items response (list-like structure)
        if response_schema_name:
            is_items = ResponseAnalyzer.is_items_response(operation, context, "201")
            if is_items:
                # Extract entity type for converter
                from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
                from cuur_codegen.utils.openapi import extract_schemas
                from cuur_codegen.utils.string import camel_case

                schemas_dict = extract_schemas(context.spec)
                response_schema = schemas_dict.get(response_schema_name)
                entity_type = None
                converter_func = None

                if response_schema:
                    entity_type = SchemaResolver.extract_entity_from_response_schema(response_schema, schemas_dict)
                    if entity_type:
                        converter_func = f"{camel_case(entity_type)}ToApi"

                return CreateBodyBuilder._build_items_response_body(entity_var, id_function, converter_func)

        # Check if response schema is already a full response structure
        # (repository returns full response vs handler needs to wrap entity)
        if response_schema_name:
            status_to_check = "202" if is_202_task_response else "201"
            is_full_response = ResponseAnalyzer.is_full_response_structure(
                operation, context, status_to_check
            )
            if is_full_response:
                # Repository returns full response structure - return directly
                return CreateBodyBuilder._build_direct_response_body(entity_var)

        # Normal create response - extract entity type for converter
        converter_func = None
        if response_schema_name:
            from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
            from cuur_codegen.utils.openapi import extract_schemas
            from cuur_codegen.utils.string import camel_case

            schemas_dict = extract_schemas(context.spec)
            response_schema = schemas_dict.get(response_schema_name)
            if response_schema:
                entity_type = SchemaResolver.extract_entity_from_response_schema(response_schema, schemas_dict)
                if entity_type:
                    converter_func = f"{camel_case(entity_type)}ToApi"

        return CreateBodyBuilder._build_normal_response_body(entity_var, id_function, converter_func, verb, has_id_param)

    @staticmethod
    def _build_operation_success_body(id_function: str) -> str:
        """Build OperationSuccessResponse body"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  await repo.create(orgId, validated);

  // 3. Return success response (OperationSuccessResponse)
  return {{
    data: {{ success: true }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_task_response_body(id_function: str) -> str:
        """Build 202 task response body"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (async operation)
  await repo.create(orgId, validated);

  // 3. Return 202 task response (async operation accepted)
  const taskId = {id_function}().replace(/^[^_]+_/, '');
  return {{
    data: {{
      taskId: taskId,
      status: "PENDING" as const,
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_empty_data_body(id_function: str) -> str:
        """Build empty data response body"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (async operation)
  await repo.create(orgId, validated);

  // 3. Return empty data response (async operation accepted)
  return {{
    data: {{}},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_array_response_body(entity_var: str, id_function: str) -> str:
        """Build array response body"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const {entity_var} = await repo.create(orgId, validated);

  // 3. Repository result → response envelope (array response)
  return {{
    data: [{entity_var}],
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_items_response_body(entity_var: str, id_function: str, converter_func: str = None) -> str:
        """Build data.items response body (list-like structure)"""
        if converter_func:
            return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const {entity_var} = await repo.create(orgId, validated);

  // 3. Convert domain entity to API format (Date → ISO string)
  const converted{entity_var.capitalize()} = (() => {{
    try {{
      return {converter_func}({entity_var});
    }} catch (error) {{
      if (process.env.NODE_ENV === "development") {{
        console.warn(`[Handler] Failed to convert entity:`, error);
      }}
      return {entity_var};
    }}
  }})();

  // 4. Repository result → response envelope (data.items structure)
  return {{
    data: {{
      items: [converted{entity_var.capitalize()}],
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
        else:
            return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const {entity_var} = await repo.create(orgId, validated);

  // 3. Repository result → response envelope (data.items structure)
  return {{
    data: {{
      items: [{entity_var}],
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_direct_response_body(entity_var: str) -> str:
        """Build direct response body (repository already returns full response structure)"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  // Repository returns full response structure (already has data and meta)
  const {entity_var} = await repo.create(orgId, validated);

  // 3. Return repository result directly (already wrapped in {{ data, meta }})
  // No need to wrap again or generate correlationId - repository handles it
  return {entity_var};
"""

    @staticmethod
    def _build_empty_response_body(id_function: str) -> str:
        """Build body for operations with empty responses (no repository)"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Operation doesn't return an entity - implement business logic here
  // TODO: Implement operation logic (e.g., webhook handling, event processing)

  // 3. Return empty response
  return {{
    data: {{}},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_response_dto_body(id_function: str) -> str:
        """Build body for operations that return Response DTOs (no repository)"""
        return f"""  // 1. Validate input
  // TODO: Use validated input when implementing business logic
  // const validated = mapInputToValidated(input);

  // 2. Operation returns a Response DTO (not an entity) - implement business logic here
  // TODO: Implement operation logic (e.g., authentication, authorization, evaluation)

  throw new Error("Operation not yet implemented - requires business logic integration");
"""

    @staticmethod
    def _build_search_query_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        entity_var: str,
        id_function: str,
        operation_id: str = None
    ) -> str:
        """Build body for search/query operations that need repository access to read entities"""
        from cuur_codegen.utils.openapi import get_response_schema_name, get_response_schema, extract_schemas

        # Get response schema to determine structure
        response_schema_name = get_response_schema_name(operation, context.spec, "200")
        response_schema = get_response_schema(operation, context.spec, "200")

        # Check if response has items array (search results)
        has_items_array = False
        if response_schema and isinstance(response_schema, dict):
            if "properties" in response_schema:
                data_prop = response_schema["properties"].get("data")
                if data_prop and isinstance(data_prop, dict) and "properties" in data_prop:
                    if "items" in data_prop["properties"]:
                        has_items_array = True

        if has_items_array:
            # Search/query operation that returns array of results (list response with pagination)
            return f"""  // 1. Validate input
  // TODO: Use validated input when implementing search logic
  // const validated = mapInputToValidated(input);

  // 2. Search/query operation - read from repositories to compute result
  // TODO: Implement search logic using repository to read entities
  // TODO: Use orgId and validated when implementing: const results = await repo.search(orgId, validated.query);

  // 3. Return search results in Response DTO format with pagination
  return {{
    data: {{
      items: [], // TODO: Return search results
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
      pagination: {{
        nextCursor: null,
        prevCursor: null,
        limit: 0,
      }},
    }},
  }};
"""
        else:
            # Single result Response DTO
            return f"""  // 1. Validate input
  // TODO: Use validated input when implementing query logic
  // const validated = mapInputToValidated(input);

  // 2. Query/evaluate operation - read from repositories to compute result
  // TODO: Implement query logic using repository to read entities
  // TODO: Use repo, orgId, and validated when implementing: const subscription = await repo.findById(orgId, orgId);

  // 3. Return Response DTO with computed result
  return {{
    data: {{
      // TODO: Populate Response DTO properties based on repository reads
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_oauth_body(operation: Dict[str, Any], context: GenerationContext, id_function: str) -> str:
        """Build OAuth operation body (doesn't use repository)"""
        from cuur_codegen.utils.openapi import get_response_schema_name, get_response_schema, extract_schemas

        # Determine status code
        response_schema_name = get_response_schema_name(operation, context.spec, "200")
        status_code = "200"
        if not response_schema_name:
            response_schema_name = get_response_schema_name(operation, context.spec, "201")
            status_code = "201"

        # Check if response is already a full response structure
        is_full_response = ResponseAnalyzer.is_full_response_structure(operation, context, status_code)

        if is_full_response and response_schema_name:
            # OAuth operation that returns full response (e.g., OAuthStartResponse)
            # Extract the data structure from the response schema
            schemas_dict = extract_schemas(context.spec)
            response_schema = schemas_dict.get(response_schema_name)

            # Get data properties for OAuth response
            data_properties = {}
            if response_schema and isinstance(response_schema, dict):
                if "allOf" in response_schema:
                    for item in response_schema["allOf"]:
                        if isinstance(item, dict) and "properties" in item:
                            data_schema = item["properties"].get("data", {})
                            if isinstance(data_schema, dict) and "properties" in data_schema:
                                data_properties = data_schema["properties"]
                                break
                elif "properties" in response_schema:
                    data_schema = response_schema["properties"].get("data", {})
                    if isinstance(data_schema, dict) and "properties" in data_schema:
                        data_properties = data_schema["properties"]

            # Build OAuth response data object with proper TypeScript syntax
            oauth_data_fields = []
            if "authorizationUrl" in data_properties:
                oauth_data_fields.append('authorizationUrl: ""')
            if "state" in data_properties:
                oauth_data_fields.append('state: ""')

            if oauth_data_fields:
                # Join fields with newlines and proper indentation
                # Last field doesn't need trailing comma (handled by object closing brace)
                oauth_data_content = ",\n      ".join(oauth_data_fields)
                return f"""  // 1. Validate input
  // TODO: Use validated input and orgId when implementing OAuth logic
  // const validated = mapInputToValidated(input);
  // TODO: Use orgId when implementing OAuth flow

  // 2. Implement OAuth operation logic
  // Generate authorization URL, state parameter, and handle OAuth flow

  // 3. Return OAuth response structure
  return {{
    data: {{
      {oauth_data_content}
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
            else:
                # Fallback if no data properties found
                return f"""  // 1. Validate input
  // TODO: Use validated input and orgId when implementing OAuth logic
  // const validated = mapInputToValidated(input);
  // TODO: Use orgId when implementing OAuth flow

  // 2. OAuth operation - generate authorization URL or handle callback
  // TODO: Implement OAuth service logic here
  // This typically involves:
  // - Generating OAuth authorization URL with state parameter
  // - Or exchanging authorization code for tokens (callback)
  // - Calling OAuth service/provider-specific logic

  // 3. Return OAuth response structure
  return {{
    data: {{}},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
        else:
            # OAuth operation that needs wrapping
            return f"""  // 1. Validate input
  // TODO: Use validated input and orgId when implementing OAuth logic
  // const validated = mapInputToValidated(input);
  // TODO: Use orgId when implementing OAuth flow

  // 2. OAuth operation - generate authorization URL or handle callback
  // TODO: Implement OAuth service logic here

  // 3. Return response envelope
  return {{
    data: {{}},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_normal_response_body(entity_var: str, id_function: str, converter_func: str = None, verb: str = None, has_id_param: bool = True) -> str:
        """Build normal create response body"""
        # Use verb from VerbMapper exclusively - update verb means use repo.update
        is_update_operation = verb == "update"

        if converter_func:
            if is_update_operation:
                # For org-scoped updates without id parameter, use orgId as id (workaround)
                update_call = f"repo.update(orgId, id, validated)" if has_id_param else f"repo.update(orgId, orgId, validated)"
                return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const {entity_var} = await {update_call};

  // 3. Convert domain entity to API format (Date → ISO string)
  const converted{entity_var.capitalize()} = (() => {{
    try {{
      return {converter_func}({entity_var});
    }} catch (error) {{
      if (process.env.NODE_ENV === "development") {{
        console.warn(`[Handler] Failed to convert entity:`, error);
      }}
      return {entity_var};
    }}
  }})();

  // 4. Repository result → response envelope
  return {{
    data: converted{entity_var.capitalize()},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
            else:
                return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const {entity_var} = await repo.create(orgId, validated);

  // 3. Convert domain entity to API format (Date → ISO string)
  const converted{entity_var.capitalize()} = (() => {{
    try {{
      return {converter_func}({entity_var});
    }} catch (error) {{
      if (process.env.NODE_ENV === "development") {{
        console.warn(`[Handler] Failed to convert entity:`, error);
      }}
      return {entity_var};
    }}
  }})();

  // 4. Repository result → response envelope
  return {{
    data: converted{entity_var.capitalize()},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
        else:
            if is_update_operation:
                # For org-scoped updates without id parameter, use orgId as id (workaround)
                update_call = f"repo.update(orgId, id, validated)" if has_id_param else f"repo.update(orgId, orgId, validated)"
                return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const {entity_var} = await {update_call};

  // 3. Repository result → response envelope
  return {{
    data: {entity_var},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
            else:
                return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const {entity_var} = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {{
    data: {entity_var},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
