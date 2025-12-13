"""
Prisma Schema Builder - Builds complete Prisma schema file
"""

from typing import Dict, Any, Optional
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.openapi import extract_schemas
from .model_builder import PrismaModelBuilder
from .type_converter import PrismaTypeConverter


class PrismaSchemaBuilder:
    """Builds complete Prisma schema files"""

    @staticmethod
    def build_schema(
        context: GenerationContext,
        header: str
    ) -> str:
        """
        Build complete Prisma schema file content.

        Args:
            context: Generation context
            header: File header comment

        Returns:
            Complete Prisma schema file content
        """
        domain_name = context.domain_name

        # Extract schemas from OpenAPI spec
        try:
            schemas = extract_schemas(context.spec)
            if not isinstance(schemas, dict):
                context.logger.warn(f"extract_schemas returned {type(schemas)}, expected dict")
                schemas = {}
        except Exception as e:
            context.logger.error(f"Error extracting schemas: {e}")
            schemas = {}

        # Build models
        try:
            models = PrismaModelBuilder.build_models(context, schemas)
        except Exception as e:
            context.logger.error(f"Error building models: {e}")
            import traceback
            context.logger.debug(traceback.format_exc())
            models = []

        # Build enums (if any)
        try:
            enums = PrismaSchemaBuilder._build_enums(context, schemas)
        except Exception as e:
            context.logger.error(f"Error building enums: {e}")
            import traceback
            context.logger.debug(traceback.format_exc())
            enums = []

        # Build schema file
        schema_content = f"""{header}generator client {{
  provider = "prisma-client-js"
  output   = "./generated"
}}

datasource db {{
  provider = "postgresql"
  url      = env("DATABASE_URL")
}}

"""

        # Add enums
        if enums:
            schema_content += "\n".join(enums) + "\n\n"

        # Add models
        if models:
            schema_content += "\n\n".join(models) + "\n"

        return schema_content

    @staticmethod
    def _build_enums(
        context: GenerationContext,
        schemas: Dict[str, Dict[str, Any]]
    ) -> list:
        """Build Prisma enum definitions from OpenAPI schemas"""
        enums: list = []
        processed_enums: set = set()

        if not isinstance(schemas, dict):
            return enums

        # First pass: find direct enum schemas
        for schema_name, schema in schemas.items():
            # Ensure schema_name is a string
            if not isinstance(schema_name, str):
                continue

            if "enum" in schema and schema_name not in processed_enums:
                enum_values = schema.get("enum", [])
                if enum_values and isinstance(enum_values, list):
                    enum_name = schema_name.replace("Enum", "").replace("Type", "") + "Enum"
                    enum_lines = [
                        f"enum {enum_name} {{",
                        *[f"  {value}" for value in enum_values if isinstance(value, (str, int, float))],
                        "}"
                    ]
                    enums.append("\n".join(enum_lines))
                    processed_enums.add(schema_name)

        # Second pass: discover enums referenced via $ref or inline enums in model fields
        # This ensures we generate enums that are referenced but not directly defined
        from cuur_codegen.utils.openapi import resolve_ref, extract_schema_name_from_ref

        # Track enum names we've already generated (for deduplication)
        generated_enum_names = set()
        for enum_str in enums:
            # Extract enum name from "enum EnumName {"
            if enum_str.startswith("enum "):
                enum_name = enum_str.split("\n")[0].replace("enum ", "").split()[0].strip()
                generated_enum_names.add(enum_name)

        # Helper function to recursively resolve $ref and check for enums
        def resolve_ref_recursive(ref: str, visited: set = None) -> Optional[Dict[str, Any]]:
            """Recursively resolve $ref, handling nested references"""
            if visited is None:
                visited = set()

            if ref in visited:
                # Circular reference detected
                return None

            visited.add(ref)
            ref_schema = resolve_ref(context.spec, ref)

            if not ref_schema:
                return None

            # If this schema has a $ref, resolve it recursively
            if "$ref" in ref_schema:
                nested_ref = ref_schema["$ref"]
                return resolve_ref_recursive(nested_ref, visited)

            return ref_schema

        # Helper function to extract enum from schema (handles nested $ref)
        def extract_enum_from_schema(schema: Dict[str, Any], ref_name: Optional[str] = None) -> Optional[tuple]:
            """Extract enum values and name from schema, handling nested references"""
            if not isinstance(schema, dict):
                return None

            # Check for direct enum
            if "enum" in schema:
                enum_values = schema.get("enum", [])
                if enum_values and isinstance(enum_values, list):
                    if ref_name:
                        enum_name = ref_name.replace("Enum", "").replace("Type", "") + "Enum"
                    else:
                        enum_name = "UnknownEnum"
                    return (enum_name, enum_values)

            # Check for $ref
            if "$ref" in schema:
                ref_schema = resolve_ref_recursive(schema["$ref"])
                if ref_schema:
                    return extract_enum_from_schema(ref_schema, ref_name)

            return None

        # Extract all models and check their fields for $ref to enums or inline enums
        entity_names = PrismaModelBuilder._identify_entity_schemas(context, schemas)
        for entity_name in entity_names:
            if not isinstance(entity_name, str):
                continue
            entity_schema = schemas.get(entity_name)
            if not isinstance(entity_schema, dict):
                continue

            properties = entity_schema.get("properties", {})
            if not isinstance(properties, dict):
                continue

            for prop_name, prop_schema in properties.items():
                if not isinstance(prop_schema, dict):
                    continue

                # Check for inline enum (enum defined directly in field)
                if "enum" in prop_schema:
                    enum_values = prop_schema.get("enum", [])
                    if enum_values and isinstance(enum_values, list):
                        # Generate enum name from field name (same logic as type converter)
                        enum_name = PrismaTypeConverter._get_enum_name(prop_name, prop_schema)
                        # Check if we already have this enum (by name and values)
                        if enum_name not in generated_enum_names:
                            enum_lines = [
                                f"enum {enum_name} {{",
                                *[f"  {value}" for value in enum_values if isinstance(value, (str, int, float))],
                                "}"
                            ]
                            enums.append("\n".join(enum_lines))
                            generated_enum_names.add(enum_name)
                            processed_enums.add(enum_name)

                # Check for $ref (with recursive resolution)
                if "$ref" in prop_schema:
                    ref_name = extract_schema_name_from_ref(prop_schema["$ref"])
                    if ref_name and ref_name not in processed_enums:
                        # Use recursive resolution to handle nested $ref
                        enum_result = extract_enum_from_schema(prop_schema, ref_name)
                        if enum_result:
                            enum_name, enum_values = enum_result
                            if enum_name not in generated_enum_names:
                                enum_lines = [
                                    f"enum {enum_name} {{",
                                    *[f"  {value}" for value in enum_values if isinstance(value, (str, int, float))],
                                    "}"
                                ]
                                enums.append("\n".join(enum_lines))
                                generated_enum_names.add(enum_name)
                                processed_enums.add(ref_name)

                # Check for array items with $ref or inline enum
                if prop_schema.get("type") == "array":
                    items = prop_schema.get("items", {})
                    if isinstance(items, dict):
                        # Check for inline enum in array items
                        if "enum" in items:
                            enum_values = items.get("enum", [])
                            if enum_values and isinstance(enum_values, list):
                                enum_name = PrismaTypeConverter._get_enum_name(f"{prop_name}Item", items)
                                if enum_name not in generated_enum_names:
                                    enum_lines = [
                                        f"enum {enum_name} {{",
                                        *[f"  {value}" for value in enum_values if isinstance(value, (str, int, float))],
                                        "}"
                                    ]
                                    enums.append("\n".join(enum_lines))
                                    generated_enum_names.add(enum_name)
                                    processed_enums.add(enum_name)
                        # Check for $ref in array items (with recursive resolution)
                        if "$ref" in items:
                            ref_name = extract_schema_name_from_ref(items["$ref"])
                            if ref_name and ref_name not in processed_enums:
                                enum_result = extract_enum_from_schema(items, ref_name)
                                if enum_result:
                                    enum_name, enum_values = enum_result
                                    if enum_name not in generated_enum_names:
                                        enum_lines = [
                                            f"enum {enum_name} {{",
                                            *[f"  {value}" for value in enum_values if isinstance(value, (str, int, float))],
                                            "}"
                                        ]
                                        enums.append("\n".join(enum_lines))
                                        generated_enum_names.add(enum_name)
                                        processed_enums.add(ref_name)

        return enums
