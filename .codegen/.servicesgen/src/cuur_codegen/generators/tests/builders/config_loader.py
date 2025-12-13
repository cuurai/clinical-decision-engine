"""
Test Factory Config Loader

Loads configuration overrides from YAML file.
Schema introspection is primary - config only provides overrides.
"""

import yaml
from pathlib import Path
from typing import Dict, Optional, Any
from dataclasses import dataclass


@dataclass
class IdPatternConfig:
    """ID generation pattern configuration"""
    prefix: str
    regex: str
    char_set: str
    length: int = 26


@dataclass
class FieldOverrideConfig:
    """Field generation override configuration"""
    generator: str  # JavaScript code to generate value
    required: bool = False


@dataclass
class EntityOverrideConfig:
    """Entity-specific override configuration"""
    entity_fields: Dict[str, FieldOverrideConfig] = None
    input_fields: Dict[str, FieldOverrideConfig] = None


@dataclass
class TestFactoryConfig:
    """Complete test factory configuration"""
    id_patterns: Dict[str, IdPatternConfig] = None
    entity_domains: Dict[str, Dict[str, str]] = None  # entity -> {service -> domain}
    field_overrides: Dict[str, EntityOverrideConfig] = None
    input_schema_overrides: Dict[str, str] = None  # entity -> schema_name
    defaults: Dict[str, Any] = None

    def __post_init__(self):
        if self.id_patterns is None:
            self.id_patterns = {}
        if self.entity_domains is None:
            self.entity_domains = {}
        if self.field_overrides is None:
            self.field_overrides = {}
        if self.input_schema_overrides is None:
            self.input_schema_overrides = {}
        if self.defaults is None:
            self.defaults = {}


class TestFactoryConfigLoader:
    """Loads test factory configuration from YAML file"""

    def __init__(self, config_path: Optional[Path] = None):
        if config_path is None:
            # Default to .servicesgen/config/test-factory-config.yaml
            config_path = Path(__file__).parent.parent.parent.parent / "config" / "test-factory-config.yaml"
        self.config_path = config_path
        self._config: Optional[TestFactoryConfig] = None

    def load(self) -> TestFactoryConfig:
        """Load configuration from YAML file"""
        if not self.config_path.exists():
            # Return empty config if file doesn't exist
            return TestFactoryConfig()

        with open(self.config_path, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}

        config = TestFactoryConfig()

        # Load ID patterns
        if "id_patterns" in data:
            for entity_name, pattern_data in data["id_patterns"].items():
                config.id_patterns[entity_name] = IdPatternConfig(
                    prefix=pattern_data.get("prefix", ""),
                    regex=pattern_data.get("regex", ""),
                    char_set=pattern_data.get("char_set", "0123456789ABCDEFGHJKMNPQRSTVWXYZ"),
                    length=pattern_data.get("length", 26)
                )

        # Load entity domain mappings
        if "entity_domains" in data:
            config.entity_domains = data["entity_domains"]

        # Load field overrides
        if "field_overrides" in data:
            for entity_name, override_data in data["field_overrides"].items():
                entity_override = EntityOverrideConfig()

                if "entity_fields" in override_data:
                    entity_override.entity_fields = {}
                    for field_name, field_data in override_data["entity_fields"].items():
                        entity_override.entity_fields[field_name] = FieldOverrideConfig(
                            generator=field_data.get("generator", ""),
                            required=field_data.get("required", False)
                        )

                if "input_fields" in override_data:
                    entity_override.input_fields = {}
                    for field_name, field_data in override_data["input_fields"].items():
                        entity_override.input_fields[field_name] = FieldOverrideConfig(
                            generator=field_data.get("generator", ""),
                            required=field_data.get("required", False)
                        )

                config.field_overrides[entity_name] = entity_override

        # Load input schema overrides
        if "input_schema_overrides" in data:
            # Handle both simple string format and nested dict format
            overrides = {}
            for entity_name, override_value in data["input_schema_overrides"].items():
                if isinstance(override_value, dict):
                    # Nested format: {entity: {schema_name: "..."}}
                    overrides[entity_name] = override_value.get("schema_name", override_value)
                else:
                    # Simple format: {entity: "schema_name"}
                    overrides[entity_name] = override_value
            config.input_schema_overrides = overrides

        # Load defaults
        if "defaults" in data:
            config.defaults = data["defaults"]

        return config

    def get_id_pattern(self, entity_name: str) -> Optional[IdPatternConfig]:
        """Get ID pattern configuration for an entity"""
        if not self._config:
            self._config = self.load()
        return self._config.id_patterns.get(entity_name.lower())

    def get_entity_domain(self, entity_name: str, service: Optional[str] = None) -> Optional[str]:
        """Get domain mapping for an entity, optionally filtered by service"""
        if not self._config:
            self._config = self.load()

        entity_domains = self._config.entity_domains.get(entity_name.lower(), {})

        if service and service.lower() in entity_domains:
            return entity_domains[service.lower()]

        return entity_domains.get("default")

    def get_field_override(self, entity_name: str, field_name: str, is_input: bool = False) -> Optional[FieldOverrideConfig]:
        """Get field generation override for an entity field"""
        if not self._config:
            self._config = self.load()

        entity_override = self._config.field_overrides.get(entity_name.lower())
        if not entity_override:
            return None

        if is_input:
            return entity_override.input_fields.get(field_name) if entity_override.input_fields else None
        else:
            return entity_override.entity_fields.get(field_name) if entity_override.entity_fields else None

    def get_input_schema_override(self, entity_name: str) -> Optional[str]:
        """Get input schema name override for an entity"""
        if not self._config:
            self._config = self.load()
        return self._config.input_schema_overrides.get(entity_name.lower())
