"""
Aggregator Builder - Builds aggregator classes that combine multiple service calls
"""

from typing import Dict, Any, List
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import pascal_case, camel_case


class AggregatorBuilder:
    """Builder for aggregator classes"""

    # Common aggregator patterns
    AGGREGATOR_PATTERNS = {
        "dashboard": {
            "name": "DashboardAggregator",
            "description": "Aggregates dashboard data from multiple services",
            "services": ["exchange", "custodian", "notifications", "market-oracles"],
            "methods": [
                {
                    "name": "getDashboard",
                    "description": "Get complete dashboard data",
                    "params": ["userId: string", "orgId: string"],
                    "service_calls": [
                        {"service": "exchange", "method": "listTrades", "params": ["userId", "{ limit: 10 }"]},
                        {"service": "custodian", "method": "getCustodyBalances", "params": ["orgId"]},
                        {"service": "notifications", "method": "listNotificationHistory", "params": ["userId", "{ limit: 5 }"]},
                        {"service": "market-oracles", "method": "getMarketSummary", "params": []},
                    ],
                },
            ],
        },
        "portfolio": {
            "name": "PortfolioAggregator",
            "description": "Aggregates portfolio data from multiple services",
            "services": ["custodian", "exchange", "treasury"],
            "methods": [
                {
                    "name": "getPortfolio",
                    "description": "Get complete portfolio overview",
                    "params": ["userId: string", "orgId: string"],
                    "service_calls": [
                        {"service": "custodian", "method": "getCustodyBalances", "params": ["orgId"]},
                        {"service": "exchange", "method": "listPositions", "params": ["userId"]},
                        {"service": "treasury", "method": "listEscrowAccounts", "params": ["orgId"]},
                    ],
                },
            ],
        },
        "trading": {
            "name": "TradingAggregator",
            "description": "Aggregates trading-related data",
            "services": ["exchange", "risk-limits", "market-oracles"],
            "methods": [
                {
                    "name": "getTradingContext",
                    "description": "Get trading context with limits and market data",
                    "params": ["userId: string", "orgId: string"],
                    "service_calls": [
                        {"service": "exchange", "method": "listMarkets", "params": ["orgId"]},
                        {"service": "risk-limits", "method": "getRiskLimits", "params": ["userId"]},
                        {"service": "market-oracles", "method": "getPriceTicks", "params": []},
                    ],
                },
            ],
        },
    }

    @staticmethod
    def build_aggregator(
        context: GenerationContext,
        aggregator_name: str,
        pattern: Dict[str, Any],
        header: str,
    ) -> str:
        """
        Build an aggregator class.

        Args:
            context: Generation context
            aggregator_name: Name of the aggregator (e.g., "DashboardAggregator")
            pattern: Aggregator pattern definition
            header: File header comment

        Returns:
            Generated TypeScript code
        """
        # Import service clients from domain-specific folders
        service_imports = []
        service_properties = []
        constructor_params = []

        from cuur_codegen.utils.string import generate_file_name
        for service_name in pattern["services"]:
            service_pascal = pascal_case(service_name.replace("-", "_"))
            service_camel = camel_case(service_name.replace("-", "_"))
            # Import from domain-specific folder: ../../domains/{domain}/services/clients/{domain}-client.js
            client_file_name = generate_file_name(service_name, "client").replace(".ts", "")
            service_imports.append(f'import {{ {service_pascal}Client }} from "../../domains/{service_name}/services/clients/{client_file_name}.js";')
            service_properties.append(f"  private {service_camel}Client: {service_pascal}Client;")
            constructor_params.append(f"{service_camel}Client: {service_pascal}Client")

        # Build methods
        methods = []
        for method_def in pattern["methods"]:
            method_code = AggregatorBuilder._build_method(method_def, pattern["services"])
            methods.append(method_code)

        # Build class
        class_content = f"""{header}

/**
 * {pattern["description"]}
 *
 * Combines data from multiple domain services into optimized responses.
 */

{chr(10).join(service_imports)}

export class {aggregator_name} {{
{chr(10).join(service_properties)}

  constructor({", ".join(constructor_params)}) {{
{chr(10).join([f"    this.{camel_case(s.replace('-', '_'))}Client = {camel_case(s.replace('-', '_'))}Client;" for s in pattern["services"]])}
  }}

{chr(10).join(methods)}
}}
"""

        return class_content.strip()

    @staticmethod
    def _build_method(method_def: Dict[str, Any], services: List[str]) -> str:
        """Build a method for an aggregator"""
        method_name = method_def["name"]
        description = method_def.get("description", "")
        params = method_def.get("params", [])
        service_calls = method_def.get("service_calls", [])

        # Build Promise.all call
        call_vars = []
        call_promises = []

        for i, call in enumerate(service_calls):
            service_name = call["service"]
            method = call["method"]
            call_params = call.get("params", [])

            service_camel = camel_case(service_name.replace("-", "_"))
            var_name = f"result{i + 1}"
            call_vars.append(var_name)

            # Build method call
            params_str = ", ".join(call_params)
            call_promises.append(f"      this.{service_camel}Client.{method}({params_str}),")

        # Build return statement
        return_obj = "{\n"
        for i, call in enumerate(service_calls):
            service_name = call["service"]
            prop_name = camel_case(service_name.replace("-", "_"))
            return_obj += f"      {prop_name}: result{i + 1},\n"
        return_obj += "    }"

        method_code = f"""  /**
   * {description}
   */
  async {method_name}({", ".join(params)}): Promise<any> {{
    const [{", ".join(call_vars)}] = await Promise.all([
{chr(10).join(call_promises)}
    ]);

    return {return_obj}
  }}"""

        return method_code
