"""
DAO Discovery - Discovers DAO repositories for core domains
"""

from typing import List, Dict
from cuur_codegen.utils.string import camel_case


class DaoDiscovery:
    """Discovers DAO repositories for core domains"""

    @staticmethod
    def discover_dao_repositories(core_domains: List[str]) -> List[Dict[str, str]]:
        """Discover DAO repositories for core domains"""
        # Map of core domain to common DAO repository names
        # This is a simplified mapping - in production, we'd scan adapters/src/{domain}/index.ts
        domain_to_repos = {
            "exchange": ["DaoOrderRepository", "DaoTradeRepository", "DaoMarketRepository", "DaoHaltRepository", "DaoPositionRepository", "DaoMarketMakerQuoteRepository"],
            "risk-limits": ["DaoRiskLimitRepository", "DaoCircuitBreakerRepository", "DaoRiskExposureRepository", "DaoPreTradeCheckDecisionRepository", "DaoPreTradeCheckLogRepository", "DaoRiskLimitByIdRepository"],
            "blockchain": ["DaoChainRepository", "DaoChainAdapterRepository", "DaoWalletRepository"],
            "custodian": ["DaoCustodyAccountRepository", "DaoCustodyBalanceRepository", "DaoCustodyDepositRepository", "DaoCustodyWithdrawalRepository", "DaoCustodyTransactionRepository"],
            "auth": ["DaoAuthAccountRepository", "DaoAuthSessionRepository", "DaoAuthPasswordRepository"],
            "identity": ["DaoAccountRepository", "DaoCurrentUserRepository"],
            "governance": ["DaoCorporateActionRepository", "DaoBallotRepository"],
            "treasury": ["DaoEscrowRepository", "DaoDistributionRepository"],
            "fiat-banking": ["DaoFiatAccountRepository", "DaoFiatBalanceRepository"],
            "marketplace": ["DaoAuctionRepository", "DaoBidRepository"],
        }

        repos = []
        seen = set()

        for domain in core_domains:
            domain_repos = domain_to_repos.get(domain, [])
            for repo_name in domain_repos:
                if repo_name not in seen:
                    seen.add(repo_name)
                    # Convert DaoOrderRepository -> orderRepo
                    var_name = camel_case(repo_name.replace("Dao", "").replace("Repository", "")) + "Repo"
                    repos.append({
                        "name": repo_name,
                        "var": var_name,
                        "domain": domain
                    })

        return repos

    @staticmethod
    def generate_dao_usage_examples(dao_repos: List[Dict[str, str]]) -> str:
        """Generate DAO usage examples comment"""
        if not dao_repos:
            return ""

        examples = []
        examples.append(" *")
        examples.append(" * DAO Repository Examples:")

        # Show a few common patterns
        for repo in dao_repos[:3]:  # Show first 3 as examples
            repo_var = repo['var']
            repo_name = repo['name']
            examples.append(f" *   - deps.{repo_var}: {repo_name}")

        if len(dao_repos) > 3:
            examples.append(f" *   - ... and {len(dao_repos) - 3} more repositories")

        examples.append(" *")
        examples.append(" * Example DAO Usage:")
        examples.append(" *   // Read from database")
        examples.append(" *   const order = await deps.orderRepo.findById(orderId, orgId);")
        examples.append(" *   const markets = await deps.marketRepo.findMany(orgId, {{ status: 'active' }});")
        examples.append(" *")
        examples.append(" *   // Write to database")
        examples.append(" *   const newOrder = await deps.orderRepo.create(orgId, orderData);")
        examples.append(" *   await deps.orderRepo.update(orderId, orgId, updates);")
        examples.append(" *")
        examples.append(" *   // Transactions (using deps.dao)")
        examples.append(" *   await deps.dao.$transaction([")
        examples.append(" *     deps.orderRepo.create(orgId, orderData),")
        examples.append(" *     deps.tradeRepo.create(orgId, tradeData)")
        examples.append(" *   ]);")

        return "\n".join(examples)
