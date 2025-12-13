"""
Schema Introspector

Introspects Zod schema files to extract entity definitions, field types,
regex patterns, enum values, and constraints. This is the primary source
of truth for factory generation - config files only provide overrides.
"""

import re
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple
from dataclasses import dataclass, field


@dataclass
class FieldInfo:
    """Information about a schema field"""
    name: str
    zod_type: str  # e.g., "z.string()", "z.enum([...])", "AccountId.regex(...)"
    is_required: bool
    is_optional: bool
    enum_values: Optional[List[str]] = None
    is_nullable_union: bool = False  # True if field is z.union([..., z.null()])
    is_array: bool = False  # True if field is z.array(...)
    regex_pattern: Optional[str] = None
    min_length: Optional[int] = None
    max_length: Optional[int] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    default_value: Optional[str] = None


@dataclass
class EntitySchemaInfo:
    """Information extracted from a Zod schema entity definition"""
    entity_name: str
    domain_name: str
    fields: Dict[str, FieldInfo] = field(default_factory=dict)
    id_field: Optional[str] = None
    id_regex: Optional[str] = None
    id_prefix: Optional[str] = None


class SchemaIntrospector:
    """Introspects Zod schema files to extract entity information"""

    # Patterns to identify entity schemas (exclude wrappers)
    EXCLUDED_PATTERNS = [
        r'.*Id$',  # ChainRecordId, WalletId, etc.
        r'.*Meta$',  # ResponseMeta
        r'.*Info$',  # PageInfo
        r'.*Envelope$',  # DataEnvelope
        r'.*Request$',  # CreateChainRequest, UpdateChainRequest
        # Note: Response schemas are NOT excluded - they are needed for response factory generation
        r'Problem$',  # Problem
        r'ValidationError$',  # ValidationError
        r'Timestamp$',  # Timestamp
        r'NullableTimestamp$',  # NullableTimestamp
    ]

    @staticmethod
    def find_schema_files(project_root: Path) -> Dict[str, Path]:
        """
        Find all Zod schema files in core package.

        Returns dict mapping domain_name -> schema_file_path
        """
        schema_files = {}

        core_base_paths = [
            project_root / "packages" / "core" / "packages" / "core" / "src",
            project_root / "packages" / "core" / "src",
            project_root.parent / "packages" / "core" / "packages" / "core" / "src",
            project_root.parent / "packages" / "core" / "src",
        ]

        core_base = None
        for path in core_base_paths:
            if path.exists():
                core_base = path
                break

        if not core_base:
            return schema_files

        # Find schema files: {domain}/openapi/{domain}.zod.schema.ts
        for schema_file in core_base.glob("*/openapi/*.zod.schema.ts"):
            domain_name = schema_file.parent.parent.name
            schema_files[domain_name] = schema_file

        return schema_files

    @staticmethod
    def extract_entity_schemas(schema_file: Path, domain_name: str) -> Dict[str, EntitySchemaInfo]:
        """
        Extract entity schema information from a Zod schema file.

        Returns dict mapping entity_name -> EntitySchemaInfo
        """
        entities = {}

        if not schema_file.exists():
            return entities

        content = schema_file.read_text(encoding="utf-8")

        # Find the schemas export object (with or without type annotation)
        schemas_match = re.search(
            r'export\s+const\s+schemas\s*(?::\s*Record<string,\s*ZodTypeAny>)?\s*=\s*\{',
            content,
            re.MULTILINE
        )

        if not schemas_match:
            return entities

        # Extract schema names from the export
        start_pos = schemas_match.end()
        brace_count = 1
        pos = start_pos
        while pos < len(content) and brace_count > 0:
            if content[pos] == '{':
                brace_count += 1
            elif content[pos] == '}':
                brace_count -= 1
            pos += 1

        if brace_count != 0:
            return entities

        schemas_content = content[start_pos:pos-1]

        # Extract schema names
        schema_names = []
        for line in schemas_content.split('\n'):
            match = re.search(r'^\s*(\w+)\s*[,:]', line)
            if match:
                schema_name = match.group(1)
                # Skip excluded patterns
                if not any(re.match(pattern, schema_name) for pattern in SchemaIntrospector.EXCLUDED_PATTERNS):
                    if schema_name and schema_name[0].isupper():
                        schema_names.append(schema_name)

        # For each entity schema, extract its definition
        for entity_name in schema_names:
            entity_info = SchemaIntrospector._extract_entity_info(
                content, entity_name, domain_name
            )
            if entity_info:
                entities[entity_name] = entity_info

        return entities

    @staticmethod
    def _extract_entity_info(content: str, entity_name: str, domain_name: str) -> Optional[EntitySchemaInfo]:
        """Extract field information from an entity schema definition"""
        # Find the entity schema definition: const EntityName = z.object({...})
        pattern = rf'const\s+{re.escape(entity_name)}\s*=\s*z\.object\(\s*{{'
        match = re.search(pattern, content, re.MULTILINE)

        if not match:
            return None

        # Extract the object definition
        start_pos = match.end()
        brace_count = 1
        pos = start_pos
        while pos < len(content) and brace_count > 0:
            if content[pos] == '{':
                brace_count += 1
            elif content[pos] == '}':
                brace_count -= 1
            pos += 1

        if brace_count != 0:
            return None

        object_content = content[start_pos:pos-1]

        entity_info = EntitySchemaInfo(
            entity_name=entity_name,
            domain_name=domain_name
        )

        # Parse fields from the object definition
        fields = SchemaIntrospector._parse_object_fields(object_content, content)
        entity_info.fields = fields

        # Identify ID field (usually named "id" with regex pattern)
        for field_name, field_info in fields.items():
            if field_name == "id" and field_info.regex_pattern:
                entity_info.id_field = field_name
                entity_info.id_regex = field_info.regex_pattern
                # Extract prefix from regex: /^acc_/ -> "acc_"
                prefix_match = re.search(r'\^([A-Za-z_]+)', field_info.regex_pattern)
                if prefix_match:
                    entity_info.id_prefix = prefix_match.group(1)
                break

        return entity_info

    @staticmethod
    def _parse_object_fields(object_content: str, full_content: str) -> Dict[str, FieldInfo]:
        """Parse field definitions from a Zod object definition"""
        fields = {}

        # Parse line by line, tracking nesting level to only capture top-level fields
        lines = object_content.split('\n')
        brace_count = 0
        paren_count = 0

        current_field = None
        current_field_content = []

        for line in lines:
            stripped = line.strip()
            if not stripped or stripped.startswith('//'):
                continue

            # Count braces and parens to track nesting
            brace_count += line.count('{') - line.count('}')
            paren_count += line.count('(') - line.count(')')

            # Look for field definition: fieldName: ...
            # Only match at top level (brace_count == 0 or 1 for the object itself)
            field_match = re.match(r'(\w+)\s*:\s*(.+)', stripped)
            if field_match and brace_count <= 1:
                # Save previous field if exists
                if current_field:
                    field_content = ' '.join(current_field_content)
                    field_info = SchemaIntrospector._parse_field_definition(
                        current_field, field_content, full_content
                    )
                    if field_info:
                        fields[current_field] = field_info

                # Start new field
                current_field = field_match.group(1)
                current_field_content = [field_match.group(2)]
            elif current_field:
                # Continue collecting field content
                current_field_content.append(stripped)

            # If we hit a comma at top level AND all braces/parens are balanced, finish current field
            # For nested objects, wait until braces are balanced
            if stripped.endswith(',') and brace_count <= 1 and paren_count <= 0 and current_field:
                field_content = ' '.join(current_field_content)
                # Remove trailing comma
                field_content = re.sub(r',\s*$', '', field_content)
                field_info = SchemaIntrospector._parse_field_definition(
                    current_field, field_content, full_content
                )
                if field_info:
                    fields[current_field] = field_info
                current_field = None
                current_field_content = []
                # Reset counts for next field
                brace_count = 0
                paren_count = 0

        # Handle last field if exists
        if current_field:
            field_content = ' '.join(current_field_content)
            field_info = SchemaIntrospector._parse_field_definition(
                current_field, field_content, full_content
            )
            if field_info:
                fields[current_field] = field_info

        return fields

    @staticmethod
    def _parse_field_definition(field_name: str, field_content: str, full_content: str) -> Optional[FieldInfo]:
        """Parse a single field definition to extract type, constraints, etc."""
        # Normalize field content (remove extra whitespace)
        field_content = ' '.join(field_content.split())

        # Check if optional (can be at end of chain or in the middle)
        is_optional = '.optional()' in field_content

        # Extract Zod type
        zod_type = field_content.strip()

        # Check for enum - handle both z.enum([...]) and enum variable references
        # Handle multi-line: z\n  .enum([...])
        enum_match = re.search(r'z\s*\.\s*enum\s*\(\s*\[(.*?)\]\s*\)', field_content, re.DOTALL)
        enum_values = None
        is_nullable_union = False

        if enum_match:
            enum_str = enum_match.group(1)
            enum_values = [v.strip().strip('"\'') for v in re.findall(r'["\']([^"\']+)["\']', enum_str)]
        else:
            # Check for variable reference (e.g., BankAccountStatus, UserStatus, AccountStatus)
            # Match any PascalCase identifier that might be a schema variable
            var_match = re.search(r'^(\w+)$', field_content.strip())
            if var_match:
                var_name = var_match.group(1)
                # Try to find the variable definition in the full content
                # Look for: const VarName = z.union([z.enum([...]), z.null()])
                var_def_match = re.search(
                    rf'const\s+{re.escape(var_name)}\s*=\s*z\s*\.\s*union\s*\(\s*\[(.*?)\]\s*\)',
                    full_content,
                    re.DOTALL
                )
                if var_def_match:
                    union_content = var_def_match.group(1)
                    # Check if union includes z.null()
                    if 'z.null()' in union_content:
                        is_nullable_union = True
                    # Extract enum from union: z.enum([...])
                    # Find enum pattern in union content - handle nested brackets correctly
                    # Look for z.enum([...]) pattern, matching brackets properly
                    enum_start = union_content.find('z.enum(')
                    if enum_start >= 0:
                        # Find the opening bracket after z.enum(
                        bracket_start = union_content.find('[', enum_start)
                        if bracket_start >= 0:
                            # Find matching closing bracket
                            bracket_count = 1
                            bracket_end = bracket_start + 1
                            while bracket_end < len(union_content) and bracket_count > 0:
                                if union_content[bracket_end] == '[':
                                    bracket_count += 1
                                elif union_content[bracket_end] == ']':
                                    bracket_count -= 1
                                bracket_end += 1
                            if bracket_count == 0:
                                enum_str = union_content[bracket_start+1:bracket_end-1]
                                enum_values = [v.strip().strip('"\'') for v in re.findall(r'["\']([^"\']+)["\']', enum_str)]
                else:
                    # Try direct enum variable: const VarName = z.enum([...])
                    enum_var_match = re.search(
                        rf'const\s+{re.escape(var_name)}\s*=\s*z\s*\.\s*enum\s*\(\s*\[(.*?)\]\s*\)',
                        full_content,
                        re.DOTALL
                    )
                    if enum_var_match:
                        enum_str = enum_var_match.group(1)
                        enum_values = [v.strip().strip('"\'') for v in re.findall(r'["\']([^"\']+)["\']', enum_str)]

        # Check for regex - handle both .regex(/.../) and variable.regex(/.../)
        regex_match = re.search(r'\.regex\(/(.*?)/\)', field_content)
        regex_pattern = None
        if regex_match:
            regex_pattern = regex_match.group(1)

        # Check for min/max length
        min_length_match = re.search(r'\.min\((\d+)\)', field_content)
        max_length_match = re.search(r'\.max\((\d+)\)', field_content)
        min_length = int(min_length_match.group(1)) if min_length_match else None
        max_length = int(max_length_match.group(1)) if max_length_match else None

        # Check for min/max value
        min_value_match = re.search(r'\.gte\(([\d.]+)\)', field_content)
        max_value_match = re.search(r'\.lte\(([\d.]+)\)', field_content)
        min_value = float(min_value_match.group(1)) if min_value_match else None
        max_value = float(max_value_match.group(1)) if max_value_match else None

        # Check for default
        default_match = re.search(r'\.default\(([^)]+)\)', field_content)
        default_value = default_match.group(1).strip().strip('"\'') if default_match else None

        # Check for email validation
        is_email = '.email()' in field_content or 'email' in field_name.lower()

        # Check for datetime validation
        is_datetime = '.datetime(' in field_content or 'At' in field_name or 'date' in field_name.lower()

        # Check for array type
        is_array = 'z.array(' in field_content or '.array(' in field_content

        # Determine if required (not optional and no default)
        is_required = not is_optional and default_value is None

        return FieldInfo(
            name=field_name,
            zod_type=zod_type,
            is_required=is_required,
            is_optional=is_optional,
            enum_values=enum_values,
            is_nullable_union=is_nullable_union,
            is_array=is_array,
            regex_pattern=regex_pattern,
            min_length=min_length,
            max_length=max_length,
            min_value=min_value,
            max_value=max_value,
            default_value=default_value
        )

    @staticmethod
    def introspect_all_entities(project_root: Path) -> Dict[str, Dict[str, EntitySchemaInfo]]:
        """
        Introspect all entities from all schema files.

        Returns dict mapping domain_name -> {entity_name -> EntitySchemaInfo}
        """
        all_entities = {}
        schema_files = SchemaIntrospector.find_schema_files(project_root)

        for domain_name, schema_file in schema_files.items():
            entities = SchemaIntrospector.extract_entity_schemas(schema_file, domain_name)
            if entities:
                all_entities[domain_name] = entities

        return all_entities

    @staticmethod
    def get_entity_info(
        entity_name: str,
        domain_name: str,
        project_root: Path
    ) -> Optional[EntitySchemaInfo]:
        """Get entity schema information for a specific entity and domain"""
        schema_files = SchemaIntrospector.find_schema_files(project_root)

        if domain_name not in schema_files:
            return None

        entities = SchemaIntrospector.extract_entity_schemas(
            schema_files[domain_name], domain_name
        )

        return entities.get(entity_name)
