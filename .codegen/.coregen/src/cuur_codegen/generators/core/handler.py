"""
Handler Generator - Generates TypeScript handler functions from OpenAPI operations
"""

from pathlib import Path
from typing import Dict, Any, List, Optional

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.utils.openapi import extract_operations
from cuur_codegen.utils.string import extract_verb_from_operation_id
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.utils.file import ensure_directory, write_file, clean_directory
from cuur_codegen.generators.core.handlers.builder import HandlerBuilder


class HandlerGenerator(BaseGenerator):
    """Generates handler functions from OpenAPI operations"""

    @property
    def name(self) -> str:
        return "Handler Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "handler"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate handler files"""
        self.validate_context(context)

        files: List[Path] = []
        warnings: List[str] = []

        # Get output directory using FolderStructureConfig
        from cuur_codegen.base.folder_structure import FolderStructureConfig
        folder_config = FolderStructureConfig()
        output_dir = folder_config.get_layer_output_path(
            project_root=context.config.paths.project_root,
            layer="core",
            domain_name=context.domain_name,
            generator_type="handler",
        )
        ensure_directory(output_dir)

        # Clean directory before generation to remove old files
        clean_directory(output_dir)

        # Extract operations
        operations = extract_operations(context.spec)
        if not operations:
            warnings.append("No operations found in OpenAPI spec")
            return GenerateResult(files=files, warnings=warnings)

        # Group operations by resource (singular for grouping)
        resource_operations: Dict[str, List[Dict[str, Any]]] = {}
        for op_data in operations:
            operation_id = op_data["operation_id"]
            resource = NamingConvention.resource_for_grouping(operation_id)

            if resource not in resource_operations:
                resource_operations[resource] = []
            resource_operations[resource].append(op_data)

        # Generate handlers for each resource
        for resource, ops in resource_operations.items():
            # Create resource subdirectory (pluralized, kebab-cased)
            resource_dir = output_dir / NamingConvention.handler_directory(resource)
            ensure_directory(resource_dir)

            # Track filenames to avoid duplicates
            used_filenames = set()

            # Generate individual handler file for each operation
            for op_data in ops:
                handler_file = self._generate_individual_handler(context, op_data, resource, resource_dir, used_filenames)
                files.append(handler_file)
                used_filenames.add(handler_file.name)

            # Generate resource index file
            resource_index_file = resource_dir / "index.ts"
            resource_index_content = self._generate_resource_index(context, resource, ops)
            write_file(resource_index_file, resource_index_content)
            files.append(resource_index_file)

        # Generate main index file
        main_index_file = output_dir / "index.ts"
        main_index_content = self._generate_main_index(context, list(resource_operations.keys()))
        write_file(main_index_file, main_index_content)
        files.append(main_index_file)

        return GenerateResult(files=files, warnings=warnings)

    def _generate_individual_handler(
        self, context: GenerationContext, op_data: Dict[str, Any], resource: str, resource_dir: Path, used_filenames: set = None
    ) -> Path:
        """Generate individual handler file for a single operation"""
        if used_filenames is None:
            used_filenames = set()

        operation_id = op_data["operation_id"]
        operation = op_data["operation"]

        # Derive verb from HTTP method (source of truth)
        http_method = op_data.get("method", "").lower()
        verb = self._derive_verb_from_http_method(http_method, operation, context)

        # Get filename using derived verb and resource (not operationId)
        # This ensures filenames match the actual operation type (list vs get)
        resource = NamingConvention.resource_for_grouping(operation_id)
        handler_filename_base = self._build_handler_filename(verb, resource)
        handler_filename = f"{handler_filename_base}.handler.ts"

        # If filename already exists, make it unique by including operation ID suffix
        if handler_filename in used_filenames:
            from cuur_codegen.utils.string import kebab_case, extract_resource_from_operation_id
            # Extract meaningful suffix from operation ID (remove verb and resource)
            # e.g., "startProviderConnection" -> "start", "completeProviderConnection" -> "complete"
            resource_from_op = extract_resource_from_operation_id(operation_id)
            # Get the part after the resource name
            if resource_from_op.lower() in operation_id.lower():
                # Find position of resource in operation ID
                resource_pos = operation_id.lower().find(resource_from_op.lower())
                if resource_pos > 0:
                    # Extract the part before resource (usually the action verb)
                    suffix = operation_id[:resource_pos]
                    # Remove common verbs to get unique suffix
                    verbs = ["create", "update", "delete", "get", "list", "patch", "post", "put", "start", "complete", "handle"]
                    for v in verbs:
                        if suffix.lower().startswith(v.lower()):
                            suffix = suffix[len(v):] if len(suffix) > len(v) else suffix
                            break
                    if suffix:
                        handler_filename = f"{handler_filename_base}-{kebab_case(suffix)}.handler.ts"
                    else:
                        # Fallback to full operation ID if no meaningful suffix found
                        handler_filename = f"{handler_filename_base}-{kebab_case(operation_id)}.handler.ts"
                else:
                    handler_filename = f"{handler_filename_base}-{kebab_case(operation_id)}.handler.ts"
            else:
                # Fallback: use operation ID
                handler_filename = f"{handler_filename_base}-{kebab_case(operation_id)}.handler.ts"

        handler_file = resource_dir / handler_filename

        # Generate handler content
        content = self._generate_handler_file_content(context, op_data, resource, verb)
        write_file(handler_file, content)

        return handler_file

    def _generate_handler_file_content(
        self, context: GenerationContext, op_data: Dict[str, Any], resource: str, verb: str
    ) -> str:
        """Generate content for a single handler file"""
        header = self.generate_header(context, f"{verb.capitalize()} {resource} handler", use_auto_generated_format=True)
        return HandlerBuilder.build_handler_file_content(context, op_data, resource, header, verb)

    def _derive_verb_from_http_method(
        self, http_method: str, operation: Dict[str, Any], context: GenerationContext
    ) -> str:
        """Derive operation verb from HTTP method and response structure using VerbMapper"""
        from cuur_codegen.utils.verb_mapping import VerbMapper
        from cuur_codegen.generators.core.handlers.body.response_analyzer import ResponseAnalyzer

        operation_id = operation.get("operationId", "")

        # Check if response has items structure (list-like)
        response_has_items = ResponseAnalyzer.is_items_response(operation, context, "200")

        # Use centralized VerbMapper for consistent verb extraction
        verb = VerbMapper.get_verb(
            operation_id=operation_id,
            http_method=http_method,
            response_has_items=response_has_items
        )

        return verb

    def _determine_if_list_operation(
        self, operation: Dict[str, Any], context: GenerationContext
    ) -> str:
        """Determine if a GET operation is a list or single entity operation"""
        from cuur_codegen.utils.openapi import get_response_schema_name, extract_schemas

        # Check response structure for list pattern
        response_schema_name = get_response_schema_name(operation, context.spec, "200")
        if not response_schema_name:
            return "get"

        # Check if schema name indicates list response
        if "List" in response_schema_name or "ListResponse" in response_schema_name:
            return "list"

        # Check response schema structure for data.items pattern
        schemas_dict = extract_schemas(context.spec)
        response_schema = schemas_dict.get(response_schema_name)
        if not response_schema or not isinstance(response_schema, dict):
            return "get"

        # Check for data.items pattern (list response structure)
        if "properties" in response_schema:
            data = response_schema["properties"].get("data", {})
            if isinstance(data, dict):
                # Check for data.items or data.properties.items
                if "properties" in data and "items" in data["properties"]:
                    return "list"
                # Check for direct items array
                if data.get("type") == "object" and "properties" in data:
                    if "items" in data["properties"]:
                        return "list"

        # Check allOf pattern
        if "allOf" in response_schema:
            for item in response_schema["allOf"]:
                if isinstance(item, dict) and "properties" in item:
                    data = item["properties"].get("data", {})
                    if isinstance(data, dict):
                        if "properties" in data and "items" in data["properties"]:
                            return "list"
                        if data.get("type") == "object" and "properties" in data:
                            if "items" in data["properties"]:
                                return "list"

        return "get"

    def _build_handler_filename(self, verb: str, resource: str) -> str:
        """Build handler filename from verb and resource"""
        from cuur_codegen.utils.string import kebab_case
        from cuur_codegen.utils.naming import pluralize_resource_name
        from cuur_codegen.utils.string import singularize

        # For list operations, keep plural form in filename
        # For other operations, use singular form
        if verb == "list":
            filename_resource = pluralize_resource_name(resource)
        else:
            # Use singular for non-list operations
            filename_resource = singularize(resource)

        filename = f"{kebab_case(verb)}-{kebab_case(filename_resource)}"
        return filename

    def _generate_resource_index(
        self, context: GenerationContext, resource: str, operations: List[Dict[str, Any]]
    ) -> str:
        """Generate index file for a resource subdirectory"""
        header = self.generate_header(context, f"{resource} handlers")

        exports = []
        used_filenames = set()
        for op_data in operations:
            operation_id = op_data["operation_id"]
            operation = op_data["operation"]

            # Derive verb from HTTP method to get correct filename
            http_method = op_data.get("method", "").lower()
            verb = self._derive_verb_from_http_method(http_method, operation, context)

            # Build filename using derived verb (same logic as _generate_individual_handler)
            handler_filename_base = self._build_handler_filename(verb, resource)
            handler_filename = f"{handler_filename_base}.handler.ts"

            # If filename already exists, make it unique by including operation ID suffix
            if handler_filename in used_filenames:
                from cuur_codegen.utils.string import kebab_case, extract_resource_from_operation_id
                # Extract meaningful suffix from operation ID (remove verb and resource)
                resource_from_op = extract_resource_from_operation_id(operation_id)
                if resource_from_op.lower() in operation_id.lower():
                    resource_pos = operation_id.lower().find(resource_from_op.lower())
                    if resource_pos > 0:
                        suffix = operation_id[:resource_pos]
                        verbs = ["create", "update", "delete", "get", "list", "patch", "post", "put", "start", "complete", "handle"]
                        for v in verbs:
                            if suffix.lower().startswith(v.lower()):
                                suffix = suffix[len(v):] if len(suffix) > len(v) else suffix
                                break
                        if suffix:
                            handler_filename = f"{handler_filename_base}-{kebab_case(suffix)}.handler.ts"
                        else:
                            handler_filename = f"{handler_filename_base}-{kebab_case(operation_id)}.handler.ts"
                    else:
                        handler_filename = f"{handler_filename_base}-{kebab_case(operation_id)}.handler.ts"
                else:
                    handler_filename = f"{handler_filename_base}-{kebab_case(operation_id)}.handler.ts"

            used_filenames.add(handler_filename)
            # Remove .ts extension and add .js for import
            handler_filename_js = handler_filename.replace(".ts", ".js")
            exports.append(f'export * from "./{handler_filename_js}";')

        return f"""{header}{chr(10).join(exports)}
"""

    def _generate_main_index(self, context: GenerationContext, resources: List[str]) -> str:
        """Generate main index file with exports from resource subdirectories"""
        header = self.generate_header(context, "Handler exports")

        exports = []
        for resource in resources:
            resource_dir = NamingConvention.handler_directory(resource)
            exports.append(f'export * from "./{resource_dir}/index.js";')

        return f"""{header}{chr(10).join(exports)}
"""
