"""
Schemas Generator - Copies Zod schemas from openapi/{domain}.zod.schema.ts and removes API client parts
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import re

from cuur_codegen.base.generator import BaseGenerator, GenerateResult
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.errors import GenerationError
from cuur_codegen.utils.file import ensure_directory, file_exists, clean_directory
from cuur_codegen.utils.openapi import extract_schemas, extract_schema_name_from_ref
from cuur_codegen.generators.core.schemas.schema_resolver import SchemaResolver


class SchemasGenerator(BaseGenerator):
    """Generates Zod schemas by copying from openapi/{domain}.zod.schema.ts and removing API client parts"""

    @property
    def name(self) -> str:
        return "Schemas Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "schemas_file"

    def generate(self, context: GenerationContext) -> GenerateResult:
        """Generate validator files by copying from openapi/{domain}.zod.schema.ts"""
        self.validate_context(context)

        files: List[Path] = []
        warnings: List[str] = []

        project_root = context.config.paths.project_root.resolve()
        domain_name = context.domain_name

        # Source file: packages/core/src/{domain}/openapi/{domain}.zod.schema.ts
        from cuur_codegen.base.folder_structure import FolderStructureConfig
        folder_config = FolderStructureConfig()
        core_layer_config = folder_config.get_layer_config("core")
        source_file = project_root / Path(core_layer_config.base_path) / domain_name / "openapi" / f"{domain_name}.zod.schema.ts"

        if not file_exists(source_file):
            raise GenerationError(
                f"Source Zod schema file not found: {source_file}",
                context.domain_name,
                self.type,
            )

        # Get output directory using FolderStructureConfig
        output_dir = folder_config.get_layer_output_path(
            project_root=project_root,
            layer="core",
            domain_name=domain_name,
            generator_type="schemas_file",
        )
        ensure_directory(output_dir)

        # Clean directory before generation to remove old files
        clean_directory(output_dir)

        # Output file: {domain}.schemas.ts
        validators_file = output_dir / f"{domain_name}.schemas.ts"

        # Read source file and remove API client parts
        try:
            content = source_file.read_text()
            cleaned_content = self._remove_api_client_parts(content)

            # Add type annotation to schemas export
            cleaned_content = self._add_type_annotations(cleaned_content)

            # Add entity aliases from OpenAPI spec (allOf aliases that openapi-zod-client doesn't generate)
            cleaned_content = self._add_entity_aliases(cleaned_content, context)

            # Write to output file
            validators_file.write_text(cleaned_content)
            files.append(validators_file)
        except Exception as e:
            raise GenerationError(
                f"Failed to copy and process schemas: {str(e)}",
                context.domain_name,
                self.type,
            )

        return GenerateResult(files=files, warnings=warnings)

    def _remove_api_client_parts(self, content: str) -> str:
        """
        Remove API client parts from the Zod schema file:
        - Import statement for makeApi, Zodios, ZodiosOptions
        - const endpoints = makeApi([...]) declaration
        - export const api = new Zodios(...) export
        - export function createApiClient(...) function
        """
        lines = content.split('\n')
        cleaned_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]

            # Remove the import line for makeApi, Zodios, ZodiosOptions
            if 'import { makeApi, Zodios, type ZodiosOptions }' in line:
                i += 1
                continue

            # Skip the endpoints declaration (from "const endpoints = makeApi([" to "]);")
            if 'const endpoints = makeApi([' in line:
                # Track brackets to find the end of the array
                bracket_count = line.count('[') - line.count(']')
                i += 1
                while i < len(lines) and bracket_count > 0:
                    bracket_count += lines[i].count('[') - lines[i].count(']')
                    i += 1
                # Skip the line with "]);"
                if i < len(lines) and ']);' in lines[i]:
                    i += 1
                continue

            # Skip the api export line
            if 'export const api' in line and 'new Zodios(' in line:
                i += 1
                continue

            # Skip the createApiClient function
            if 'export function createApiClient' in line:
                # Track braces to find the end of the function
                brace_count = line.count('{') - line.count('}')
                i += 1
                while i < len(lines) and brace_count > 0:
                    brace_count += lines[i].count('{') - lines[i].count('}')
                    i += 1
                continue

            # Keep all other lines
            cleaned_lines.append(line)
            i += 1

        return '\n'.join(cleaned_lines)

    def _add_type_annotations(self, content: str) -> str:
        """
        Add proper type annotation to schemas export: Record<string, ZodTypeAny>
        This prevents TypeScript serialization limit errors for large schema maps while
        still allowing z.infer<typeof schemas.SchemaName> to work correctly.
        """
        # Check if schemas export exists
        if "export const schemas" not in content:
            return content

        # Ensure ZodTypeAny is imported
        if 'import { z }' in content and 'type ZodTypeAny' not in content:
            # Add ZodTypeAny to the import
            content = re.sub(
                r'import \{ z \} from "zod";',
                'import { z, type ZodTypeAny } from "zod";',
                content
            )
            content = re.sub(
                r'import \{ z \} from "zod"',
                'import { z, type ZodTypeAny } from "zod"',
                content
            )

        # Ensure schemas export has Record<string, ZodTypeAny> type annotation
        # Replace any existing type annotation or add one if missing
        if re.search(r'export const schemas:\s*Record<string,\s*ZodTypeAny>\s*=', content):
            # Already has the correct annotation, no change needed
            pass
        elif re.search(r'export const schemas\s*=', content):
            # Has no type annotation or has wrong one, replace/add it
            content = re.sub(
                r'export const schemas:\s*Record<string,\s*(?:any|z\.ZodTypeAny)>\s*=',
                'export const schemas: Record<string, ZodTypeAny> =',
                content
            )
            content = re.sub(
                r'export const schemas\s*=',
                'export const schemas: Record<string, ZodTypeAny> =',
                content
            )

        return content

    def _add_entity_aliases(self, content: str, context: GenerationContext) -> str:
        """
        Add entity aliases from OpenAPI spec.
        openapi-zod-client doesn't generate schemas that are only allOf aliases,
        so we need to add them manually based on the OpenAPI spec.
        """
        schemas_dict = extract_schemas(context.spec)
        entity_aliases = []  # List of (alias_name, ref_name) tuples for allOf aliases
        entity_schemas = []  # List of (schema_name, zod_code) tuples for type: object schemas
        alias_dependencies = {}  # Track alias dependencies for topological sorting
        potential_aliases = set()  # Track schemas that will be added as aliases

        # First pass: identify all potential aliases (schemas that reference other schemas)
        for schema_name, schema_def in schemas_dict.items():
            if not isinstance(schema_def, dict):
                continue

            if self._schema_exists_in_content(content, schema_name):
                continue

            ref_name = None
            if "$ref" in schema_def and len(schema_def) == 1:
                ref_name = extract_schema_name_from_ref(schema_def["$ref"])
            elif "allOf" in schema_def:
                allof_items = schema_def.get("allOf", [])
                if isinstance(allof_items, list) and len(allof_items) == 1:
                    item = allof_items[0]
                    if isinstance(item, dict) and "$ref" in item:
                        ref_name = extract_schema_name_from_ref(item["$ref"])

            if ref_name:
                potential_aliases.add(schema_name)

        # Second pass: collect aliases that can be resolved
        for schema_name, schema_def in schemas_dict.items():
            if not isinstance(schema_def, dict):
                continue

            # Skip if schema already exists in generated content
            if self._schema_exists_in_content(content, schema_name):
                continue

            ref_name = None

            # Check if this is a direct $ref alias (like PasswordReset: $ref: "#/components/schemas/PasswordResetResponse")
            if "$ref" in schema_def:
                # Check if it's a pure $ref (only $ref key, or $ref + description)
                if len(schema_def) == 1 or (len(schema_def) == 2 and "description" in schema_def):
                    ref_name = extract_schema_name_from_ref(schema_def["$ref"])

            # Check if this is an allOf alias (single allOf item with a $ref)
            elif "allOf" in schema_def:
                allof_items = schema_def.get("allOf", [])
                if isinstance(allof_items, list) and len(allof_items) == 1:
                    item = allof_items[0]
                    if isinstance(item, dict) and "$ref" in item:
                        ref_name = extract_schema_name_from_ref(item["$ref"])

            if ref_name:
                # Check if the referenced schema exists in the generated file OR will be added as an alias
                ref_exists = self._schema_exists_in_content(content, ref_name)
                ref_will_be_alias = ref_name in potential_aliases
                # Also check if ref_name exists in schemas_dict (it's defined in OpenAPI spec)
                # This handles cases where the schema is generated by openapi-zod-client
                ref_in_spec = ref_name in schemas_dict

                if ref_exists or ref_will_be_alias or ref_in_spec:
                    entity_aliases.append((schema_name, ref_name))
                    alias_dependencies[schema_name] = ref_name
                    continue

            # Check for type: object schemas that might be entity aliases
            # (like AuthPassword which is a type: object, not an allOf)
            if schema_def.get("type") == "object" and "properties" in schema_def:
                # Skip Request/Response/Envelope types (these are usually generated)
                if any(pattern in schema_name for pattern in ["Request", "Response", "Envelope", "Meta"]):
                    continue

                # Convert OpenAPI object schema to Zod
                zod_code = self._convert_object_schema_to_zod(schema_def, schemas_dict, content)
                if zod_code:
                    entity_schemas.append((schema_name, zod_code))

        # Sort aliases topologically so dependencies come first
        entity_aliases = self._sort_aliases_topologically(entity_aliases, alias_dependencies, content)

        if not entity_aliases and not entity_schemas:
            return content

        # Find where to insert the aliases (before export const schemas)
        schemas_export_pos = content.find("export const schemas = {")
        if schemas_export_pos == -1:
            return content

        # Build alias code
        alias_code = []
        if entity_aliases or entity_schemas:
            alias_code.append("")
            alias_code.append("// Entity aliases (auto-generated from OpenAPI spec)")
            alias_code.append("// These schemas are defined in OpenAPI but not generated by openapi-zod-client")

            # Add allOf aliases (simple references)
            for alias_name, ref_name in sorted(entity_aliases):
                alias_code.append(f"const {alias_name} = {ref_name};")

            # Add type: object schemas (full Zod definitions)
            for schema_name, zod_code in sorted(entity_schemas):
                alias_code.append(f"const {schema_name} = {zod_code};")

        if not alias_code:
            return content

        # Insert before schemas export
        insert_pos = schemas_export_pos
        # Find the line before export const schemas
        lines_before = content[:insert_pos].rstrip().split('\n')
        # Insert after the last non-empty line
        insert_line = len(lines_before)

        # Combine lines before and after
        new_content = '\n'.join(lines_before) + '\n' + '\n'.join(alias_code) + '\n' + content[insert_pos:]

        # Add aliases to schemas export
        # Find the closing brace of schemas export
        schemas_start = new_content.find("export const schemas = {")
        if schemas_start == -1:
            return new_content

        # Find the closing brace
        brace_count = 0
        schemas_end = schemas_start
        for i in range(schemas_start, len(new_content)):
            if new_content[i] == '{':
                brace_count += 1
            elif new_content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    schemas_end = i
                    break

        # Insert aliases before closing brace
        alias_exports = []
        for alias_name, _ in sorted(entity_aliases):
            alias_exports.append(f"  {alias_name}, // Entity alias")
        for schema_name, _ in sorted(entity_schemas):
            alias_exports.append(f"  {schema_name}, // Entity schema")

        if alias_exports:
            # Insert aliases before the closing brace
            # Find the position right before the closing brace
            # The closing brace is at schemas_end
            # We need to insert before that position

            # Get the content before the closing brace
            before_brace = new_content[:schemas_end]
            after_brace = new_content[schemas_end:]

            # Find the last non-empty line before the closing brace
            lines_before = before_brace.rstrip().split('\n')
            last_line = lines_before[-1] if lines_before else ""

            # If the last line doesn't end with a comma, we need to add one
            if last_line.strip() and not last_line.strip().endswith(','):
                # Add comma to last line
                lines_before[-1] = last_line.rstrip() + ','

            # Insert aliases before closing brace
            new_content = '\n'.join(lines_before) + '\n' + '\n'.join(alias_exports) + '\n' + after_brace

        return new_content

    def _schema_exists_in_content(self, content: str, schema_name: str) -> bool:
        """Check if a schema exists in the generated content"""
        # Check if schema is defined as const SchemaName =
        pattern = f"const {schema_name} ="
        return pattern in content

    def _sort_aliases_topologically(
        self,
        entity_aliases: List[tuple],
        alias_dependencies: Dict[str, str],
        content: str
    ) -> List[tuple]:
        """
        Sort aliases topologically so that dependencies come before dependents.
        Example: PasswordReset -> PasswordResetResponse (generated)
                 AuthPasswordReset -> PasswordReset (alias, must come after)
        """
        # Build dependency graph
        alias_set = {alias[0] for alias in entity_aliases}
        sorted_aliases = []
        visited = set()

        def visit(alias_name: str):
            """Visit an alias and its dependencies"""
            if alias_name in visited:
                return

            visited.add(alias_name)

            # Find the alias tuple
            alias_tuple = next((a for a in entity_aliases if a[0] == alias_name), None)
            if not alias_tuple:
                return

            ref_name = alias_tuple[1]

            # If the reference is also an alias we're adding, visit it first
            if ref_name in alias_set and ref_name not in visited:
                visit(ref_name)

            # Add this alias after its dependencies
            sorted_aliases.append(alias_tuple)

        # Visit all aliases
        for alias_name, _ in entity_aliases:
            if alias_name not in visited:
                visit(alias_name)

        return sorted_aliases

    def _is_alias_schema(self, schema_def: Dict[str, Any]) -> bool:
        """Check if a schema definition is an alias ($ref or allOf alias)"""
        if not isinstance(schema_def, dict):
            return False

        # Check for direct $ref alias
        if "$ref" in schema_def and len(schema_def) == 1:
            return True

        # Check for allOf alias
        if "allOf" in schema_def:
            allof_items = schema_def.get("allOf", [])
            if isinstance(allof_items, list) and len(allof_items) == 1:
                item = allof_items[0]
                if isinstance(item, dict) and "$ref" in item:
                    return True

        return False

    def _schema_exists_as_const_before_schemas(self, content: str, schema_name: str) -> bool:
        """Check if a schema exists as a const BEFORE the schemas export (can be referenced directly)"""
        # Find the position of "export const schemas"
        schemas_export_pos = content.find("export const schemas = {")
        if schemas_export_pos == -1:
            return False

        # Check if schema exists before schemas export
        content_before_schemas = content[:schemas_export_pos]
        pattern = f"const {schema_name} ="
        return pattern in content_before_schemas

    def _convert_object_schema_to_zod(self, schema_def: Dict[str, Any], schemas_dict: Dict[str, Any], content: str) -> Optional[str]:
        """
        Convert OpenAPI type: object schema to Zod schema string.
        Returns None if conversion is not possible or schema is too complex.
        """
        if not isinstance(schema_def, dict) or schema_def.get("type") != "object":
            return None

        properties = schema_def.get("properties", {})
        if not properties:
            return None

        required_fields = schema_def.get("required", [])
        zod_fields = []

        for prop_name, prop_schema in properties.items():
            if not isinstance(prop_schema, dict):
                continue

            # Convert property schema to Zod
            zod_type = self._convert_property_to_zod(prop_schema, schemas_dict, content)
            if not zod_type:
                continue

            # Add .optional() if not required
            if prop_name not in required_fields:
                zod_type = f"{zod_type}.optional()"

            zod_fields.append(f"    {prop_name}: {zod_type},")

        if not zod_fields:
            return None

        # Build Zod object schema
        zod_code = "z\n  .object({\n" + "\n".join(zod_fields) + "\n  })\n  .passthrough()"
        return zod_code

    def _convert_property_to_zod(self, prop_schema: Dict[str, Any], schemas_dict: Dict[str, Any], content: str) -> Optional[str]:
        """Convert a single property schema to Zod type string"""
        # Handle $ref
        if "$ref" in prop_schema:
            ref_name = extract_schema_name_from_ref(prop_schema["$ref"])
            if ref_name:
                # Check if schema exists as a const before schemas export (can reference directly)
                if self._schema_exists_as_const_before_schemas(content, ref_name):
                    return ref_name  # Direct reference, not schemas.RefName
                # Check if schema exists in schemas export (must use schemas.RefName)
                elif self._schema_exists_in_content(content, ref_name):
                    return f"schemas.{ref_name}"
            return None

        # Handle type
        prop_type = prop_schema.get("type")
        if prop_type == "string":
            zod_type = "z.string()"
            # Add format validations
            if prop_schema.get("format") == "date-time":
                zod_type = "z.string().datetime({ offset: true })"
            elif prop_schema.get("format") == "email":
                zod_type = "z.string().email()"
            elif prop_schema.get("format") == "uri" or prop_schema.get("format") == "url":
                zod_type = "z.string().url()"
            # Add enum if present
            if "enum" in prop_schema:
                enum_values = ", ".join([f'"{v}"' for v in prop_schema["enum"]])
                zod_type = f"z.enum([{enum_values}])"
            # Add regex if present
            if "pattern" in prop_schema:
                pattern = prop_schema["pattern"]
                zod_type = f"{zod_type}.regex(/{pattern}/)"
            return zod_type
        elif prop_type == "integer" or prop_type == "number":
            zod_type = "z.number()"
            if prop_type == "integer":
                zod_type = f"{zod_type}.int()"
            # Add min/max if present
            if "minimum" in prop_schema:
                zod_type = f"{zod_type}.gte({prop_schema['minimum']})"
            if "maximum" in prop_schema:
                zod_type = f"{zod_type}.lte({prop_schema['maximum']})"
            return zod_type
        elif prop_type == "boolean":
            return "z.boolean()"
        elif prop_type == "array":
            items = prop_schema.get("items", {})
            if isinstance(items, dict):
                item_zod = self._convert_property_to_zod(items, schemas_dict, content)
                if item_zod:
                    return f"z.array({item_zod})"
            return "z.array(z.unknown())"
        elif prop_type == "object":
            # Recursively convert nested object
            nested_zod = self._convert_object_schema_to_zod(prop_schema, schemas_dict, content)
            if nested_zod:
                return nested_zod
            return "z.object({}).passthrough()"

        return None
