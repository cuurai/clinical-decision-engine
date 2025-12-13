"""
GraphQL Builder - Builds GraphQL schema and resolvers
"""

from typing import Dict, Any, List
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, pascal_case, generate_file_name


class GraphQLBuilder:
    """Builder for GraphQL schema and resolvers"""

    @staticmethod
    def build_schema(
        context: GenerationContext,
        schema_def: Dict[str, Any],
        header: str,
    ) -> str:
        """
        Build GraphQL schema.

        Args:
            context: Generation context
            schema_def: GraphQL schema definition
            header: File header comment

        Returns:
            Generated TypeScript code
        """
        schema_content = f"""{header}

/**
 * GraphQL Schema
 *
 * Generated GraphQL schema for Orchestrator layer.
 */

export const typeDefs = `
  type Query {{
    dashboard(userId: String!, orgId: String!): Dashboard
    portfolio(userId: String!, orgId: String!): Portfolio
    tradingContext(userId: String!, orgId: String!): TradingContext
  }}

  type Dashboard {{
    portfolio: PortfolioData
    trades: [Trade]
    notifications: [Notification]
    market: MarketSummary
  }}

  type Portfolio {{
    balances: [Balance]
    positions: [Position]
    escrowAccounts: [EscrowAccount]
  }}

  type TradingContext {{
    markets: [Market]
    riskLimits: RiskLimits
    priceTicks: [PriceTick]
  }}

  type PortfolioData {{
    totalValue: String
    holdings: [Holding]
  }}

  type Holding {{
    symbol: String
    quantity: String
    value: String
  }}

  type Trade {{
    id: String
    symbol: String
    quantity: String
    price: String
    timestamp: String
  }}

  type Notification {{
    id: String
    title: String
    message: String
    read: Boolean
    timestamp: String
  }}

  type MarketSummary {{
    totalMarkets: Int
    activeMarkets: Int
  }}

  type Balance {{
    asset: String
    amount: String
  }}

  type Position {{
    symbol: String
    quantity: String
  }}

  type EscrowAccount {{
    id: String
    balance: String
  }}

  type Market {{
    id: String
    symbol: String
    status: String
  }}

  type RiskLimits {{
    maxPositionSize: String
    maxDailyLoss: String
  }}

  type PriceTick {{
    symbol: String
    price: String
    timestamp: String
  }}
`;
"""

        return schema_content.strip()

    @staticmethod
    def build_resolvers(
        context: GenerationContext,
        resolvers: Dict[str, Any],
        header: str,
    ) -> str:
        """
        Build GraphQL resolvers.

        Args:
            context: Generation context
            resolvers: Resolver definitions
            header: File header comment

        Returns:
            Generated TypeScript code
        """
        resolvers_content = f"""{header}

/**
 * GraphQL Resolvers
 *
 * Generated resolvers for Orchestrator layer.
 */

import {{ DashboardAggregator }} from "../../services/aggregators/{generate_file_name("dashboard", "aggregator").replace(".ts", "")}.js";
import {{ PortfolioAggregator }} from "../../services/aggregators/{generate_file_name("portfolio", "aggregator").replace(".ts", "")}.js";
import {{ TradingAggregator }} from "../../services/aggregators/{generate_file_name("trading", "aggregator").replace(".ts", "")}.js";

export const resolvers = {{
  Query: {{
    dashboard: async (_: any, {{ userId, orgId }}: {{ userId: string; orgId: string }}) => {{
      const aggregator = new DashboardAggregator(/* inject service clients */);
      return await aggregator.getDashboard(userId, orgId);
    }},

    portfolio: async (_: any, {{ userId, orgId }}: {{ userId: string; orgId: string }}) => {{
      const aggregator = new PortfolioAggregator(/* inject service clients */);
      return await aggregator.getPortfolio(userId, orgId);
    }},

    tradingContext: async (_: any, {{ userId, orgId }}: {{ userId: string; orgId: string }}) => {{
      const aggregator = new TradingAggregator(/* inject service clients */);
      return await aggregator.getTradingContext(userId, orgId);
    }},
  }},
}};
"""

        return resolvers_content.strip()
