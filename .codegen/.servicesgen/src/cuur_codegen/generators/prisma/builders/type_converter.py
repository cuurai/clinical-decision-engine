"""
Prisma Type Converter - Converts OpenAPI types to Prisma types
"""

from typing import Dict, Any, Optional
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.openapi import extract_schema_name_from_ref


class PrismaTypeConverter:
    """Converts OpenAPI schema types to Prisma types"""

    # Mapping from OpenAPI types/formats to Prisma types
    TYPE_MAPPING = {
        "string": "String",
        "integer": "Int",
        "number": "Decimal",  # Use Decimal for financial precision
        "boolean": "Boolean",
        "array": "String[]",  # Default for arrays, can be overridden
    }

    # Format-specific mappings
    FORMAT_MAPPING = {
        "date-time": "DateTime",
        "date": "DateTime",
        "time": "String",  # Prisma doesn't have a Time type, use String
        "uuid": "String @db.Uuid",
        "email": "String",
        "uri": "String",
        "url": "String",
        "binary": "Bytes",
        "byte": "Bytes",
        "int32": "Int",
        "int64": "BigInt",
        "float": "Float",
        "double": "Decimal",
        "password": "String",  # Store passwords as String
        "ipv4": "String",
        "ipv6": "String",
    }

    # Field name patterns that suggest DateTime type
    DATETIME_FIELD_PATTERNS = [
        "createdat", "created_at", "created",
        "updatedat", "updated_at", "updated",
        "deletedat", "deleted_at", "deleted",
        "expiresat", "expires_at", "expires",
        "timestamp", "time_stamp",
        "lastloginat", "last_login_at", "lastlogin",
        "lastverifiedat", "last_verified_at", "lastverified",
        "lastusedat", "last_used_at", "lastused",
        "verifiedat", "verified_at", "verified",
        "sentat", "sent_at", "sent",
        "receivedat", "received_at", "received",
        "completedat", "completed_at", "completed",
        "startedat", "started_at", "started",
        "endedat", "ended_at", "ended",
        "createdby", "created_by",  # Standardize createdBy to DateTime? No, keep as String for userId
        "updatedby", "updated_by",  # Standardize updatedBy to DateTime? No, keep as String for userId
    ]

    # Field name patterns that suggest UUID type
    UUID_FIELD_PATTERNS = [
        "id", "uuid", "guid",
        "userid", "user_id", "userId",
        "orgid", "org_id", "orgId",
        "accountid", "account_id", "accountId",
        "factorid", "factor_id", "factorId",
        "sessionid", "session_id", "sessionId",
        "tokenid", "token_id", "tokenId",
    ]

    # Field name patterns that suggest email type
    EMAIL_FIELD_PATTERNS = [
        "email", "e_mail", "eMail",
    ]

    # Field name patterns that suggest URI/URL type
    URI_FIELD_PATTERNS = [
        "url", "uri", "link", "href", "endpoint",
    ]

    @staticmethod
    def convert_openapi_to_prisma_type(
        schema: Dict[str, Any],
        field_name: str,
        context: Optional[GenerationContext] = None
    ) -> str:
        """
        Convert OpenAPI schema to Prisma type string.

        Enhanced with:
        - Better format detection (date-time, uuid, email, uri)
        - Field name pattern matching for type inference
        - Better enum detection (inline and referenced)
        - Better array handling (nested arrays, complex types)

        Args:
            schema: OpenAPI schema definition
            field_name: Field name (for context and pattern matching)
            context: Generation context

        Returns:
            Prisma type string (e.g., "String", "Int", "DateTime", etc.)
        """
        # Handle $ref (references to other schemas)
        if "$ref" in schema:
            ref_name = extract_schema_name_from_ref(schema["$ref"])
            if ref_name and context:
                # Resolve the referenced schema to check if it's an enum
                from cuur_codegen.utils.openapi import resolve_ref
                ref_schema = resolve_ref(context.spec, schema["$ref"])
                if ref_schema:
                    # Check if it's an enum
                    if "enum" in ref_schema:
                        # It's an enum - generate enum name from schema name
                        enum_name = ref_name.replace("Enum", "").replace("Type", "") + "Enum"
                        return enum_name
                    # Check if referenced schema has type/format info we can use
                    if "type" in ref_schema or "format" in ref_schema:
                        # Recursively convert the referenced schema
                        return PrismaTypeConverter.convert_openapi_to_prisma_type(
                            ref_schema, field_name, context
                        )
                # For model references, treat as String (relationships handled separately)
            return "String"

        # Handle enum (inline enum or enum in referenced schema)
        if "enum" in schema:
            # Prisma enums - we'll generate enum types separately
            enum_name = PrismaTypeConverter._get_enum_name(field_name, schema)
            return enum_name

        # Handle type
        schema_type = schema.get("type")
        if not schema_type:
            # Try to infer type from field name patterns if no type specified
            inferred_type = PrismaTypeConverter._infer_type_from_field_name(field_name)
            if inferred_type:
                return inferred_type
            # Default to String if no type specified
            return "String"

        # Handle array (including nested arrays)
        if schema_type == "array":
            items = schema.get("items", {})
            if not items:
                # Empty items - default to String[]
                return "String[]"

            # Recursively convert array item type
            item_type = PrismaTypeConverter.convert_openapi_to_prisma_type(
                items, f"{field_name}Item", context
            )

            # Handle nested arrays (array of arrays)
            if isinstance(items, dict) and items.get("type") == "array":
                # Already handled recursively, just return with []
                return f"{item_type}[]"

            return f"{item_type}[]"

        # Handle format-specific types (highest priority after enum/ref/array)
        format_type = schema.get("format")
        if format_type:
            if format_type in PrismaTypeConverter.FORMAT_MAPPING:
                base_type = PrismaTypeConverter.FORMAT_MAPPING[format_type]
                # Add nullable if needed
                if schema.get("nullable", False):
                    return f"{base_type}?"
                return base_type
            else:
                # Unknown format - log warning but continue with type inference
                if context:
                    context.logger.debug(f"Unknown format '{format_type}' for field '{field_name}', using type inference")

        # Handle basic types with enhanced inference
        if schema_type in PrismaTypeConverter.TYPE_MAPPING:
            base_type = PrismaTypeConverter.TYPE_MAPPING[schema_type]

            # Enhanced type inference based on field name patterns
            if schema_type == "string":
                # Check field name patterns for better type inference
                inferred_type = PrismaTypeConverter._infer_string_type_from_field_name(
                    field_name, format_type
                )
                if inferred_type:
                    base_type = inferred_type
            elif base_type == "Decimal" and schema_type == "number":
                # Check if it's a currency/decimal field
                if any(keyword in field_name.lower() for keyword in ["decimal", "amount", "price", "balance", "cost", "fee", "rate"]):
                    return "Decimal @db.Decimal(18, 8)"  # Standard decimal precision

            # Add nullable if needed
            if schema.get("nullable", False):
                return f"{base_type}?"
            return base_type

        # Default fallback - try field name inference
        inferred_type = PrismaTypeConverter._infer_type_from_field_name(field_name)
        if inferred_type:
            return inferred_type

        return "String"

    @staticmethod
    def _infer_type_from_field_name(field_name: str) -> Optional[str]:
        """
        Infer Prisma type from field name patterns.

        Returns None if no pattern matches.
        """
        field_lower = field_name.lower().replace("_", "").replace("-", "")

        # Check DateTime patterns
        for pattern in PrismaTypeConverter.DATETIME_FIELD_PATTERNS:
            if pattern in field_lower:
                return "DateTime"

        # Check UUID patterns (but only if it's likely an ID field)
        for pattern in PrismaTypeConverter.UUID_FIELD_PATTERNS:
            if pattern == field_lower or field_lower.endswith(pattern):
                return "String @db.Uuid"

        return None

    @staticmethod
    def _infer_string_type_from_field_name(
        field_name: str, format_type: Optional[str] = None
    ) -> Optional[str]:
        """
        Infer Prisma string type from field name patterns.

        Returns None if no pattern matches or if format_type already specifies the type.
        """
        # If format is already specified, don't override
        if format_type and format_type in PrismaTypeConverter.FORMAT_MAPPING:
            return None

        field_lower = field_name.lower().replace("_", "").replace("-", "")

        # CRITICAL FIX: createdBy/updatedBy/deletedBy should be String (userId), not DateTime
        if field_lower in ["createdby", "created_by", "updatedby", "updated_by", "deletedby", "deleted_by"]:
            return "String"

        # Check DateTime patterns (for string fields that should be DateTime)
        # CRITICAL FIX: Standardize all date/time fields to DateTime type
        for pattern in PrismaTypeConverter.DATETIME_FIELD_PATTERNS:
            if pattern in field_lower:
                # Skip createdBy/updatedBy/deletedBy - these are user IDs, not dates
                if pattern in ["createdby", "created_by", "updatedby", "updated_by", "deletedby", "deleted_by"]:
                    continue
                return "DateTime"

        # Check UUID patterns
        for pattern in PrismaTypeConverter.UUID_FIELD_PATTERNS:
            if pattern == field_lower or field_lower.endswith(pattern):
                return "String @db.Uuid"

        # Check email patterns
        for pattern in PrismaTypeConverter.EMAIL_FIELD_PATTERNS:
            if pattern in field_lower:
                return "String"  # Email is just String in Prisma

        # Check URI/URL patterns
        for pattern in PrismaTypeConverter.URI_FIELD_PATTERNS:
            if pattern in field_lower:
                return "String"  # URI is just String in Prisma

        return None

    @staticmethod
    def _get_enum_name(field_name: str, schema: Dict[str, Any]) -> str:
        """Generate enum name from field name"""
        # Convert fieldName to FieldNameEnum
        parts = field_name.split("_")
        enum_name = "".join(part.capitalize() for part in parts) + "Enum"
        return enum_name

    @staticmethod
    def is_required(field_name: str, schema: Dict[str, Any], required_fields: list) -> bool:
        """Check if field is required"""
        # Ensure required_fields is a list
        if not isinstance(required_fields, list):
            return not schema.get("nullable", False)

        if field_name in required_fields:
            return True
        return not schema.get("nullable", False)

    @staticmethod
    def get_default_value(schema: Dict[str, Any]) -> Optional[str]:
        """Get default value for Prisma field"""
        if "default" in schema:
            default = schema["default"]
            schema_type = schema.get("type")

            # Check if it's an enum (has enum values)
            if "enum" in schema:
                # Enum defaults don't use quotes
                return f"@default({default})"

            if schema_type == "string":
                return f'@default("{default}")'
            elif schema_type == "boolean":
                return "@default(true)" if default else "@default(false)"
            elif schema_type in ["integer", "number"]:
                return f"@default({default})"
            elif schema.get("format") == "date-time":
                # For timestamps, use @default(now())
                if default == "now()":
                    return "@default(now())"
                return f'@default("{default}")'

        # Check for auto-generated fields
        if schema.get("x-prisma-default") == "uuid":
            return "@default(uuid())"
        if schema.get("x-prisma-default") == "now":
            return "@default(now())"

        return None
