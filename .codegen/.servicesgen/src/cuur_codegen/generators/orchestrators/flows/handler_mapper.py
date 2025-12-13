"""
Handler Mapper - Maps handler names to repositories and import paths
"""

import re
from typing import Dict, Optional, Tuple
from cuur_codegen.utils.string import camel_case, kebab_case, extract_resource_from_operation_id, extract_verb_from_operation_id


class HandlerMapper:
    """Maps handler names to repositories and import paths"""

    # Map of operation patterns to repository names
    # Format: (verb, resource_pattern) -> repo_var_name
    OPERATION_TO_REPO_MAP = {
        # Exchange domain
        ("list", "markets"): "marketRepo",
        ("get", "market"): "marketRepo",
        ("create", "market"): "marketRepo",
        ("update", "market"): "marketRepo",
        ("delete", "market"): "marketRepo",
        ("list", "orders"): "orderRepo",
        ("get", "order"): "orderRepo",
        ("create", "order"): "orderRepo",
        ("update", "order"): "orderRepo",
        ("cancel", "order"): "orderRepo",
        ("delete", "order"): "orderRepo",
        ("list", "trades"): "tradeRepo",
        ("get", "trade"): "tradeRepo",
        ("list", "halts"): "haltRepo",
        ("get", "halt"): "haltRepo",
        ("create", "halt"): "haltRepo",
        ("update", "halt"): "haltRepo",
        ("list", "positions"): "positionRepo",
        ("get", "position"): "positionRepo",
        ("list", "marketmakerquotes"): "marketMakerQuoteRepo",
        ("get", "marketmakerquote"): "marketMakerQuoteRepo",
        ("create", "marketmakerquote"): "marketMakerQuoteRepo",
        ("update", "marketmakerquote"): "marketMakerQuoteRepo",
        # Risk-limits domain
        ("list", "risklimits"): "riskLimitRepo",
        ("get", "risklimit"): "riskLimitRepo",
        ("list", "circuitbreakers"): "circuitBreakerRepo",
        ("get", "circuitbreaker"): "circuitBreakerRepo",
        # Add more mappings as needed
    }

    @staticmethod
    def map_service_to_domain(service: str) -> str:
        """Map service name (EXCHANGE) to domain name (exchange)"""
        return service.lower().replace('_', '-')

    @staticmethod
    def extract_handler_name(handler_field: str) -> str:
        """Extract handler function name from handler field (listMarketsHandler -> listMarkets)"""
        # Remove "Handler" suffix if present
        if handler_field.endswith("Handler"):
            return handler_field[:-7]  # Remove "Handler"
        return handler_field

    @staticmethod
    def map_handler_to_repo(operation_id: str, handler_name: Optional[str] = None) -> Optional[str]:
        """
        Map handler/operation to repository variable name

        Args:
            operation_id: Operation ID (e.g., "listMarkets", "deleteOrdersorderid")
            handler_name: Optional handler name (e.g., "listMarketsHandler")

        Returns:
            Repository variable name (e.g., "marketRepo") or None if not found
        """
        # Use handler_name if provided, otherwise use operation_id
        name = HandlerMapper.extract_handler_name(handler_name) if handler_name else operation_id

        verb = extract_verb_from_operation_id(name)
        resource = extract_resource_from_operation_id(name)

        # Handle malformed operation IDs like "deleteOrdersorderid" -> extract "order"
        # Pattern: verb + "Orders" + "orderid" -> should extract "order"
        if re.match(r'^(delete|update|get|list)Orders.*', name, re.IGNORECASE):
            resource = "Order"
        elif re.match(r'^(delete|update|get|list)Trades.*', name, re.IGNORECASE):
            resource = "Trade"
        elif re.match(r'^(delete|update|get|list)Markets.*', name, re.IGNORECASE):
            resource = "Market"
        elif re.match(r'^(delete|update|get|list)Halts.*', name, re.IGNORECASE):
            resource = "Halt"
        elif re.match(r'^(delete|update|get|list)Positions.*', name, re.IGNORECASE):
            resource = "Position"

        # Normalize resource name (remove pluralization for matching)
        resource_lower = resource.lower()

        # Try exact match first
        key = (verb.lower(), resource_lower)
        if key in HandlerMapper.OPERATION_TO_REPO_MAP:
            return HandlerMapper.OPERATION_TO_REPO_MAP[key]

        # Try with singularized resource
        # For list operations, resource is plural (markets), but repo might be singular
        if verb.lower() == "list" and resource_lower.endswith("s"):
            singular_resource = resource_lower[:-1]  # Remove trailing 's'
            key = (verb.lower(), singular_resource)
            if key in HandlerMapper.OPERATION_TO_REPO_MAP:
                return HandlerMapper.OPERATION_TO_REPO_MAP[key]

        # Fallback: derive from resource name
        # listMarkets -> Markets -> marketRepo
        # listPreTradeCheckLogs -> PreTradeCheckLogs -> PreTradeCheckLog -> preTradeCheckLogRepo
        # Use original resource (with proper casing) for camelCase conversion
        resource_singular = resource.rstrip("s") if resource.lower().endswith("s") else resource
        repo_var = camel_case(resource_singular) + "Repo"
        return repo_var

    @staticmethod
    def get_handler_import_path(domain: str, handler_name: str) -> str:
        """
        Get import path for handler from @cuur/core

        Args:
            domain: Domain name (e.g., "exchange")
            handler_name: Handler function name (e.g., "listMarkets")

        Returns:
            Import path (e.g., "@cuur/core/exchange/handlers/index.js")
        """
        # Handlers are exported from domain/handlers/index.js
        return f"@cuur/core/{domain}/handlers/index.js"

    @staticmethod
    def determine_handler_signature(verb: str, method: str) -> Dict[str, bool]:
        """
        Determine handler signature based on verb and HTTP method

        Returns:
            Dict with: needs_org_id, needs_id, needs_params, needs_body
        """
        verb_lower = verb.lower()
        method_upper = method.upper()

        # All handlers need orgId except simple get operations (but even get operations need orgId for security)
        # Delete, update, cancel operations need orgId + id
        # List operations need orgId + params
        # Create operations need orgId + body
        needs_org_id = verb_lower in ["list", "create", "update", "delete", "cancel", "patch", "get"]
        needs_id = verb_lower in ["get", "update", "delete", "cancel", "patch"]
        needs_params = verb_lower == "list"  # List operations use query params
        needs_body = method_upper in ["POST", "PUT", "PATCH"] and verb_lower in ["create", "update"]

        return {
            "needs_org_id": needs_org_id,
            "needs_id": needs_id,
            "needs_params": needs_params,
            "needs_body": needs_body,
        }
