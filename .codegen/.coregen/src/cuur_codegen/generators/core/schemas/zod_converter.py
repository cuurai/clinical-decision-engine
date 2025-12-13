"""
Zod Converter - Converts OpenAPI schemas to Zod type strings
"""

from typing import Dict, Any, Optional
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.utils.openapi import extract_schema_name_from_ref
import re
from pathlib import Path


class ZodConverter:
    """Converts OpenAPI schemas to Zod type strings"""

    @staticmethod
    def convert_openapi_schema_to_zod(
        schema: Dict[str, Any],
        param_info: Dict[str, Any],
        context: Optional[GenerationContext] = None
    ) -> str:
        """Convert OpenAPI schema to Zod type string"""
        # Handle $ref
        if "$ref" in schema:
            ref_name = extract_schema_name_from_ref(schema["$ref"])
            if ref_name:
                # Check if schema exists in schemas file before using it
                if context and not ZodConverter._schema_exists_in_schemas(ref_name, context.domain_name):
                    # Schema doesn't exist in schemas file - use z.string() as fallback
                    return "z.string()"
                return f"schemas.{ref_name}"

        # Handle direct schema types
        schema_type = schema.get("type")
        if schema_type == "string":
            return ZodConverter._convert_string_schema(schema)
        elif schema_type == "integer" or schema_type == "number":
            return "z.number()"
        elif schema_type == "boolean":
            return "z.boolean()"
        elif schema_type == "array":
            items = schema.get("items", {})
            item_zod = ZodConverter.convert_openapi_schema_to_zod(items, {})
            return f"z.array({item_zod})"
        else:
            # Default to string for unknown types
            return "z.string()"

    @staticmethod
    def _convert_string_schema(schema: Dict[str, Any]) -> str:
        """Convert string schema to Zod type"""
        # Check for enum
        if "enum" in schema:
            enum_values = ", ".join([f'"{v}"' for v in schema["enum"]])
            return f"z.enum([{enum_values}])"

        # Check for format
        format_type = schema.get("format")
        if format_type == "date-time":
            return "z.string().datetime()"
        elif format_type == "date":
            return "z.string().date()"
        elif format_type == "email":
            return "z.string().email()"
        elif format_type == "uri":
            return "z.string().url()"
        else:
            return "z.string()"

    @staticmethod
    def _schema_exists_in_schemas(schema_name: str, domain_name: str) -> bool:
        """
        Check if a schema exists in the generated schemas file.
        This is a simple check - we look for the schema name in the schemas file.
        """
        schemas_file = Path(f"packages/core/src/{domain_name}/schemas/{domain_name}.schemas.ts")
        if not schemas_file.exists():
            return False

        content = schemas_file.read_text()
        # Check if schema is exported (const SchemaName = or export const SchemaName =)
        pattern = rf'(?:export\s+)?const\s+{re.escape(schema_name)}\s*='
        return bool(re.search(pattern, content))
