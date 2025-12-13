"""
Converter Generator - Generates entity converters for DAO ↔ Domain mapping
"""

from pathlib import Path
from typing import Dict, Any, List

from cuur_codegen.base.generator_bases import SingleFileGenerator
from cuur_codegen.base.generator import GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.folder_structure import FolderStructureConfig
from cuur_codegen.utils.openapi import extract_schemas, extract_operations, get_response_schema, is_shared_type
from cuur_codegen.utils.string import extract_resource_from_operation_id, camel_case
from cuur_codegen.utils.naming import NamingConvention
from cuur_codegen.utils.file import write_file


class ConverterGenerator(SingleFileGenerator):
    """Generates converter functions for entity mapping"""

    @property
    def name(self) -> str:
        return "Converter Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "converter"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate converter files"""
        # Clean converter files before generation (only converter files, not entire utils directory)
        converter_filename = NamingConvention.converter_filename(context.domain_name)
        from cuur_codegen.base.folder_structure import FolderStructureConfig
        folder_config = FolderStructureConfig()
        output_dir = folder_config.get_layer_output_path(
            project_root=context.config.paths.project_root,
            layer="core",
            domain_name=context.domain_name,
            generator_type="converter",
        )
        converter_file = output_dir / converter_filename
        if converter_file.exists() and converter_file.is_file():
            converter_file.unlink()

        # Extract entity types directly from OpenAPI schemas
        # Filter for actual entity types (exclude Request/Response/Envelope/ID types, primitives, enums)
        schemas = extract_schemas(context.spec)
        entity_types = set()

        # Patterns to exclude
        exclude_patterns = [
            "Request", "Response", "Envelope", "RequestBody",
            "Id", "Meta", "Error", "Problem", "Validation",
            "PageInfo", "AccountId", "OrgId"
        ]

        for schema_name, schema_def in schemas.items():
            # Skip if matches exclude patterns
            if any(pattern in schema_name for pattern in exclude_patterns):
                continue

            # Only include if it looks like an entity (starts with capital, no special patterns)
            if not (schema_name[0].isupper() and not any(char.isdigit() for char in schema_name)):
                continue

            # Skip primitive types (number, string, boolean)
            schema_type = schema_def.get("type")
            if schema_type in ["number", "string", "boolean", "integer"]:
                # Only skip if it's NOT an object with properties (some schemas have type: object explicitly)
                if schema_type != "object" and "properties" not in schema_def:
                    continue

            # Skip enum types (has enum property)
            if "enum" in schema_def:
                continue

            # Only include object types (has properties or type: object)
            # This ensures we only generate converters for actual entity objects
            if "properties" in schema_def or schema_def.get("type") == "object":
                entity_types.add(schema_name)

        # Deduplicate singular/plural pairs - prefer singular forms
        # This prevents generating converters for both "Halt" and "Halts"
        from cuur_codegen.utils.string import singularize
        entity_types_list = list(entity_types)
        deduplicated = set()
        plural_schemas = set()

        for schema_name in entity_types_list:
            # Check if this is a plural that has a singular counterpart
            singular_name = singularize(schema_name)
            if singular_name != schema_name and singular_name in entity_types:
                # Prefer singular form
                deduplicated.add(singular_name)
                plural_schemas.add(schema_name)
            elif schema_name not in plural_schemas:
                # Add if not excluded by plural preference
                deduplicated.add(schema_name)

        entity_types = deduplicated

        if not entity_types:
            return GenerateResult(
                files=[],
                warnings=["No entity types found in OpenAPI spec"]
            )

        # Store entity types for generate_content()
        self._entity_types = sorted(list(entity_types))
        return super().generate(context)

    def generate_content(self, context: GenerationContext) -> str:
        """Generate converter file content"""
        return self._generate_converter_file(context, self._entity_types)

    def get_filename(self, context: GenerationContext) -> str:
        """Get converter filename"""
        return NamingConvention.converter_filename(context.domain_name)

    def _extract_entity_type_from_schema(self, schema: Dict[str, Any], spec: Dict[str, Any]) -> str | None:
        """Extract entity type name from response schema"""
        # Check for $ref
        if "$ref" in schema:
            ref_path = schema["$ref"]
            resolved = self._resolve_ref(spec, ref_path)
            if resolved and "title" in resolved:
                return resolved["title"]
            # Extract from ref path
            if "#/components/schemas/" in ref_path:
                return ref_path.split("/")[-1]

        # Check for allOf with DataEnvelope pattern
        if "allOf" in schema:
            for item in schema["allOf"]:
                if "$ref" in item:
                    ref_path = item["$ref"]
                    if "#/components/schemas/" in ref_path:
                        schema_name = ref_path.split("/")[-1]
                        # Skip DataEnvelope
                        if schema_name != "DataEnvelope":
                            return schema_name
                elif "properties" in item and "data" in item["properties"]:
                    data_schema = item["properties"]["data"]
                    if "$ref" in data_schema:
                        ref_path = data_schema["$ref"]
                        if "#/components/schemas/" in ref_path:
                            return ref_path.split("/")[-1]

        return None

    def _resolve_ref(self, spec: Dict[str, Any], ref: str) -> Dict[str, Any] | None:
        """Resolve a $ref reference"""
        if not ref.startswith("#/"):
            return None

        parts = ref[2:].split("/")
        if len(parts) < 3:
            return None

        component_type = parts[1]
        component_name = parts[2]
        schema_name = parts[3] if len(parts) > 3 else None

        components = spec.get("components", {})
        component = components.get(component_name, {})

        if schema_name:
            return component.get(schema_name)

        return component

    def _generate_converter_file(self, context: GenerationContext, entity_types: List[str]) -> str:
        """Generate single converter file for all entity types in domain"""
        domain_name = context.domain_name
        domain_title = domain_name.replace("-", " ").title()

        # Generate header with detailed description (no generation metadata)
        header = f"""/**
 * {domain_title} Domain Converters
 *
 * Thin wrappers around centralized converters (packages/core/src/shared/helpers/core-converters.ts)
 * Converts between domain types (with Date objects) and API types (with ISO strings)
 *
 * Naming convention: {{entity}}ToApi (camelCase)
 */

"""

        converter_functions = []

        # Extract schemas for date-time field detection
        schemas = extract_schemas(context.spec)

        for entity_type in entity_types:
            # Function name: camelCase entity name + "ToApi"
            func_name = f"{camel_case(entity_type)}ToApi"
            param_name = camel_case(entity_type)

            # Detect date-time fields from OpenAPI schema
            date_fields = self._detect_date_time_fields(entity_type, schemas)

            # Build converter call with detected date fields (explicitly pass empty array if none found)
            if date_fields:
                date_fields_str = ", ".join([f'"{field}"' for field in date_fields])
                converter_call = f'ConverterPresets.standardApiResponse({param_name}, {{ dateFields: [{date_fields_str}] }})'
            else:
                # Explicitly pass empty array to avoid default dateFields conversion
                converter_call = f'ConverterPresets.standardApiResponse({param_name}, {{ dateFields: [] }})'

            # Build date fields documentation
            if date_fields:
                date_fields_list = ", ".join([f"`{field}`" for field in date_fields])
                date_fields_doc = f"\n *\n * Date fields converted: {date_fields_list}\n *\n * Error handling:\n * - Invalid Date objects are converted to null\n * - Non-Date values are left unchanged (with console warnings in development mode)\n * - String values are assumed to already be in ISO format and are left unchanged"
            else:
                date_fields_doc = "\n *\n * No date-time fields detected in OpenAPI schema - no date conversion performed"

            converter_functions.append(f"""
/**
 * Convert {entity_type} domain entity to API response
 * Uses structural typing to accept repository output (may include extra fields from Zod passthrough)
 *{date_fields_doc}
 */
export function {func_name}({param_name}: {entity_type}): {entity_type} {{
  return {converter_call} as {entity_type};
}}""")

        # Separate shared types from domain-specific types
        shared_types_list = []
        domain_types_list = []

        # Get openapi directory to detect shared types
        openapi_dir = context.config.paths.openapi_dir
        # If openapi_dir doesn't have src/, try adding it
        if not (openapi_dir / "common").exists():
            openapi_src_dir = openapi_dir / "src"
            if openapi_src_dir.exists():
                openapi_dir = openapi_src_dir

        for entity_type in sorted(entity_types):
            if is_shared_type(entity_type, context.spec, openapi_dir):
                shared_types_list.append(entity_type)
            else:
                domain_types_list.append(entity_type)

        # Build imports - separate shared and domain types
        folder_config = FolderStructureConfig()
        shared_helpers_path = folder_config.get_layer_shared_import_path(
            layer="core",
            generator_type="converter",
            shared_type="helpers"
        )
        types_path = folder_config.get_layer_import_path(
            layer="core",
            from_generator="converter",
            to_generator="types",
            domain_name=context.domain_name
        )
        shared_types_path = folder_config.get_layer_shared_import_path(
            layer="core",
            generator_type="converter",
            shared_type="types"
        )

        imports = [f'import {{ ConverterPresets }} from "{shared_helpers_path}";']

        # Import domain-specific types
        if domain_types_list:
            domain_imports = ",\n".join(f"  {t}" for t in domain_types_list)
            imports.append(f'import type {{\n{domain_imports},\n}} from "{types_path}";')

        # Import shared types
        if shared_types_list:
            shared_imports = ",\n".join(f"  {t}" for t in shared_types_list)
            imports.append(f'import type {{\n{shared_imports},\n}} from "{shared_types_path}";')

        return f"""{header}{chr(10).join(imports)}
{chr(10).join(converter_functions)}
"""

    def _detect_date_time_fields(self, entity_type: str, schemas: Dict[str, Any]) -> List[str]:
        """Detect date-time fields from OpenAPI schema for an entity type"""
        date_fields = []

        # Get schema for this entity type
        entity_schema = schemas.get(entity_type)
        if not entity_schema:
            return date_fields

        # Check if schema has properties
        properties = entity_schema.get("properties", {})
        if not isinstance(properties, dict):
            return date_fields

        # Scan properties for date-time format
        for prop_name, prop_schema in properties.items():
            if not isinstance(prop_schema, dict):
                continue

            # Check for format: date-time
            if prop_schema.get("format") == "date-time":
                date_fields.append(prop_name)

            # Also check for oneOf with date-time (nullable dates)
            if "oneOf" in prop_schema:
                for one_of_item in prop_schema["oneOf"]:
                    if isinstance(one_of_item, dict) and one_of_item.get("format") == "date-time":
                        date_fields.append(prop_name)
                        break

        return sorted(date_fields)
