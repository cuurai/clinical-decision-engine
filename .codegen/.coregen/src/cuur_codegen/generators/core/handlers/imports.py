"""
Handler Imports Builder - Builds import statements for handler files
"""

from typing import Dict, Any
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.utils.string import pascal_case, build_type_name
from cuur_codegen.utils.openapi import get_response_schema_name, get_request_body_schema_name


class HandlerImportsBuilder:
    """Builds import statements for handler files"""

    @staticmethod
    def build_imports(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        verb: str,
        operation_id: str = None
    ) -> str:
        """Build import statements for a single handler"""
        # Use a dict to group imports by source path
        imports_by_source: Dict[str, list] = {}

        # Get import paths from folder structure config
        folder_config = FolderStructureConfig()
        types_path = folder_config.get_layer_import_path(
            layer="core",
            from_generator="handler",
            to_generator="types",
            domain_name=context.domain_name
        )
        repos_path = folder_config.get_layer_import_path(
            layer="core",
            from_generator="handler",
            to_generator="repository",
            domain_name=context.domain_name
        )
        shared_helpers_path = folder_config.get_layer_shared_import_path(
            layer="core",
            generator_type="handler",
            shared_type="helpers"
        )

        # Response type import
        HandlerImportsBuilder._add_response_type_import(
            imports_by_source, operation, context, types_path, verb, operation_id, resource
        )

        # Input type import (for create/update operations)
        if verb in ["create", "update", "patch"]:
            HandlerImportsBuilder._add_input_type_import(
                imports_by_source, operation, context, types_path
            )

        # List params type import (for list operations with query parameters)
        if verb == "list" and operation_id:
            HandlerImportsBuilder._add_list_params_import(
                imports_by_source, operation, context, types_path, operation_id
            )

        # Repository import (skip for operations that don't have repositories)
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
            HandlerImportsBuilder._add_import(imports_by_source, repos_path, repo_name, is_type=True)

        # ID generator import - always add if handler body uses correlationId
        # OAuth operations that return responses with meta.correlationId still need the import
        # Only skip if operation truly doesn't generate a response (empty 204, etc.)
        should_add_id_generator = True

        # Check if this is an operation that doesn't generate a correlationId
        # Empty responses (204 No Content) don't need it, but OAuth responses do
        if is_empty_response and verb == "delete":
            # Delete operations with 204 still need correlationId in success response
            should_add_id_generator = True
        elif is_empty_response:
            # Other empty responses don't need correlationId
            should_add_id_generator = False

        # Add import if handler generates a response with correlationId
        if should_add_id_generator:
            HandlerImportsBuilder._add_id_generator_import(
                imports_by_source, context, shared_helpers_path
            )

        # Converter import (if entity type can be determined from response)
        converter_used = HandlerImportsBuilder._add_converter_import(
            imports_by_source, operation, context, verb, resource
        )

        # Entity type import for list operations with schema mismatches
        if verb == "list":
            HandlerImportsBuilder._add_entity_type_import_for_mismatch(
                imports_by_source, operation, context, resource, types_path
            )

        # Track unused imports (converters and ID generators that won't be used in handler body)
        unused_imports = set()

        # Check if converter was added but won't be used (Response DTO operations)
        if converter_used:
            from cuur_codegen.utils.schema_analyzer import SchemaAnalyzer
            if verb in ["create", "update"]:
                # Response DTO operations don't use converters
                if operation_id and SchemaAnalyzer.should_skip_repository_generation(operation, context.spec, operation_id):
                    # Get converter name that was added
                    from cuur_codegen.utils.openapi import get_response_schema_name, extract_schemas
                    from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
                    from cuur_codegen.utils.string import camel_case
                    response_schema_name = get_response_schema_name(operation, context.spec, "200") or get_response_schema_name(operation, context.spec, "201")
                    if response_schema_name:
                        schemas_dict = extract_schemas(context.spec)
                        response_schema = schemas_dict.get(response_schema_name)
                        if response_schema:
                            entity_type = SchemaResolver.extract_entity_from_response_schema(response_schema, schemas_dict)
                            if entity_type:
                                converter_func = f"{camel_case(entity_type)}ToApi"
                                unused_imports.add(converter_func)

        # Check if ID generator is unused (operations that throw errors don't use it)
        # This is detected by checking if body throws an error immediately
        # We'll check this after body is built, but for now we can't easily detect it here
        # So we'll handle it in the body builder by checking the generated body

        # Build final import statements, combining imports from the same source
        return HandlerImportsBuilder._build_import_statements(imports_by_source, unused_imports)

    @staticmethod
    def _add_import(
        imports_by_source: Dict[str, list],
        source_path: str,
        import_name: str,
        is_type: bool = False
    ) -> None:
        """Add an import to the imports_by_source dict"""
        if source_path not in imports_by_source:
            imports_by_source[source_path] = {"types": [], "values": []}

        if is_type:
            imports_by_source[source_path]["types"].append(import_name)
        else:
            imports_by_source[source_path]["values"].append(import_name)

    @staticmethod
    def _build_import_statements(imports_by_source: Dict[str, list], unused_imports: set = None) -> str:
        """Build final import statements, combining imports from the same source"""
        import_lines = []
        if unused_imports is None:
            unused_imports = set()

        for source_path, imports in imports_by_source.items():
            types = imports.get("types", [])
            values = imports.get("values", [])

            # Build type imports
            if types:
                types_list = sorted(types)
                # Comment out unused type imports
                active_types = []
                commented_types = []
                for t in types_list:
                    if t in unused_imports:
                        commented_types.append(t)
                    else:
                        active_types.append(t)

                if active_types:
                    types_str = ", ".join(active_types)
                    import_lines.append(f'import type {{ {types_str} }} from "{source_path}";')

                if commented_types:
                    types_str = ", ".join(commented_types)
                    import_lines.append(f'// TODO: Uncomment when implementing handler logic')
                    import_lines.append(f'// import type {{ {types_str} }} from "{source_path}";')

            # Build value imports
            if values:
                values_list = sorted(values)
                # Comment out unused value imports
                active_values = []
                commented_values = []
                for v in values_list:
                    if v in unused_imports:
                        commented_values.append(v)
                    else:
                        active_values.append(v)

                if active_values:
                    values_str = ", ".join(active_values)
                    import_lines.append(f'import {{ {values_str} }} from "{source_path}";')

                if commented_values:
                    values_str = ", ".join(commented_values)
                    import_lines.append(f'// TODO: Uncomment when implementing handler logic')
                    import_lines.append(f'// import {{ {values_str} }} from "{source_path}";')

        return "\n".join(import_lines) + "\n" if import_lines else ""

    @staticmethod
    def _add_response_type_import(
        imports_by_source: Dict[str, list],
        operation: Dict[str, Any],
        context: GenerationContext,
        types_path: str,
        verb: str,
        operation_id: str,
        resource: str
    ) -> None:
        """Add response type import"""
        responses = operation.get("responses", {})

        # Determine status code based on verb
        status_code = HandlerImportsBuilder._determine_status_code(verb, responses)

        # Check if response has application/json content
        if status_code:
            response = responses.get(status_code, {})
            content = response.get("content", {}) if isinstance(response, dict) else {}

            if "application/json" in content:
                # Use operation_id-based naming to match types generator (line 411 in types.py)
                # Types generator always exports as: {pascal_case(operation_id)}Response
                if operation_id:
                    response_type = f"{pascal_case(operation_id)}Response"
                else:
                    # Fallback to naming convention if operation_id not available
                    response_type = f"{build_type_name(resource, verb.capitalize())}Response"
                HandlerImportsBuilder._add_import(imports_by_source, types_path, response_type, is_type=True)

    @staticmethod
    def _add_input_type_import(
        imports_by_source: Dict[str, list],
        operation: Dict[str, Any],
        context: GenerationContext,
        types_path: str
    ) -> None:
        """Add input type import"""
        schema_name = get_request_body_schema_name(operation, context.spec)
        if schema_name:
            HandlerImportsBuilder._add_import(imports_by_source, types_path, schema_name, is_type=True)

    @staticmethod
    def _add_list_params_import(
        imports_by_source: Dict[str, list],
        operation: Dict[str, Any],
        context: GenerationContext,
        types_path: str,
        operation_id: str
    ) -> None:
        """Add list params type import"""
        parameters = operation.get("parameters", [])
        has_query = any(p.get("in") == "query" for p in parameters if isinstance(p, dict))
        if has_query:
            list_params_type = f"{pascal_case(operation_id)}Params"
            HandlerImportsBuilder._add_import(imports_by_source, types_path, list_params_type, is_type=True)

    @staticmethod
    def _is_full_response_structure(
        operation: Dict[str, Any],
        context: GenerationContext,
        verb: str
    ) -> bool:
        """Check if response schema is already a full response structure"""
        if verb != "create":
            return False

        from cuur_codegen.generators.core.handlers.body.response_analyzer import ResponseAnalyzer
        return ResponseAnalyzer.is_full_response_structure(operation, context, "201")

    @staticmethod
    def _add_id_generator_import(
        imports_by_source: Dict[str, list],
        context: GenerationContext,
        shared_helpers_path: str
    ) -> None:
        """Add ID generator import"""
        domain_name = context.domain_name
        domain_prefix_map = {
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
        prefix = domain_prefix_map.get(domain_name)
        if not prefix:
            words = domain_name.split("-")
            prefix = "".join([word[0] for word in words if word])[:2].lower()
        HandlerImportsBuilder._add_import(imports_by_source, shared_helpers_path, f"{prefix}TransactionId", is_type=False)

    @staticmethod
    def _add_converter_import(
        imports_by_source: Dict[str, list],
        operation: Dict[str, Any],
        context: GenerationContext,
        verb: str,
        resource: str = None
    ) -> bool:
        """Add converter function import if entity type can be determined"""
        from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
        from cuur_codegen.utils.openapi import extract_schemas, get_response_schema_name
        from cuur_codegen.utils.string import camel_case, pascal_case
        from cuur_codegen.base.folder_structure import FolderStructureConfig
        from cuur_codegen.generators.core.repositories.entity_extractor import EntityExtractor

        # Only add converter for operations that return entities (not empty responses)
        if verb in ["list", "get", "create", "update", "patch"]:
            response_schema_name = get_response_schema_name(operation, context.spec, "200")
            if not response_schema_name and verb == "create":
                response_schema_name = get_response_schema_name(operation, context.spec, "201")

            if response_schema_name:
                schemas_dict = extract_schemas(context.spec)
                response_schema = schemas_dict.get(response_schema_name)
                if response_schema:
                    list_response_entity_type = SchemaResolver.extract_entity_from_response_schema(response_schema, schemas_dict)
                    if list_response_entity_type:
                        # Check for schema mismatch (only for list operations)
                        if verb == "list" and resource:
                            repo_entity_type = EntityExtractor.extract_entity_name_from_operations(context, resource)
                            if not repo_entity_type:
                                repo_entity_type = pascal_case(resource)
                            # Skip converter import if there's a mismatch (converter won't be used)
                            if repo_entity_type and repo_entity_type != list_response_entity_type:
                                return False

                        converter_func = f"{camel_case(list_response_entity_type)}ToApi"
                        folder_config = FolderStructureConfig()
                        converters_path = folder_config.get_layer_import_path(
                            layer="core",
                            from_generator="handler",
                            to_generator="converter",
                            domain_name=context.domain_name
                        )
                        HandlerImportsBuilder._add_import(imports_by_source, converters_path, converter_func, is_type=False)
                        return True
        return False

    @staticmethod
    def _add_entity_type_import_for_mismatch(
        imports_by_source: Dict[str, list],
        operation: Dict[str, Any],
        context: GenerationContext,
        resource: str,
        types_path: str
    ) -> None:
        """Add entity type import for list operations with schema mismatches"""
        from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
        from cuur_codegen.utils.openapi import extract_schemas, get_response_schema_name
        from cuur_codegen.utils.string import pascal_case
        from cuur_codegen.generators.core.repositories.entity_extractor import EntityExtractor

        # Get repository entity type (from GET operations, prioritized)
        repo_entity_type = EntityExtractor.extract_entity_name_from_operations(context, resource)
        if not repo_entity_type:
            repo_entity_type = pascal_case(resource)

        # Get LIST response entity type
        response_schema_name = get_response_schema_name(operation, context.spec, "200")
        list_response_entity_type = None
        if response_schema_name:
            schemas_dict = extract_schemas(context.spec)
            response_schema = schemas_dict.get(response_schema_name)
            if response_schema:
                list_response_entity_type = SchemaResolver.extract_entity_from_response_schema(response_schema, schemas_dict)

        # If there's a mismatch, import the LIST response entity type (used in type assertion)
        if repo_entity_type and list_response_entity_type and repo_entity_type != list_response_entity_type:
            HandlerImportsBuilder._add_import(imports_by_source, types_path, list_response_entity_type, is_type=True)

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
