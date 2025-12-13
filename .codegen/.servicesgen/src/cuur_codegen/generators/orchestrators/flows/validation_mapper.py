"""
Validation Mapper - Maps handlers to their input schemas from @cuur/core
"""

import re
from typing import Dict, Optional, Tuple
from cuur_codegen.utils.string import pascal_case, camel_case, extract_verb_from_operation_id, extract_resource_from_operation_id


class ValidationMapper:
    """Maps handler names to their input schema names from core"""

    @staticmethod
    def map_handler_to_schema_name(handler_name: str, verb: str, method: str) -> Optional[str]:
        """
        Map handler name to its input schema name

        Args:
            handler_name: Handler function name (e.g., "createOrder", "listMarkets")
            verb: HTTP verb (e.g., "create", "list", "update")
            method: HTTP method (e.g., "POST", "GET")

        Returns:
            Schema name (e.g., "CreateOrderRequest", "ListMarketsParams") or None
        """
        verb_lower = verb.lower()
        method_upper = method.upper()

        # Extract resource name from handler
        # createOrder -> Order, listMarkets -> Markets
        resource = extract_resource_from_operation_id(handler_name)
        if not resource:
            return None

        # For create/update operations, use {Verb}{Resource}Request
        if verb_lower in ["create", "update", "patch"] and method_upper in ["POST", "PUT", "PATCH"]:
            return f"{pascal_case(verb)}{pascal_case(resource)}Request"

        # For list operations, use List{Resource}Params (if exists)
        # Note: Many list operations don't have params schemas, so we return None
        if verb_lower == "list":
            return None  # Query params are typically Record<string, string>

        # For get/delete operations, no body schema needed
        return None

    @staticmethod
    def get_schema_import(domain: str, schema_name: Optional[str]) -> Optional[str]:
        """
        Get import statement for schema from @cuur/core

        Args:
            domain: Domain name (e.g., "exchange")
            schema_name: Schema name (e.g., "CreateOrderRequest")

        Returns:
            Import statement or None
        """
        if not schema_name:
            return None

        # Core exports schemas as {domain}Schemas
        # Pattern: remove hyphens, keep lowercase, add "Schemas"
        # e.g., "exchange" -> "exchangeSchemas", "fiat-banking" -> "fiatbankingSchemas"
        domain_schemas_var = f"{domain.replace('-', '').lower()}Schemas"

        return f'import {{ {domain_schemas_var} }} from "@cuur/core/{domain}/index.js";'

    @staticmethod
    def generate_validation_code(
        schema_name: Optional[str],
        domain: str,
        variable_name: str,
        validation_type: str  # "body", "params", "query"
    ) -> Optional[str]:
        """
        Generate validation code for body/params/query

        Args:
            schema_name: Schema name (e.g., "CreateOrderRequest")
            domain: Domain name (e.g., "exchange")
            variable_name: Variable to validate (e.g., "body", "query")
            validation_type: Type of validation ("body", "params", "query")

        Returns:
            Validation code string or None
        """
        if not schema_name:
            return None

        # Core exports schemas as {domain}Schemas
        # Pattern: remove hyphens, keep lowercase, add "Schemas"
        # e.g., "exchange" -> "exchangeSchemas", "fiat-banking" -> "fiatbankingSchemas"
        domain_schemas_var = f"{domain.replace('-', '').lower()}Schemas"

        # Generate validation code
        # body -> validatedBody, query -> validatedQuery
        validated_var = f"validated{pascal_case(variable_name)}"

        return f"""    // Validate {validation_type} using core schema
    const {validated_var} = {domain_schemas_var}.{schema_name}.parse({variable_name});"""
