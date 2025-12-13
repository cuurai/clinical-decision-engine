"""
Service Client Builder - Builds typed service client wrappers
"""

from typing import Dict, Any, List
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, pascal_case, kebab_case


class ServiceClientBuilder:
    """Builder for typed service client wrappers"""

    @staticmethod
    def build_service_client(
        context: GenerationContext,
        operations: List[Dict[str, Any]],
        header: str,
    ) -> str:
        """
        Build a typed service client class for a domain.

        Args:
            context: Generation context
            operations: List of OpenAPI operations
            header: File header comment

        Returns:
            Generated TypeScript code
        """
        domain_name = context.domain_name
        domain_pascal = pascal_case(domain_name.replace("-", "_"))
        domain_camel = camel_case(domain_name.replace("-", "_"))

        # Import types from @cuur/core
        type_imports = ServiceClientBuilder._extract_type_imports(operations, domain_name)

        # Generate methods for each operation
        methods = []
        for op in operations:
            method = ServiceClientBuilder._build_method(context, op, domain_name)
            if method:
                methods.append(method)

        # Build class
        # Import ServiceClient from shared location (relative to domain folder)
        class_content = f"""
{header}

/**
 * {domain_pascal} Service Client
 *
 * Type-safe client wrapper for {domain_name} domain service.
 * Uses types from @cuur/core for full type safety.
 */

import {{ ServiceClient }} from "@quub/services/client/service-client.js";
{type_imports}

export class {domain_pascal}Client {{
  constructor(private client: ServiceClient) {{}}

{chr(10).join(methods)}
}}
"""

        return class_content.strip()

    @staticmethod
    def _extract_type_imports(operations: List[Dict[str, Any]], domain_name: str) -> str:
        """Extract type imports needed for the service client"""
        # Collect unique types from operations
        request_types = set()
        response_types = set()
        param_types = set()

        for op in operations:
            operation = op.get("operation", {})
            operation_id = operation.get("operationId", "")
            if not operation_id:
                continue

            # Extract request body type
            request_body = operation.get("requestBody", {})
            if request_body:
                content = request_body.get("content", {})
                json_content = content.get("application/json", {})
                schema_ref = json_content.get("schema", {}).get("$ref", "")
                if schema_ref:
                    # Extract schema name from $ref
                    schema_name = schema_ref.split("/")[-1]
                    request_types.add(schema_name)

            # Extract response types
            responses = operation.get("responses", {})
            for status_code, response in responses.items():
                if status_code.startswith("2"):  # 2xx responses
                    content = response.get("content", {})
                    json_content = content.get("application/json", {})
                    schema_ref = json_content.get("schema", {}).get("$ref", "")
                    if schema_ref:
                        schema_name = schema_ref.split("/")[-1]
                        response_types.add(schema_name)

            # Extract parameter types
            parameters = operation.get("parameters", [])
            if parameters:
                param_types.add(f"List{ServiceClientBuilder._extract_resource_name(operation_id)}Params")

        # Build import statement
        all_types = sorted(request_types | response_types | param_types)
        if not all_types:
            return ""

        # Import from @cuur/core/{domain}/types/index.js
        domain_path = domain_name.replace("-", "/")
        type_names = ", ".join(all_types)
        return f'import type {{ {type_names} }} from "@cuur/core/{domain_path}/types/index.js";'

    @staticmethod
    def _extract_resource_name(operation_id: str) -> str:
        """Extract resource name from operation ID"""
        # e.g., "listChains" -> "Chains", "createOrder" -> "Order"
        if operation_id.startswith("list"):
            return operation_id[4:]  # Remove "list"
        elif operation_id.startswith("get"):
            return operation_id[3:]  # Remove "get"
        elif operation_id.startswith("create"):
            return operation_id[6:]  # Remove "create"
        elif operation_id.startswith("update"):
            return operation_id[6:]  # Remove "update"
        elif operation_id.startswith("delete"):
            return operation_id[6:]  # Remove "delete"
        return operation_id

    @staticmethod
    def _build_method(
        context: GenerationContext,
        operation_data: Dict[str, Any],
        domain_name: str,
    ) -> str:
        """Build a method for a single operation"""
        operation = operation_data.get("operation", {})
        operation_id = operation.get("operationId", "")
        if not operation_id:
            return ""

        method_name = camel_case(operation_id)
        method_http = operation_data.get("method", "GET").upper()
        path = operation_data.get("path", "")

        # Determine return type from response
        # Use the response type names that are already exported from @cuur/core
        # These follow the pattern: ListChainsResponse, GetChainResponse, etc.
        responses = operation.get("responses", {})
        return_type = "unknown"
        for status_code, response in responses.items():
            if status_code.startswith("2"):  # 2xx response
                content = response.get("content", {})
                json_content = content.get("application/json", {})
                schema_ref = json_content.get("schema", {}).get("$ref", "")
                if schema_ref:
                    schema_name = schema_ref.split("/")[-1]
                    # Check if schema_name already ends with "Response" (from @cuur/core types)
                    if schema_name.endswith("Response"):
                        return_type = schema_name
                    else:
                        # Map to response type (e.g., "Trade" -> "GetTradeResponse" or "ListTradesResponse")
                        if method_name.startswith("list"):
                            return_type = f"List{schema_name}Response"
                        elif method_name.startswith("get"):
                            return_type = f"Get{schema_name}Response"
                        elif method_name.startswith("create"):
                            return_type = f"Create{schema_name}Response"
                        elif method_name.startswith("update"):
                            return_type = f"Update{schema_name}Response"
                        else:
                            return_type = f"{schema_name}Response"
                break

        # Determine request body type
        request_body = operation.get("requestBody", {})
        request_type = "unknown"
        if request_body:
            content = request_body.get("content", {})
            json_content = content.get("application/json", {})
            schema_ref = json_content.get("schema", {}).get("$ref", "")
            if schema_ref:
                schema_name = schema_ref.split("/")[-1]
                request_type = schema_name

        # Build method parameters
        params = []

        # Add path parameters
        parameters = operation.get("parameters", [])
        path_params = [p for p in parameters if p.get("in") == "path"]
        for param in path_params:
            param_name = param.get("name", "")
            params.append(f"{param_name}: string")

        # Add query parameters
        query_params = [p for p in parameters if p.get("in") == "query"]
        if query_params:
            # Use params type if available
            params_type = f"List{ServiceClientBuilder._extract_resource_name(operation_id)}Params"
            params.append(f"params?: {params_type}")

        # Add request body
        if request_body and method_http in ["POST", "PUT", "PATCH"]:
            params.append(f"body: {request_type}")

        # Build method body
        method_params_str = ", ".join(params)

        # Build path with parameter substitution
        call_path = path
        for param in path_params:
            param_name = param.get("name", "")
            call_path = call_path.replace(f"{{{param_name}}}", f"${{{param_name}}}")

        # Build service call
        service_call = f'    return this.client.call<{return_type}>("{domain_name}", `{call_path}`, {{'
        service_call += f'\n      method: "{method_http}",'

        if request_body and method_http in ["POST", "PUT", "PATCH"]:
            service_call += '\n      body,'

        service_call += '\n    });'

        method = f"""  /**
   * {operation.get("summary", method_name)}
   */
  async {method_name}({method_params_str}): Promise<{return_type}> {{
{service_call}
  }}"""

        return method
