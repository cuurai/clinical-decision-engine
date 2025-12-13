"""
Routes Builder - Generates routes.ts
"""

from pathlib import Path
from typing import Optional, List, Dict, Any
import re
from cuur_codegen.utils.file import write_file
from cuur_codegen.utils.string import camel_case, kebab_case


class RoutesBuilder:
    """Builds routes.ts file"""

    @staticmethod
    def convert_path_to_regex(path: str) -> str:
        """Convert OpenAPI path with parameters to regex pattern"""
        # Convert {param} to named capture groups
        # Example: /trading/markets/{symbol} -> \/trading\/markets\/(?<symbol>[^\/]+)
        pattern = path
        # First, replace {param} with placeholder to protect it from escaping
        placeholders = {}
        def replace_param(match):
            param_name = match.group(1)
            placeholder = f"__PARAM_{param_name}__"
            placeholders[placeholder] = f"(?<{param_name}>[^/]+)"
            return placeholder
        pattern = re.sub(r'\{(\w+)\}', replace_param, pattern)
        # Escape special regex characters (but not / yet, and not our placeholders)
        pattern = re.sub(r'([.+*?^$()\[\]|\\])', r'\\\1', pattern)
        # Replace placeholders back with named capture groups
        for placeholder, replacement in placeholders.items():
            pattern = pattern.replace(placeholder, replacement)
        # Finally, escape forward slashes last (so we don't double-escape)
        pattern = pattern.replace('/', r'\/')
        return pattern

    @staticmethod
    def extract_path_params(path: str) -> List[str]:
        """Extract parameter names from OpenAPI path"""
        params = re.findall(r'\{(\w+)\}', path)
        return params

    @staticmethod
    def build_routes(domain_name: str, spec: Dict[str, Any]) -> str:
        """Build routes.ts content"""
        paths = spec.get("paths", {})
        routes_list = []
        flow_imports = []

        for path, methods in paths.items():
            for method, operation in methods.items():
                if method.lower() not in ["get", "post", "put", "delete", "patch"]:
                    continue

                operation_id = operation.get("operationId", "")
                if not operation_id:
                    continue

                # Convert operationId to flow function name (camelCase)
                flow_name = camel_case(operation_id.replace("get", "").replace("create", "").replace("list", "").replace("update", "").replace("delete", ""))
                if not flow_name:
                    flow_name = camel_case(operation_id)

                flow_import_name = f"{flow_name}Flow"
                flow_file_name = kebab_case(flow_name)

                # Check if flow already imported
                if flow_import_name not in flow_imports:
                    flow_imports.append(flow_import_name)

                # Build route matcher
                http_method = method.upper()
                path_params = RoutesBuilder.extract_path_params(path)
                regex_pattern = RoutesBuilder.convert_path_to_regex(path)

                # Generate path parameter extraction code
                if path_params:
                    matches_code = f'''    matches: (event) => {{
      if (event.httpMethod !== "{http_method}") return false;
      const pathMatch = event.path.match(/^{regex_pattern}$/);
      return pathMatch !== null;
    }},'''
                    handler_params_code = f'''      // Extract path parameters using regex
      const pathMatch = event.path.match(/^{regex_pattern}$/);
      const params = {{ ...(event.pathParameters || {{}}), ...(pathMatch?.groups || {{}}) }};'''
                else:
                    matches_code = f'''    matches: (event) =>
      event.httpMethod === "{http_method}" && event.path === "{path}",'''
                    handler_params_code = '''      const params = event.pathParameters || {};'''

                route_code = f'''  {{
{matches_code}
    handler: async (event, context, deps) => {{
      // Extract request data (body, path params, query params)
      const body = event.body ? JSON.parse(event.body) : {{}};
{handler_params_code}
      const query = event.queryStringParameters || {{}};

      // Pass context (orgId, accountId from JWT) and request data to flow
      // Note: orgId comes from context, never from params or query
      return {flow_import_name}({{ context, body, params, query }}, deps);
    }},
  }}'''
                routes_list.append(route_code)

        # Generate imports
        imports = "\n".join([
            f'import {{ {name} }} from "./flows/{kebab_case(name.replace("Flow", ""))}.flow.js";'
            for name in flow_imports
        ])

        return f'''/**
 * API Gateway route → flow mapping
 *
 * Maps incoming API Gateway events to the appropriate flow handlers.
 *
 * Security: orgId is passed from JWT context, never extracted from URL.
 */

import type {{ APIGatewayProxyEvent }} from "aws-lambda";
import type {{ Dependencies }} from "./deps.js";
import type {{ RequestContext }} from "./context.js";
{imports}

export interface Route {{
  matches(event: APIGatewayProxyEvent): boolean;
  handler(event: APIGatewayProxyEvent, context: RequestContext, deps: Dependencies): Promise<any>;
}}

export const routes: Route[] = [
{",".join(routes_list)}
];
'''

    @staticmethod
    def generate_routes(output_dir: Path, domain_name: str, spec: Dict[str, Any]) -> Optional[Path]:
        """Generate routes.ts"""
        routes_file = output_dir / "routes.ts"
        write_file(routes_file, RoutesBuilder.build_routes(domain_name, spec))
        return routes_file
