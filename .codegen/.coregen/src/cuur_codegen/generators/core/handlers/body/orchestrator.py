"""
Handler Body Orchestrator - Orchestrates building handler function bodies for different HTTP verbs
"""

from typing import Dict, Any
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.utils.string import camel_case, pascal_case
from cuur_codegen.generators.core.repositories.entity_extractor import EntityExtractor


class HandlerBodyBuilder:
    """Builds handler function bodies"""

    DOMAIN_PREFIX_MAP = {
        "activity": "ac",
        "ai": "ai",
        "channel": "ch",
        "compliance": "co",
        "content": "cn",
        "conversation": "cv",
        "entitlement": "en",
        "identity": "id",
        "knowledge": "kn",
        "metrics": "mt",
        "notification": "ob",
        "observability": "ob",
        "operations": "op",
        "scheduling": "sc",
    }

    @staticmethod
    def build_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        verb: str,
        operation_id: str = None
    ) -> str:
        """Build handler function body based on verb"""
        id_function = HandlerBodyBuilder._get_id_function(context.domain_name)
        entity_var = camel_case(resource)

        if verb == "create" or verb == "update":
            # Both create and update operations use the create body builder
            # The builder will check the verb to determine repo.create vs repo.update
            return HandlerBodyBuilder._build_create_body(
                context, operation, resource, entity_var, id_function, operation_id, verb
            )
        elif verb == "get":
            return HandlerBodyBuilder._build_get_body(
                context, operation, entity_var, id_function, operation_id
            )
        elif verb == "list":
            return HandlerBodyBuilder._build_list_body(
                context, operation, resource, id_function
            )
        elif verb in ["update", "patch"]:
            return HandlerBodyBuilder._build_update_body(
                context, operation, resource, entity_var, id_function
            )
        elif verb == "delete":
            return HandlerBodyBuilder._build_delete_body(id_function)
        else:
            return HandlerBodyBuilder._build_unknown_verb_body()

    @staticmethod
    def _get_id_function(domain_name: str) -> str:
        """Get ID generator function name for domain"""
        prefix = HandlerBodyBuilder.DOMAIN_PREFIX_MAP.get(domain_name)
        if not prefix:
            words = domain_name.split("-")
            prefix = "".join([word[0] for word in words if word])[:2].lower()
        return f"{prefix}TransactionId"

    @staticmethod
    def _build_create_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        entity_var: str,
        id_function: str,
        operation_id: str = None,
        verb: str = None
    ) -> str:
        """Build create handler body"""
        from cuur_codegen.generators.core.handlers.body.create import CreateBodyBuilder
        return CreateBodyBuilder.build(context, operation, resource, entity_var, id_function, operation_id, verb)

    @staticmethod
    def _build_get_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        entity_var: str,
        id_function: str,
        operation_id: str = None
    ) -> str:
        """Build get handler body"""
        from cuur_codegen.generators.core.handlers.body.get import GetBodyBuilder
        return GetBodyBuilder.build(context, operation, entity_var, id_function, operation_id)

    @staticmethod
    def _build_list_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        id_function: str
    ) -> str:
        """Build list handler body"""
        parameters = operation.get("parameters", [])
        has_query = any(p.get("in") == "query" for p in parameters if isinstance(p, dict))
        params_arg = "params" if has_query else "undefined"

        # Extract entity type from response schema to determine converter function
        from cuur_codegen.generators.core.handlers.body.response_analyzer import ResponseAnalyzer
        from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
        from cuur_codegen.utils.openapi import extract_schemas, get_response_schema_name

        entity_type = None
        converter_func = None
        list_response_entity_type = None

        # Try to extract entity type from response schema
        response_schema_name = get_response_schema_name(operation, context.spec, "200")
        if response_schema_name:
            schemas_dict = extract_schemas(context.spec)
            response_schema = schemas_dict.get(response_schema_name)
            if response_schema:
                list_response_entity_type = SchemaResolver.extract_entity_from_response_schema(response_schema, schemas_dict)
                if list_response_entity_type:
                    converter_func = f"{camel_case(list_response_entity_type)}ToApi"
                    entity_type = list_response_entity_type

        # Get repository entity type (from GET operations, prioritized)
        repo_entity_type = EntityExtractor.extract_entity_name_from_operations(context, resource)
        if not repo_entity_type:
            repo_entity_type = pascal_case(resource)

        # Detect schema mismatch between repository and LIST response
        type_assertion = ""
        has_mismatch = repo_entity_type and list_response_entity_type and repo_entity_type != list_response_entity_type
        if has_mismatch:
            # Cast to response type (what the API expects) to satisfy TypeScript
            # The repository returns repo_entity_type but response expects list_response_entity_type
            type_assertion = f"""  // TODO: Schema mismatch detected - repository returns '{repo_entity_type}[]' but LIST response expects '{list_response_entity_type}[]'
  // Using type assertion to handle mismatch. Fix schema mismatch in API - list{resource} should return {repo_entity_type}[] not {list_response_entity_type}[]
  const typedItems = result.items as any as {list_response_entity_type}[];"""
            items_var_base = "typedItems"
            # When there's a mismatch, don't use converter (converter expects list_response_entity_type but we have repo_entity_type)
            converter_func = None
        else:
            items_var_base = "result.items"

        # Build converter code if entity type found (skip if mismatch detected)
        converter_code = ""
        if converter_func and not has_mismatch:
            converter_code = f"""  // Convert domain entities to API format (Date → ISO string)
  const convertedItems = {items_var_base}.map(item => {{
    try {{
      return {converter_func}(item);
    }} catch (error) {{
      // Log conversion error but continue with original item
      if (process.env.NODE_ENV === "development") {{
        console.warn(`[Handler] Failed to convert entity:`, error);
      }}
      return item;
    }}
  }});"""
            items_var = "convertedItems"
        else:
            items_var = items_var_base

        return f"""  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, {params_arg});
{type_assertion}
{converter_code}
  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: {{ data: {{ items: [...] }}, meta: {{ ... }} }}
  return {{
    data: {{
      items: {items_var},
    }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
      pagination: {{
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      }},
    }},
  }};
"""

    @staticmethod
    def _build_update_body(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        entity_var: str,
        id_function: str
    ) -> str:
        """Build update handler body"""
        from cuur_codegen.generators.core.handlers.body.update import UpdateBodyBuilder
        return UpdateBodyBuilder.build(context, operation, resource, entity_var, id_function)

    @staticmethod
    def _build_delete_body(id_function: str) -> str:
        """Build delete handler body - returns void for 204, or success response for 200"""
        return f"""  await repo.delete(orgId, id);
  // For 204 No Content responses, return void (no response body)
  // For 200 OK responses, return success response
  return {{
    data: {{ success: true }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_unknown_verb_body() -> str:
        """Build body for unknown verb"""
        return """  // TODO: Implement handler body
  throw new Error("Not implemented");
"""
