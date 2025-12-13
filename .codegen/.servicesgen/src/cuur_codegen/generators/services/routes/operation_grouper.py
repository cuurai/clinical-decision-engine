"""
Operation Grouper

Groups operations by resource for route file generation
"""

from typing import Dict, Any, List
from cuur_codegen.utils.string import camel_case, pluralize_resource_name
import re


class OperationGrouper:
    """Groups operations by resource"""

    @staticmethod
    def group_operations_by_resource(
        operations: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Group operations by resource name extracted from operationId

        Example:
        - listMarkets -> markets
        - getMarket -> markets
        - createMarket -> markets
        """
        resource_map: Dict[str, List[Dict[str, Any]]] = {}

        for op_data in operations:
            operation = op_data.get("operation", {})
            operation_id = operation.get("operationId") or op_data.get("operation_id", "")

            if not operation_id:
                continue

            # Extract resource from operationId (e.g., listMarkets -> markets)
            resource_match = re.match(r"^(list|get|create|update|delete|patch)([A-Z]\w+)", operation_id)
            if resource_match:
                resource = pluralize_resource_name(camel_case(resource_match.group(2)))

                if resource not in resource_map:
                    resource_map[resource] = []

                resource_map[resource].append(op_data)

        return resource_map
