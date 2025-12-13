"""
Handler Discovery - Discovers actual handler function names from core package
"""

import re
from pathlib import Path
from typing import Dict, List, Optional, Set
from cuur_codegen.utils.string import camel_case, extract_verb_from_operation_id, extract_resource_from_operation_id


class HandlerDiscovery:
    """Discovers actual handler function names from core package"""

    # Mapping from YAML handler names to actual core handler names
    # Format: (domain, yaml_handler_name) -> actual_handler_name
    HANDLER_NAME_MAP = {
        # Fiat-banking domain
        ("fiat-banking", "listBankingaccounts"): "listFiatAccounts",
        ("fiat-banking", "listBankingaccountsHandler"): "listFiatAccounts",
        # Custodian domain
        ("custodian", "listCustodyaccounts"): "listCustodyAccounts",
        ("custodian", "listCustodyaccountsHandler"): "listCustodyAccounts",
        # Treasury domain
        ("treasury", "listEscrows"): "listEscrowAccounts",
        ("treasury", "listEscrowsHandler"): "listEscrowAccounts",
        # Add more mappings as needed
    }

    @staticmethod
    def discover_handlers(domain: str, project_root: Path) -> Set[str]:
        """
        Discover actual handler function names from core package handlers index.ts

        Args:
            domain: Domain name (e.g., "fiat-banking")
            project_root: Project root path

        Returns:
            Set of handler function names
        """
        handlers: Set[str] = set()

        # Try to find core handlers directory
        core_handlers_path = project_root / "packages" / "core" / "packages" / "core" / "src" / domain / "handlers" / "index.ts"

        if not core_handlers_path.exists():
            # Try alternative path
            core_handlers_path = project_root.parent / "packages" / "core" / "packages" / "core" / "src" / domain / "handlers" / "index.ts"

        if not core_handlers_path.exists():
            return handlers

        try:
            # Read the index.ts file
            with open(core_handlers_path, "r", encoding="utf-8") as f:
                content = f.read()

            # Extract exported function names from "export * from" statements
            # Pattern: export * from "./fiat-accounts/index.js";
            # Then we need to read those sub-index files to get actual function names

            # For now, we'll use a simpler approach: scan handler files directly
            handlers_dir = core_handlers_path.parent
            for handler_file in handlers_dir.rglob("*.handler.ts"):
                try:
                    with open(handler_file, "r", encoding="utf-8") as hf:
                        handler_content = hf.read()
                        # Extract function name: export async function listFiatAccounts(
                        match = re.search(r'export\s+async\s+function\s+(\w+)', handler_content)
                        if match:
                            handlers.add(match.group(1))
                except Exception:
                    continue
        except Exception:
            pass

        return handlers

    @staticmethod
    def map_handler_name(yaml_handler_name: str, domain: str, operation_id: str, project_root: Path) -> str:
        """
        Map YAML handler name to actual core handler function name

        Args:
            yaml_handler_name: Handler name from YAML (e.g., "listBankingaccountsHandler")
            domain: Domain name (e.g., "fiat-banking")
            operation_id: Operation ID from YAML (e.g., "listBankingaccounts")
            project_root: Project root path

        Returns:
            Actual handler function name (e.g., "listFiatAccounts")
        """
        # Remove "Handler" suffix if present
        clean_name = HandlerDiscovery._extract_handler_name(yaml_handler_name)

        # Check explicit mapping first (for known mismatches)
        key = (domain, clean_name)
        if key in HandlerDiscovery.HANDLER_NAME_MAP:
            return HandlerDiscovery.HANDLER_NAME_MAP[key]

        # Check with Handler suffix
        key_with_handler = (domain, yaml_handler_name)
        if key_with_handler in HandlerDiscovery.HANDLER_NAME_MAP:
            return HandlerDiscovery.HANDLER_NAME_MAP[key_with_handler]

        # Try to discover handlers and find best match
        available_handlers = HandlerDiscovery.discover_handlers(domain, project_root)

        if available_handlers:
            # Try exact match first
            if clean_name in available_handlers:
                return clean_name

            # Try fuzzy matching: extract verb and resource, then match
            verb = extract_verb_from_operation_id(clean_name)
            resource = extract_resource_from_operation_id(clean_name)

            # Normalize resource names for comparison (remove common prefixes/suffixes)
            normalized_resource = HandlerDiscovery._normalize_resource_name(resource)

            # Try to find handler with same verb and similar resource
            best_match = None
            best_score = 0

            for handler_name in available_handlers:
                handler_verb = extract_verb_from_operation_id(handler_name)
                handler_resource = extract_resource_from_operation_id(handler_name)
                normalized_handler_resource = HandlerDiscovery._normalize_resource_name(handler_resource)

                if handler_verb.lower() == verb.lower():
                    # Calculate similarity score
                    score = HandlerDiscovery._calculate_similarity(
                        normalized_resource, normalized_handler_resource
                    )

                    if score > best_score:
                        best_score = score
                        best_match = handler_name

                    # If resources match exactly (after normalization), use it
                    if normalized_resource.lower() == normalized_handler_resource.lower():
                        return handler_name

            # Use best match if score is reasonable (> 0.5)
            if best_match and best_score > 0.5:
                return best_match

            # Fallback: find any handler with matching verb (prefer list handlers for list operations)
            # BUT: Only use this fallback if we haven't found an exact match
            # The exact match check above should have caught it, so this should rarely be needed
            if verb.lower() == "list":
                # Try to find handler that matches the resource name more closely
                for handler_name in sorted(available_handlers):  # Sort for deterministic ordering
                    handler_verb = extract_verb_from_operation_id(handler_name)
                    if handler_verb.lower() == "list":
                        # Prefer handlers that contain the resource name
                        handler_resource = extract_resource_from_operation_id(handler_name)
                        if resource.lower() in handler_resource.lower() or handler_resource.lower() in resource.lower():
                            return handler_name
                # If no resource match, return first list handler (but this should rarely happen)
                for handler_name in sorted(available_handlers):
                    handler_verb = extract_verb_from_operation_id(handler_name)
                    if handler_verb.lower() == "list":
                        return handler_name

            # Last resort: any handler with matching verb
            for handler_name in available_handlers:
                handler_verb = extract_verb_from_operation_id(handler_name)
                if handler_verb.lower() == verb.lower():
                    return handler_name

        # Final fallback: return cleaned name (might not exist, but at least it's consistent)
        return clean_name

    @staticmethod
    def _normalize_resource_name(resource: str) -> str:
        """Normalize resource name for comparison (remove common prefixes/suffixes)"""
        normalized = resource

        # Remove common prefixes
        prefixes = ["banking", "fiat", "custody", "escrow", "wallet"]
        for prefix in prefixes:
            if normalized.lower().startswith(prefix.lower()):
                normalized = normalized[len(prefix):]
                break

        # Remove pluralization
        if normalized.lower().endswith("s") and len(normalized) > 1:
            normalized = normalized[:-1]

        # Remove "account" suffix (common in many domains)
        if normalized.lower().endswith("account"):
            normalized = normalized[:-7]

        return normalized

    @staticmethod
    def _calculate_similarity(str1: str, str2: str) -> float:
        """Calculate similarity score between two strings (0.0 to 1.0)"""
        str1_lower = str1.lower()
        str2_lower = str2.lower()

        # Exact match
        if str1_lower == str2_lower:
            return 1.0

        # Substring match
        if str1_lower in str2_lower or str2_lower in str1_lower:
            return 0.8

        # Character overlap
        set1 = set(str1_lower)
        set2 = set(str2_lower)
        intersection = set1 & set2
        union = set1 | set2

        if len(union) == 0:
            return 0.0

        return len(intersection) / len(union)

    @staticmethod
    def _extract_handler_name(handler_field: str) -> str:
        """Extract handler function name from handler field (listMarketsHandler -> listMarkets)"""
        # Remove "Handler" suffix if present
        if handler_field.endswith("Handler"):
            return handler_field[:-7]  # Remove "Handler"
        return handler_field
