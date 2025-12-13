"""
String manipulation utilities
"""

import re
from typing import Optional
import inflection


def camel_case(text: str) -> str:
    """Convert text to camelCase"""
    # Handle kebab-case, snake_case first (before checking if already camelCase)
    if "-" in text or "_" in text or " " in text:
        text = re.sub(r"[-_\s]+", " ", text)
        words = text.split()
        if not words:
            return ""
        return words[0].lower() + "".join(word.capitalize() for word in words[1:])

    # If already camelCase (starts with lowercase, no separators), return as-is
    if text and text[0].islower() and not "_" in text and not "-" in text:
        return text

    # Handle PascalCase (e.g., "ChainAdapter" -> "chainAdapter")
    if text and text[0].isupper() and not "_" in text and not "-" in text:
        # Split on capital letters
        words = re.findall(r'[A-Z][a-z]*', text)
        if words:
            return words[0].lower() + "".join(words[1:])

    # Fallback: treat as single word
    return text.lower() if text else ""


def pascal_case(text: str) -> str:
    """Convert text to PascalCase"""
    # If already PascalCase (starts with uppercase, no separators), return as-is
    if text and text[0].isupper() and not "_" in text and not "-" in text and not " " in text:
        return text

    # Handle camelCase - split on capital letters
    if text and text[0].islower():
        # Split camelCase into words
        words = re.findall(r'[a-z]+|[A-Z][a-z]*', text)
        if words:
            return "".join(word.capitalize() for word in words)

    # Handle snake_case, kebab-case
    text = re.sub(r"[-_\s]+", " ", text)
    words = text.split()
    if not words:
        return ""
    return "".join(word.capitalize() for word in words)


def kebab_case(text: str) -> str:
    """Convert text to kebab-case"""
    # Handle camelCase, PascalCase, snake_case
    text = re.sub(r"([a-z])([A-Z])", r"\1-\2", text)
    text = re.sub(r"[-_\s]+", "-", text)
    return text.lower()


def snake_case(text: str) -> str:
    """Convert text to snake_case"""
    # Handle camelCase, PascalCase, kebab-case
    text = re.sub(r"([a-z])([A-Z])", r"\1_\2", text)
    text = re.sub(r"[-_\s]+", "_", text)
    return text.lower()


def pluralize(text: str) -> str:
    """Pluralize a word"""
    return inflection.pluralize(text)


def pluralize_resource_name(resource_name: str) -> str:
    """
    Pluralize resource name with edge case handling

    Edge cases that are already plural or shouldn't pluralize:
    - status, liveness, readiness, class, case
    """
    # Edge cases that are already plural or shouldn't pluralize
    plural_edge_cases = {
        "status", "liveness", "readiness", "class", "case"
    }

    # Check if entire resource matches edge case
    lower_resource = resource_name.lower()
    if lower_resource in plural_edge_cases:
        return resource_name

    # For compound words (e.g., "shareholder-registry"), check the last part
    parts = lower_resource.split("-")
    if len(parts) > 1:
        last_part = parts[-1]
        if last_part in plural_edge_cases:
            return resource_name  # Don't pluralize if last part is edge case

    # Use inflection for normal pluralization
    return inflection.pluralize(resource_name)


def singularize(text: str) -> str:
    """Singularize a word"""
    return inflection.singularize(text)


def extract_resource_from_operation_id(operation_id: str) -> str:
    """
    Extract resource name from operation ID

    Examples:
        createMarket -> Market
        updateOrder -> Order
        getWalletById -> Wallet
        listChains -> Chain
    """
    # Remove common verbs
    verbs = ["create", "update", "delete", "get", "list", "patch", "post", "put"]

    for verb in verbs:
        if operation_id.lower().startswith(verb.lower()):
            remaining = operation_id[len(verb):]
            if remaining:
                # Capitalize first letter
                return remaining[0].upper() + remaining[1:]

    # If no verb found, assume first word is verb
    # Try to extract resource (usually second word in camelCase)
    match = re.match(r"^[a-z]+([A-Z][a-zA-Z]+)", operation_id)
    if match:
        return match.group(1)

    # Fallback: return as-is capitalized
    return pascal_case(operation_id)


def extract_verb_from_operation_id(operation_id: str, http_method: Optional[str] = None, response_has_items: bool = False) -> str:
    """
    Extract HTTP verb from operation ID using centralized VerbMapper.

    This function now delegates to VerbMapper for consistent verb extraction
    across all generators. The VerbMapper supports:
    - HTTP method → verb mapping
    - Operation ID pattern matching
    - Response structure refinement

    Args:
        operation_id: The operation ID from OpenAPI spec
        http_method: Optional HTTP method (lowercase: "get", "post", etc.)
        response_has_items: Whether response has data.items structure (list-like)

    Returns:
        Verb string: "create", "list", "get", "update", "delete"
    """
    from cuur_codegen.utils.verb_mapping import VerbMapper
    return VerbMapper.get_verb(operation_id, http_method, response_has_items)


def build_type_name(resource: str, suffix: str = "") -> str:
    """Build a type name from resource and suffix"""
    resource_pascal = pascal_case(resource)
    if suffix:
        suffix_pascal = pascal_case(suffix)
        return f"{resource_pascal}{suffix_pascal}"
    return resource_pascal


def build_function_name(resource: str, verb: str) -> str:
    """Build a function name from resource and verb"""
    resource_camel = camel_case(resource)
    verb_lower = verb.lower()
    return f"{verb_lower}{resource_camel[0].upper()}{resource_camel[1:]}" if resource_camel else verb_lower
