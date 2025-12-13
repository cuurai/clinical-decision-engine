"""
Entity Extractor - Extracts entity names from operations for repository generation
"""

from typing import Dict, Any, List, Optional
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.utils.openapi import extract_schemas, extract_operations, get_response_schema_name
from cuur_codegen.utils.string import pascal_case, singularize, pluralize_resource_name
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver


class EntityExtractor:
    """Extracts entity names from operations"""

    DOMAIN_PREFIXES = {
        "auth": "Auth",
        "blockchain": "Chain",
        "fiat-banking": "Fiat",
        "gateway": "",
        "identity": "",
        "pricing-refdata": "",
        "risk-limits": "Risk",
        "sandbox": "Sandbox",
        "tenancy-trust": "",
        "transfer-agent": "Transfer",
        "treasury": "",
    }

    @staticmethod
    def extract_entity_name_from_operations(
        context: GenerationContext,
        resource: str
    ) -> Optional[str]:
        """Extract actual entity schema name from response schemas"""
        operations = extract_operations(context.spec)
        schemas_dict = extract_schemas(context.spec)
        resource_pascal = pascal_case(resource)

        # Find all operations for this resource
        resource_operations = []
        for op_data in operations:
            operation_id = op_data["operation_id"]
            op_resource = NamingConvention.resource_for_grouping(operation_id)
            if op_resource == resource:
                resource_operations.append(op_data)

        # 1. PRIORITY: Try to extract from response schemas first
        entity_from_response = EntityExtractor._extract_from_response_schemas(
            context, resource_operations, schemas_dict
        )
        if entity_from_response:
            return entity_from_response

        # 2. Try exact match
        if resource_pascal in schemas_dict:
            return resource_pascal

        # 3. Try case-insensitive match
        for schema_name in schemas_dict.keys():
            if schema_name.lower() == resource_pascal.lower():
                return schema_name

        # 4. Try domain-prefixed variations
        domain_prefix = EntityExtractor.DOMAIN_PREFIXES.get(context.domain_name, "")
        if domain_prefix:
            prefixed_name = f"{domain_prefix}{resource_pascal}"
            if prefixed_name in schemas_dict:
                return prefixed_name

        # 5. Try singular/plural variations
        singular_resource = singularize(resource_pascal)
        if singular_resource != resource_pascal and singular_resource in schemas_dict:
            return singular_resource
        plural_resource = pluralize_resource_name(resource_pascal)
        if plural_resource != resource_pascal and plural_resource in schemas_dict:
            return plural_resource

        # 6. Try domain-prefixed singular/plural
        if domain_prefix:
            prefixed_singular = f"{domain_prefix}{singular_resource}"
            if prefixed_singular != prefixed_name and prefixed_singular in schemas_dict:
                return prefixed_singular

        # 7. Try to resolve allOf aliases
        resolved = SchemaResolver.resolve_allof_alias(resource_pascal, schemas_dict)
        if resolved:
            return resolved

        return None

    @staticmethod
    def _extract_from_response_schemas(
        context: GenerationContext,
        resource_operations: List[Dict[str, Any]],
        schemas_dict: Dict[str, Any]
    ) -> Optional[str]:
        """Extract entity from response schemas, prioritizing GET operations over LIST operations"""
        from cuur_codegen.utils.openapi import get_response_schema
        from cuur_codegen.utils.string import extract_verb_from_operation_id

        # Separate operations by verb - prioritize GET/create/update over LIST
        get_ops = []
        list_ops = []
        other_ops = []

        for op_data in resource_operations:
            operation_id = op_data["operation_id"]
            verb = extract_verb_from_operation_id(operation_id)
            if verb == "get":
                get_ops.append(op_data)
            elif verb == "list":
                list_ops.append(op_data)
            else:
                other_ops.append(op_data)

        # Try GET operations first (they represent single entities)
        entity_from_get = EntityExtractor._extract_entity_from_operation_list(
            context, get_ops, schemas_dict
        )
        if entity_from_get:
            return entity_from_get

        # Try create/update operations (they also represent single entities)
        entity_from_other = EntityExtractor._extract_entity_from_operation_list(
            context, other_ops, schemas_dict
        )
        if entity_from_other:
            return entity_from_other

        # Finally try LIST operations (they represent list items)
        entity_from_list = EntityExtractor._extract_entity_from_operation_list(
            context, list_ops, schemas_dict
        )
        return entity_from_list

    @staticmethod
    def _extract_entity_from_operation_list(
        context: GenerationContext,
        operations: List[Dict[str, Any]],
        schemas_dict: Dict[str, Any]
    ) -> Optional[str]:
        """Extract entity from a list of operations"""
        from cuur_codegen.utils.openapi import get_response_schema

        for op_data in operations:
            op = op_data["operation"]
            for status_code in ["200", "201", "202"]:
                # Try to get named schema first
                response_schema_name = get_response_schema_name(op, context.spec, status_code)
                response_schema = None

                if response_schema_name:
                    # Named schema exists
                    response_schema = schemas_dict.get(response_schema_name)
                else:
                    # Try to get inline schema
                    response_schema = get_response_schema(op, context.spec, status_code)

                if response_schema and isinstance(response_schema, dict):
                    entity_from_response = SchemaResolver.extract_entity_from_response_schema(
                        response_schema, schemas_dict
                    )
                    if entity_from_response:
                        # Filter out Response/Request types
                        if any(suffix in entity_from_response for suffix in ["Request", "Response", "Envelope"]):
                            continue
                        # Resolve allOf aliases
                        resolved = SchemaResolver.resolve_allof_alias(entity_from_response, schemas_dict)
                        if resolved and not any(suffix in resolved for suffix in ["Request", "Response", "Envelope"]):
                            return resolved
                        return entity_from_response
        return None
