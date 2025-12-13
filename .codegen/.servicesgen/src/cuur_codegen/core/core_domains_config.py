"""
Core Domains Configuration Reader

Reads and parses core domain configuration files (.core-domains.yaml or .core-domains.json)
to define technical service domains and their configurations.

Supports both YAML (preferred, human-readable) and JSON formats.
"""

import json
import yaml
from pathlib import Path
from typing import List, Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class CoreDomainConfig:
    """Configuration for a core domain"""
    name: str
    enabled: bool = True
    spec_path: Optional[str] = None
    bundled_path: Optional[str] = None
    description: Optional[str] = None


@dataclass
class CoreDomainsConfig:
    """Complete core domains configuration"""
    version: str
    domains: List[CoreDomainConfig]


class CoreDomainsConfigReader:
    """Reads and parses core domain configuration from YAML or JSON file

    Prefers YAML format (more readable), falls back to JSON if YAML not found.
    """

    def __init__(self, config_path: Path):
        self.config_path = config_path
        self._config: Optional[CoreDomainsConfig] = None

    def load(self) -> CoreDomainsConfig:
        """Load configuration from YAML or JSON file"""
        if not self.config_path.exists():
            # Try YAML if JSON was requested
            if self.config_path.suffix == '.json':
                yaml_path = self.config_path.with_suffix('.yaml')
                if yaml_path.exists():
                    self.config_path = yaml_path
                else:
                    raise FileNotFoundError(
                        f"Core domains configuration not found: {self.config_path} or {yaml_path}"
                    )
            else:
                raise FileNotFoundError(
                    f"Core domains configuration not found: {self.config_path}"
                )

        # Determine format and load accordingly
        if self.config_path.suffix in ['.yaml', '.yml']:
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)
        elif self.config_path.suffix == '.json':
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        else:
            raise ValueError(
                f"Unsupported config file format: {self.config_path.suffix}. "
                f"Use .yaml or .json"
            )

        # Parse configuration
        # Support both simple list format and object format
        domains = []
        for domain_entry in data.get("domains", []):
            if isinstance(domain_entry, str):
                # Simple format: just domain name
                domains.append(CoreDomainConfig(
                    name=domain_entry,
                    enabled=True,
                    spec_path=None,
                    bundled_path=None,
                    description=None
                ))
            else:
                # Object format: full configuration
                domains.append(CoreDomainConfig(
                    name=domain_entry["name"],
                    enabled=domain_entry.get("enabled", True),
                    spec_path=domain_entry.get("specPath") or domain_entry.get("spec_path"),
                    bundled_path=domain_entry.get("bundledPath") or domain_entry.get("bundled_path"),
                    description=domain_entry.get("description")
                ))

        self._config = CoreDomainsConfig(
            version=data.get("version", "1.0.0"),
            domains=domains
        )

        return self._config

    def get_config(self) -> CoreDomainsConfig:
        """Get loaded configuration (loads if not already loaded)"""
        if self._config is None:
            self.load()
        return self._config


def load_core_domains_config(project_root: Path) -> Optional[CoreDomainsConfig]:
    """Convenience function to load core domains configuration

    Prefers YAML format (more readable), falls back to JSON if YAML not found.

    Args:
        project_root: Project root directory

    Returns:
        CoreDomainsConfig if file exists, None otherwise
    """
    project_root = project_root.resolve()

    # Try paths: first check generator config folder, then legacy platform locations
    # Get servicesgen directory (parent of src/cuur_codegen/core)
    # Path: core_domains_config.py -> core -> cuur_codegen -> src -> .servicesgen
    servicesgen_dir = Path(__file__).parent.parent.parent.parent

    paths_to_try = [
        # Generator config folder (preferred)
        servicesgen_dir / "config" / ".core-domains.yaml",
        servicesgen_dir / "config" / ".core-domains.json",
        # Legacy platform locations
        project_root / "platform" / "openapi" / "src" / "config" / ".core-domains.yaml",
        project_root / "platform" / "openapi" / "src" / "config" / ".core-domains.json",
        project_root / "openapi" / "src" / "config" / ".core-domains.yaml",
        project_root / "openapi" / "src" / "config" / ".core-domains.json",
    ]

    config_path = None
    for path in paths_to_try:
        if path.exists():
            config_path = path
            break

    if config_path is None:
        return None

    reader = CoreDomainsConfigReader(config_path)
    return reader.load()
