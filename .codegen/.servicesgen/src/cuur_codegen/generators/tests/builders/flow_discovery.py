"""
Flow Discovery Utility

Discovers orchestrator flows from orchestrator domains
"""

from pathlib import Path
from typing import List, Optional
from dataclasses import dataclass
import re
import yaml
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, kebab_case


@dataclass
class FlowInfo:
    """Flow information"""
    flow_name: str  # e.g., "tradingPlaceOrderFlow"
    operation_id: str  # e.g., "createTradingPlaceOrder"
    verb: str  # create, list, get, update, delete
    resource: str  # e.g., "tradingPlaceOrder"
    flow_file: str  # Path to flow file
    has_body: bool  # Whether flow expects body parameter
    has_params: bool  # Whether flow expects path params
    has_query: bool  # Whether flow expects query params
    orchestrator_domain: str  # e.g., "trading-markets"


class FlowDiscovery:
    """Discovers orchestrator flows from orchestrator domains"""

    @staticmethod
    def discover_flows(
        orchestrator_domain: str,
        context: GenerationContext
    ) -> List[FlowInfo]:
        """
        Discover flows for an orchestrator domain from YAML (source of truth)
        Validates that corresponding generated flow files exist

        Args:
            orchestrator_domain: Orchestrator domain name (e.g., "trading-markets")
            context: Generation context

        Returns:
            List of FlowInfo objects
        """
        flows: List[FlowInfo] = []
        project_root = context.config.paths.project_root

        # YAML is the source of truth
        yaml_spec_path = project_root / "orchestrators" / "openapi" / "src" / "yaml" / f"{orchestrator_domain}.yaml"

        if not yaml_spec_path.exists():
            context.logger.warn(
                f"YAML spec not found for orchestrator domain {orchestrator_domain} at {yaml_spec_path}"
            )
            return flows

        try:
            # Read YAML spec (source of truth)
            with open(yaml_spec_path, "r", encoding="utf-8") as f:
                spec = yaml.safe_load(f)

            paths = spec.get("paths", {})
            flows_path = project_root / "orchestrators" / "domains" / "src" / orchestrator_domain / "flows"

            # Discover flows from YAML
            for path, methods in paths.items():
                for method, operation in methods.items():
                    # Only process operations with orchestration flows
                    flow_steps = operation.get("x-orchestration-flow", [])
                    if not flow_steps:
                        continue

                    operation_id = operation.get("operationId", "")
                    if not operation_id:
                        continue

                    # Find corresponding generated flow file
                    flow_file = FlowDiscovery._find_flow_file(
                        operation_id, path, orchestrator_domain, project_root
                    )

                    # Validate that generated code exists
                    if not flow_file.exists():
                        context.logger.warn(
                            f"Generated flow file missing for operation {operation_id} "
                            f"(path: {path}). Run: python3 -m cuur_codegen.cli.main generate "
                            f"--domain {orchestrator_domain} --layer orchestrators"
                        )
                        # Continue anyway - test will fail at runtime if file doesn't exist

                    # Extract flow information from YAML
                    flow_name = FlowDiscovery._derive_flow_name(operation_id, path)

                    # Get operation details from YAML
                    has_body = method.upper() in ["POST", "PUT", "PATCH"]
                    parameters = operation.get("parameters", [])
                    has_params = bool([p for p in parameters if p.get("in") == "path"])
                    has_query = bool([p for p in parameters if p.get("in") == "query"])

                    # Extract verb and resource
                    verb = FlowDiscovery._extract_verb(operation_id, flow_name)
                    resource = FlowDiscovery._extract_resource(operation_id, flow_name, verb)

                    flow_info = FlowInfo(
                        flow_name=flow_name,
                        operation_id=operation_id,
                        verb=verb,
                        resource=resource,
                        flow_file=str(flow_file),
                        has_body=has_body,
                        has_params=has_params,
                        has_query=has_query,
                        orchestrator_domain=orchestrator_domain,
                    )
                    flows.append(flow_info)

        except Exception as error:
            context.logger.error(f"Error discovering flows from YAML for {orchestrator_domain}: {error}")
            raise

        return flows

    @staticmethod
    def _find_flow_file(
        operation_id: str,
        path: str,
        orchestrator_domain: str,
        project_root: Path
    ) -> Path:
        """
        Find the generated flow file for an operation.
        Matches FlowBuilder.generate_flows() naming convention:
        - flow_name = operation_id with verb removed, then kebab_case
        - path_suffix = sanitized path (/-separated, {param} -> param)
        - filename = {flow_name}{path_suffix}.flow.ts
        """
        flows_path = project_root / "orchestrators" / "domains" / "src" / orchestrator_domain / "flows"

        if not flows_path.exists():
            # Return expected path even if directory doesn't exist (for validation)
            flow_name = FlowDiscovery._derive_flow_name_from_operation_id(operation_id)
            return flows_path / f"{kebab_case(flow_name)}.flow.ts"

        # Match FlowBuilder logic: remove verb prefix from operation_id
        flow_name = FlowDiscovery._derive_flow_name_from_operation_id(operation_id)
        flow_name_kebab = kebab_case(flow_name)

        # Build path suffix (matches FlowBuilder logic)
        path_suffix = ""
        if path and path != "/":
            path_clean = path.strip("/").replace("/", "-")
            # Remove path parameters like {symbol} -> symbol
            path_clean = re.sub(r'\{(\w+)\}', r'\1', path_clean)
            path_suffix = f"-{path_clean}" if path_clean else ""

        # Try exact match first
        expected_filename = f"{flow_name_kebab}{path_suffix}.flow.ts"
        flow_file = flows_path / expected_filename
        if flow_file.exists():
            return flow_file

        # Try without path suffix (for operations without path params)
        if path_suffix:
            flow_file = flows_path / f"{flow_name_kebab}.flow.ts"
            if flow_file.exists():
                return flow_file

        # Fallback: search for any file containing flow_name_kebab or operation_id parts
        # Also try matching by operation_id kebab (for cases where naming differs)
        operation_id_kebab = kebab_case(operation_id)
        for flow_file in flows_path.glob("*.flow.ts"):
            stem = flow_file.stem
            # Match if stem contains flow_name_kebab or operation_id_kebab
            if flow_name_kebab in stem or operation_id_kebab in stem:
                return flow_file

        # Return expected path even if it doesn't exist (for validation)
        return flows_path / expected_filename

    @staticmethod
    def _derive_flow_name_from_operation_id(operation_id: str) -> str:
        """
        Derive flow name from operation ID (matches FlowBuilder logic).
        Removes verb prefixes: get, create, list, update, delete
        """
        flow_name = operation_id
        verbs = ["get", "create", "list", "update", "delete", "cancel", "patch"]

        for verb in verbs:
            if flow_name.startswith(verb.capitalize()):
                flow_name = flow_name[len(verb):]
                break
            elif flow_name.startswith(verb):
                flow_name = flow_name[len(verb):]
                break

        return flow_name if flow_name else operation_id

    @staticmethod
    def _derive_flow_name(operation_id: str, path: str) -> str:
        """
        Derive flow function name from operation ID.
        Pattern: {resource}Flow (camelCase)
        e.g., "createTradingPlaceOrder" -> "tradingPlaceOrderFlow"
        """
        # Remove verb prefix
        resource = FlowDiscovery._derive_flow_name_from_operation_id(operation_id)

        # Convert to camelCase and add Flow suffix
        flow_name = camel_case(resource) + "Flow"
        return flow_name

    @staticmethod
    def _extract_verb(operation_id: str, flow_name: str) -> str:
        """Extract HTTP verb from operation ID or flow name"""
        # Common verbs
        verbs = ["create", "list", "get", "update", "delete", "cancel", "patch"]

        # Check operation ID first
        operation_lower = operation_id.lower()
        for verb in verbs:
            if operation_lower.startswith(verb):
                return verb

        # Check flow name
        flow_lower = flow_name.lower().replace("flow", "")
        for verb in verbs:
            if flow_lower.startswith(verb):
                return verb

        # Default to "get" if no verb found
        return "get"

    @staticmethod
    def _extract_resource(operation_id: str, flow_name: str, verb: str) -> str:
        """Extract resource name from operation ID or flow name"""
        # Remove verb prefix
        resource = operation_id
        verb_pascal = verb.capitalize()
        if resource.startswith(verb_pascal):
            resource = resource[len(verb_pascal):]
        elif resource.startswith(verb):
            resource = resource[len(verb):]

        # Remove "Flow" suffix from flow_name
        flow_resource = flow_name.replace("Flow", "")
        if flow_resource.startswith(verb):
            flow_resource = flow_resource[len(verb):]

        # Use the shorter/more descriptive one
        if len(flow_resource) < len(resource):
            resource = flow_resource

        return camel_case(resource) if resource else "resource"
