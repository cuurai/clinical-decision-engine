"""
Naming utilities for consistent file and directory naming across all generators
"""

from typing import Tuple
from cuur_codegen.utils.string import (
    kebab_case,
    camel_case,
    pascal_case,
    pluralize_resource_name,
    singularize,
    extract_resource_from_operation_id,
    extract_verb_from_operation_id,
)


class NamingConvention:
    """
    Centralized naming convention utilities for consistent file naming
    across all generators (handlers, repositories, converters, etc.)
    """

    @staticmethod
    def handler_directory(resource: str) -> str:
        """
        Get handler directory name for a resource (pluralized, kebab-cased)

        Examples:
            Chain -> chains
            ChainAdapter -> chain-adapters
            WalletBalance -> wallet-balances
        """
        plural = pluralize_resource_name(resource)
        return kebab_case(plural)

    @staticmethod
    def handler_filename(operation_id: str) -> Tuple[str, str]:
        """
        Get handler filename for an operation

        Returns:
            Tuple of (filename_without_ext, resource_name)

        Examples:
            listChains -> (list-chains, chains)
            createChain -> (create-chain, chain)
            getChainAdapter -> (get-chain-adapter, chain-adapter)
        """
        verb = extract_verb_from_operation_id(operation_id)
        resource = extract_resource_from_operation_id(operation_id)

        # For list operations, keep plural form in filename
        # For other operations, use singular form
        if verb == "list":
            filename_resource = resource  # Keep plural (e.g., "Chains")
        else:
            # Use singular for non-list operations
            filename_resource = resource.rstrip("s") if resource.endswith("s") and len(resource) > 1 else resource

        filename = f"{kebab_case(verb)}-{kebab_case(filename_resource)}"
        return filename, kebab_case(filename_resource)

    @staticmethod
    def repository_filename(resource: str) -> str:
        """
        Get repository filename for a resource (kebab-case, singular)

        Examples:
            Chain -> chain-repository.ts
            ChainAdapter -> chain-adapter-repository.ts
            WalletBalance -> wallet-balance-repository.ts
        """
        # Use singular form for repository files
        singular = resource.rstrip("s") if resource.endswith("s") and len(resource) > 1 else resource
        return f"{kebab_case(singular)}-repository.ts"

    @staticmethod
    def converter_filename(domain_name: str) -> str:
        """
        Get converter filename for a domain

        Examples:
            blockchain -> blockchain-converters.ts
            exchange -> exchange-converters.ts
        """
        return f"{kebab_case(domain_name)}-converters.ts"

    @staticmethod
    def handler_function_name(operation_id: str) -> str:
        """
        Get handler function name (camelCase)

        Examples:
            listChains -> listChains
            createChain -> createChain
            getChainAdapter -> getChainAdapter
        """
        return camel_case(operation_id)

    @staticmethod
    def repository_type_name(resource: str) -> str:
        """
        Get repository type name (PascalCase)

        Examples:
            Chain -> ChainRepository
            ChainAdapter -> ChainAdapterRepository
        """
        return f"{pascal_case(resource)}Repository"

    @staticmethod
    def resource_for_grouping(operation_id: str) -> str:
        """
        Get resource name for grouping operations (singular for grouping)

        Examples:
            listChains -> Chain (singular for grouping)
            listTokenClasses -> TokenClass (proper singularization)
            createChain -> Chain
            getChainAdapter -> ChainAdapter
            getRiskLimits -> RiskLimit (singularize for consistency)
            updateRiskLimits -> RiskLimit (singularize for consistency)
        """
        verb = extract_verb_from_operation_id(operation_id)
        resource = extract_resource_from_operation_id(operation_id)

        # For list operations, use proper singularization for grouping
        # This ensures "TokenClasses" -> "TokenClass" not "TokenClasse"
        if verb == "list":
            # Use inflection library for proper singularization
            singular = singularize(resource)
            # Preserve PascalCase if resource was PascalCase
            if resource[0].isupper():
                return singular[0].upper() + singular[1:] if len(singular) > 1 else singular.upper()
            return singular

        # For other operations, also singularize if resource ends with 's' (plural)
        # This ensures consistent grouping (e.g., getRiskLimits and updateRiskLimit both group to RiskLimit)
        # But preserve resources that are already singular or don't end with 's'
        if resource.lower().endswith('s') and len(resource) > 1:
            # Use inflection library for proper singularization
            singular = singularize(resource)
            # Preserve PascalCase if resource was PascalCase
            if resource[0].isupper():
                return singular[0].upper() + singular[1:] if len(singular) > 1 else singular.upper()
            return singular

        return resource
