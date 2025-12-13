#!/usr/bin/env python3
"""
SDK Domain Client Generator

Generates TypeScript domain client files for the Quub SDK based on domains in core.
This script automatically creates client classes for all domains and updates the
main client and index files.
"""

import os
import re
from pathlib import Path
from typing import List

# Configuration
SDK_SRC_PATH = Path(
    "/Users/nrahal/@code_2025/products/quub/quub-exchange/quub-exchange-core/src/sdk/src"
)
CORE_PATH = Path(
    "/Users/nrahal/@code_2025/products/quub/quub-exchange/quub-exchange-core/src/core"
)
DOMAINS_PATH = SDK_SRC_PATH / "domains"
HTTP_PATH = SDK_SRC_PATH / "http"

# Exclude these from domain generation
EXCLUDED_DIRS = {
    "README.md",
    "index.ts",
    "dist",
    "node_modules",
    "shared",
    "storage",
    "cache",
}

# Domain-specific method templates
DOMAIN_METHODS = {
    "auth": [
        ('login(credentials: { email: string; password: string }): Promise<{ token: string; refreshToken: string }>',
         'await this.http.post("/auth/login", credentials)'),
        ('refresh(refreshToken: string): Promise<{ token: string }>',
         'await this.http.post("/auth/refresh", { refreshToken })'),
        ('logout(): Promise<void>',
         'await this.http.post("/auth/logout")'),
        ('verifyToken(): Promise<{ valid: boolean }>',
         'await this.http.get("/auth/verify")'),
    ],
    "blockchain": [
        ('getChainStatus(): Promise<unknown>',
         'await this.http.get("/blockchain/status")'),
        ('getTransaction(txId: string): Promise<unknown>',
         'await this.http.get(`/blockchain/transactions/${txId}`)'),
        ('getBlock(blockId: string): Promise<unknown>',
         'await this.http.get(`/blockchain/blocks/${blockId}`)'),
    ],
    "exchange": [
        ('getExchangeStatus(): Promise<{ status: string; timestamp: string }>',
         'await this.http.get("/exchange/status")'),
        ('getMarketData(symbol: string): Promise<unknown>',
         'await this.http.get(`/exchange/markets/${symbol}`)'),
        ('listMarkets(options?: { limit?: number; offset?: number }): Promise<unknown>',
         'await this.http.get("/exchange/markets", options)'),
    ],
    "governance": [
        ('getProposals(options?: { status?: string; limit?: number }): Promise<unknown>',
         'await this.http.get("/governance/proposals", options)'),
        ('getProposal(proposalId: string): Promise<unknown>',
         'await this.http.get(`/governance/proposals/${proposalId}`)'),
        ('submitProposal(proposal: unknown): Promise<unknown>',
         'await this.http.post("/governance/proposals", proposal)'),
        ('vote(proposalId: string, vote: unknown): Promise<unknown>',
         'await this.http.post(`/governance/proposals/${proposalId}/votes`, vote)'),
    ],
    "identity": [
        ('getProfile(): Promise<unknown>',
         'await this.http.get("/identity/profile")'),
        ('updateProfile(profile: unknown): Promise<unknown>',
         'await this.http.put("/identity/profile", profile)'),
        ('getDocuments(): Promise<unknown>',
         'await this.http.get("/identity/documents")'),
        ('uploadDocument(document: unknown): Promise<unknown>',
         'await this.http.post("/identity/documents", document)'),
    ],
    "treasury": [
        ('getBalance(): Promise<unknown>',
         'await this.http.get("/treasury/balance")'),
        ('getTransactions(options?: { limit?: number; offset?: number }): Promise<unknown>',
         'await this.http.get("/treasury/transactions", options)'),
        ('deposit(deposit: unknown): Promise<unknown>',
         'await this.http.post("/treasury/deposits", deposit)'),
        ('withdraw(withdrawal: unknown): Promise<unknown>',
         'await this.http.post("/treasury/withdrawals", withdrawal)'),
    ],
}


def get_domain_name_from_path(path: str) -> str:
    """Convert path to camelCase domain name."""
    parts = path.split("-")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


def get_class_name(domain: str) -> str:
    """Convert domain name to class name."""
    parts = domain.split("-")
    return "".join(word.capitalize() for word in parts) + "Client"


def generate_domain_client(domain: str) -> str:
    """Generate TypeScript domain client code."""
    class_name = get_class_name(domain)
    domain_name = get_domain_name_from_path(domain)

    # Get methods for this domain if defined, otherwise use generic methods
    if domain in DOMAIN_METHODS:
        methods_code = ""
        for method_sig, method_impl in DOMAIN_METHODS[domain]:
            base_method = method_sig.split("(")[0]
            methods_code += f'\n\n  async {method_sig} {{\n    const response = {method_impl};\n    return response.data;\n  }}'
    else:
        # Generic methods for unknown domains
        methods_code = f'''

  async getStatus(): Promise<unknown> {{
    const response = await this.http.get("/{domain}/status");
    return response.data;
  }}

  async list(options?: {{ limit?: number; offset?: number }}): Promise<unknown> {{
    const response = await this.http.get("/{domain}", options);
    return response.data;
  }}'''

    return f'''import {{ HttpClient }} from "../http/http-client";

/**
 * {class_name} domain client
 */
export class {class_name} {{
  constructor(private http: HttpClient) {{}}{methods_code}
}}
'''


def generate_all_domain_clients(domains: List[str]) -> None:
    """Generate all domain client files."""
    DOMAINS_PATH.mkdir(parents=True, exist_ok=True)

    generated_count = 0
    for domain in sorted(domains):
        if domain in EXCLUDED_DIRS:
            continue

        client_file = DOMAINS_PATH / f"{domain}-client.ts"
        code = generate_domain_client(domain)

        client_file.write_text(code)
        print(f"✓ Generated {client_file.name}")
        generated_count += 1

    print(f"\n✓ Generated {generated_count} domain client files")
    return generated_count


def generate_main_client(domains: List[str]) -> None:
    """Generate the main client that aggregates all domain clients."""
    # Filter and sort domains
    active_domains = sorted([d for d in domains if d not in EXCLUDED_DIRS])

    # Generate imports
    imports = 'import { HttpClient, HttpClientConfig } from "./http/http-client";\n'
    for domain in active_domains:
        class_name = get_class_name(domain)
        domain_name = get_domain_name_from_path(domain)
        imports += f'import {{ {class_name} }} from "./domains/{domain}-client";\n'

    # Generate properties
    properties = ""
    for domain in active_domains:
        class_name = get_class_name(domain)
        domain_name = get_domain_name_from_path(domain)
        properties += f"  public {domain}: {class_name};\n"

    # Generate initialization
    init_code = ""
    for domain in active_domains:
        class_name = get_class_name(domain)
        init_code += f"    this.{domain} = new {class_name}(this.http);\n"

    client_code = f'''{imports}
export interface QuubSDKConfig extends HttpClientConfig {{
  baseUrl: string;
}}

/**
 * Main Quub SDK Client
 */
export class QuubClient {{
  private http: HttpClient;

{properties}
  constructor(config: QuubSDKConfig) {{
    this.http = new HttpClient(config);

    // Initialize domain clients
{init_code}  }}

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string): void {{
    this.http.setAuthToken(token);
  }}

  /**
   * Set API key for requests
   */
  setApiKey(apiKey: string): void {{
    this.http.setApiKey(apiKey);
  }}

  /**
   * Get the underlying HTTP client for advanced usage
   */
  getHttpClient(): HttpClient {{
    return this.http;
  }}
}}
'''

    client_file = SDK_SRC_PATH / "client.ts"
    client_file.write_text(client_code)
    print(f"✓ Updated {client_file.name}")


def generate_index(domains: List[str]) -> None:
    """Generate the main index.ts file that exports everything."""
    active_domains = sorted([d for d in domains if d not in EXCLUDED_DIRS])

    # Generate domain exports
    domain_exports = ""
    for domain in active_domains:
        class_name = get_class_name(domain)
        domain_exports += f'export * from "./domains/{domain}-client";\n'

    index_code = f'''// Main SDK exports
export * from "./client";
export * from "./http/http-client";
export * from "./http/errors";
export * from "./http/fetch-adapter";

// Domain clients
{domain_exports}
// Utilities
export * from "./utils/build-query";
export * from "./utils/token-storage";

// Generated types from OpenAPI
export * from "./generated";
'''

    index_file = SDK_SRC_PATH / "index.ts"
    index_file.write_text(index_code)
    print(f"✓ Updated {index_file.name}")


def get_domains() -> List[str]:
    """Get list of domains from core directory."""
    domains = []
    for item in CORE_PATH.iterdir():
        if item.is_dir() and item.name not in EXCLUDED_DIRS:
            domains.append(item.name)
    return domains


def main():
    """Main entry point."""
    print("🚀 Quub SDK Domain Client Generator\n")

    # Get all domains
    domains = get_domains()
    print(f"Found {len(domains)} domains:\n")
    for domain in sorted(domains):
        if domain not in EXCLUDED_DIRS:
            print(f"  • {domain}")

    print("\n" + "=" * 50)
    print("Generating domain clients...")
    print("=" * 50 + "\n")

    # Generate domain clients
    generate_all_domain_clients(domains)

    # Generate main client
    print("\n✓ Generating main client...")
    generate_main_client(domains)

    # Generate index
    print("✓ Generating index exports...")
    generate_index(domains)

    print("\n" + "=" * 50)
    print("✅ SDK generation complete!")
    print("=" * 50)
    print("\nNext steps:")
    print("1. Review the generated files")
    print("2. Run: npm run build")
    print("3. Test the SDK integration")


if __name__ == "__main__":
    main()
