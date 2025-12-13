"""
Repository Generator Configuration - Configurable settings for repository generation
"""

from typing import Dict, List, Set, Optional
from dataclasses import dataclass, field


@dataclass
class RepositoryConfig:
    """Configuration for repository generation"""

    # Status codes to check for successful responses
    success_status_codes: List[str] = field(default_factory=lambda: ["200", "201", "202"])

    # Status codes for create operations
    create_status_codes: List[str] = field(default_factory=lambda: ["201", "202"])

    # Status codes for update operations
    update_status_codes: List[str] = field(default_factory=lambda: ["200", "201", "202"])

    # Verbs that indicate create operations
    create_verbs: Set[str] = field(default_factory=lambda: {"create"})

    # Verbs that indicate update operations
    update_verbs: Set[str] = field(default_factory=lambda: {"update", "patch"})

    # Verbs that indicate delete operations
    delete_verbs: Set[str] = field(default_factory=lambda: {"delete"})

    # Verbs that indicate list operations
    list_verbs: Set[str] = field(default_factory=lambda: {"list"})

    # Verbs that indicate get operations
    get_verbs: Set[str] = field(default_factory=lambda: {"get"})

    # Type patterns that don't need imports
    builtin_type_patterns: Set[str] = field(default_factory=lambda: {
        "Record<string, never>",
        "PaginationParams"
    })

    # Default list params type when no query params found
    default_list_params_type: str = "Record<string, never>"

    # Default update request type pattern
    default_update_request_pattern: str = "Update{entity_name}Request"

    # Repository type determination rules
    # Format: (has_create, has_update, has_delete) -> repository_type
    repository_type_rules: Dict[tuple, str] = field(default_factory=lambda: {
        (True, True, True): "CrudRepository",
        (True, True, False): "CreateUpdateReadRepository",
        (True, False, True): "CreateDeleteReadRepository",
        (False, True, True): "UpdateDeleteReadRepository",
        (True, False, False): "CreateReadRepository",
        (False, True, False): "UpdateReadRepository",
        (False, False, True): "DeleteReadRepository",
        (False, False, False): "ReadRepository",
    })

    # Response schema suffixes to filter out
    response_schema_suffixes_to_filter: Set[str] = field(default_factory=lambda: {
        "Request",
        "Response",
        "Envelope"
    })

    # Content types to check for request bodies
    request_body_content_types: List[str] = field(default_factory=lambda: ["application/json"])

    def get_repository_type(self, has_create: bool, has_update: bool, has_delete: bool) -> str:
        """Get repository type based on operation flags"""
        key = (has_create, has_update, has_delete)
        return self.repository_type_rules.get(key, "ReadRepository")

    def is_builtin_type(self, type_name: str) -> bool:
        """Check if a type is a builtin type that doesn't need import"""
        return any(pattern in type_name for pattern in self.builtin_type_patterns)

    def should_filter_schema_name(self, schema_name: str) -> bool:
        """Check if a schema name should be filtered out"""
        return any(suffix in schema_name for suffix in self.response_schema_suffixes_to_filter)


# Default configuration instance
DEFAULT_CONFIG = RepositoryConfig()


# Domain-specific configurations can be added here
DOMAIN_CONFIGS: Dict[str, RepositoryConfig] = {
    # Example: "channel": RepositoryConfig(
    #     create_status_codes=["201", "202", "204"],
    #     ...
    # )
}
