"""
OpenAPI specification parsing and manipulation utilities
"""

from pathlib import Path
from typing import Dict, Any, Optional, List
import yaml
import json

from cuur_codegen.core.errors import OpenAPIError


def load_openapi_spec(path: Path) -> Dict[str, Any]:
    """Load OpenAPI specification from file"""
    if not path.exists():
        raise OpenAPIError(f"OpenAPI spec not found: {path}")

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
