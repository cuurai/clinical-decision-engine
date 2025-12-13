"""
OpenAPI specification parsing and manipulation utilities
"""

from pathlib import Path
from typing import Dict, Any, Optional, List, Set
import yaml
import json

from cuur_codegen.base.errors import OpenAPIError


def load_openapi_spec(path: Path) -> Dict[str, Any]:
    """Load OpenAPI specification from file"""
    if not path.exists():
        # Provide helpful error message
        parent_dir = path.parent
        available_files = []

        if parent_dir.exists():
            # Look for similar files
            available_files = [
                f.name for f in parent_dir.glob("*.json")[:5]
            ] + [
                f.name for f in parent_dir.glob("*.yaml")[:5]
            ]

        error_msg = f"""
❌ OpenAPI spec file not found: {path}
"""
        if available_files:
            try:
                cwd = Path.cwd()
                if parent_dir.is_relative_to(cwd):
                    rel_path = parent_dir.relative_to(cwd)
                    restore_path = str(rel_path).replace("\\", "/")
                else:
                    restore_path = str(parent_dir)
            except (ValueError, AttributeError):
                restore_path = str(parent_dir)

            error_msg += f"""
💡 Found these files in {parent_dir}:
   {', '.join(available_files[:5])}

💡 To restore from main branch:
   git checkout main -- {restore_path}/
"""
        else:
            error_msg += f"""
💡 The directory {parent_dir} exists but contains no spec files.

💡 To restore OpenAPI files from main branch:
   git checkout main -- openapi/
"""

        raise OpenAPIError(error_msg.strip())

    try:
        content = path.read_text(encoding="utf-8")

        # Try YAML first
        if path.suffix in [".yaml", ".yml"]:
            return yaml.safe_load(content)

        # Try JSON
        if path.suffix == ".json":
            return json.loads(content)

        # Default to YAML
        return yaml.safe_load(content)

    except yaml.YAMLError as e:
        raise OpenAPIError(f"Failed to parse YAML: {e}")
    except json.JSONDecodeError as e:
        raise OpenAPIError(f"Failed to parse JSON: {e}")
    except Exception as e:
        raise OpenAPIError(f"Failed to load OpenAPI spec: {e}")


def extract_operations(spec: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extract all operations from OpenAPI spec"""
    operations = []

    paths = spec.get("paths", {})
    for path, path_item in paths.items():
        for method, operation in path_item.items():
            if method in ["get", "post", "put", "patch", "delete", "head", "options"]:
                operation_data = {
                    "path": path,
                    "method": method.upper(),
                    "operation": operation,
                    "operation_id": operation.get("operationId", f"{method}_{path}"),
                }
                operations.append(operation_data)

    return operations


def extract_schemas(spec: Dict[str, Any]) -> Dict[str, Any]:
    """Extract all schemas from OpenAPI spec"""
    components = spec.get("components", {})
    return components.get("schemas", {})


def get_operation_by_id(spec: Dict[str, Any], operation_id: str) -> Optional[Dict[str, Any]]:
    """Get operation by operationId"""
    operations = extract_operations(spec)
    for op in operations:
        if op["operation_id"] == operation_id:
            return op["operation"]
    return None


def resolve_ref(spec: Dict[str, Any], ref: str) -> Optional[Dict[str, Any]]:
    """
    Resolve a $ref reference in OpenAPI spec

    Supports:
    - #/components/schemas/Name
    - #/components/parameters/Name
    - #/components/responses/Name
    - #/components/requestBodies/Name
    - ./file.yaml#/components/schemas/Name (not fully supported)
    """
    if not ref.startswith("#/"):
        # External reference - not fully supported
        return None

    parts = ref[2:].split("/")
    # parts = ["components", "schemas", "SchemaName"] or ["components", "requestBodies", "RequestBodyName"]
    if len(parts) < 3:
        return None

    component_type = parts[0]  # "components"
    component_name = parts[1]  # "schemas", "requestBodies", "parameters", etc.
    # Schema/component name is the last part
    schema_name = parts[2] if len(parts) >= 3 else None

    components = spec.get("components", {})
    component = components.get(component_name, {})

    if schema_name:
        return component.get(schema_name)

    return component


def extract_schema_name_from_ref(ref: str) -> Optional[str]:
    """
    Extract schema name from a $ref string

    Examples:
    - "#/components/schemas/CreateChainRequest" -> "CreateChainRequest"
    - "#/components/requestBodies/CreateChainRequestBody" -> "CreateChainRequestBody"
    """
    if not ref or not isinstance(ref, str):
        return None

    if not ref.startswith("#/"):
        return None

    parts = ref[2:].split("/")
    # parts = ["components", "schemas", "SchemaName"] or ["components", "requestBodies", "RequestBodyName"]
    if len(parts) >= 3 and parts[0] == "components":
        # Schema/component name is the last part
        return parts[-1]

    return None


def get_request_body_schema_name(operation: Dict[str, Any], spec: Dict[str, Any]) -> Optional[str]:
    """Extract the actual schema name from requestBody"""
    request_body = operation.get("requestBody")
    if not request_body:
        return None

    # Check for direct $ref to requestBodies component
    if "$ref" in request_body:
        ref = request_body["$ref"]
        schema_name = extract_schema_name_from_ref(ref)
        if schema_name:
            # If it's a requestBody reference, resolve it and get the schema
            if "#/components/requestBodies/" in ref:
                resolved = resolve_ref(spec, ref)
                if resolved:
                    content = resolved.get("content", {})
                    json_content = content.get("application/json", {})
                    schema = json_content.get("schema")
                    if schema and "$ref" in schema:
                        return extract_schema_name_from_ref(schema["$ref"])
            else:
                return schema_name

    # Check content -> application/json -> schema -> $ref
    content = request_body.get("content", {})
    json_content = content.get("application/json", {})
    schema = json_content.get("schema")

    if schema and "$ref" in schema:
        return extract_schema_name_from_ref(schema["$ref"])

    return None


def get_response_schema_name(operation: Dict[str, Any], spec: Dict[str, Any], status_code: str = "200") -> Optional[str]:
    """Extract the actual schema name from response"""
    responses = operation.get("responses", {})
    response = responses.get(status_code)

    if not response:
        # Try 200 as fallback
        if status_code != "200" and "200" in responses:
            response = responses["200"]
        else:
            return None

    # Check for direct $ref (e.g., #/components/responses/NoContentResponse)
    if "$ref" in response:
        ref = response["$ref"]
        schema_name = extract_schema_name_from_ref(ref)
        # For 204 responses, if it references NoContentResponse, return it
        if status_code == "204" and "NoContentResponse" in ref:
            return "NoContentResponse"
        if schema_name:
            return schema_name

    # Check content -> application/json -> schema -> $ref
    content = response.get("content", {})
    json_content = content.get("application/json", {})
    schema = json_content.get("schema")

    if schema and "$ref" in schema:
        return extract_schema_name_from_ref(schema["$ref"])

    return None


def get_schema(spec: Dict[str, Any], schema_name: str) -> Optional[Dict[str, Any]]:
    """Get schema by name"""
    schemas = extract_schemas(spec)
    return schemas.get(schema_name)


def get_request_body_schema(operation: Dict[str, Any], spec: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Get request body schema from operation"""
    request_body = operation.get("requestBody")
    if not request_body:
        return None

    # Handle $ref
    if "$ref" in request_body:
        resolved = resolve_ref(spec, request_body["$ref"])
        if resolved:
            request_body = resolved

    content = request_body.get("content", {})
    json_content = content.get("application/json", {})
    schema = json_content.get("schema")

    if not schema:
        return None

    # Resolve schema ref if needed
    if "$ref" in schema:
        return resolve_ref(spec, schema["$ref"])

    return schema


def get_response_schema(operation: Dict[str, Any], spec: Dict[str, Any], status_code: str = "200") -> Optional[Dict[str, Any]]:
    """Get response schema from operation"""
    responses = operation.get("responses", {})
    response = responses.get(status_code)

    if not response:
        return None

    # Handle $ref
    if "$ref" in response:
        resolved = resolve_ref(spec, response["$ref"])
        if resolved:
            response = resolved

    content = response.get("content", {})
    json_content = content.get("application/json", {})
    schema = json_content.get("schema")

    if not schema:
        return None

    # Resolve schema ref if needed
    if "$ref" in schema:
        return resolve_ref(spec, schema["$ref"])

    return schema


def is_crud_operation(operation_id: str) -> bool:
    """Check if operation is a CRUD operation"""
    verbs = ["create", "update", "delete", "get", "list", "patch"]
    return any(operation_id.lower().startswith(verb) for verb in verbs)


def has_path_parameter(path: str, param_name: str) -> bool:
    """Check if path has a specific parameter"""
    return f"{{{param_name}}}" in path or f"{{{{{param_name}}}}}" in path


def get_shared_types_from_common_files(openapi_dir: Path) -> Set[str]:
    """
    Dynamically detect shared types by loading common YAML files.

    Shared types are defined in openapi/src/common/*.yaml files.
    This function loads all common files and extracts schema names.

    Args:
        openapi_dir: Path to openapi directory (e.g., project_root / "openapi" / "src")

    Returns:
        Set of shared type names found in common files
    """
    shared_types: Set[str] = set()
    common_dir = openapi_dir / "common"

    if not common_dir.exists():
        return shared_types

    # Load all YAML files in common directory
    for yaml_file in common_dir.glob("*.yaml"):
        try:
            spec = load_openapi_spec(yaml_file)
            schemas = spec.get("components", {}).get("schemas", {})

            # Add all schema names from common files
            for schema_name in schemas.keys():
                shared_types.add(schema_name)

        except Exception:
            # Skip files that can't be loaded
            continue

    return shared_types


def is_shared_type(type_name: str, spec: Dict[str, Any], openapi_dir: Path) -> bool:
    """
    Check if a type is a shared type by examining $ref references in the spec.

    A type is shared if:
    1. It's defined in a common/*.yaml file (detected via $ref)
    2. It's explicitly listed in common files

    Args:
        type_name: Name of the type to check
        spec: OpenAPI specification dict
        openapi_dir: Path to openapi directory

    Returns:
        True if type is shared, False otherwise
    """
    # First check if it's in common files directly
    shared_types = get_shared_types_from_common_files(openapi_dir)
    if type_name in shared_types:
        return True

    # Check if this type is referenced via $ref to common files
    schemas = spec.get("components", {}).get("schemas", {})
    type_def = schemas.get(type_name)

    if isinstance(type_def, dict):
        # Check if it's a $ref to a common file
        ref = type_def.get("$ref", "")
        if ref and "common/" in ref:
            return True

        # Check allOf, anyOf, oneOf for common refs
        for key in ["allOf", "anyOf", "oneOf"]:
            if key in type_def:
                for item in type_def[key]:
                    if isinstance(item, dict):
                        item_ref = item.get("$ref", "")
                        if item_ref and "common/" in item_ref:
                            return True

    return False


def get_shared_types_from_common_files(openapi_dir: Path) -> Set[str]:
    """
    Dynamically detect shared types by loading common YAML files.

    Shared types are defined in openapi/src/common/*.yaml files.
    This function loads all common files and extracts schema names.

    Args:
        openapi_dir: Path to openapi/src directory

    Returns:
        Set of shared type names found in common files
    """
    shared_types: Set[str] = set()
    common_dir = openapi_dir / "common"

    if not common_dir.exists():
        return shared_types

    # Load all YAML files in common directory
    for yaml_file in common_dir.glob("*.yaml"):
        try:
            spec = load_openapi_spec(yaml_file)
            schemas = spec.get("components", {}).get("schemas", {})

            # Add all schema names from common files
            for schema_name in schemas.keys():
                shared_types.add(schema_name)

        except Exception:
            # Skip files that can't be loaded - allows codegen to work even if some files are missing
            continue

    # Always add these as they're always shared (re-exported from generated types)
    shared_types.add("components")
    shared_types.add("operations")

    return shared_types


def is_shared_type(type_name: str, spec: Dict[str, Any], openapi_dir: Path) -> bool:
    """
    Check if a type is a shared type by examining $ref references in the spec.

    A type is shared if:
    1. It's defined in a common/*.yaml file (detected via $ref)
    2. It's explicitly listed in common files

    Args:
        type_name: Name of the type to check
        spec: OpenAPI specification dict
        openapi_dir: Path to openapi/src directory

    Returns:
        True if type is shared, False otherwise
    """
    # First check if it's in common files directly
    shared_types = get_shared_types_from_common_files(openapi_dir)
    if type_name in shared_types:
        return True

    # Check if this type is referenced via $ref to common files
    schemas = spec.get("components", {}).get("schemas", {})
    type_def = schemas.get(type_name)

    if isinstance(type_def, dict):
        # Check if it's a $ref to a common file
        ref = type_def.get("$ref", "")
        if ref and "common/" in ref:
            return True

        # Check allOf, anyOf, oneOf for common refs
        for key in ["allOf", "anyOf", "oneOf"]:
            if key in type_def:
                for item in type_def[key]:
                    if isinstance(item, dict):
                        item_ref = item.get("$ref", "")
                        if item_ref and "common/" in item_ref:
                            return True

    return False
