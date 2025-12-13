"""
Factory Mappings Configuration

Centralized configuration for entity factory generation.
Separates hardcoded entity-specific logic from the main factory builder.
"""

from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field


@dataclass
class IdGenerationConfig:
    """Configuration for ID generation"""
    prefix: str  # e.g., "acc_", "CO_", "ED_"
    length: int = 26
    char_set: str = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"  # Excludes I, O, L, U
    comment: str = ""


@dataclass
class FieldGenerationRule:
    """Rule for generating a field value"""
    field_name: str
    generation_code: str  # JavaScript code to generate the value
    condition: Optional[Callable[[str, str], bool]] = None  # Optional condition function


@dataclass
class EntityFactoryConfig:
    """Configuration for entity factory generation"""
    entity_name: str
    domain_name: str
    id_config: IdGenerationConfig
    id_generation_code: str = ""  # JavaScript code for ID generation setup
    entity_fields: List[FieldGenerationRule] = field(default_factory=list)
    input_fields: List[FieldGenerationRule] = field(default_factory=list)
    input_schema_name: Optional[str] = None  # Override default Create{Entity}Request schema name


# ID Generation Configurations
ID_CONFIGS = {
    "account": IdGenerationConfig(
        prefix="acc_",
        comment="Generate valid account ID matching regex: /^acc_[0-9A-HJKMNP-TV-Z]{26}$/"
    ),
    "kyccase": IdGenerationConfig(
        prefix="CO_",
        comment="Generate valid KYC case ID: CO_ + 26-char ULID"
    ),
    "document": IdGenerationConfig(
        prefix="ED_",
        comment="Generate valid document ID: ED_ + 26-char ULID"
    ),
    "documentsignature": IdGenerationConfig(
        prefix="ED_",
        comment="Generate valid document signature ID: ED_ + 26-char ULID"
    ),
    "org": IdGenerationConfig(
        prefix="ID_",
        comment="Generate valid org ID matching regex: /^ID_[0-9A-HJKMNP-TV-Z]{26}$/"
    ),
    "default": IdGenerationConfig(
        prefix="",
        comment="Default: use UUID for ID"
    ),
}

# Entity Factory Configurations
ENTITY_CONFIGS: Dict[str, EntityFactoryConfig] = {
    # Account entity (identity or auth domain)
    ("account", "identity"): EntityFactoryConfig(
        entity_name="account",
        domain_name="identity",
        id_config=ID_CONFIGS["account"],
        id_generation_code="""  // Generate valid account ID matching regex: /^acc_[0-9A-HJKMNP-TV-Z]{26}$/
  const accountIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validIdChars.split(""))
  ).join("");""",
        entity_fields=[
            FieldGenerationRule("id", "`acc_${accountIdSuffix}`"),
            FieldGenerationRule("email", "faker.internet.email()"),
            FieldGenerationRule("status", 'faker.helpers.arrayElement(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "CLOSED"])'),
            FieldGenerationRule("createdAt", "new Date().toISOString()"),
            FieldGenerationRule("type", 'faker.helpers.arrayElement(["INDIVIDUAL", "CORPORATE", "INSTITUTIONAL"])', 
                              condition=lambda e, d: d == "identity"),  # Only for identity domain
        ],
        input_fields=[
            FieldGenerationRule("type", 'faker.helpers.arrayElement(["INDIVIDUAL", "CORPORATE", "INSTITUTIONAL"])'),
            FieldGenerationRule("email", "faker.internet.email()"),
        ],
    ),
    ("account", "auth"): EntityFactoryConfig(
        entity_name="account",
        domain_name="auth",
        id_config=ID_CONFIGS["account"],
        id_generation_code="""  // Generate valid account ID matching regex: /^acc_[0-9A-HJKMNP-TV-Z]{26}$/
  const accountIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validIdChars.split(""))
  ).join("");""",
        entity_fields=[
            FieldGenerationRule("id", "`acc_${accountIdSuffix}`"),
            FieldGenerationRule("email", "faker.internet.email()"),
            FieldGenerationRule("status", 'faker.helpers.arrayElement(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION", "CLOSED"])'),
            FieldGenerationRule("createdAt", "new Date().toISOString()"),
        ],
        input_fields=[
            FieldGenerationRule("type", 'faker.helpers.arrayElement(["INDIVIDUAL", "CORPORATE", "INSTITUTIONAL"])'),
            FieldGenerationRule("email", "faker.internet.email()"),
        ],
    ),
    # KycCase entity (compliance domain)
    ("kyccase", "compliance"): EntityFactoryConfig(
        entity_name="kyccase",
        domain_name="compliance",
        id_config=ID_CONFIGS["kyccase"],
        id_generation_code="""  // Generate valid orgId matching regex pattern: /^ID_[0-9A-HJKMNP-TV-Z]{26}$/
  // Exclude I, O, L, U to match the pattern
  const validOrgIdChars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const orgIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validOrgIdChars.split(""))
  ).join("");
  // Generate valid account ID: acc_ + 26-char ULID
  const accountIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validIdChars.split(""))
  ).join("");
  // Generate valid KYC case ID: CO_ + 26-char ULID matching /^CO_[0-9A-HJKMNPQRSTVWXYZ]{26}$/
  const kycCaseIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validIdChars.split(""))
  ).join("");""",
        entity_fields=[
            FieldGenerationRule("id", "`CO_${kycCaseIdSuffix}`"),
            FieldGenerationRule("orgId", "`ID_${orgIdSuffix}`"),
            FieldGenerationRule("accountId", "`acc_${accountIdSuffix}`"),
            FieldGenerationRule("type", 'faker.helpers.arrayElement(["PERSON", "ENTITY"])'),
            FieldGenerationRule("status", 'faker.helpers.arrayElement(["PENDING", "APPROVED", "REJECTED"])'),
            FieldGenerationRule("createdAt", "new Date().toISOString()"),
            FieldGenerationRule("updatedAt", "new Date().toISOString()"),
        ],
        input_fields=[
            FieldGenerationRule("accountId", "`acc_${Array.from({ length: 26 }, () => faker.helpers.arrayElement(validIdChars.split(\"\"))).join(\"\")}`"),
            FieldGenerationRule("type", 'faker.helpers.arrayElement(["PERSON", "ENTITY"])'),
        ],
    ),
    # Document entity (e-documents domain)
    ("document", "e-documents"): EntityFactoryConfig(
        entity_name="document",
        domain_name="e-documents",
        id_config=ID_CONFIGS["document"],
        id_generation_code="""  // Generate valid orgId matching regex pattern: /^ID_[0-9A-HJKMNP-TV-Z]{26}$/
  // Exclude I, O, L, U to match the pattern
  const validOrgIdChars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const orgIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validOrgIdChars.split(""))
  ).join("");
  // Generate valid document ID: ED_ + 26-char ULID
  const documentIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validIdChars.split(""))
  ).join("");""",
        entity_fields=[
            FieldGenerationRule("id", "`ED_${documentIdSuffix}`"),
            FieldGenerationRule("orgId", "`ID_${orgIdSuffix}`"),
            FieldGenerationRule("name", "faker.system.fileName()"),
            FieldGenerationRule("type", 'faker.helpers.arrayElement(["PDF", "DOCX", "IMAGE", "XLSX", "JSON"])'),
            FieldGenerationRule("status", 'faker.helpers.arrayElement(["DRAFT", "REVIEW", "PUBLISHED", "ARCHIVED"])'),
            FieldGenerationRule("mimeType", "faker.system.mimeType()"),
            FieldGenerationRule("bytes", "faker.number.int({ min: 1000, max: 10000000 })"),
            FieldGenerationRule("createdBy", "`acc_${Array.from({ length: 26 }, () => faker.helpers.arrayElement(validIdChars.split(\"\"))).join(\"\")}`"),
            FieldGenerationRule("createdAt", "new Date().toISOString()"),
            FieldGenerationRule("updatedAt", "new Date().toISOString()"),
        ],
        input_fields=[
            FieldGenerationRule("file", 'new File(["test content"], "test.pdf", { type: "application/pdf" })'),
            FieldGenerationRule("name", "faker.system.fileName()"),
        ],
    ),
    # DocumentSignature entity (e-documents domain)
    ("documentsignature", "e-documents"): EntityFactoryConfig(
        entity_name="documentsignature",
        domain_name="e-documents",
        id_config=ID_CONFIGS["documentsignature"],
        id_generation_code="""  // Generate valid document ID: ED_ + 26-char ULID
  const documentIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validIdChars.split(""))
  ).join("");
  // Generate valid signature ID: ED_ + 26-char ULID
  const signatureIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validIdChars.split(""))
  ).join("");""",
        entity_fields=[
            FieldGenerationRule("id", "`ED_${signatureIdSuffix}`"),
            FieldGenerationRule("documentId", "`ED_${documentIdSuffix}`"),
            FieldGenerationRule("method", 'faker.helpers.arrayElement(["DOCUSIGN", "UAE_PASS", "MANUAL", "QUUB_NATIVE"])'),
            FieldGenerationRule("status", 'faker.helpers.arrayElement(["PENDING", "COMPLETED", "REJECTED", "EXPIRED"])'),
            FieldGenerationRule("signers", """[{
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(["SIGNER", "CC", "REVIEWER"]),
      status: faker.helpers.arrayElement(["PENDING", "SIGNED", "DECLINED"]),
    }]"""),
            FieldGenerationRule("requestedAt", "new Date().toISOString()"),
        ],
        input_fields=[
            FieldGenerationRule("signers", """[{
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(["SIGNER", "CC", "REVIEWER"]),
    }]"""),
            FieldGenerationRule("method", 'faker.helpers.arrayElement(["DOCUSIGN", "UAE_PASS", "MANUAL", "QUUB_NATIVE"])'),
        ],
        input_schema_name="CreateSignatureRequestRequest",  # Special case: different schema name
    ),
    # Org entity (identity domain)
    ("org", "identity"): EntityFactoryConfig(
        entity_name="org",
        domain_name="identity",
        id_config=ID_CONFIGS["org"],
        id_generation_code="""  // Generate valid org ID matching regex pattern: /^ID_[0-9A-HJKMNP-TV-Z]{26}$/
  // Exclude I, O, L, U to match the pattern
  const validOrgIdChars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const orgIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validOrgIdChars.split(""))
  ).join("");""",
        entity_fields=[
            FieldGenerationRule("id", "`ID_${orgIdSuffix}`"),
            FieldGenerationRule("legalName", "faker.company.name()"),
            FieldGenerationRule("status", 'faker.helpers.arrayElement(["ACTIVE", "SUSPENDED", "CLOSED"])'),
            FieldGenerationRule("createdAt", "new Date().toISOString()"),
            FieldGenerationRule("updatedAt", "new Date().toISOString()"),
        ],
        input_fields=[
            FieldGenerationRule("legalName", "faker.company.name()"),
            FieldGenerationRule("country", "faker.location.countryCode()"),
        ],
    ),
}

# Default configuration for entities without specific config
DEFAULT_ENTITY_CONFIG = EntityFactoryConfig(
    entity_name="default",
    domain_name="default",
    id_config=ID_CONFIGS["default"],
    id_generation_code="""  // Generate valid orgId matching regex pattern: /^ID_[0-9A-HJKMNP-TV-Z]{26}$/
  // Exclude I, O, L, U to match the pattern
  const validOrgIdChars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
  const orgIdSuffix = Array.from({ length: 26 }, () =>
    faker.helpers.arrayElement(validOrgIdChars.split(""))
  ).join("");""",
    entity_fields=[
        FieldGenerationRule("id", "faker.string.uuid()"),
        FieldGenerationRule("orgId", "`ID_${orgIdSuffix}`"),
        FieldGenerationRule("createdAt", "new Date().toISOString()"),
        FieldGenerationRule("updatedAt", "new Date().toISOString()"),
    ],
    input_fields=[],
)


def get_entity_config(entity_name: str, domain_name: str) -> EntityFactoryConfig:
    """
    Get entity factory configuration for a given entity and domain.
    
    Args:
        entity_name: Entity name (e.g., "account", "kyccase")
        domain_name: Domain name (e.g., "identity", "compliance")
        
    Returns:
        EntityFactoryConfig for the entity, or default config if not found
    """
    key = (entity_name.lower(), domain_name.lower())
    return ENTITY_CONFIGS.get(key, DEFAULT_ENTITY_CONFIG)


def get_input_schema_name(entity_name: str, domain_name: str) -> Optional[str]:
    """
    Get input schema name for a given entity and domain.
    
    Args:
        entity_name: Entity name (e.g., "documentsignature")
        domain_name: Domain name (e.g., "e-documents")
        
    Returns:
        Input schema name override, or None to use default Create{Entity}Request
    """
    config = get_entity_config(entity_name, domain_name)
    return config.input_schema_name

