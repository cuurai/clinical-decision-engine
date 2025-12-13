"""
Prisma Model Builder - Builds Prisma model definitions from OpenAPI schemas
"""

from typing import Dict, Any, List, Optional, Set
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.openapi import extract_schemas
from cuur_codegen.utils.string import camel_case, pascal_case, kebab_case
from .type_converter import PrismaTypeConverter

# Domain prefix mapping (2-letter uppercase codes)
# Format: {DOMAIN_PREFIX}_{ULID} (e.g., GW_01HQZX3K8PQRS7VN6M9TW1ABJZ)
DOMAIN_PREFIX_MAP = {
    "auth": "AU",
    "blockchain": "BL",
    "business-intelligence": "BI",
    "compliance": "CO",
    "custodian": "CU",
    "e-documents": "ED",
    "escrow": "ES",
    "events": "EV",
    "exchange": "EX",
    "fees-billing": "FB",
    "fiat-banking": "FI",
    "gateway": "GW",
    "governance": "GO",
    "identity": "ID",
    "market-oracles": "MO",
    "marketplace": "MP",
    "notifications": "NO",
    "observability": "OB",
    "pricing-refdata": "PR",
    "primary-market": "PM",
    "risk-limits": "RL",
    "sandbox": "SB",
    "settlements": "SE",
    "tenancy-trust": "TT",
    "transfer-agent": "TA",
    "treasury": "TR",
}


class PrismaModelBuilder:
    """Builds Prisma model definitions"""

    @staticmethod
    def build_models(
        context: GenerationContext,
        entity_schemas: Dict[str, Dict[str, Any]]
    ) -> List[str]:
        """
        Build Prisma model definitions from entity schemas.

        Args:
            context: Generation context
            entity_schemas: Dictionary of entity schema definitions

        Returns:
            List of Prisma model strings
        """
        models: List[str] = []
        processed_models: Set[str] = set()

        # Extract all schemas from OpenAPI spec
        all_schemas = extract_schemas(context.spec)

        # Ensure all_schemas is a dict, not a list
        if not isinstance(all_schemas, dict):
            context.logger.warn(f"Expected dict from extract_schemas, got {type(all_schemas)}")
            return models

        # Find entity schemas (those that are used in responses, not requests)
        entity_names = PrismaModelBuilder._identify_entity_schemas(
            context, all_schemas
        )

        for entity_name in entity_names:
            # Ensure entity_name is a string
            if not isinstance(entity_name, str):
                context.logger.debug(f"Skipping non-string entity name: {type(entity_name)} = {entity_name}")
                continue

            # Skip if already processed
            if entity_name in processed_models:
                continue

            # Get schema
            schema = all_schemas.get(entity_name)
            if not schema:
                context.logger.debug(f"Schema not found for entity: {entity_name}")
                continue

            # Build model
            try:
                model_str = PrismaModelBuilder._build_model(
                    context, entity_name, schema, all_schemas
                )
                if model_str:
                    models.append(model_str)
                    processed_models.add(entity_name)
            except Exception as e:
                context.logger.warn(f"Failed to build model for {entity_name}: {e}")
                continue

        return models

    @staticmethod
    def _identify_entity_schemas(
        context: GenerationContext,
        schemas: Dict[str, Dict[str, Any]]
    ) -> List[str]:
        """Identify which schemas are entities (not DTOs)"""
        entity_names: List[str] = []

        # Ensure schemas is a dict
        if not isinstance(schemas, dict):
            context.logger.warn(f"Expected dict for schemas, got {type(schemas)}")
            return entity_names

        # Look for schemas that are used in GET/POST responses
        # and don't end with "Request" or "Response"
        for schema_name, schema in schemas.items():
            # Ensure schema_name is a string (not a list or other type)
            if not isinstance(schema_name, str):
                context.logger.debug(f"Skipping non-string schema name: {type(schema_name)} = {schema_name}")
                continue

            # Skip empty names
            if not schema_name:
                continue

            # Skip request/response wrappers
            if schema_name.endswith("Request") or schema_name.endswith("Response"):
                continue
            if schema_name.endswith("Envelope") or schema_name.endswith("Params"):
                continue

            # Check if schema has properties (it's a model, not a primitive)
            if isinstance(schema, dict) and "properties" in schema:
                # Ensure we're adding a string, not a list
                if isinstance(schema_name, str):
                    entity_names.append(schema_name)

        # Sort and return only strings
        return sorted([name for name in entity_names if isinstance(name, str)])

    @staticmethod
    def _build_model(
        context: GenerationContext,
        model_name: str,
        schema: Dict[str, Any],
        all_schemas: Dict[str, Dict[str, Any]]
    ) -> str:
        """Build a single Prisma model"""
        # Convert model name to Prisma naming (PascalCase)
        prisma_model_name = pascal_case(model_name)

        # Get required fields - ensure it's a list
        required_fields = schema.get("required", [])
        if not isinstance(required_fields, list):
            required_fields = []

        # Build fields
        fields: List[str] = []

        # Always add id field first with domain prefix format
        # Format: {DOMAIN_PREFIX}_{ULID} (e.g., GW_01HQZX3K8PQRS7VN6M9TW1ABJZ)
        # Total length: 2 (prefix) + 1 (underscore) + 26 (ULID) = 29 chars
        # Using Char(33) to accommodate potential future entity prefixes
        domain_name = context.domain_name.lower()
        domain_prefix = DOMAIN_PREFIX_MAP.get(domain_name, "XX")
        # ID should be generated at application level with domain prefix
        # No @default() - IDs must be generated with correct domain prefix
        fields.append(f"  id        String   @id @db.Char(33) /// Format: {domain_prefix}_<ULID>")

        # Add orgId for multi-tenancy (if not already present)
        properties = schema.get("properties", {})
        if not isinstance(properties, dict):
            context.logger.warn(f"Model {model_name} has non-dict properties: {type(properties)}")
            properties = {}

        if "orgId" not in properties and "org_id" not in properties:
            fields.append("  orgId     String   @map(\"org_id\")")

        # Process properties
        for prop_name, prop_schema in properties.items():
            # Ensure prop_name is a string
            if not isinstance(prop_name, str):
                context.logger.debug(f"Skipping non-string property name in {model_name}: {type(prop_name)}")
                continue

            if not isinstance(prop_schema, dict):
                context.logger.debug(f"Skipping non-dict property schema for {model_name}.{prop_name}: {type(prop_schema)}")
                continue

            # Skip id and orgId (already added)
            if prop_name in ["id", "orgId", "org_id"]:
                continue

            try:
                # Check if this field is a potential foreign key
                relation_info = None
                if prop_name.endswith("Id") or prop_name.endswith("_id"):
                    # Try to detect relationship
                    potential_model_name = prop_name.replace("_id", "Id").replace("Id", "")
                    if potential_model_name:
                        for entity_name in all_schemas.keys():
                            if (entity_name.lower() == potential_model_name.lower() or
                                entity_name.lower() == potential_model_name.lower() + "s"):
                                relation_info = {
                                    "ref_model": pascal_case(entity_name),
                                    "field_name": camel_case(prop_name)
                                }
                                break

                field_str = PrismaModelBuilder._build_field(
                    context, prop_name, prop_schema, required_fields, all_schemas, relation_info
                )
                if field_str:
                    fields.append(field_str)
            except Exception as e:
                context.logger.warn(f"Failed to build field {model_name}.{prop_name}: {e}")
                continue

        # Add timestamps
        if "createdAt" not in properties and "created_at" not in properties:
            fields.append("  createdAt DateTime @default(now()) @map(\"created_at\")")
        if "updatedAt" not in properties and "updated_at" not in properties:
            fields.append("  updatedAt DateTime @updatedAt @map(\"updated_at\")")

        # Add audit trail fields (createdBy, updatedBy) - these should be String (userId), not DateTime
        if "createdBy" not in properties and "created_by" not in properties:
            fields.append("  createdBy String? @map(\"created_by\")")
        if "updatedBy" not in properties and "updated_by" not in properties:
            fields.append("  updatedBy String? @map(\"updated_by\")")

        # Add soft delete fields for audit trail
        if "deletedAt" not in properties and "deleted_at" not in properties:
            fields.append("  deletedAt DateTime? @map(\"deleted_at\")")
        if "deletedBy" not in properties and "deleted_by" not in properties:
            fields.append("  deletedBy String? @map(\"deleted_by\")")

        # Build indexes - extract field names from generated fields to check if orgId exists
        field_names = set()
        for field in fields:
            # Extract field name from field string (e.g., "  orgId     String   @map(\"org_id\")" -> "orgId")
            parts = field.strip().split()
            if parts:
                field_names.add(parts[0])

        indexes = PrismaModelBuilder._build_indexes(model_name, properties, field_names)

        # Build unique constraints - add unique constraints on critical fields
        unique_constraints = PrismaModelBuilder._build_unique_constraints(
            model_name, properties, field_names
        )

        # Build foreign key relationships - detect and add relationships
        relationships = PrismaModelBuilder._build_relationships(
            context, model_name, prisma_model_name, properties, all_schemas, field_names
        )

        # Build model string
        model_lines = [
            f"model {prisma_model_name} {{",
            *fields,
            *indexes,
            *unique_constraints,
            *relationships,
            "}"
        ]

        return "\n".join(model_lines)

    @staticmethod
    def _build_field(
        context: GenerationContext,
        prop_name: str,
        prop_schema: Dict[str, Any],
        required_fields: List[str],
        all_schemas: Dict[str, Dict[str, Any]],
        relation_info: Optional[Dict[str, str]] = None
    ) -> str:
        """Build a single Prisma field"""
        # Convert property name to camelCase for Prisma
        prisma_field_name = camel_case(prop_name)

        # Get Prisma type (pass context to resolve $ref enums)
        prisma_type = PrismaTypeConverter.convert_openapi_to_prisma_type(
            prop_schema, prop_name, context
        )

        # Check if required (before type override)
        is_required = PrismaTypeConverter.is_required(
            prop_name, prop_schema, required_fields
        )

        # CRITICAL FIX: Foreign key fields (ending with Id) should use @db.Char(33)
        # to match our domain-prefixed ID schema, not @db.Uuid
        # Format: {DOMAIN_PREFIX}_{ULID} (e.g., BL_01HQZX3K8PQRS7VN6M9TW1ABJZ)
        if relation_info or (prop_name.endswith("Id") and prop_name != "orgId"):
            # Override type to use Char(33) for domain-prefixed IDs
            # Set to String @db.Char(33) for domain-prefixed ID format
            prisma_type = "String @db.Char(33)"

        # Add nullable if not required
        if not is_required and not prisma_type.endswith("?"):
            prisma_type += "?"

        # Get default value
        default_value = PrismaTypeConverter.get_default_value(prop_schema)

        # Build field string
        field_parts = [f"  {prisma_field_name}", prisma_type]

        # Add @map if field name needs mapping
        if prop_name != prisma_field_name:
            field_parts.append(f'@map("{prop_name}")')

        # Add default if present
        if default_value:
            field_parts.append(default_value)

        # CRITICAL FIX: Add @relation annotation for foreign keys
        # Note: This is a simplified implementation. Full FK support requires:
        # 1. Detecting relationship direction (one-to-many vs many-to-one)
        # 2. Adding reverse relation fields
        # 3. Handling cascade deletes
        # For now, we'll add a comment and index the FK field
        if relation_info:
            # Add comment indicating relationship
            # Full @relation will be added in a future enhancement
            field_parts.append(f'/// FK: References {relation_info["ref_model"]}')

        return " ".join(field_parts)

    @staticmethod
    def _build_indexes(
        model_name: str,
        properties: Dict[str, Any],
        field_names: Optional[set] = None
    ) -> List[str]:
        """Build Prisma indexes"""
        indexes: List[str] = []

        # Use field_names if provided, otherwise check properties
        if field_names is None:
            field_names = set(properties.keys()) if isinstance(properties, dict) else set()

        # Only index orgId if it exists in the model
        if "orgId" in field_names:
            indexes.append("  @@index([orgId])")

        # Index common query fields
        common_index_fields = ["status", "type", "createdAt", "updatedAt"]
        for field in common_index_fields:
            camel_field = camel_case(field)
            if field in field_names or camel_field in field_names:
                indexes.append(f"  @@index([{camel_field}])")

        # Index soft delete field for filtering
        if "deletedAt" in field_names or "deleted_at" in field_names:
            indexes.append("  @@index([deletedAt])")

        # CRITICAL FIX: Index foreign key fields (fields ending in Id)
        # Foreign keys should always be indexed for JOIN performance
        indexed_fk_fields = set()
        for field_name in field_names:
            if field_name.endswith("Id") and field_name != "orgId":
                # Avoid duplicate indexes
                if field_name not in indexed_fk_fields:
                    indexes.append(f"  @@index([{field_name}])")
                    indexed_fk_fields.add(field_name)

        # Composite index for orgId + status (only if both exist)
        if "orgId" in field_names and ("status" in field_names or camel_case("status") in field_names):
            indexes.append("  @@index([orgId, status])")

        return indexes

    @staticmethod
    def _build_unique_constraints(
        model_name: str,
        properties: Dict[str, Any],
        field_names: Optional[set] = None
    ) -> List[str]:
        """
        Build Prisma unique constraints for critical fields.

        CRITICAL FIX: Adds unique constraints on:
        - email per orgId (for Account models)
        - Session tokens (unique per org or globally)
        - API keys (unique per organization)
        """
        unique_constraints: List[str] = []

        # Use field_names if provided, otherwise check properties
        if field_names is None:
            field_names = set(properties.keys()) if isinstance(properties, dict) else set()

        # Email should be unique per organization (for Account models)
        if "orgId" in field_names and ("email" in field_names or "Email" in field_names):
            # Check if this is an Account model or similar
            if "account" in model_name.lower() or "user" in model_name.lower():
                unique_constraints.append("  @@unique([orgId, email])")

        # Session tokens should be unique
        if "token" in field_names and "session" in model_name.lower():
            if "orgId" in field_names:
                unique_constraints.append("  @@unique([orgId, token])")
            else:
                unique_constraints.append("  @@unique([token])")

        # API keys should be unique per organization
        if "apiKey" in field_names or "api_key" in field_names:
            if "orgId" in field_names:
                unique_constraints.append("  @@unique([orgId, apiKey])")

        return unique_constraints

    @staticmethod
    def _build_relationships(
        context: GenerationContext,
        model_name: str,
        prisma_model_name: str,
        properties: Dict[str, Any],
        all_schemas: Dict[str, Dict[str, Any]],
        field_names: Optional[set] = None
    ) -> List[str]:
        """
        Build Prisma foreign key relationships.

        CRITICAL FIX: Detects and adds relationship comments for:
        - Fields ending in "Id" that match model names (e.g., chainId -> Chain)
        - Adds relationship documentation comments

        Note: Full @relation annotations require detecting relationship direction
        (one-to-many vs many-to-one) and will be added in a future enhancement.
        """
        relationships: List[str] = []

        # Use field_names if provided, otherwise check properties
        if field_names is None:
            field_names = set(properties.keys()) if isinstance(properties, dict) else set()

        # Look for fields that might be foreign keys
        for prop_name in properties.keys():
            if not isinstance(prop_name, str):
                continue

            # Skip if not a potential foreign key (doesn't end with Id)
            if not (prop_name.endswith("Id") or prop_name.endswith("_id")):
                continue

            # Extract potential referenced model name
            # e.g., "chainId" -> "Chain", "walletId" -> "Wallet"
            potential_model_name = prop_name.replace("_id", "Id").replace("Id", "")
            if not potential_model_name:
                continue

            # Try to find matching model (case-insensitive)
            matching_model = None
            for entity_name in all_schemas.keys():
                # Check exact match or singularized match
                if (entity_name.lower() == potential_model_name.lower() or
                    entity_name.lower() == potential_model_name.lower() + "s" or
                    potential_model_name.lower() + "s" == entity_name.lower()):
                    matching_model = entity_name
                    break

            if matching_model:
                # Found a relationship - add comment
                prisma_ref_model_name = pascal_case(matching_model)
                camel_field_name = camel_case(prop_name)
                relationships.append(f"  // Relationship: {camel_field_name} -> {prisma_ref_model_name}")

        return relationships
