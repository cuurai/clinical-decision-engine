# Naming Conventions

This document defines the naming conventions used throughout the ServicesGen codebase.

## Python Naming Standards (PEP 8)

We follow **Python PEP 8** naming conventions:

### 1. Constants: `UPPER_SNAKE_CASE`

Use for module-level constants and configuration dictionaries.

```python
# ✅ Good
LAYER_CONFIGS: Dict[str, LayerConfig] = {...}
DEFAULT_TIMEOUT = 30
MAX_RETRIES = 3

# ❌ Bad
layer_configs = {...}  # Should be UPPER_SNAKE_CASE
defaultTimeout = 30    # Should be UPPER_SNAKE_CASE
```

### 2. Classes: `PascalCase`

Use for all class definitions.

```python
# ✅ Good
class LayerConfig:
    pass

class PipelineOptions:
    pass

class DomainProcessingStage:
    pass

# ❌ Bad
class layer_config:  # Should be PascalCase
    pass

class pipelineOptions:  # Should be PascalCase
    pass
```

### 3. Functions: `snake_case`

Use for all function and method names.

```python
# ✅ Good
def get_layer_config(layer_name: str) -> Optional[LayerConfig]:
    pass

def resolve_domains(domains: List[str]) -> List[str]:
    pass

# ❌ Bad
def getLayerConfig():  # Should be snake_case
    pass

def ResolveDomains():  # Should be snake_case
    pass
```

### 4. Variables: `snake_case`

Use for all variable names.

```python
# ✅ Good
domain_name = "auth"
selected_layers = ["services", "adapters"]
config_path = Path("config.yaml")

# ❌ Bad
domainName = "auth"  # Should be snake_case
selectedLayers = [...]  # Should be snake_case
```

### 5. Private Methods/Variables: `_leading_underscore`

Use for internal/private methods and variables.

```python
# ✅ Good
def _resolve_domains(self, domains: List[str]) -> List[str]:
    """Internal method - not part of public API"""
    pass

def _find_domain_config(self, name: str) -> Optional[DomainConfig]:
    """Internal helper method"""
    pass

# ❌ Bad
def resolve_domains(self):  # Should be _resolve_domains if internal
    pass
```

## Naming Conflict Resolution

### Issue: Duplicate Class Names

**Problem**: `GeneratorConfig` existed in two places:
- `core/config.py` - Pydantic BaseModel for generator options
- `pipeline/layer_config.py` - Dataclass for layer generator config

**Solution**: Renamed the layer config version to `LayerGeneratorConfig` to:
- Avoid naming conflicts
- Make purpose clearer
- Follow domain-specific naming pattern

```python
# ✅ Good - Clear and specific
class LayerGeneratorConfig:  # In pipeline/layer_config.py
    """Configuration for a single generator within a layer"""
    pass

class GeneratorConfig:  # In core/config.py
    """Configuration for all generators (legacy)"""
    pass
```

## Examples from Codebase

### Constants
```python
LAYER_CONFIGS: Dict[str, LayerConfig] = {...}
```

### Classes
```python
class LayerConfig:
class LayerGeneratorConfig:
class Pipeline:
class PipelineOptions:
class DomainProcessingStage:
```

### Functions
```python
def get_layer_config(layer_name: str) -> Optional[LayerConfig]:
def get_all_layer_names() -> List[str]:
def get_core_domain_layers() -> List[str]:
def is_orchestrator_layer(layer_name: str) -> bool:
```

### Private Methods
```python
def _resolve_domains(self, domains: List[str]) -> List[str]:
def _get_domain_config(self, domain_name: str) -> Optional[DomainConfig]:
def _find_domain_config(self, domain_name: str) -> Optional[DomainConfig]:
```

## Quick Reference

| Type | Convention | Example |
|------|-----------|---------|
| Constants | `UPPER_SNAKE_CASE` | `LAYER_CONFIGS`, `DEFAULT_TIMEOUT` |
| Classes | `PascalCase` | `LayerConfig`, `PipelineOptions` |
| Functions | `snake_case` | `get_layer_config`, `is_orchestrator_layer` |
| Variables | `snake_case` | `domain_name`, `selected_layers` |
| Private | `_snake_case` | `_resolve_domains`, `_find_config` |

## Benefits

1. ✅ **Consistency** - Same convention throughout codebase
2. ✅ **Readability** - Easy to identify types at a glance
3. ✅ **IDE Support** - Better autocomplete and type hints
4. ✅ **Pythonic** - Follows Python community standards
5. ✅ **No Conflicts** - Unique names prevent import issues
