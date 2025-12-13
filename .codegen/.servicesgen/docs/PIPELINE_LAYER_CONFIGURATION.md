# Pipeline Layer Configuration Guide

This guide explains how to configure and maintain pipeline layers for junior developers.

## Overview

The pipeline uses a **modular layer configuration system** that makes it easy to:
- Understand which generators belong to which layers
- Add new layers or generators
- Modify execution order
- Maintain separation between raw domains and orchestrator domains

## File Structure

```
.servicesgen/src/cuur_codegen/pipeline/
├── layer_config.py    # Layer configurations (EDIT THIS)
├── pipeline.py        # Main pipeline orchestrator
└── stages.py          # Domain processing stages
```

## Layer Configuration (`layer_config.py`)

All layer configurations are defined in `layer_config.py`. Each layer has:

- **name**: Layer identifier (e.g., "services", "adapters", "orchestrators")
- **description**: What this layer generates
- **generators**: List of generators used by this layer
- **execution_order**: Order in which generators run
- **domain_type**: "core" or "orchestrator" - determines domain source

### Example: Adding a New Layer

```python
LAYER_CONFIGS: Dict[str, LayerConfig] = {
    # ... existing layers ...

    "my-new-layer": LayerConfig(
        name="my-new-layer",
        description="My new layer that does X",
        generators=[
            GeneratorConfig(
                name="my_generator",
                description="Generates X files",
                enabled_by_default=True,
                requires_spec=True,
            ),
        ],
        execution_order=["my_generator"],
        domain_type="core",  # or "orchestrator"
        requires_openapi_spec=True,
    ),
}
```

### Example: Adding a Generator to an Existing Layer

```python
"services": LayerConfig(
    name="services",
    description="Core domain services",
    generators=[
        GeneratorConfig(name="service", ...),
        GeneratorConfig(name="my_new_generator", ...),  # Add here
    ],
    execution_order=["service", "my_new_generator"],  # Update order
    ...
),
```

## Available Layers

### Core Domain Layers

These layers process **core domain services** (auth, blockchain, compliance, etc.):

1. **adapters** - DAO repository implementations (includes Prisma schema generation)
2. **services** - Fastify microservices
3. **tests** - Test factories and flow tests

### Orchestrator Layer

This layer processes **orchestrator domains** (business-scenario-driven aggregations):

1. **orchestrators** - Orchestrator layer
   - Generates service clients, aggregators, REST routes, GraphQL, WebSocket

## Domain Resolution

The pipeline automatically:
- **Filters orchestrator domains** when generating core domain layers
- **Filters core domains** when generating orchestrator layers
- **Loads domains** from appropriate config files

### How It Works

1. **Core Domain Layers**: Load domains from `.servicesgen/config/.core-domains.yaml`
2. **Orchestrator Layers**: Load domains from `.servicesgen/config/.orchestrator-domains.yaml`
3. **Filtering**: Automatically excludes wrong domain type
4. **Tests Layer**: Processes both core domains (for entity factories) and orchestrator domains (for flow tests)

## Generator Registration

Generators must be registered in `Pipeline.__init__()`:

```python
# In pipeline.py
self.registry.register("my_generator", MyGeneratorClass)
```

## Execution Order

Generators run in the order specified in `execution_order`. This is important when:
- Generator A depends on output from Generator B
- Files need to be generated in a specific sequence

## Common Tasks

### Task 1: Add a New Generator to Services Layer

1. **Create generator class** in `generators/services/`
2. **Register it** in `Pipeline.__init__()`:
   ```python
   self.registry.register("my_generator", MyGenerator)
   ```
3. **Add to layer config** in `layer_config.py`:
   ```python
   "services": LayerConfig(
       generators=[
           GeneratorConfig(name="service", ...),
           GeneratorConfig(name="my_generator", ...),  # Add here
       ],
       execution_order=["service", "my_generator"],  # Update order
   )
   ```

### Task 2: Create a New Layer

1. **Define layer config** in `layer_config.py`:
   ```python
   "my-layer": LayerConfig(...)
   ```
2. **Register generators** in `Pipeline.__init__()`
3. **Update CLI** to accept `--layer my-layer`

### Task 3: Change Generator Execution Order

Simply update `execution_order` in `layer_config.py`:

```python
execution_order=["generator_a", "generator_b", "generator_c"]
```

## Best Practices

1. ✅ **Always edit `layer_config.py`** - Don't hardcode layer mappings
2. ✅ **Use descriptive names** - Make layer and generator names clear
3. ✅ **Document dependencies** - Note if generators depend on each other
4. ✅ **Test incrementally** - Test one layer at a time
5. ✅ **Keep it simple** - One generator per responsibility

## Troubleshooting

### Issue: Generator not running

**Check:**
1. Is generator registered in `Pipeline.__init__()`?
2. Is generator listed in layer config?
3. Is layer selected via `--layer` flag?
4. Is generator enabled in config?

### Issue: Wrong domains being processed

**Check:**
1. Is `domain_type` correct in layer config?
2. Are domains filtered correctly in `_resolve_domains()`?
3. Is orchestrator config file present (for orchestrator layers)?

### Issue: Execution order wrong

**Check:**
1. Is `execution_order` correct in layer config?
2. Are dependencies correct?

## Quick Reference

```python
# Get layer config
from cuur_codegen.pipeline.layer_config import get_layer_config
config = get_layer_config("services")

# Check if layer is orchestrator
from cuur_codegen.pipeline.layer_config import is_orchestrator_layer
if is_orchestrator_layer("orchestrators"):
    # Handle orchestrator layer

# Get all layer names
from cuur_codegen.pipeline.layer_config import get_all_layer_names
layers = get_all_layer_names()
```
