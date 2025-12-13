"""
Parameter Extractor - Extracts path and query parameters from OpenAPI operations
"""

from typing import Dict, Any, Optional
from cuur_codegen.utils.openapi import resolve_ref, extract_schema_name_from_ref


class ParameterExtractor:
    """Extracts parameters from OpenAPI operations"""

    @staticmethod
    def extract_path_parameters(operation: Dict[str, Any], spec: Dict[str, Any]) -> Dict[str, Any]:
        """Extract path parameters from OpenAPI operation"""
        parameters = operation.get("parameters", [])
        path_params = {}

        for param in parameters:
            if isinstance(param, dict):
                param_in = param.get("in")
                if param_in == "path":
                    param_name = param.get("name")
                    if param_name:
                        path_params[param_name] = param
            elif isinstance(param, str) and param.startswith("#/"):
                # Handle $ref parameters
                resolved = ParameterExtractor._resolve_param_ref(spec, param)
                if resolved and resolved.get("in") == "path":
                    param_name = resolved.get("name")
                    if param_name:
                        path_params[param_name] = resolved

        return path_params

    @staticmethod
    def extract_query_parameters(operation: Dict[str, Any], spec: Dict[str, Any]) -> Dict[str, Any]:
        """Extract query parameters from OpenAPI operation"""
        parameters = operation.get("parameters", [])
        query_params = {}

        for param in parameters:
            if isinstance(param, dict):
                param_in = param.get("in")
                if param_in == "query":
                    param_name = param.get("name")
                    if param_name:
                        query_params[param_name] = param
            elif isinstance(param, str) and param.startswith("#/"):
                # Handle $ref parameters
                resolved = ParameterExtractor._resolve_param_ref(spec, param)
                if resolved and resolved.get("in") == "query":
                    param_name = resolved.get("name")
                    if param_name:
                        query_params[param_name] = resolved

        return query_params

    @staticmethod
    def _resolve_param_ref(spec: Dict[str, Any], ref: str) -> Optional[Dict[str, Any]]:
        """Resolve a parameter $ref"""
        if not ref.startswith("#/"):
            return None

        parts = ref[2:].split("/")
        if len(parts) < 4 or parts[0] != "components" or parts[1] != "parameters":
            return None

        param_name = parts[2]
        components = spec.get("components", {})
        parameters = components.get("parameters", {})
        return parameters.get(param_name)
