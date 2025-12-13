"""
Entity Builder - Builds entity file content
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.string import kebab_case, pascal_case, singularize, pluralize_resource_name
from cuur_codegen.utils.openapi import extract_schemas, get_response_schema_name
from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver
from cuur_codegen.generators.core.schemas.zod_converter import ZodConverter


class EntityBuilder:
    """Builds entity file content"""

    @staticmethod
    def build_entity_content(
        context: GenerationContext,
        resource: str,
        operations: List[Dict[str, Any]] = None,
        header: str = None
    ) -> Optional[str]:
        """
        Generate entity file content - finds entity schema from OpenAPI spec.
        Returns None if operations only return 204 (No Content).
        """
        if header is None:
            # Fallback: generate a simple header if not provided
            header = f"""/**
 * {resource} Entity
 *
 * Auto-generated from OpenAPI spec
 */
"""
        resource_pascal = pascal_case(resource)
        schemas_dict = extract_schemas(context.spec)

        # Find entity schema name
        entity_schema_name = EntityBuilder._find_entity_schema_name(
            context, resource, resource_pascal, schemas_dict, operations
        )

        # Check if operations only return 204 (No Content)
        if operations:
            has_non_204_response = False
            for op_data in operations:
                op = op_data["operation"]
                responses = op.get("responses", {})
                if "200" in responses or "201" in responses or "202" in responses:
                    has_non_204_response = True
                    break

            if not has_non_204_response:
                return None

        # Resolve allOf aliases
        resolved_schema_name = SchemaResolver.resolve_allof_alias(entity_schema_name, schemas_dict)
        if resolved_schema_name:
            entity_schema_name = resolved_schema_name

        # Check if schema exists in schemas file, try extracting from response schemas if not
        if not ZodConverter._schema_exists_in_schemas(entity_schema_name, context.domain_name):
            entity_schema_name = EntityBuilder._find_entity_from_responses(
                context, operations, schemas_dict, entity_schema_name
            )

        # Calculate relative import path
        resource_kebab = kebab_case(resource)
        domain_root = context.config.get_output_dir("core") / context.domain_name
        entity_dir = domain_root / "models" / resource_kebab / "entity"
        entity_file = entity_dir / f"{resource_kebab}.entity.ts"

        folder_config = FolderStructureConfig()
        validators_path = folder_config.get_relative_import_path(
            from_file_path=entity_file,
            layer="core",
            to_generator="schemas_file",
            domain_name=context.domain_name,
            domain_root=domain_root
        )

        return f"""{header}import {{ z }} from "zod";
import {{ schemas }} from "{validators_path}";

/**
 * Entity: {resource_pascal}Entity
 * Description: Represents the {resource_pascal} domain model.
 * Source: schemas.{entity_schema_name}
 */
export const Z{resource_pascal}EntitySchema = schemas.{entity_schema_name};
export type {resource_pascal}Entity = z.infer<typeof Z{resource_pascal}EntitySchema>;
"""


    @staticmethod
    def _find_entity_schema_name(
        context: GenerationContext,
        resource: str,
        resource_pascal: str,
        schemas_dict: Dict[str, Any],
        operations: Optional[List[Dict[str, Any]]]
    ) -> str:
        """Find entity schema name using multiple strategies"""
        entity_schema_name = None

        # 1. Try exact match
        if resource_pascal in schemas_dict:
            entity_schema_name = resource_pascal
        else:
            # 2. Try case-insensitive match
            for schema_name in schemas_dict.keys():
                if schema_name.lower() == resource_pascal.lower():
                    entity_schema_name = schema_name
                    break

            # 3. Try singular/plural variations
            if not entity_schema_name:
                singular_resource = singularize(resource_pascal)
                if singular_resource != resource_pascal and singular_resource in schemas_dict:
                    entity_schema_name = singular_resource
                elif resource_pascal != singular_resource:
                    plural_resource = pluralize_resource_name(resource_pascal)
                    if plural_resource != resource_pascal and plural_resource in schemas_dict:
                        entity_schema_name = plural_resource

            # 4. Try to extract from response schemas
            if not entity_schema_name and operations:
                entity_schema_name = EntityBuilder._extract_from_response_schemas(
                    context, operations, schemas_dict
                )

        # Fallback to resource name
        return entity_schema_name or resource_pascal

    @staticmethod
    def _extract_from_response_schemas(
        context: GenerationContext,
        operations: List[Dict[str, Any]],
        schemas_dict: Dict[str, Any]
    ) -> Optional[str]:
        """Extract entity schema name from response schemas"""
        from cuur_codegen.utils.openapi import get_response_schema_name

        for op_data in operations:
            op = op_data["operation"]
            for status_code in ["200", "201", "202"]:
                if status_code == "204":
                    continue
                response_schema_name = get_response_schema_name(op, context.spec, status_code)
                if response_schema_name:
                    response_schema = schemas_dict.get(response_schema_name)
                    if response_schema and isinstance(response_schema, dict):
                        entity_from_response = SchemaResolver.extract_entity_from_response_schema(
                            response_schema, schemas_dict
                        )
                        if entity_from_response:
                            if not any(suffix in entity_from_response for suffix in ["Request", "Response", "Envelope"]):
                                return entity_from_response
        return None

    @staticmethod
    def _find_entity_from_responses(
        context: GenerationContext,
        operations: Optional[List[Dict[str, Any]]],
        schemas_dict: Dict[str, Any],
        fallback_name: str
    ) -> str:
        """Find entity schema from response schemas if not found in schemas file"""
        if not operations:
            return fallback_name

        from cuur_codegen.utils.openapi import get_response_schema_name
        from cuur_codegen.generators.core.schemas.zod_converter import ZodConverter

        for op_data in operations:
            op = op_data["operation"]
            for status_code in ["200", "201", "202"]:
                if status_code == "204":
                    continue
                response_schema_name = get_response_schema_name(op, context.spec, status_code)
                if response_schema_name:
                    response_schema = schemas_dict.get(response_schema_name)
                    if response_schema and isinstance(response_schema, dict):
                        entity_from_response = SchemaResolver.extract_entity_from_response_schema(
                            response_schema, schemas_dict
                        )
                        if entity_from_response and ZodConverter._schema_exists_in_schemas(
                            entity_from_response, context.domain_name
                        ):
                            return entity_from_response

        return fallback_name
