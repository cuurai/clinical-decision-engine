"""
Models Factory Builder

Generates factories from entity and DTO files in the models directory.
Reads from packages/core/packages/core/src/{domain}/models/
"""

import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, kebab_case, pascal_case
from .schema_introspector import SchemaIntrospector, FieldInfo


@dataclass
class EntityInfo:
    """Information about an entity file"""
    entity_name: str  # e.g., "chain"
    schema_name: str  # e.g., "Chain" (from schemas.Chain)
    file_path: Path


@dataclass
class DtoInfo:
    """Information about a DTO file"""
    dto_name: str  # e.g., "create-chain"
    schema_export_name: str  # e.g., "ZCreateChainRequestSchema"
    type_export_name: str  # e.g., "CreateChainRequest"
    schema_source: str  # "schemas.CreateChainRequest" or "inline"
    file_path: Path


class ModelsFactoryBuilder:
    """Builds factories from models directory structure"""

    def __init__(self, context: GenerationContext):
        self.context = context
        self.project_root = context.config.paths.project_root

    def find_core_base_path(self) -> Optional[Path]:
        """Find the core package base path"""
        core_base_paths = [
            self.project_root / "packages" / "core" / "packages" / "core" / "src",
            self.project_root / "packages" / "core" / "src",
            self.project_root.parent / "packages" / "core" / "packages" / "core" / "src",
            self.project_root.parent / "packages" / "core" / "src",
        ]

        for path in core_base_paths:
            if path.exists():
                return path
        return None

    def find_entity_files(self, domain_name: str) -> Dict[str, EntityInfo]:
        """Find all entity files in models directory"""
        entities = {}
        core_base = self.find_core_base_path()
        if not core_base:
            return entities

        models_dir = core_base / domain_name / "models"
        if not models_dir.exists():
            return entities

        for entity_file in models_dir.glob("*/entity/*.entity.ts"):
            entity_name = entity_file.parent.parent.name
            content = entity_file.read_text(encoding="utf-8")

            # Extract schema name from: schemas.Chain
            schema_match = re.search(r'schemas\.(\w+)', content)
            if schema_match:
                schema_name = schema_match.group(1)
                entities[entity_name] = EntityInfo(
                    entity_name=entity_name,
                    schema_name=schema_name,
                    file_path=entity_file
                )

        return entities

    def find_dto_files(self, domain_name: str) -> Dict[str, List[DtoInfo]]:
        """Find all DTO files in models directory, grouped by entity"""
        dtos_by_entity: Dict[str, List[DtoInfo]] = {}
        core_base = self.find_core_base_path()
        if not core_base:
            return dtos_by_entity

        models_dir = core_base / domain_name / "models"
        if not models_dir.exists():
            return dtos_by_entity

        for dto_file in models_dir.glob("*/dto/*.dto.ts"):
            entity_name = dto_file.parent.parent.name
            dto_name = dto_file.stem.replace(".dto", "")  # e.g., "create-chain"
            content = dto_file.read_text(encoding="utf-8")

            # Extract schema export name: ZCreateChainRequestSchema
            schema_export_match = re.search(r'export const (Z\w+Schema)', content)
            schema_export_name = schema_export_match.group(1) if schema_export_match else None

            # Extract type export name: CreateChainRequest
            type_export_match = re.search(r'export type (\w+)', content)
            type_export_name = type_export_match.group(1) if type_export_match else None

            # Check if schema comes from schemas.* or is inline
            schema_source_match = re.search(r'schemas\.(\w+)', content)
            schema_source = f"schemas.{schema_source_match.group(1)}" if schema_source_match else "inline"

            if schema_export_name and type_export_name:
                if entity_name not in dtos_by_entity:
                    dtos_by_entity[entity_name] = []

                dtos_by_entity[entity_name].append(DtoInfo(
                    dto_name=dto_name,
                    schema_export_name=schema_export_name,
                    type_export_name=type_export_name,
                    schema_source=schema_source,
                    file_path=dto_file
                ))

        return dtos_by_entity

    def _get_schema_fields(self, schema_name: str, domain_name: str) -> Dict[str, FieldInfo]:
        """Extract fields from a schema definition"""
        core_base = self.find_core_base_path()
        if not core_base:
            return {}

        # Try schemas file first (has variable definitions), then openapi file
        schema_file = core_base / domain_name / "schemas" / f"{domain_name}.schemas.ts"
        if not schema_file.exists():
            schema_file = core_base / domain_name / "openapi" / f"{domain_name}.zod.schema.ts"
        if not schema_file.exists():
            return {}

        content = schema_file.read_text(encoding="utf-8")

        # Find the schema definition - handle multi-line: const Chain = z\n  .object({
        pattern = rf'const\s+{re.escape(schema_name)}\s*=\s*z\s*\.\s*object\s*\(\s*\{{'
        match = re.search(pattern, content, re.MULTILINE | re.DOTALL)

        if not match:
            return {}

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
            return {}

        object_content = content[start_pos:pos-1]

        # Parse fields using SchemaIntrospector
        fields = SchemaIntrospector._parse_object_fields(object_content, content)
        return fields

    def _generate_field_code(self, field_name: str, field_info: FieldInfo) -> Optional[str]:
        """Generate faker code for a field based on its type and constraints"""
        zod_lower = field_info.zod_type.lower()

        # Check for z.record() - object with string keys (must come before z.object check)
        if "z.record(" in field_info.zod_type or ".record(" in field_info.zod_type:
            # z.record(z.string()) or z.record(z.unknown()) - empty object for test data
            return "{}"

        # Check for nested objects FIRST (before other checks)
        # Look for z.object( pattern or object with braces indicating nested structure
        if "z.object" in field_info.zod_type or ("object" in zod_lower and "{" in field_info.zod_type):
            # Try to extract nested object structure
            # Look for object({ field1: type1, field2: type2 })
            object_match = re.search(r'object\s*\(\s*\{\s*([^}]+)\s*\}', field_info.zod_type, re.DOTALL)
            if object_match:
                nested_content = object_match.group(1)
                # Parse nested fields - handle patterns like "EIP1559: z.boolean()"
                nested_fields = []
                # Look for field: z.type() patterns
                nested_field_pattern = r'(\w+)\s*:\s*z\.(\w+)\(\)'
                nested_field_matches = re.finditer(nested_field_pattern, nested_content)
                for nested_match in nested_field_matches:
                    nested_field_name = nested_match.group(1)
                    nested_field_type = nested_match.group(2)
                    if nested_field_type == "boolean":
                        nested_fields.append(f"{nested_field_name}: faker.datatype.boolean()")
                    elif nested_field_type == "string":
                        nested_fields.append(f"{nested_field_name}: faker.string.alpha(10)")
                    elif nested_field_type == "number":
                        nested_fields.append(f"{nested_field_name}: faker.number.int()")

                if nested_fields:
                    return "{\n      " + ",\n      ".join(nested_fields) + ",\n    }"

            # Fallback: return empty object
            return "{}"

        # Boolean fields - must come before string checks
        if "z.boolean()" in field_info.zod_type or "boolean" in zod_lower:
            # Check for default value
            if field_info.default_value is not None:
                # Use schema default (true/false, not string)
                if str(field_info.default_value).lower() == "false" or field_info.default_value == False:
                    return "false"
                elif str(field_info.default_value).lower() == "true" or field_info.default_value == True:
                    return "true"
            return "faker.datatype.boolean()"

        # Nullable union fields - check if field allows null
        is_nullable = (
            "z.union" in field_info.zod_type and "z.null()" in field_info.zod_type
        ) or "z.null()" in field_info.zod_type

        if is_nullable and field_info.is_optional:
            # For optional nullable fields, default to null
            # But check if there's a non-null default value
            if field_info.default_value is not None and str(field_info.default_value).lower() != "null":
                # Generate the non-null value - continue to normal field generation
                pass
            else:
                # Default to null for optional nullable fields
                return "null"

        # Include all fields - don't skip optional fields for entity factories
        # (They should be included for realistic test data)

        # ID fields with regex patterns - handle all ID field names (id, orgId, ownerAccountId, etc.)
        is_id_field = (
            field_name.lower() == "id" or
            field_name.lower().endswith("id") or
            field_name.lower().endswith("_id")
        )

        if is_id_field:
            # Extract prefix from regex pattern
            prefix = None
            if field_info.regex_pattern:
                # Extract prefix from regex: /^BL_/, /^ID_/, /^acc_/, /^CU_/, /^TR_/, /^pm-prj_/
                # Handle multi-part prefixes like pm-prj_
                prefix_match = re.search(r'\^([A-Za-z_-]+)', field_info.regex_pattern)
                if prefix_match:
                    prefix = prefix_match.group(1)

            # Map common ID field names to their expected prefixes
            if not prefix:
                field_lower = field_name.lower()
                if field_lower == "orgid" or field_lower == "org_id":
                    prefix = "ID_"
                elif field_lower == "owneraccountid" or field_lower == "owner_account_id":
                    prefix = "acc_"
                elif field_lower == "parentwalletid" or field_lower == "parent_wallet_id":
                    prefix = "BL_"
                elif field_lower == "projectid" or field_lower == "project_id":
                    prefix = "pm-prj_"
                elif "wallet" in field_lower and "id" in field_lower:
                    prefix = "BL_"
                elif "account" in field_lower and "id" in field_lower and "org" not in field_lower:
                    prefix = "acc_"

            # Generate ID helper function name based on prefix
            if prefix:
                # Normalize prefix for function name (remove hyphens, uppercase)
                func_prefix = prefix.replace("-", "").replace("_", "").upper()
                if func_prefix.startswith("BL"):
                    return "makeBLId()"
                elif func_prefix.startswith("ID"):
                    return "makeIDId()"
                elif func_prefix.startswith("ACC"):
                    return "makeAccId()"
                elif func_prefix.startswith("CU"):
                    return "makeCUId()"
                elif func_prefix.startswith("TR"):
                    return "makeTRId()"
                elif func_prefix.startswith("PMPRJ"):
                    return "makeProjectId()"
                else:
                    # Generic ID generation with prefix
                    # Convert prefix to function name: CU_ -> makeCUId, pm-prj_ -> makeProjectId
                    if "_" in prefix or "-" in prefix:
                        parts = re.split(r'[_-]', prefix)
                        func_name = "make" + "".join(p.capitalize() for p in parts if p) + "Id()"
                        return func_name
                    else:
                        return f"make{prefix.replace('_', '').upper()}Id()"

            # Fallback: check if zod_type contains variable reference (e.g., ChainRecordId.regex)
            if "Id" in field_info.zod_type or "Id.regex" in field_info.zod_type:
                # Try to extract from context - check for BL_ pattern in regex
                if "BL_" in field_info.zod_type or "BL_" in str(field_info.regex_pattern or ""):
                    return "makeBLId()"
                elif "ID_" in field_info.zod_type or "ID_" in str(field_info.regex_pattern or ""):
                    return "makeIDId()"
                elif "acc_" in field_info.zod_type or "acc_" in str(field_info.regex_pattern or ""):
                    return "makeAccId()"
                elif "CU_" in field_info.zod_type or "CU_" in str(field_info.regex_pattern or ""):
                    return "makeCUId()"
                elif "TR_" in field_info.zod_type or "TR_" in str(field_info.regex_pattern or ""):
                    return "makeTRId()"
                elif "pm-prj_" in field_info.zod_type or "pm-prj_" in str(field_info.regex_pattern or ""):
                    return "makeProjectId()"

            # If no prefix found but it's an ID field, use generic ID generation
            # For fields like BankAccountId (union without regex), use a reasonable default
            if field_name.lower() == "id":
                # Check zod_type for hints about the ID type
                zod_type_lower = field_info.zod_type.lower()
                if "bankaccount" in zod_type_lower or ("account" in zod_type_lower and "bank" in zod_type_lower):
                    # Bank account IDs - use BA_ prefix
                    return '`BA_${faker.string.alphanumeric(26)}`'
                elif "deposit" in zod_type_lower:
                    return '`DP_${faker.string.alphanumeric(26)}`'
                elif "withdrawal" in zod_type_lower:
                    return '`WD_${faker.string.alphanumeric(26)}`'
                elif "settlement" in zod_type_lower:
                    return '`ST_${faker.string.alphanumeric(26)}`'
                else:
                    # Generic ID - use UUID or alphanumeric
                    return "faker.string.uuid()"

        # Arrays - must come before enum check
        if field_info.is_array:
            # Check if array of strings
            if "z.string()" in field_info.zod_type or "string" in zod_lower:
                return "[]"
            # Check if array of enums
            if field_info.enum_values:
                enum_values_str = ", ".join(f'"{v}"' for v in field_info.enum_values)
                return f"[faker.helpers.arrayElement([{enum_values_str}])]"
            # Generic array
            return "[]"

        # Enums - handle nullable unions (required but can be null)
        if field_info.enum_values:
            enum_values_str = ", ".join(f'"{v}"' for v in field_info.enum_values)
            if field_info.is_nullable_union:
                # Required nullable union: generate enum value OR null
                return f"faker.helpers.arrayElement([{enum_values_str}, null])"
            return f"faker.helpers.arrayElement([{enum_values_str}])"

        # Handle variable references that should be enums (e.g., BankAccountStatus, UserStatus)
        # Even if enum extraction failed, if field name suggests enum and it's required, generate a value
        if field_info.is_required and not field_info.is_optional:
            # Check if field name suggests enum (Status, Type, Category, etc.)
            if field_name.lower().endswith("status") or field_name.lower().endswith("type") or field_name.lower().endswith("category"):
                # Try to infer enum values from common patterns
                if "status" in field_name.lower():
                    # Common status enums
                    if "bank" in field_name.lower() or ("account" in field_name.lower() and "fiat" in zod_lower):
                        return 'faker.helpers.arrayElement(["ACTIVE", "SUSPENDED", "CLOSED", null])'
                    elif "verification" in field_name.lower():
                        return 'faker.helpers.arrayElement(["UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", null])'
                    elif "custody" in zod_lower or "custodian" in zod_lower:
                        return 'faker.helpers.arrayElement(["ACTIVE", "SUSPENDED", "CLOSED", null])'
                    elif "escrow" in zod_lower or "treasury" in zod_lower:
                        return 'faker.helpers.arrayElement(["ACTIVE", "FROZEN", "CLOSED", null])'
                    else:
                        return 'faker.helpers.arrayElement(["ACTIVE", "INACTIVE", "PENDING", null])'
                elif "type" in field_name.lower():
                    return 'faker.helpers.arrayElement(["TYPE_A", "TYPE_B", "TYPE_C", null])'
                # If nullable union but no enum extracted, default to null
                if field_info.is_nullable_union:
                    return "null"

        # Strings - check for z.string() OR variable references with .regex() (e.g., SymbolCode.regex(...))
        is_string_field = (
            "z.string()" in field_info.zod_type or
            ".regex(" in field_info.zod_type or
            (field_info.regex_pattern and "string" in zod_lower)
        )

        if is_string_field:
            # URL fields
            if ".url()" in field_info.zod_type or "url" in field_name.lower():
                return "faker.internet.url()"

            # Email fields
            if ".email()" in field_info.zod_type or "email" in field_name.lower():
                return "faker.internet.email()"

            # Datetime fields
            if ".datetime(" in field_info.zod_type or field_name.lower().endswith("at"):
                return "new Date().toISOString()"

            # Hash fields
            if "hash" in field_name.lower():
                return "faker.string.hexadecimal({ length: 64 })"

            # Address fields
            if "address" in field_name.lower():
                return "faker.finance.ethereumAddress()"

            # Name fields
            if "name" in field_name.lower():
                if "short" in field_name.lower():
                    return "faker.word.noun().slice(0, 4).toUpperCase()"
                return "faker.word.noun()"

            # Currency fields - check regex for 3 uppercase letters
            if "currency" in field_name.lower():
                if field_info.regex_pattern and re.match(r'\^\[A-Z\]\{3\}', field_info.regex_pattern):
                    return 'faker.string.alpha({ length: 3, casing: "upper" })'
                return "faker.finance.currencyCode()"

            # Balance/decimal string fields - check for decimal regex pattern
            if "balance" in field_name.lower() and field_info.regex_pattern:
                # Pattern: /^(0|[1-9]\d*)(\.\d{1,8})?$/
                if re.search(r'\(0\|\[1-9\]\\d\*\)\(\\\.\\d\{1,8\}\)\?', field_info.regex_pattern):
                    return "faker.number.float({ min: 0, max: 1000000, fractionDigits: 8 }).toString()"

            # Symbol/code fields with regex patterns (e.g., SymbolCode, AssetCode)
            if field_info.regex_pattern:
                # Check regex pattern to determine appropriate faker
                # Match patterns starting with ^[A-Z0-9] (uppercase alphanumeric)
                if re.match(r'\^\[A-Z0-9\]', field_info.regex_pattern):
                    # Uppercase alphanumeric pattern (e.g., symbol codes, asset codes)
                    if "symbol" in field_name.lower():
                        # Symbol codes: BTC/USD, ETH-EUR, etc. (pattern allows separator: -/.:)
                        # Generate format like "BTC/USD" or "ETH-EUR"
                        return '`${faker.string.alpha({ length: 3, casing: "upper" })}/${faker.string.alpha({ length: 3, casing: "upper" })}`'
                    elif "asset" in field_name.lower():
                        # Asset codes: BTC, ETH, USD, etc. (2-12 uppercase alphanumeric)
                        return 'faker.string.alpha({ length: { min: 2, max: 4 }, casing: "upper" })'
                    else:
                        # Generic uppercase alphanumeric
                        if field_info.min_length or field_info.max_length:
                            min_len = field_info.min_length or 1
                            max_len = field_info.max_length or 16
                            return f'faker.string.alphanumeric({{ length: {{ min: {min_len}, max: {max_len} }}, casing: "upper" }})'
                        return 'faker.string.alphanumeric({ length: { min: 1, max: 16 }, casing: "upper" })'
                elif re.match(r'\^\[0-9\]', field_info.regex_pattern):
                    # Numeric pattern
                    if field_info.min_length or field_info.max_length:
                        min_len = field_info.min_length or 1
                        max_len = field_info.max_length or 16
                        return f"faker.string.numeric({{ length: {{ min: {min_len}, max: {max_len} }} }})"
                    return "faker.string.numeric({ length: { min: 1, max: 16 } })"
                else:
                    # Generic string with regex constraint - check if pattern suggests uppercase
                    # If pattern contains [A-Z] or starts with uppercase chars, use uppercase
                    if '[A-Z]' in field_info.regex_pattern or field_info.regex_pattern.startswith('^[A-Z'):
                        if field_info.min_length or field_info.max_length:
                            min_len = field_info.min_length or 1
                            max_len = field_info.max_length or 16
                            return f'faker.string.alphanumeric({{ length: {{ min: {min_len}, max: {max_len} }}, casing: "upper" }})'
                        return 'faker.string.alphanumeric({ length: { min: 1, max: 16 }, casing: "upper" })'
                    # Generic string with regex constraint
                    if field_info.min_length or field_info.max_length:
                        length = field_info.max_length or field_info.min_length or 10
                        return f"faker.string.alpha({length})"
                    return "faker.string.alpha(10)"

            # Currency fields - ensure 3 uppercase letters to match /^[A-Z]{3}$/
            if "currency" in field_name.lower():
                # Check if regex pattern requires exactly 3 uppercase letters
                if field_info.regex_pattern and re.search(r'\^\[A-Z\]\{3\}', field_info.regex_pattern):
                    # Generate 3 uppercase letters
                    return 'faker.string.alpha({ length: 3, casing: "upper" })'
                return "faker.finance.currencyCode()"

            # Balance/decimal string fields - check for decimal string regex pattern
            if "balance" in field_name.lower() or ("amount" in field_name.lower() and field_info.regex_pattern):
                # Check for decimal string pattern: /^(0|[1-9]\d*)(\.\d{1,8})?$/
                if field_info.regex_pattern and re.search(r'\^\(0\|\[1-9\]', field_info.regex_pattern):
                    # Generate decimal string
                    return "faker.number.float({ min: 0, max: 1000000, fractionDigits: 8 }).toString()"

            # chainId - numeric string (like "1", "137", "56")
            if field_name.lower() == "chainid":
                return "faker.string.numeric({ length: { min: 1, max: 3 } })"

            # createdBy/updatedBy - use "system" for realism
            if field_name.lower() in ("createdby", "updatedby"):
                return '"system"'

            # Default string
            if field_info.min_length or field_info.max_length:
                length = field_info.max_length or field_info.min_length or 10
                return f"faker.string.alpha({length})"
            return "faker.string.alpha(10)"

        # Numbers
        if "z.number()" in field_info.zod_type:
            is_int = ".int()" in field_info.zod_type
            min_val = field_info.min_value or (1 if is_int else 0.0)
            max_val = field_info.max_value or (10000 if is_int else 10000.0)

            if is_int:
                return f"faker.number.int({{ min: {int(min_val)}, max: {int(max_val)} }})"
            else:
                return f"faker.number.float({{ min: {min_val}, max: {max_val} }})"

        # Booleans
        if "z.boolean()" in field_info.zod_type:
            return "faker.datatype.boolean()"

        # Default values
        if field_info.default_value is not None:
            # Try to parse as number
            try:
                float(field_info.default_value)
                return field_info.default_value
            except ValueError:
                return f'"{field_info.default_value}"'

        return None

    def build_entity_factory_file(
        self,
        entity_info: EntityInfo,
        domain_name: str,
        header: str
    ) -> str:
        """Build factory file for a single entity"""
        entity_pascal = pascal_case(entity_info.entity_name)
        entity_camel = camel_case(entity_info.entity_name)
        schema_name = entity_info.schema_name

        # Import from models
        import_path = f"@cuur/core/{domain_name}/models/{entity_info.entity_name}"

        # Import schemas
        schemas_var = domain_name.replace("-", "").lower() + "Schemas"
        schemas_import = f"@cuur/core/{domain_name}/index.js"

        # Extract fields from schema
        fields = self._get_schema_fields(schema_name, domain_name)

        # Generate field code and collect ID helpers needed
        field_lines = []
        id_helpers_needed = set()

        # Track status field code for deprecationReason conditional logic
        status_field_code = None
        deprecation_reason_code = None

        for field_name, field_info in sorted(fields.items()):
            field_code = self._generate_field_code(field_name, field_info)
            if field_code:
                # Track ID helpers
                if "makeBLId()" in field_code:
                    id_helpers_needed.add("BL")
                elif "makeIDId()" in field_code:
                    id_helpers_needed.add("ID")
                elif "makeAccId()" in field_code:
                    id_helpers_needed.add("Acc")
                elif "makeCUId()" in field_code:
                    id_helpers_needed.add("CU")
                elif "makeTRId()" in field_code:
                    id_helpers_needed.add("TR")
                elif "makeProjectId()" in field_code:
                    id_helpers_needed.add("Project")

                # Special handling for status field - extract early for deprecationReason
                if field_name == "status":
                    status_field_code = field_code
                    # Use status variable instead of regenerating (status var declared before raw object)
                    field_lines.append(f"    {field_name}: status,")
                    continue

                # Special handling for deprecationReason - only populate if status is DEPRECATED
                if field_name == "deprecationReason":
                    deprecation_reason_code = field_code
                    # Will be added after status is determined
                    continue

                # Handle default values from schema
                if field_info.default_value is not None:
                    # Use schema default if available
                    if "z.number" in field_info.zod_type:
                        field_lines.append(f"    {field_name}: overrides.{field_name} ?? {field_info.default_value},")
                    elif "z.boolean" in field_info.zod_type:
                        # Boolean defaults - use actual boolean, not string
                        bool_val = "true" if (str(field_info.default_value).lower() == "true" or field_info.default_value == True) else "false"
                        field_lines.append(f"    {field_name}: overrides.{field_name} ?? {bool_val},")
                    else:
                        # String/enum defaults
                        default_val = f'"{field_info.default_value}"' if isinstance(field_info.default_value, str) else str(field_info.default_value)
                        field_lines.append(f"    {field_name}: overrides.{field_name} ?? {default_val},")
                elif field_info.is_optional:
                    # Optional without default - include with generated code
                    # But skip deprecationReason (handled separately)
                    if field_name != "deprecationReason":
                        field_lines.append(f"    {field_name}: overrides.{field_name} ?? {field_code},")
                else:
                    # Required field
                    field_lines.append(f"    {field_name}: overrides.{field_name} ?? {field_code},")

        # Add deprecationReason conditionally (will be inserted after status in raw object)
        # Note: This will be handled in the template generation

        fields_block = "\n".join(field_lines) if field_lines else "    // No fields generated"

        # Generate ID helpers if needed
        id_helpers_block = ""
        if id_helpers_needed:
            id_helpers_block = "\n\nconst ID_CHARS = \"0123456789ABCDEFGHJKMNPQRSTVWXYZ\";\n\n"
            if "BL" in id_helpers_needed:
                id_helpers_block += """export function makeBLId() {
  return (
    "BL_" +
    Array.from({ length: 26 }, () =>
      ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
    ).join("")
  );
}

"""
            if "ID" in id_helpers_needed:
                id_helpers_block += """export function makeIDId() {
  return (
    "ID_" +
    Array.from({ length: 26 }, () =>
      ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
    ).join("")
  );
}

"""
            if "Acc" in id_helpers_needed:
                id_helpers_block += """export function makeAccId() {
  return (
    "acc_" +
    Array.from({ length: 26 }, () =>
      ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
    ).join("")
  );
}

"""
            if "CU" in id_helpers_needed:
                id_helpers_block += """export function makeCUId() {
  return (
    "CU_" +
    Array.from({ length: 26 }, () =>
      ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
    ).join("")
  );
}

"""
            if "TR" in id_helpers_needed:
                id_helpers_block += """export function makeTRId() {
  return (
    "TR_" +
    Array.from({ length: 26 }, () =>
      ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
    ).join("")
  );
}

"""
            if "Project" in id_helpers_needed:
                id_helpers_block += """export function makeProjectId() {
  return (
    "pm-prj_" +
    Array.from({ length: 26 }, () =>
      ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
    ).join("")
  );
}

"""

        # Check if status field exists for conditional deprecationReason
        has_status = "status" in fields
        status_var_decl = ""
        deprecation_reason_line = ""

        if has_status and status_field_code:
            status_var_decl = f"\n  const status = overrides.status ?? {status_field_code};\n"
            # Add deprecationReason conditionally after all other fields
            if deprecation_reason_code:
                # Use faker.word.words(3) for more realistic deprecation reason
                deprecation_reason_line = f"\n    deprecationReason: status === \"DEPRECATED\" ? (overrides.deprecationReason ?? faker.word.words(3)) : undefined,"

        return f"""{header}

import {{ faker }} from "@faker-js/faker";
import {{ {schema_name}Entity }} from "{import_path}/index.js";
import {{ {schemas_var} as schemas }} from "{schemas_import}";
import {{ z }} from "zod";
{id_helpers_block}
export function create{schema_name}(overrides: Partial<{schema_name}Entity> = {{}}) {{{status_var_decl}
  const raw = {{
{fields_block}{deprecation_reason_line}
    ...overrides,
  }};

  return schemas.{schema_name}.parse(raw);
}}

export function {entity_camel}Batch(n = 3, overrides = {{}}) {{
  return Array.from({{ length: n }}, () => create{schema_name}(overrides));
}}
"""

    def build_dto_factory_file(
        self,
        dto_info: DtoInfo,
        entity_name: str,
        domain_name: str,
        header: str
    ) -> str:
        """Build factory file for a single DTO"""
        type_name = dto_info.type_export_name
        schema_export = dto_info.schema_export_name

        # Import from models
        import_path = f"@cuur/core/{domain_name}/models/{entity_name}"

        # If schema comes from schemas.*, import schemas
        schemas_var = domain_name.replace("-", "").lower() + "Schemas"
        schemas_import = f"@cuur/core/{domain_name}/index.js"

        # Determine schema reference and extract fields
        id_helpers_needed = set()
        if dto_info.schema_source.startswith("schemas."):
            schema_ref_name = dto_info.schema_source.split('.')[1]
            schema_ref = f"schemas.{schema_ref_name}"

            # Extract fields from the referenced schema
            # For Create/Update requests, they're usually based on the entity
            # Check if it's a request schema (e.g., CreateChainRequest -> Chain)
            if "Request" in schema_ref_name:
                # Try to extract base entity name (CreateChainRequest -> Chain)
                base_entity_match = re.match(r'Create(\w+)Request|Update(\w+)Request', schema_ref_name)
                if base_entity_match:
                    base_entity = base_entity_match.group(1) or base_entity_match.group(2)
                    fields = self._get_schema_fields(base_entity, domain_name)
                else:
                    fields = self._get_schema_fields(schema_ref_name, domain_name)
            else:
                fields = self._get_schema_fields(schema_ref_name, domain_name)

            # Import ID helpers from entity factory if needed
            entity_factory_import = f"../entity/{entity_name}.entity.factory.js"
            imports = f'''import {{ faker }} from "@faker-js/faker";
import {{ {type_name} }} from "{import_path}/index.js";
import {{ {schemas_var} as schemas }} from "{schemas_import}";
import {{ z }} from "zod";'''
        else:
            # Inline schema - read from DTO file
            schema_ref = schema_export
            imports = f'''import {{ faker }} from "@faker-js/faker";
import {{ {type_name}, {schema_export} }} from "{import_path}/index.js";
import {{ z }} from "zod";'''

            # For inline schemas, try to extract from the DTO file
            dto_content = dto_info.file_path.read_text(encoding="utf-8")
            # Look for z.object definition
            object_match = re.search(r'z\.object\(\s*\{{([\s\S]+?)\}}\s*\)', dto_content)
            if object_match:
                object_content = object_match.group(1)
                fields = SchemaIntrospector._parse_object_fields(object_content, dto_content)
            else:
                fields = {}

        # Generate field code and track ID helpers needed
        field_lines = []
        for field_name, field_info in sorted(fields.items()):
            field_code = self._generate_field_code(field_name, field_info)
            if field_code:
                # Track ID helpers
                if "makeBLId()" in field_code:
                    id_helpers_needed.add("BL")
                elif "makeIDId()" in field_code:
                    id_helpers_needed.add("ID")
                elif "makeAccId()" in field_code:
                    id_helpers_needed.add("Acc")
                elif "makeCUId()" in field_code:
                    id_helpers_needed.add("CU")
                elif "makeTRId()" in field_code:
                    id_helpers_needed.add("TR")
                elif "makeProjectId()" in field_code:
                    id_helpers_needed.add("Project")

                # For DTOs (especially Create/Update requests), all fields are typically optional
                if field_info.is_optional or field_info.default_value is not None:
                    field_lines.append(f"    {field_name}: overrides.{field_name} ?? {field_code},")
                else:
                    field_lines.append(f"    {field_name}: overrides.{field_name} ?? {field_code},")

        fields_block = "\n".join(field_lines) if field_lines else "    // No fields generated"

        # Add ID helper imports if needed
        id_imports = ""
        if id_helpers_needed:
            helper_names = []
            if "BL" in id_helpers_needed:
                helper_names.append("makeBLId")
            if "ID" in id_helpers_needed:
                helper_names.append("makeIDId")
            if "Acc" in id_helpers_needed:
                helper_names.append("makeAccId")

            if helper_names:
                entity_factory_import = f"../entity/{entity_name}.entity.factory.js"
                id_imports = f'\nimport {{ {", ".join(helper_names)} }} from "{entity_factory_import}";'

        return f"""{header}

{imports}{id_imports}

export function create{type_name}(overrides: Partial<{type_name}> = {{}}) {{
  const raw = {{
{fields_block}
    ...overrides,
  }};

  return {schema_ref}.parse(raw);
}}
"""

    def build_all_factories_for_domain(
        self,
        domain_name: str,
        header: str
    ) -> List[Tuple[str, str]]:
        """
        Build all factory files for a domain.
        Returns list of (relative_path, content) tuples.
        Paths are relative to the factories directory and match the models structure.
        """
        factories = []

        # Find entities
        entities = self.find_entity_files(domain_name)

        # Find DTOs
        dtos_by_entity = self.find_dto_files(domain_name)

        # Generate entity factories
        for entity_name, entity_info in sorted(entities.items()):
            # Only include entities with id field (pure entities)
            # We'll check this by reading the schema file
            if self._entity_has_id_field(entity_info, domain_name):
                entity_factory_content = self.build_entity_factory_file(
                    entity_info, domain_name, header
                )
                # Structure: {entity-name}/entity/{entity-name}.entity.factory.ts
                relative_path = f"{entity_name}/entity/{entity_name}.entity.factory.ts"
                factories.append((relative_path, entity_factory_content))

        # Generate DTO factories
        for entity_name, dto_list in sorted(dtos_by_entity.items()):
            for dto_info in sorted(dto_list, key=lambda d: d.dto_name):
                dto_factory_content = self.build_dto_factory_file(
                    dto_info, entity_name, domain_name, header
                )
                # Structure: {entity-name}/dto/{dto-name}.dto.factory.ts
                relative_path = f"{entity_name}/dto/{dto_info.dto_name}.dto.factory.ts"
                factories.append((relative_path, dto_factory_content))

        return factories

    def _entity_has_id_field(self, entity_info: EntityInfo, domain_name: str) -> bool:
        """Check if entity has an id field by reading the schema file"""
        # Read the Zod schema file to check for id field
        core_base = self.find_core_base_path()
        if not core_base:
            return False

        schema_file = core_base / domain_name / "openapi" / f"{domain_name}.zod.schema.ts"
        if not schema_file.exists():
            return False

        content = schema_file.read_text(encoding="utf-8")

        # Find the schema definition
        pattern = rf"const\s+{re.escape(entity_info.schema_name)}\s*=\s*z\s*\.\s*object\s*\(\s*\{{([\s\S]+?)\}}\s*\)"
        match = re.search(pattern, content, re.DOTALL)
        if not match:
            return False

        object_content = match.group(1)
        # Check for id field
        return bool(re.search(r'\bid\s*:', object_content))
