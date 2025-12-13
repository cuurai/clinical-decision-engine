# Verb Mapping System

## Overview

The Verb Mapping system provides a centralized, configurable way to map API patterns to operation verbs. This ensures consistent verb extraction across all generators (handlers, repositories, types).

## Usage

### Basic Usage

```python
from quub_codegen.utils.verb_mapping import VerbMapper

# Get verb for an operation
verb = VerbMapper.get_verb(
    operation_id="runCompletion",
    http_method="post",
    response_has_items=False
)
# Returns: "create"
```

### Adding Custom Patterns

When you discover a new API pattern, add it to the mapping:

```python
from quub_codegen.utils.verb_mapping import VerbMapper

# Add a custom operation ID pattern
VerbMapper.add_operation_pattern(r"^customAction[A-Z]", "create")

# Add or override HTTP method mapping
VerbMapper.add_http_method_mapping("head", "get")
```

## Mapping Priority

The verb is determined in this order:

1. **Operation ID Pattern Matching** (highest priority)
   - Patterns are checked in order, first match wins
   - More specific patterns should be added first

2. **HTTP Method Mapping**
   - Standard HTTP method → verb mapping
   - Can be overridden for custom methods

3. **Response Structure Refinement**
   - GET operations with `data.items` structure → "list"
   - Otherwise → "get"

## Default Mappings

### HTTP Methods
- `POST` → `create`
- `PUT` → `update`
- `PATCH` → `update`
- `DELETE` → `delete`
- `GET` → `get` (refined by response structure)

### Operation ID Patterns

#### List Operations
- `^list[A-Z]` → `list`
- `^get[A-Z].*List` → `list`
- `^query[A-Z]` → `list`
- `^search[A-Z]` → `list`

#### Create Operations
- `^create[A-Z]` → `create`
- `^post[A-Z]` → `create`
- `^add[A-Z]` → `create`
- `^run[A-Z]` → `create` (action operations)

#### Update Operations
- `^update[A-Z]` → `update`
- `^put[A-Z]` → `update`
- `^patch[A-Z]` → `update`
- `^edit[A-Z]` → `update`

#### Delete Operations
- `^delete[A-Z]` → `delete`
- `^remove[A-Z]` → `delete`

#### Get Operations
- `^get[A-Z]` → `get`
- `^fetch[A-Z]` → `get`
- `^retrieve[A-Z]` → `get`

## Examples

```python
# POST operation with "run" prefix
VerbMapper.get_verb("runCompletion", "post")
# → "create"

# GET operation with list response
VerbMapper.get_verb("getAuditLog", "get", response_has_items=True)
# → "list"

# GET operation with single entity response
VerbMapper.get_verb("getProviderAccount", "get", response_has_items=False)
# → "get"

# Custom pattern
VerbMapper.add_operation_pattern(r"^execute[A-Z]", "create")
VerbMapper.get_verb("executeTask", "post")
# → "create"
```

## Configuration

To add new patterns, modify `verb_mapping.py` or use the `add_operation_pattern()` and `add_http_method_mapping()` methods at runtime.

Patterns are checked in order, so add more specific patterns before general ones:

```python
# More specific first
VerbMapper.add_operation_pattern(r"^listAll[A-Z]", "list")
VerbMapper.add_operation_pattern(r"^list[A-Z]", "list")  # More general
```
