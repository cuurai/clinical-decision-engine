"""
Orchestrator Domain Configuration Reader

Reads and parses orchestrator domain configuration files (.orchestrator-domains.yaml or .bff-domains.yaml)
to understand business-scenario-driven orchestrator domains and their mappings to core domains.

Supports both YAML (preferred, human-readable) and JSON formats.

"""

import json
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Set, Any
from dataclasses import dataclass


@dataclass
class CoreDomainConfig:
    """Configuration for a core domain used by an orchestrator domain"""
    name: str
    operations: List[str]
    required: bool


@dataclass
class AggregatorCall:
    """A single core domain call within an aggregator"""
    domain: str
    operation: str
    params: Optional[Dict[str, any]] = None


@dataclass
class AggregatorConfig:
    """Configuration for an orchestrator domain aggregator"""
    name: str
    description: str
    core_domain_calls: List[AggregatorCall]


@dataclass
class BusinessTypeConfig:
    """Configuration for a business-specific type"""
    name: str
    description: str
    extends: Optional[str] = None
    fields: Optional[Dict[str, str]] = None


@dataclass
class OrchestratorDomainConfig:
    """Configuration for an orchestrator domain"""
    name: str
    display_name: str
    description: str
    core_domains: List[CoreDomainConfig]
    aggregators: List[AggregatorConfig]
    business_types: Optional[Dict[str, any]] = None

@dataclass
class CoreDomainRegistry:
    """Registry of core domain service URLs"""
    base_url: str
    ports: Dict[str, int]


@dataclass
class OrchestratorDomainsConfig:
    """Complete orchestrator domains configuration"""
    version: str
    orchestrator_domains: List[OrchestratorDomainConfig]
    core_domain_registry: CoreDomainRegistry


class OrchestratorDomainConfigReader:
    """Reads and parses orchestrator domain configuration from YAML or JSON file

    Prefers YAML format (more readable), falls back to JSON if YAML not found.
    """

    def __init__(self, config_path: Path):
        self.config_path = config_path
        self._config: Optional[OrchestratorDomainsConfig] = None

    def load(self) -> OrchestratorDomainsConfig:
        """Load configuration from YAML or JSON file"""
        if not self.config_path.exists():
            # Try YAML if JSON was requested
            if self.config_path.suffix == '.json':
                yaml_path = self.config_path.with_suffix('.yaml')
                if yaml_path.exists():
                    self.config_path = yaml_path
                else:
                    raise FileNotFoundError(
                        f"Orchestrator domains configuration not found: {self.config_path} or {yaml_path}"
                    )
            else:
                raise FileNotFoundError(
                    f"Orchestrator domains configuration not found: {self.config_path}"
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
        # Support both "bffDomains" (legacy) and "orchestratorDomains" keys
        domain_list = data.get("orchestratorDomains", data.get("bffDomains", []))
        orchestrator_domains = []
        for domain_data in domain_list:
                # Parse coreDomains - support both simple list and object format
                core_domains = []
                core_domains_data = domain_data.get("coreDomains", [])
                for core_domain_entry in core_domains_data:
                    if isinstance(core_domain_entry, str):
                        # Simple format: just domain name string
                        core_domains.append(CoreDomainConfig(
                            name=core_domain_entry,
                            operations=[],
                            required=True
                        ))
                    else:
                        # Object format: full configuration
                        core_domains.append(CoreDomainConfig(
                            name=core_domain_entry["name"],
                            operations=core_domain_entry.get("operations", []),
                            required=core_domain_entry.get("required", True)
                        ))

                # Parse aggregators - optional, defaults to empty
                aggregators = []
                for agg_data in domain_data.get("aggregators", []):
                    core_domain_calls = []
                    domain_calls_data = agg_data.get("coreDomainCalls", [])
                    for call_data in domain_calls_data:
                        core_domain_calls.append(AggregatorCall(
                            domain=call_data["domain"],
                            operation=call_data["operation"],
                            params=call_data.get("params")
                        ))
                    aggregators.append(AggregatorConfig(
                        name=agg_data["name"],
                        description=agg_data.get("description", ""),
                        core_domain_calls=core_domain_calls
                    ))

                orchestrator_domains.append(OrchestratorDomainConfig(
                    name=domain_data["name"],
                    display_name=domain_data.get("displayName", domain_data.get("display_name", domain_data["name"])),
                    description=domain_data.get("description", ""),
                    core_domains=core_domains,
                    aggregators=aggregators,
                    business_types=domain_data.get("businessTypes")
                ))

        # Parse coreDomainRegistry - optional, defaults provided
        registry_data = data.get("coreDomainRegistry", {})
        registry = CoreDomainRegistry(
            base_url=registry_data.get("baseUrl") or registry_data.get("base_url", "http://localhost"),
            ports=registry_data.get("ports", {})
        )

        self._config = OrchestratorDomainsConfig(
            version=data.get("version", "1.0.0"),
            orchestrator_domains=orchestrator_domains,
            core_domain_registry=registry
        )

        return self._config

    def get_config(self) -> OrchestratorDomainsConfig:
        """Get loaded configuration (loads if not already loaded)"""
        if self._config is None:
            return self.load()
        return self._config

    def get_orchestrator_domain(self, domain_name: str) -> Optional[OrchestratorDomainConfig]:
        """Get orchestrator domain configuration by name"""
        config = self.get_config()
        for domain in config.orchestrator_domains:
            if domain.name == domain_name:
                return domain
        return None

    def get_core_domains_for_orchestrator_domain(self, orchestrator_domain_name: str) -> List[str]:
        """Get list of core domain names used by an orchestrator domain"""
        orchestrator_domain = self.get_orchestrator_domain(orchestrator_domain_name)
        if not orchestrator_domain:
            return []
        return [cd.name for cd in orchestrator_domain.core_domains]

    def get_all_core_domains(self) -> Set[str]:
        """Get set of all core domain names used across all orchestrator domains"""
        config = self.get_config()
        core_domains = set()
        for orchestrator_domain in config.orchestrator_domains:
            for core_domain in orchestrator_domain.core_domains:
                core_domains.add(core_domain.name)
        return core_domains

    def get_core_domain_url(self, core_domain_name: str) -> str:
        """Get URL for a core domain service"""
        config = self.get_config()
        port = config.core_domain_registry.ports.get(core_domain_name)
        if not port:
            raise ValueError(f"Port not found for core domain: {core_domain_name}")
        return f"{config.core_domain_registry.base_url}:{port}"



def load_orchestrator_domains_config(project_root: Path) -> OrchestratorDomainsConfig:
    """Convenience function to load orchestrator domains configuration

    Prefers YAML format (more readable), falls back to JSON if YAML not found.

    Handles both cases:
    - project_root is actual project root: project_root/platform/orchestrators/...
    - project_root is platform directory: project_root/orchestrators/...
    Note: Still supports legacy .bff-domains.yaml file name for config file.
    """
    project_root = project_root.resolve()

    # Try paths: first check generator config folder, then legacy platform locations
    # Get servicesgen directory (parent of src/cuur_codegen/generators/orchestrators)
    # Path: config_reader.py -> orchestrators -> generators -> cuur_codegen -> src -> .servicesgen
    servicesgen_dir = Path(__file__).parent.parent.parent.parent.parent

    paths_to_try = [
        # Generator config folder (preferred)
        servicesgen_dir / "config" / ".orchestrator-domains.yaml",
        servicesgen_dir / "config" / ".orchestrator-domains.json",
        # Legacy .bff-domains files in generator config folder
        servicesgen_dir / "config" / ".bff-domains.yaml",
        servicesgen_dir / "config" / ".bff-domains.json",
        # Legacy platform locations (for backward compatibility)
        project_root / "platform" / "orchestrators" / "openapi" / "src" / "config" / ".orchestrator-domains.yaml",
        project_root / "platform" / "orchestrators" / "openapi" / "src" / "config" / ".orchestrator-domains.json",
        project_root / "orchestrators" / "openapi" / "src" / "config" / ".orchestrator-domains.yaml",
        project_root / "orchestrators" / "openapi" / "src" / "config" / ".orchestrator-domains.json",
        # Legacy .bff-domains files in orchestrators directory (still supported)
        project_root / "platform" / "orchestrators" / "openapi" / "src" / "config" / ".bff-domains.yaml",
        project_root / "platform" / "orchestrators" / "openapi" / "src" / "config" / ".bff-domains.json",
        project_root / "orchestrators" / "openapi" / "src" / "config" / ".bff-domains.yaml",
        project_root / "orchestrators" / "openapi" / "src" / "config" / ".bff-domains.json",
        # Legacy bff paths (still supported)
        project_root / "platform" / "bff" / "openapi" / "src" / "config" / ".bff-domains.yaml",
        project_root / "platform" / "bff" / "openapi" / "src" / "config" / ".bff-domains.json",
        project_root / "bff" / "openapi" / "src" / "config" / ".bff-domains.yaml",
        project_root / "bff" / "openapi" / "src" / "config" / ".bff-domains.json",
    ]

    config_path = None
    for path in paths_to_try:
        if path.exists():
            config_path = path
            break

    if not config_path:
        raise FileNotFoundError(
            f"Orchestrator domains configuration not found. Tried:\n"
            + "\n".join(f"  - {p}" for p in paths_to_try)
        )

    reader = OrchestratorDomainConfigReader(config_path)
    return reader.load()
