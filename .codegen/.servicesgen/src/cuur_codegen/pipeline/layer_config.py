"""
Layer Configuration - Centralized configuration for all pipeline layers

This module defines which generators belong to which layers, their execution order,
and layer-specific settings. This makes it easy for junior developers to understand
and modify the pipeline structure.

To add a new layer:
1. Add a new entry to LAYER_CONFIGS
2. Register generators in Pipeline.__init__
3. Update layer_to_generators mapping if needed
"""

from typing import List, Dict, Optional
from dataclasses import dataclass


@dataclass
class LayerGeneratorConfig:
    """Configuration for a single generator within a layer"""
    name: str
    description: str
    enabled_by_default: bool = True
    requires_spec: bool = True  # Does this generator need OpenAPI spec?


@dataclass
class LayerConfig:
    """Configuration for a pipeline layer"""
    name: str
    description: str
    generators: List[LayerGeneratorConfig]
    execution_order: List[str]  # Order in which generators run
    domain_type: str  # "core" (formerly "raw") or "orchestrator" - determines domain source
    requires_openapi_spec: bool = True  # Does this layer need OpenAPI specs?


# ============================================================================
# LAYER CONFIGURATIONS
# ============================================================================
# Each layer defines:
# - Which generators it uses
# - The order they execute
# - Whether it processes core domains or orchestrator domains
# ============================================================================

LAYER_CONFIGS: Dict[str, LayerConfig] = {
    "adapters": LayerConfig(
        name="adapters",
        description="Data Access Object (DAO) adapters - Prisma repository implementations and schema generation",
        generators=[
            LayerGeneratorConfig(
                name="adapter",
                description="Generates Prisma schema files and DAO repository implementations using Prisma",
                enabled_by_default=True,
                requires_spec=True,
            ),
        ],
        execution_order=["adapter"],  # AdapterGenerator generates Prisma schema first, then repositories
        domain_type="core",
        requires_openapi_spec=True,
    ),

    "services": LayerConfig(
        name="services",
        description="Core domain services - Fastify-based microservices",
        generators=[
            LayerGeneratorConfig(
                name="service",
                description="Generates Fastify service routes, handlers, and dependencies",
                enabled_by_default=True,
                requires_spec=True,
            ),
        ],
        execution_order=["service"],
        domain_type="core",
        requires_openapi_spec=True,
    ),

    "tests": LayerConfig(
        name="tests",
        description="Test files - Unit tests for handlers and repositories",
        generators=[
            LayerGeneratorConfig(
                name="tests",
                description="Generates Vitest test files with mocks",
                enabled_by_default=True,
                requires_spec=True,
            ),
        ],
        execution_order=["tests"],
        domain_type="core",
        requires_openapi_spec=True,
    ),

    "orchestrators": LayerConfig(
        name="orchestrators",
        description="Orchestrators - Business-scenario-driven API aggregation layer",
        generators=[
            LayerGeneratorConfig(
                name="orchestrator_flow",
                description="Generates complete orchestrator domain structure from YAML OpenAPI specs (handler, routes, flows, validation, models, domain wrappers)",
                enabled_by_default=True,
                requires_spec=False,  # Reads YAML files directly from platform/orchestrators/openapi/src/yaml/
            ),
            LayerGeneratorConfig(
                name="orchestrator_aggregator",
                description="Generates aggregator classes that combine multiple service calls",
                enabled_by_default=True,
                requires_spec=False,  # Uses orchestrator domain config
            ),
        ],
        execution_order=[
            "orchestrator_flow",            # Generate complete domain structure first (from YAML)
            "orchestrator_aggregator",      # Then aggregators
        ],
        domain_type="orchestrator",
        requires_openapi_spec=False,  # Orchestrators use their own config system
    ),
}


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_layer_config(layer_name: str) -> Optional[LayerConfig]:
    """Get configuration for a specific layer"""
    return LAYER_CONFIGS.get(layer_name)


def get_all_layer_names() -> List[str]:
    """Get list of all available layer names"""
    return list(LAYER_CONFIGS.keys())


def get_core_domain_layers() -> List[str]:
    """Get list of layers that process core domains"""
    return [
        name for name, config in LAYER_CONFIGS.items()
        if config.domain_type == "core"
    ]


def get_orchestrator_layers() -> List[str]:
    """Get list of layers that process orchestrator domains"""
    return [
        name for name, config in LAYER_CONFIGS.items()
        if config.domain_type == "orchestrator"
    ]


def get_generators_for_layers(layer_names: List[str]) -> List[str]:
    """Get all generator names for specified layers"""
    generators = set()
    for layer_name in layer_names:
        config = get_layer_config(layer_name)
        if config:
            generators.update([g.name for g in config.generators])
    return list(generators)


def get_execution_order_for_layers(layer_names: List[str]) -> List[str]:
    """Get execution order for generators across specified layers"""
    # Collect all generators with their order
    generator_orders = {}
    for layer_name in layer_names:
        config = get_layer_config(layer_name)
        if config:
            for idx, gen_name in enumerate(config.execution_order):
                if gen_name not in generator_orders:
                    generator_orders[gen_name] = idx
                else:
                    # Use the earliest position if generator appears in multiple layers
                    generator_orders[gen_name] = min(generator_orders[gen_name], idx)

    # Sort by order
    return sorted(generator_orders.keys(), key=lambda x: generator_orders[x])


def is_orchestrator_layer(layer_name: str) -> bool:
    """Check if a layer is an orchestrator layer"""
    config = get_layer_config(layer_name)
    return config is not None and config.domain_type == "orchestrator"


def is_core_domain_layer(layer_name: str) -> bool:
    """Check if a layer processes core domains"""
    config = get_layer_config(layer_name)
    return config is not None and config.domain_type == "core"
