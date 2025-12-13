# Pipeline Refactoring Summary

## Overview

The pipeline has been refactored to be more **readable** and **modular**, making it easier for junior developers to understand and maintain.

## Key Changes

### 1. Centralized Layer Configuration (`layer_config.py`)

**Before**: Layer-to-generator mappings were hardcoded in multiple places:
- `pipeline.py` - Domain resolution logic
- `stages.py` - Generator selection logic
- Hard to find and modify

**After**: All layer configurations are in one place:
- `layer_config.py` - Single source of truth
- Clear, declarative structure
- Easy to add/modify layers

### 2. Improved Code Organization

**Before**:
- Domain resolution logic mixed with execution logic
- Orchestrator filtering scattered throughout
- Hard to understand flow

**After**:
- Clear separation of concerns
- Helper methods for domain resolution
- Self-documenting code with better naming

### 3. Better Documentation

- Inline comments explain each step
- Type hints for better IDE support
- Helper functions with clear names

## File Structure

```
.servicesgen/src/cuur_codegen/pipeline/
├── layer_config.py      # NEW: Layer configurations (EDIT THIS)
├── pipeline.py          # REFACTORED: Uses layer_config
├── stages.py            # REFACTORED: Uses layer_config
└── __init__.py          # UPDATED: Exports layer_config
```

## How to Add a New Layer

### Step 1: Define Layer Configuration

Edit `.servicesgen/src/cuur_codegen/pipeline/layer_config.py`:

```python
LAYER_CONFIGS: Dict[str, LayerConfig] = {
    # ... existing layers ...

    "my-new-layer": LayerConfig(
        name="my-new-layer",
        description="What this layer does",
        generators=[
            GeneratorConfig(
                name="my_generator",
                description="Generates X files",
                enabled_by_default=True,
                requires_spec=True,
            ),
        ],
        execution_order=["my_generator"],
        domain_type="raw",  # or "orchestrator"
        requires_openapi_spec=True,
    ),
}
```

### Step 2: Register Generator

Edit `.servicesgen/src/cuur_codegen/pipeline/pipeline.py`:

```python
# In Pipeline.__init__()
self.registry.register("my_generator", MyGeneratorClass)
```

### Step 3: Done!

The pipeline will automatically:
- Include your layer in available layers
- Filter domains correctly
- Execute generators in the right order

## Benefits for Junior Developers

1. ✅ **Single Source of Truth** - All layer configs in one file
2. ✅ **Self-Documenting** - Clear structure and naming
3. ✅ **Easy to Modify** - Change config, not code logic
4. ✅ **Type Safety** - Dataclasses prevent errors
5. ✅ **Clear Separation** - Raw domains vs orchestrator domains

## Migration Notes

- **No breaking changes** - Existing CLI commands work the same
- **Backward compatible** - All existing functionality preserved
- **Improved error messages** - Better feedback when things go wrong

## Testing

Run the layer config test:

```bash
python3 -c "
import sys
sys.path.insert(0, '.servicesgen/src')
from cuur_codegen.pipeline.layer_config import get_all_layer_names
print('Layers:', get_all_layer_names())
"
```

## Next Steps

1. Review `layer_config.py` to understand structure
2. Read `PIPELINE_LAYER_CONFIGURATION.md` for detailed guide
3. Test with: `python3 -m .servicesgen.src.cuur_codegen.cli.main generate --layer services`
