"""
Flow Builder - Generates flow files from x-orchestration-flow
"""

from pathlib import Path
from typing import List, Dict, Any, Set
import re
from cuur_codegen.utils.file import ensure_directory, write_file
from cuur_codegen.utils.string import camel_case, kebab_case, pascal_case, extract_verb_from_operation_id, extract_resource_from_operation_id
from ..config_reader import load_orchestrator_domains_config
from .dao_discovery import DaoDiscovery
from .handler_mapper import HandlerMapper
from .handler_discovery import HandlerDiscovery
from .validation_mapper import ValidationMapper


class FlowBuilder:
    """Builds flow files"""

    @staticmethod
    def generate_readable_variable_name(step_id: str, handler_name: str, service: str, operation_id: str) -> str:
        """
        Generate a readable variable name from stepId, handler name, or operation.

        Examples:
        - callCustodian0 + listCustodyTransactions -> custodyTransactions
        - callExchange0 + listMarkets -> markets
        - callCustodian0 + getCustodyAccount -> custodyAccount

        Args:
            step_id: Original stepId from YAML (e.g., "callCustodian0")
            handler_name: Handler function name (e.g., "listCustodyTransactions")
            service: Service name (e.g., "CUSTODIAN")
            operation_id: Operation ID (e.g., "listCustodyaccounts")

        Returns:
            Readable variable name (e.g., "custodyTransactions")
        """
        # If stepId already looks good (no trailing numbers), use it
        if step_id and not re.match(r'.*\d+$', step_id):
            # Remove "call" prefix if present
            if step_id.startswith("call"):
                cleaned = step_id[4:]  # Remove "call"
                # Convert to camelCase if needed
                return camel_case(cleaned)
            return camel_case(step_id)

        # Extract resource from handler name (listCustodyTransactions -> custodyTransactions)
        # Remove verb prefix (list, get, create, update, delete)
        verb = extract_verb_from_operation_id(handler_name)
        resource = extract_resource_from_operation_id(handler_name)

        if resource:
            # Convert to camelCase (e.g., "CustodyTransactions" -> "custodyTransactions")
            return camel_case(resource)

        # Fallback: use service name + operation resource
        service_lower = service.lower()
        operation_resource = extract_resource_from_operation_id(operation_id)
        if operation_resource:
            return camel_case(f"{service_lower}{operation_resource}")

        # Last resort: clean up stepId
        cleaned = re.sub(r'call(\w+)\d+', r'\1', step_id)
        return camel_case(cleaned) if cleaned else "result"

    @staticmethod
    def generate_flows(output_dir: Path, domain_name: str, spec: Dict[str, Any], project_root: Path) -> List[Path]:
        """Generate flow files from x-orchestration-flow"""
        flows_dir = output_dir / "flows"
        ensure_directory(flows_dir)

        files = []
        paths = spec.get("paths", {})

        for path, methods in paths.items():
            for method, operation in methods.items():
                operation_id = operation.get("operationId", "")
                if not operation_id:
                    continue

                flow_steps = operation.get("x-orchestration-flow", [])
                if not flow_steps:
                    continue

                # Generate flow file name - include path to make it unique if operationId is duplicated
                flow_name = camel_case(operation_id.replace("get", "").replace("create", "").replace("list", "").replace("update", "").replace("delete", ""))
                if not flow_name:
                    flow_name = camel_case(operation_id)

                flow_name_kebab = kebab_case(flow_name)

                # Extract meaningful part from path (e.g., /trading/markets/{symbol} -> trading-markets-symbol)
                # Only add path suffix if it adds unique information (like path parameters)
                path_suffix = ""
                if path and path != "/":
                    # Remove leading/trailing slashes and replace / with -
                    path_clean = path.strip("/").replace("/", "-")
                    # Extract path parameters separately BEFORE removing them
                    path_params = re.findall(r'\{(\w+)\}', path)
                    # Remove path parameters from path_clean for comparison
                    path_clean_no_params = re.sub(r'\{(\w+)\}', r'\1', path_clean)

                    # Normalize both for comparison: split into segments
                    flow_segments = flow_name_kebab.split("-")
                    path_segments = path_clean_no_params.split("-")

                    # Check if flow_name segments match path segments (allowing for params in between)
                    # Strategy: If path segments contain flow segments, only add path params + unique suffix
                    flow_in_path = True
                    flow_idx = 0
                    for path_seg in path_segments:
                        if flow_idx < len(flow_segments) and path_seg == flow_segments[flow_idx]:
                            flow_idx += 1

                    # If all flow segments found in path (in order), path contains flow_name
                    if flow_idx == len(flow_segments):
                        # Path contains flow_name - only add path parameters
                        if path_params:
                            path_suffix = f"-{'-'.join(path_params)}"
                    elif path_clean_no_params.startswith(flow_name_kebab):
                        # Path starts with flow_name - only add path parameters
                        if path_params:
                            path_suffix = f"-{'-'.join(path_params)}"
                    else:
                        # Path is different from operation_id, add full path suffix
                        path_suffix = f"-{path_clean_no_params}" if path_clean_no_params else ""

                # Make filename unique by including path suffix
                flow_file_name = f"{flow_name_kebab}{path_suffix}.flow.ts"
                flow_file = flows_dir / flow_file_name
                flow_content = FlowBuilder.build_flow_content(domain_name, operation_id, flow_steps, operation, project_root)
                write_file(flow_file, flow_content)
                files.append(flow_file)

        return files

    @staticmethod
    def build_flow_content(domain_name: str, operation_id: str, flow_steps: List[Dict], operation: Dict, project_root: Path) -> str:
        """Generate flow file content"""
        flow_name = camel_case(operation_id.replace("get", "").replace("create", "").replace("list", "").replace("update", "").replace("delete", ""))
        if not flow_name:
            flow_name = camel_case(operation_id)

        flow_function_name = f"{flow_name}Flow"

        # Get DAO repositories for this domain (needed for examples)
        dao_repos = []
        try:
            orchestrator_config = load_orchestrator_domains_config(project_root)
            for domain_config in orchestrator_config.orchestrator_domains:
                if domain_config.name == domain_name:
                    core_domains = [cd.name for cd in domain_config.core_domains]
                    dao_repos = DaoDiscovery.discover_dao_repositories(core_domains)
                    break
        except Exception:
            pass

        # Extract path parameters from OpenAPI path
        path_params = []
        if "parameters" in operation:
            for param in operation["parameters"]:
                if param.get("in") == "path":
                    path_params.append(param.get("name"))

        # Build dependency graph and topological sort for proper execution order
        step_map = {step.get("stepId"): step for step in flow_steps}
        dependencies = {}  # step_id -> [dependent_step_ids]
        step_depends_on = {}  # step_id -> [step_ids it depends on]

        for step in flow_steps:
            step_id = step.get("stepId", "")
            depends_on = step.get("dependsOn", [])
            if isinstance(depends_on, str):
                depends_on = [depends_on]
            elif not isinstance(depends_on, list):
                depends_on = []

            step_depends_on[step_id] = depends_on
            # Build reverse dependency map
            for dep in depends_on:
                if dep not in dependencies:
                    dependencies[dep] = []
                dependencies[dep].append(step_id)

        # Topological sort to determine execution order
        def topological_sort():
            """Sort steps respecting dependencies"""
            in_degree = {step_id: len(step_depends_on.get(step_id, [])) for step_id in step_map.keys()}
            queue = [step_id for step_id, degree in in_degree.items() if degree == 0]
            result = []

            while queue:
                step_id = queue.pop(0)
                result.append(step_id)

                # Update dependencies
                for dependent in dependencies.get(step_id, []):
                    in_degree[dependent] -= 1
                    if in_degree[dependent] == 0:
                        queue.append(dependent)

            # Add any remaining steps (shouldn't happen if graph is acyclic)
            for step_id in step_map.keys():
                if step_id not in result:
                    result.append(step_id)

            return result

        execution_order = topological_sort()

        # Build flow steps and collect handler imports
        steps_code = []
        context_vars = []
        result_vars = []
        handler_imports: Set[str] = set()  # Track unique handler imports
        schema_imports: Set[str] = set()  # Track unique schema imports
        validation_code: List[str] = []  # Collect validation code
        validated_vars: Dict[str, str] = {}  # Map original vars to validated vars (body -> validatedBody)
        step_results: Dict[str, str] = {}  # Map step_id -> variable_name for passing results

        # Process steps in topological order
        step_number = 0
        for step_id in execution_order:
            step = step_map.get(step_id)
            if not step:
                continue
            step_kind = step.get("kind", "")
            step_id = step.get("stepId", "")

            # Get step number from config or auto-generate
            step_number += 1
            config_step_number = step.get("stepNumber", step.get("step", step_number))

            if step_kind == "bff-internal":
                if step_id == "extractContext":
                    # Context is already extracted from JWT in handler
                    steps_code.append(f"    // Step {config_step_number}: Extract context from JWT (orgId, accountId)")
                    # Extract path parameters (non-auth parameters)
                    for param_name in path_params:
                        # Skip orgId - it comes from JWT context, not URL
                        if param_name.lower() != "orgid" and param_name not in context_vars:
                            steps_code.append(f"    const {param_name} = params.{param_name} || '';")
                            context_vars.append(param_name)
                elif step_id == "composeResponse":
                    steps_code.append(f"    // Step {config_step_number}: Compose response from previous steps")
                    # Build result object from all backend call results
                    if result_vars:
                        result_obj = ",\n      ".join([f"{var}: {var}" for var in result_vars])
                        steps_code.append(f"    const result = {{\n      {result_obj}\n    }};")
                    else:
                        steps_code.append("    const result = {};")
            elif step_kind == "backend-call":
                service = step.get("service", "")
                operation_id_call = step.get("operationId", "")
                handler_field = step.get("handler", "")
                method = step.get("method", "").upper()
                path_template = step.get("pathTemplate", "")

                # Map service to domain (EXCHANGE -> exchange)
                domain = HandlerMapper.map_service_to_domain(service)

                # Map YAML handler name to actual core handler name
                # This handles cases where YAML names don't match actual handler names
                handler_name = HandlerDiscovery.map_handler_name(
                    handler_field if handler_field else operation_id_call,
                    domain,
                    operation_id_call,
                    project_root
                )

                # Generate readable variable name FIRST (needed for inputFrom processing)
                var_name = FlowBuilder.generate_readable_variable_name(
                    step_id, handler_name, service, operation_id_call
                )

                # Map handler to repository (listMarkets -> marketRepo)
                repo_var = HandlerMapper.map_handler_to_repo(operation_id_call, handler_field)

                # Get handler import path
                handler_import_path = HandlerMapper.get_handler_import_path(domain, handler_name)
                handler_imports.add(f'import {{ {handler_name} }} from "{handler_import_path}";')

                # Determine handler signature
                verb = extract_verb_from_operation_id(handler_name)
                signature = HandlerMapper.determine_handler_signature(verb, method)

                # Map handler to schema for validation
                schema_name = ValidationMapper.map_handler_to_schema_name(handler_name, verb, method)
                if schema_name:
                    schema_import = ValidationMapper.get_schema_import(domain, schema_name)
                    if schema_import:
                        schema_imports.add(schema_import)

                # Build handler call parameters
                handler_args = []

                # First parameter: repository
                if repo_var:
                    handler_args.append(f"deps.{repo_var}")
                else:
                    # Fallback if repo not found
                    handler_args.append("deps.marketRepo")  # Default fallback

                # Second parameter: orgId (if needed)
                if signature["needs_org_id"]:
                    handler_args.append("orgId")

                # Third parameter: entity ID (if needed, e.g., getMarket(marketId))
                if signature["needs_id"]:
                    # Extract ID from path params (e.g., marketId, orderId)
                    id_param = None
                    for param_name in path_params:
                        if param_name.lower().endswith("id") or param_name.lower() in ["symbol", "code"]:
                            id_param = param_name
                            break
                    if id_param:
                        handler_args.append(f"params.{id_param}")
                    else:
                        # Try to extract from path template
                        path_template_params = re.findall(r':(\w+)', path_template) if path_template else []
                        for param_name in path_template_params:
                            if param_name.lower() != "orgid" and (param_name.lower().endswith("id") or param_name.lower() in ["symbol", "code"]):
                                handler_args.append(f"params.{param_name}")
                                break

                # Check if this step depends on previous steps and should receive their results
                depends_on = step_depends_on.get(step_id, [])
                previous_results = {}
                for dep_step_id in depends_on:
                    if dep_step_id in step_results:
                        previous_results[dep_step_id] = step_results[dep_step_id]

                # Check if this step should receive data from a previous step
                input_from_config = step.get("inputFrom", {})
                input_var_name = None

                if input_from_config:
                    # Extract data from previous step
                    source_step_id = input_from_config.get("step", "")
                    if source_step_id and source_step_id in step_results:
                        source_var = step_results[source_step_id]

                        # Build extraction code
                        extract_config = input_from_config.get("extract", {})
                        add_config = input_from_config.get("add", {})
                        merge_with = input_from_config.get("mergeWith", None)  # "body", "query", or None

                        # Generate variable name for the input (using current step's var_name)
                        input_var_name = f"{var_name}Input"

                        # Build extraction code
                        extraction_lines = []
                        extraction_lines.append(f"    // Extract data from previous step: {source_step_id}")

                        # Start with base object (body, query, or empty)
                        if merge_with == "body":
                            # Use validated body if available, otherwise use raw body
                            # Check if body validation was done earlier (look for validatedBody variable)
                            # We check validation_code to see if body validation exists
                            has_body_validation = any("validatedBody" in line or "validated" in line.lower() for line in validation_code)
                            if has_body_validation:
                                base_obj = "validatedBody"
                            elif schema_name and "body" in validated_vars:
                                base_obj = validated_vars["body"]
                            else:
                                base_obj = "body"
                            extraction_lines.append(f"    const {input_var_name} = {{ ...{base_obj} }};")
                        elif merge_with == "query":
                            extraction_lines.append(f"    const {input_var_name} = {{ ...(query || {{}}) }};")
                        else:
                            extraction_lines.append(f"    const {input_var_name} = {{}};")

                        # Extract fields from previous step result
                        for field_name, field_path in extract_config.items():
                            # Convert path like "data.id" to JavaScript path
                            js_path = ".".join(field_path.split("."))
                            extraction_lines.append(f"    {input_var_name}.{field_name} = {source_var}.{js_path};")

                        # Add constant values
                        for field_name, field_value in add_config.items():
                            if isinstance(field_value, str):
                                extraction_lines.append(f"    {input_var_name}.{field_name} = \"{field_value}\";")
                            elif isinstance(field_value, (int, float)):
                                extraction_lines.append(f"    {input_var_name}.{field_name} = {field_value};")
                            elif isinstance(field_value, bool):
                                extraction_lines.append(f"    {input_var_name}.{field_name} = {str(field_value).lower()};")
                            elif field_value is None:
                                extraction_lines.append(f"    {input_var_name}.{field_name} = null;")
                            else:
                                # For complex objects, stringify
                                extraction_lines.append(f"    {input_var_name}.{field_name} = {repr(field_value)};")

                        # Insert extraction code before handler call
                        steps_code.extend(extraction_lines)

                # Last parameter: params/body (if needed)
                if signature["needs_params"]:
                    # List operations use query params
                    if input_var_name:
                        handler_args.append(f"{input_var_name} || {{}}")
                    else:
                        handler_args.append("query || {}")
                elif signature["needs_body"]:
                    # Create/Update operations use body
                    if input_var_name:
                        # Use extracted/merged input
                        handler_args.append(input_var_name)
                    elif schema_name and "body" in validated_vars:
                        handler_args.append(validated_vars["body"])
                    else:
                        handler_args.append("body")

                # Store result mapping for dependent steps (var_name was already generated above)
                step_results[step_id] = var_name

                # Build handler call
                handler_args_str = ", ".join(handler_args)

                # Add step number comment
                step_description = step.get("description", "")
                if step_description:
                    steps_code.append(f"    // Step {config_step_number}: {step_description}")
                else:
                    steps_code.append(f"    // Step {config_step_number}: Call {handler_name}")

                # Add comment if this step depends on previous steps
                if depends_on:
                    dep_vars = [step_results.get(dep, dep) for dep in depends_on if dep in step_results]
                    if dep_vars:
                        steps_code.append(f"    // Depends on: {', '.join(dep_vars)}")

                call_code = f"    const {var_name} = await {handler_name}({handler_args_str});"

                steps_code.append(call_code)
                result_vars.append(var_name)

        # Build return statement
        if "composeResponse" in [s.get("stepId") for s in flow_steps]:
            return_code = "    return result;"
        elif result_vars:
            # Return the last result if no composeResponse step
            return_code = f"    return {result_vars[-1]};"
        else:
            return_code = "    return {};"

        # Generate DAO usage examples comment
        dao_examples = DaoDiscovery.generate_dao_usage_examples(dao_repos) if dao_repos else ""

        # Build handler imports string
        handler_imports_str = "\n".join(sorted(handler_imports)) if handler_imports else ""

        # Build schema imports string
        schema_imports_str = "\n".join(sorted(schema_imports)) if schema_imports else ""

        # Generate validation code for body if needed
        # Check if any backend call needs body validation
        body_needs_validation = False
        body_schema_name = None
        body_domain = None
        for step in flow_steps:
            if step.get("kind") == "backend-call":
                service = step.get("service", "")
                handler_field = step.get("handler", "")
                operation_id_call = step.get("operationId", "")
                method = step.get("method", "").upper()
                domain = HandlerMapper.map_service_to_domain(service)
                handler_name = HandlerDiscovery.map_handler_name(
                    handler_field if handler_field else operation_id_call,
                    domain,
                    operation_id_call,
                    project_root
                )
                verb = extract_verb_from_operation_id(handler_name)
                signature = HandlerMapper.determine_handler_signature(verb, method)
                if signature["needs_body"]:
                    body_needs_validation = True
                    body_schema_name = ValidationMapper.map_handler_to_schema_name(handler_name, verb, method)
                    body_domain = domain
                    break  # Use first backend call's schema for body validation

        # Generate validation code for body
        validation_code_str = ""
        if body_needs_validation and body_schema_name:
            # Core exports schemas as {domain}Schemas
            # Pattern: remove hyphens, keep lowercase, add "Schemas"
            # e.g., "exchange" -> "exchangeSchemas", "fiat-banking" -> "fiatbankingSchemas"
            domain_schemas_var = f"{body_domain.replace('-', '').lower()}Schemas"
            validated_body_var = "validatedBody"
            validation_code_str = f"""    // Validate request body using core schema
    const {validated_body_var} = {domain_schemas_var}.{body_schema_name}.parse(body);"""
            validated_vars["body"] = validated_body_var
            # Update handler calls to use validated body
            # Replace "body" with validated_body_var in steps_code
            steps_code = [step.replace(', body)', f', {validated_body_var})') if ', body)' in step else step for step in steps_code]

        content = f'''/**
 * {pascal_case(flow_name)} Flow
 *
 * Business workflow that orchestrates multiple domain services.
 * Generated from OpenAPI operation: {operation_id}
 *
 * Security: orgId is extracted from JWT context, never from URL parameters.
 *
 * Available Dependencies:
 * - Core Handlers: Imported from @cuur/core and called directly (in-process)
 * - DAO Repositories: Use deps.{{repo}}Repo for direct database access
{dao_examples}
 */

import type {{ Dependencies }} from "../deps.js";
import type {{ RequestContext }} from "../context.js";
import {{ FlowError }} from "../errors/flow-error.js";
import {{ logger }} from "../logger.js";
import {{ ZodError }} from "zod";
{handler_imports_str}
{schema_imports_str}

export async function {flow_function_name}(
  {{ context, body, params, query }}: {{
    context: RequestContext; // Contains orgId, accountId from JWT
    body: any;
    params: Record<string, string>;
    query: Record<string, string>;
  }},
  deps: Dependencies
): Promise<any> {{
  const requestId = context.accountId + "-" + Date.now();

  logger.info({{
    requestId,
    orgId: context.orgId,
    accountId: context.accountId,
    operation: "{operation_id}",
  }}, "Starting {flow_function_name}");

  try {{
    // Extract orgId from JWT context (never from URL)
    const orgId = context.orgId;
    const accountId = context.accountId;

{validation_code_str}

{chr(10).join(steps_code)}

    logger.info({{ requestId }}, "Completed {flow_function_name} successfully");

{return_code}
  }} catch (error: unknown) {{
    if (error instanceof ZodError) {{
      logger.warn({{ requestId, errors: error.errors }}, "Validation error in {flow_function_name}");
      throw new FlowError("VALIDATION_ERROR", "Request validation failed", 400, error.errors);
    }}

    if (error instanceof FlowError) {{
      logger.warn({{ requestId, code: error.code, message: error.message }}, "Flow error in {flow_function_name}");
      throw error;
    }}

    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    logger.error({{ requestId, error: errorMessage, stack: errorStack }}, "Unexpected error in {flow_function_name}");
    throw new FlowError("INTERNAL_ERROR", errorMessage, 500);
  }}
}}
'''
        return content
