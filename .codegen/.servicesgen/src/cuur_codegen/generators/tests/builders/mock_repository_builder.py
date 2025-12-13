"""
Mock Repository Builder

Generates mock repository implementations for testing
"""

from typing import Optional
from .repository_discovery import RepositoryInfo
from cuur_codegen.utils.string import camel_case


def _get_domain_transaction_id_function(domain_name: str) -> str:
    """Get domain-specific TransactionId function name"""
    domain_prefix_map = {
        "auth": "AU",
        "blockchain": "BL",
        "business-intelligence": "BI",
        "compliance": "CO",
        "custodian": "CU",
        "decision-intelligence": "DI",
        "e-documents": "ED",
        "escrow": "ES",
        "events": "EV",
        "exchange": "EX",
        "fees-billing": "FB",
        "fiat-banking": "FI",
        "gateway": "GW",
        "governance": "GO",
        "identity": "ID",
        "integration-interoperability": "II",
        "knowledge-evidence": "KE",
        "market-oracles": "MO",
        "marketplace": "MP",
        "notifications": "NO",
        "observability": "OB",
        "patient-clinical-data": "PC",
        "pricing-refdata": "PR",
        "primary-market": "PM",
        "risk-limits": "RL",
        "sandbox": "SB",
        "settlements": "SE",
        "tenancy-trust": "TT",
        "transfer-agent": "TA",
        "treasury": "TR",
        "workflow-care-pathways": "WC",
    }

    prefix = domain_prefix_map.get(domain_name.lower())
    if not prefix:
        raise ValueError(f"Unknown domain: {domain_name}")
    return f"{prefix.lower()}TransactionId"


class MockRepositoryBuilder:
    """Builds mock repository classes"""

    @staticmethod
    def build_mock_repository(
        repo: RepositoryInfo,
        domain_name: str,
        header: str,
        include_imports: bool = True
    ) -> str:
        """Build mock repository class"""
        mock_class_name = f"Mock{repo.interface_name}"
        entity_pascal = repo.entity_name
        entity_var = camel_case(repo.entity_name)
        entities_var = f"{entity_var}s"
        transaction_id_function = _get_domain_transaction_id_function(domain_name)

        imports = ""
        if include_imports:
            create_type_import = ""
            update_type_import = ""
            if repo.has_create or repo.is_crud:
                create_type = repo.create_type or f"Create{entity_pascal}Request"
                create_type_import = f"\n  {create_type},"
            if repo.has_update:
                update_type = repo.update_type or f"Update{entity_pascal}Request"
                update_type_import = f"\n  {update_type},"

            # Use subpath imports for domain-specific types and repositories
            # ID generators stay as @cuur/core since they're exported from main index
            # Filter out TypeScript utility types from list_params_type
            typescript_utility_types = {"Record", "Partial", "Pick", "Omit", "Readonly", "Required"}
            list_params = repo.list_params_type or 'PaginationParams'
            if any(list_params.startswith(util) for util in typescript_utility_types):
                list_params = 'PaginationParams'

            imports = f"""import type {{
  {repo.interface_name},
}} from "@cuur/core/{domain_name}/repositories/index.js";
import type {{
  {entity_pascal}{create_type_import}{update_type_import}
}} from "@cuur/core/{domain_name}/types/index.js";
import type {{
  {list_params},
  PaginatedResult,
}} from "@cuur/core/shared/helpers/index.js";
import {{ {transaction_id_function} }} from "@cuur/core/shared/helpers/id-generator.js";

"""

        methods = MockRepositoryBuilder._build_mock_methods(
            repo, entity_pascal, entity_var, entities_var, transaction_id_function
        )

        return f"""{header}{imports}export class {mock_class_name} implements {repo.interface_name} {{
  private {entities_var}: {entity_pascal}[] = [];
  private idCounter = 1;

  /**
   * Reset mock state (call in beforeEach)
   */
  reset(): void {{
    this.{entities_var} = [];
    this.idCounter = 1;
  }}

{methods}
}}
"""

    @staticmethod
    def _build_mock_methods(
        repo: RepositoryInfo,
        entity_pascal: str,
        entity_var: str,
        entities_var: str,
        transaction_id_function: str
    ) -> str:
        """Build mock repository methods"""
        methods = []
        # Filter out TypeScript utility types from list_params_type
        typescript_utility_types = {"Record", "Partial", "Pick", "Omit", "Readonly", "Required"}
        list_params_type = repo.list_params_type or "PaginationParams"
        if any(list_params_type.startswith(util) for util in typescript_utility_types):
            list_params_type = "PaginationParams"

        # list method
        methods.append(f"""  async list(
    orgId: string,
    params?: {list_params_type}
  ): Promise<PaginatedResult<{entity_pascal}>> {{
    let items = this.{entities_var}.filter((item) => item.orgId === orgId);

    const limit = (params as any)?.limit ?? 50;
    if (limit) {{
      items = items.slice(0, limit);
    }}

    return {{
      items,
      nextCursor: items.length === limit ? items[items.length - 1]?.id : undefined,
      prevCursor: undefined,
    }};
  }}""")

        # findById method
        methods.append(f"""  async findById(orgId: string, id: string): Promise<{entity_pascal} | null> {{
    return this.{entities_var}.find((item) => item.id === id && item.orgId === orgId) || null;
  }}""")

        # get method (alias)
        methods.append(f"""  async get(orgId: string, id: string): Promise<{entity_pascal} | null> {{
    return this.findById(orgId, id);
  }}""")

        # create method (if has create)
        if repo.has_create or repo.is_crud:
            create_type = repo.create_type or f"Create{entity_pascal}Request"
            methods.append(f"""  async create(orgId: string, data: {create_type}): Promise<{entity_pascal}> {{
    const {entity_var}: {entity_pascal} = {{
      ...data,
      id: {transaction_id_function}(),
      orgId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }} as {entity_pascal};
    this.{entities_var}.push({entity_var});
    return {entity_var};
  }}""")

        # update method (if has update)
        if repo.has_update:
            update_type = repo.update_type or f"Update{entity_pascal}Request"
            methods.append(f"""  async update(orgId: string, id: string, data: {update_type}): Promise<{entity_pascal}> {{
    const {entity_var} = await this.findById(orgId, id);
    if (!{entity_var}) {{
      throw new Error(`{entity_pascal} ${{id}} not found`);
    }}
    Object.assign({entity_var}, data, {{ updatedAt: new Date() }});
    return {entity_var};
  }}""")

        # delete method (if has delete)
        if repo.has_delete:
            methods.append(f"""  async delete(orgId: string, id: string): Promise<void> {{
    const index = this.{entities_var}.findIndex((item) => item.id === id && item.orgId === orgId);
    if (index === -1) {{
      throw new Error(`{entity_pascal} ${{id}} not found`);
    }}
    this.{entities_var}.splice(index, 1);
  }}""")

        return "\n\n".join(methods)

    @staticmethod
    def build_combined_mocks(
        repositories: list[RepositoryInfo],
        domain_name: str,
        header: str
    ) -> str:
        """Build combined mocks file with all mock repositories"""
        transaction_id_function = _get_domain_transaction_id_function(domain_name)

        # Collect unique imports
        entity_names = set()
        create_types = set()
        update_types = set()
        list_params_types = set()

        # TypeScript utility types that shouldn't be imported
        typescript_utility_types = {
            "Record", "Partial", "Pick", "Omit", "Readonly", "Required",
            "Exclude", "Extract", "NonNullable", "ReturnType", "Parameters"
        }

        for repo in repositories:
            entity_names.add(repo.entity_name)
            if repo.has_create or repo.is_crud:
                if repo.create_type:
                    # Check if it's a TypeScript utility type (starts with utility type name)
                    if not any(repo.create_type.startswith(util) for util in typescript_utility_types):
                        create_types.add(repo.create_type)
            if repo.has_update:
                if repo.update_type:
                    # Check if it's a TypeScript utility type
                    if not any(repo.update_type.startswith(util) for util in typescript_utility_types):
                        update_types.add(repo.update_type)
            if repo.list_params_type:
                # Check if it's a TypeScript utility type (e.g., Record<string, never>)
                if not any(repo.list_params_type.startswith(util) for util in typescript_utility_types):
                    list_params_types.add(repo.list_params_type)
                else:
                    # Use default PaginationParams if it's a utility type
                    list_params_types.add("PaginationParams")

        # Build imports
        repo_imports = ",\n  ".join(r.interface_name for r in repositories)
        entity_imports = ",\n  ".join(sorted(entity_names))
        create_type_imports = ",\n  ".join(sorted(create_types)) if create_types else ""
        update_type_imports = ",\n  ".join(sorted(update_types)) if update_types else ""
        list_params_imports = ",\n  ".join(sorted(list_params_types)) if list_params_types else ""

        # Use subpath imports for domain-specific types and repositories
        # Group imports by their import paths
        repo_import_lines = [f"  {repo_imports},"] if repo_imports else []
        entity_import_lines = [f"  {entity_imports},"] if entity_imports else []
        create_type_import_lines = [f"  {create_type_imports},"] if create_type_imports else []
        update_type_import_lines = [f"  {update_type_imports},"] if update_type_imports else []
        list_params_import_lines = [f"  {list_params_imports},"] if list_params_imports else []

        # Build separate import statements for each import path
        import_statements = []

        if repo_import_lines:
            import_statements.append(f"""import type {{
{chr(10).join(repo_import_lines)}
}} from "@cuur/core/{domain_name}/repositories/index.js";""")

        domain_type_lines = []
        if entity_import_lines:
            domain_type_lines.extend(entity_import_lines)
        if create_type_import_lines:
            domain_type_lines.extend(create_type_import_lines)
        if update_type_import_lines:
            domain_type_lines.extend(update_type_import_lines)

        if domain_type_lines:
            import_statements.append(f"""import type {{
{chr(10).join(domain_type_lines)}
}} from "@cuur/core/{domain_name}/types/index.js";""")

        shared_helper_lines = []
        # Filter out TypeScript utility types and invalid types from list_params
        typescript_utility_types = {"Record", "Partial", "Pick", "Omit", "Readonly", "Required"}
        valid_list_params = []
        for param in list_params_types:
            # Skip TypeScript utility types and primitive types
            if not any(param.startswith(util) for util in typescript_utility_types) and param not in {"string", "number", "boolean"}:
                valid_list_params.append(param)

        # Use PaginationParams if no valid params found
        if not valid_list_params:
            valid_list_params = ["PaginationParams"]
        elif "PaginationParams" not in valid_list_params:
            valid_list_params.append("PaginationParams")

        if valid_list_params:
            shared_helper_lines.extend([f"  {param}," for param in sorted(set(valid_list_params))])
        shared_helper_lines.append("  PaginatedResult,")

        if shared_helper_lines:
            import_statements.append(f"""import type {{
{chr(10).join(shared_helper_lines)}
}} from "@cuur/core/shared/helpers/index.js";""")

        # ID generators are exported from shared helpers
        import_statements.append(f"""import {{ {transaction_id_function} }} from "@cuur/core/shared/helpers/id-generator.js";""")

        imports = chr(10).join(import_statements) + chr(10) if import_statements else ""

        # Build mock classes
        mock_classes = []
        for repo in repositories:
            mock_header = f"/**\n * Mock {repo.interface_name} for testing\n */"
            mock_content = MockRepositoryBuilder.build_mock_repository(
                repo, domain_name, mock_header, include_imports=False
            )
            mock_classes.append(mock_content)

        return f"""{header}{imports}

{chr(10).join(mock_classes)}
"""
