"""
Factory Builder

Generates test data factories for orchestrator domains
"""

from pathlib import Path
from typing import List, Set, Optional, Dict
import yaml
import re
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import camel_case, kebab_case, pascal_case, singularize
from .repository_discovery import RepositoryDiscovery, RepositoryInfo
from .flow_discovery import FlowInfo
from .factory_mappings import get_entity_config, get_input_schema_name


class FactoryBuilder:
    """Builds test data factories for orchestrator domains"""

    @staticmethod
    def discover_entities_from_schemas(
        context: GenerationContext
    ) -> Dict[str, str]:
        """
        Discover entities from core package schema files.
        Reads schema files from packages/core/packages/core/src/{domain}/schemas/{domain}.schemas.ts
        and extracts entity names from the schemas export.

        Returns dict mapping entity_name -> core_domain_name

        Example: {"Chain": "blockchain", "Wallet": "blockchain", "FiatAccount": "fiat-banking"}
        """
        entities_map: Dict[str, str] = {}
        project_root = context.config.paths.project_root

        # Find core package path (try multiple possible locations)
        core_base_paths = [
            project_root / "packages" / "core" / "packages" / "core" / "src",
            project_root / "packages" / "core" / "src",
            project_root.parent / "packages" / "core" / "packages" / "core" / "src",
            project_root.parent / "packages" / "core" / "src",
        ]

        core_base = None
        for path in core_base_paths:
            if path.exists():
                core_base = path
                break

        if not core_base:
            context.logger.debug("Core package path not found, skipping schema discovery")
            return entities_map

        # Find all schema files - look for *.zod.schema.ts files in openapi/ directory
        schema_files = list(core_base.glob("*/openapi/*.zod.schema.ts"))

        for schema_file in schema_files:
            try:
                # Extract domain name from path: packages/core/src/{domain}/openapi/{domain}.zod.schema.ts
                domain_name = schema_file.parent.parent.name

                # Parse schema file to extract entity names
                schema_content = schema_file.read_text(encoding="utf-8")
                entity_names = FactoryBuilder._extract_entities_from_schema_file(schema_content)

                # Map each entity to its domain
                for entity_name in entity_names:
                    entities_map[entity_name] = domain_name

            except Exception as e:
                context.logger.debug(f"Error parsing schema file {schema_file}: {e}")

        return entities_map

    @staticmethod
    def _extract_entities_from_schema_file(schema_content: str) -> List[str]:
        """
        Extract entity names from a schema file by parsing the schemas export.

        Filters out non-entity schemas like:
        - ResponseMeta, PageInfo, DataEnvelope (wrapper types)
        - *Request, *Response, *Envelope (request/response wrappers)
        - *Id (ID types)
        - Problem, ValidationError (error types)

        Returns list of entity names (e.g., ["Chain", "Wallet", "OnChainTx"])
        """
        entity_names: List[str] = []

        # Find the schemas export: export const schemas = { ... } or export const schemas: Record<string, ZodTypeAny> = { ... }
        # Handle multi-line exports with nested braces
        schemas_match = re.search(
            r'export\s+const\s+schemas\s*(?::\s*Record<string,\s*ZodTypeAny>)?\s*=\s*\{',
            schema_content,
            re.MULTILINE
        )

        if not schemas_match:
            return entity_names

        # Find the matching closing brace for the schemas object
        start_pos = schemas_match.end()
        brace_count = 1
        pos = start_pos
        while pos < len(schema_content) and brace_count > 0:
            if schema_content[pos] == '{':
                brace_count += 1
            elif schema_content[pos] == '}':
                brace_count -= 1
            pos += 1

        if brace_count != 0:
            return entity_names

        schemas_content = schema_content[start_pos:pos-1]

        # Extract schema names from the object (e.g., "Chain,", "Wallet,")
        # Pattern: schema_name, or schema_name: (but not inside nested objects)
        # Match word characters followed by comma or colon, but skip nested content
        schema_name_pattern = r'^\s*(\w+)\s*[,:]'
        schema_names = []
        for line in schemas_content.split('\n'):
            match = re.search(schema_name_pattern, line)
            if match:
                schema_names.append(match.group(1))

        # Filter out non-entity schemas
        excluded_patterns = [
            r'.*Id$',  # ChainRecordId, WalletId, etc.
            r'.*Meta$',  # ResponseMeta
            r'.*Info$',  # PageInfo
            r'.*Envelope$',  # DataEnvelope
            r'.*Request$',  # CreateChainRequest, UpdateChainRequest
            r'.*Response$',  # ListChainsResponse, CreateChainResponse
            r'Problem$',  # Problem
            r'ValidationError$',  # ValidationError
        ]

        for schema_name in schema_names:
            # Skip if matches any excluded pattern
            if any(re.match(pattern, schema_name) for pattern in excluded_patterns):
                continue

            # Check if it's likely an entity (starts with capital letter, not a common wrapper)
            if schema_name and schema_name[0].isupper():
                entity_names.append(schema_name)

        return entity_names

    @staticmethod
    def discover_entities_from_flows(
        flows: List[FlowInfo],
        orchestrator_domain: str,
        context: GenerationContext
    ) -> Dict[str, str]:
        """
        Discover entities ONLY from handlers used in flows.
        Returns dict mapping entity_name -> core_domain_name

        Only includes entities that are actually referenced by handler responses in flows.

        Example: {"FiatAccount": "fiat-banking", "CustodyAccount": "custodian", "Wallet": "blockchain"}
        """
        entities_map: Dict[str, str] = {}
        project_root = context.config.paths.project_root

        yaml_spec_path = project_root / "orchestrators" / "openapi" / "src" / "yaml" / f"{orchestrator_domain}.yaml"

        if not yaml_spec_path.exists():
            return entities_map

        # Get all available schema entities for validation
        all_schema_entities = FactoryBuilder.discover_entities_from_schemas(context)

        try:
            with open(yaml_spec_path, "r", encoding="utf-8") as f:
                spec = yaml.safe_load(f)

            paths = spec.get("paths", {})

            for path, methods in paths.items():
                for method, operation in methods.items():
                    flow_steps = operation.get("x-orchestration-flow", [])
                    if not flow_steps:
                        continue

                    # Extract handlers from flow steps
                    for step in flow_steps:
                        if step.get("kind") == "backend-call":
                            handler_name = step.get("handler")
                            if handler_name:
                                # Map handler to entity
                                entity_name, core_domain = FactoryBuilder._handler_to_entity(
                                    handler_name, step.get("service", ""), context, schema_entities=all_schema_entities
                                )
                                # Only include if entity exists in schema-discovered entities
                                if entity_name and core_domain and entity_name in all_schema_entities:
                                    entities_map[entity_name] = core_domain

        except Exception as e:
            context.logger.debug(f"Error discovering entities from flows: {e}")

        return entities_map

    @staticmethod
    def _handler_to_entity(
        handler_name: str,
        service: str,
        context: GenerationContext,
        schema_entities: Optional[Dict[str, str]] = None
    ) -> tuple[Optional[str], Optional[str]]:
        """
        Map handler name to entity name and core domain.
        Uses schema-discovered entities if provided, otherwise falls back to handler inference.

        Examples:
        - listFiatAccounts -> (FiatAccount, fiat-banking)
        - listCustodyAccounts -> (CustodyAccount, custodian)
        - createOrder -> (Order, exchange)
        - listWallets -> (Wallet, blockchain)
        """
        # Remove verb prefix (list, create, get, update, delete)
        verbs = ["list", "create", "get", "update", "delete", "patch"]
        entity_base = handler_name
        for verb in verbs:
            if entity_base.startswith(verb):
                entity_base = entity_base[len(verb):]
                break

        if not entity_base:
            return None, None

        # Convert to PascalCase entity name
        # listFiatAccounts -> FiatAccounts -> FiatAccount (singularize)
        entity_name = pascal_case(entity_base)
        entity_name = singularize(entity_name)

        # If we have schema entities, try to find exact match first
        if schema_entities:
            if entity_name in schema_entities:
                return entity_name, schema_entities[entity_name]
            # Try plural version
            plural_entity = entity_name + "s"
            if plural_entity in schema_entities:
                return plural_entity, schema_entities[plural_entity]

        # Map service to core domain name
        service_to_domain = {
            "FIAT-BANKING": "fiat-banking",
            "CUSTODIAN": "custodian",
            "BLOCKCHAIN": "blockchain",
            "EXCHANGE": "exchange",
            "TREASURY": "treasury",
            "RISK-LIMITS": "risk-limits",
            "IDENTITY": "identity",
            "AUTH": "auth",
            "GOVERNANCE": "governance",
            "PRICING-REFDATA": "pricing-refdata",
            "PRIMARY-MARKET": "primary-market",
            "TRANSFER-AGENT": "transfer-agent",
            "BUSINESS-INTELLIGENCE": "business-intelligence",
            "COMPLIANCE": "compliance",
            "ESCROW": "escrow",
            "FEES-BILLING": "fees-billing",
            "MARKET-ORACLES": "market-oracles",
            "MARKETPLACE": "marketplace",
            "NOTIFICATIONS": "notifications",
            "OBSERVABILITY": "observability",
            "SANDBOX": "sandbox",
            "SETTLEMENTS": "settlements",
            "TENANCY-TRUST": "tenancy-trust",
        }

        core_domain = service_to_domain.get(service.upper())
        if not core_domain:
            # Fallback: try to infer from handler name
            if "Fiat" in entity_name:
                core_domain = "fiat-banking"
            elif "Custody" in entity_name:
                core_domain = "custodian"
            elif "Wallet" in entity_name:
                core_domain = "blockchain"
            elif "Order" in entity_name or "Trade" in entity_name or "Market" in entity_name:
                core_domain = "exchange"
            else:
                return None, None

        return entity_name, core_domain

    @staticmethod
    def _find_entity_directory_name(entity_name: str, core_domain_name: str, context: GenerationContext) -> Optional[str]:
        """
        Find the actual entity directory name from the entity name.
        Example: "OnChainTx" -> "on-chain-tx", "Chain" -> "chain"

        Args:
            entity_name: Entity name (e.g., "OnChainTx", "Chain")
            core_domain_name: Core domain name (e.g., "blockchain")
            context: Generation context

        Returns:
            Entity directory name (e.g., "on-chain-tx") or None if not found
        """
        # Check if core domain factories exist
        # Use path relative to project_root, checking if project_root is already platform/
        if context.config.paths.project_root.name == "platform":
            test_dir = context.config.paths.project_root / "tests" / "src" / "core" / core_domain_name / "factories"
        else:
            test_dir = context.config.paths.project_root / "platform" / "tests" / "src" / "core" / core_domain_name / "factories"
        if not test_dir.exists():
            return None

        # Try to find entity directory by scanning factories
        entity_kebab = kebab_case(entity_name)
        entity_dir = test_dir / entity_kebab
        if entity_dir.exists() and (entity_dir / "entity" / f"{entity_kebab}.entity.factory.ts").exists():
            return entity_kebab

        # Try alternative: scan all directories and match by function name
        for dir_path in test_dir.iterdir():
            if not dir_path.is_dir():
                continue
            entity_file = dir_path / "entity" / f"{dir_path.name}.entity.factory.ts"
            if entity_file.exists():
                content = entity_file.read_text(encoding="utf-8")
                # Check if this file exports create{EntityName}
                entity_pascal = pascal_case(entity_name)
                if f"export function create{entity_pascal}" in content:
                    return dir_path.name

        return None

    @staticmethod
    def build_handler_response_factory(
        handler_name: str,
        entity_name: str,
        field_name: str,
        header: str,
        context: GenerationContext,
        orchestrator_domain: str,
        entity_to_domain_map: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Build a handler response factory that wraps entities in DataEnvelope.

        Detects handler type:
        - Create handlers: createAccount -> { data: account, meta: {...} }
        - List handlers: listAccounts -> { data: { items: [...] }, meta: {...} }

        Args:
            handler_name: Handler name (e.g., "createAccount")
            entity_name: Entity name (e.g., "Account")
            field_name: Field name in response (e.g., "account")
            header: File header
            context: Generation context
            orchestrator_domain: Orchestrator domain name
            entity_to_domain_map: Optional mapping of entity_name -> core_domain_name
        """
        entity_pascal = pascal_case(entity_name)
        handler_pascal = pascal_case(handler_name)

        factory_function = f"create{handler_pascal}Response"

        # Detect handler type: create handlers return single entity, list handlers return array
        is_create_handler = handler_name.lower().startswith("create")

        # Determine which core domain this entity belongs to
        entity_lower = entity_name.lower()

        # Special case: EscrowAccount should always come from escrow domain, not treasury
        # even if the handler service is TREASURY (EscrowAccount exists in both schemas)
        if "escrow" in entity_lower and entity_name.endswith("Account"):
            core_domain_name = "escrow"
        else:
            # First try to infer from entity name (more accurate for entities like EscrowAccount)
            inferred_domain = FactoryBuilder._infer_core_domain_from_entity(entity_name, context)

            # Use entity_to_domain_map if available, but prefer inferred domain for entities
            # that have clear domain patterns
            if entity_to_domain_map and entity_name in entity_to_domain_map:
                mapped_domain = entity_to_domain_map[entity_name]
                # Prefer inferred domain if it's more specific
                if "escrow" in entity_lower and inferred_domain == "escrow":
                    core_domain_name = "escrow"
                else:
                    core_domain_name = mapped_domain
            else:
                core_domain_name = inferred_domain

        # Find actual entity directory name (e.g., "OnChainTx" -> "on-chain-tx")
        entity_dir_name = FactoryBuilder._find_entity_directory_name(entity_name, core_domain_name, context)
        if not entity_dir_name:
            # Fallback to kebab-case of entity name
            entity_dir_name = kebab_case(entity_name)

        # Import path: nested structure - factories/{entity-dir}/entity/{entity-dir}.entity.factory.js
        # Note: The path appears to have "double factories" (@quub/factories/.../factories/...)
        # but this is correct because:
        # - @quub/factories is the alias (resolves to platform/tests/src/core/)
        # - /factories/ is the actual directory name in the structure
        # So: @quub/factories/{domain}/factories/{entity}/entity/... resolves correctly
        import_path = f"@quub/factories/{core_domain_name}/factories/{entity_dir_name}/entity/{entity_dir_name}.entity.factory.js"

        if is_create_handler:
            # Create handler: return single entity in data
            return f"""{header}
/**
 * {handler_pascal} Handler Response Factory
 *
 * Generates handler response (DataEnvelope) for {handler_name}.
 * Wraps {entity_pascal} entity in standard handler response structure.
 * Imports entity factory from core domain factories.
 */

import {{ getFaker }} from "../shared/faker-helpers.js";
import {{ create{entity_pascal} }} from "{import_path}";

/**
 * Creates a {handler_pascal} handler response with valid test data.
 *
 * @param item - {entity_pascal} entity (defaults to generated entity)
 * @param overrides - Partial overrides for meta fields
 * @returns Handler response with DataEnvelope structure
 */
export function {factory_function}(
  item?: any,
  overrides?: Partial<any>
): any {{
  const faker = getFaker();

  const defaultItem = item || create{entity_pascal}();

  return {{
    data: defaultItem,
    meta: {{
      correlationId: faker.string.uuid(),
      requestId: faker.string.uuid(),
      timestamp: new Date().toISOString(),
      ...overrides,
    }},
  }};
}}
"""
        else:
            # List handler: return array in data.items
            return f"""{header}
/**
 * {handler_pascal} Handler Response Factory
 *
 * Generates handler response (DataEnvelope) for {handler_name}.
 * Wraps {entity_pascal} entities in standard handler response structure.
 * Imports entity factory from core domain factories.
 */

import {{ getFaker }} from "../shared/faker-helpers.js";
import {{ create{entity_pascal} }} from "{import_path}";

/**
 * Creates a {handler_pascal} handler response with valid test data.
 *
 * @param items - Array of {entity_pascal} entities (defaults to 2 generated entities)
 * @param overrides - Partial overrides for meta fields
 * @returns Handler response with DataEnvelope structure
 */
export function {factory_function}(
  items?: any[],
  overrides?: Partial<any>
): any {{
  const faker = getFaker();

  const defaultItems = items || [
    create{entity_pascal}(),
    create{entity_pascal}(),
  ];

  return {{
    data: {{
      items: defaultItems,
    }},
    meta: {{
      correlationId: faker.string.uuid(),
      requestId: faker.string.uuid(),
      timestamp: new Date().toISOString(),
      pagination: {{
        nextCursor: null,
        prevCursor: null,
        limit: 50,
      }},
      ...overrides,
    }},
  }};
}}
"""

    @staticmethod
    def discover_entities_from_repositories(
        repositories: List[RepositoryInfo],
        context: GenerationContext
    ) -> Set[str]:
        """
        Discover entity names from repository names.
        Pattern: Dao{Entity}Repository -> {Entity}
        """
        entities: Set[str] = set()

        for repo in repositories:
            # Extract entity name from repository name
            # DaoFiatAccountRepository -> FiatAccount
            repo_name = repo.name
            if repo_name.startswith("Dao"):
                entity_name = repo_name[3:]  # Remove "Dao" prefix
            else:
                entity_name = repo_name

            # Remove "Repository" suffix if present
            if entity_name.endswith("Repository"):
                entity_name = entity_name[:-10]

            if entity_name:
                entities.add(entity_name)

        return entities

    @staticmethod
    def _singularize_field_name(field_name: str) -> str:
        """
        Singularize field name for comments.
        e.g., "fiatAccounts" -> "fiatAccount", "wallets" -> "wallet"
        """
        if field_name.endswith("ies"):
            return field_name[:-3] + "y"
        elif field_name.endswith("es"):
            return field_name[:-2]
        elif field_name.endswith("s"):
            return field_name[:-1]
        return field_name

    @staticmethod
    def _extract_flow_name_from_operation_id(operation_id: str) -> str:
        """
        Extract flow name from operationId.
        Pattern: getFundingBalances -> fundingBalances
                 createOrdersNew -> ordersNew
        """
        # Remove HTTP verb prefixes
        verbs = ["get", "create", "list", "update", "delete", "patch", "post", "put"]
        flow_name = operation_id
        for verb in verbs:
            if flow_name.startswith(verb.capitalize()):
                flow_name = flow_name[len(verb):]
                break
            elif flow_name.startswith(verb):
                flow_name = flow_name[len(verb):]
                break

        return flow_name

    @staticmethod
    def build_flow_factory_file(
        flow_name: str,
        operation_id: str,
        orchestrator_domain: str,
        header: str,
        context: GenerationContext,
        flow_file_path: Optional[str] = None,
        entities_map: Optional[Dict[str, str]] = None
    ) -> str:
        """
        Build a factory file for a flow response.
        Generates test data matching the flow's return structure.

        Args:
            flow_name: Flow name (e.g., "fundingBalances")
            operation_id: Operation ID (e.g., "getFundingBalances")
            orchestrator_domain: Orchestrator domain name
            header: File header
            context: Generation context
            flow_file_path: Optional path to flow file to parse return structure

        Returns:
            Factory file content
        """
        flow_pascal = pascal_case(flow_name)
        flow_camel = camel_case(flow_name)

        # Factory function names
        factory_function = f"create{flow_pascal}Response"
        batch_function = f"{flow_camel}ResponseBatch"

        # Extract return structure from YAML config (source of truth)
        response_fields, field_to_handler = FactoryBuilder._extract_flow_response_structure_from_yaml(
            operation_id, orchestrator_domain, context, flow_name=flow_name
        )

        # Fallback to flow file if YAML extraction fails
        if not response_fields and flow_file_path:
            response_fields, field_to_handler = FactoryBuilder._extract_flow_response_structure(flow_file_path, context)

        # Get YAML spec path for handler discovery
        from pathlib import Path
        project_root = context.config.paths.project_root
        yaml_spec_path = str(project_root / "orchestrators" / "openapi" / "src" / "yaml" / f"{orchestrator_domain}.yaml")

        # Build response object structure using handler response factories
        entities_map = entities_map or {}
        response_structure = FactoryBuilder._build_response_structure_code(
            response_fields,
            field_to_handler,
            entities_map,
            None,
            context,
            flow_file_path
        )

        return f"""{header}
/**
 * {flow_pascal} Flow Response Factory
 *
 * Generates test data for {flow_pascal} flow response.
 * Matches the structure returned by {flow_name}Flow.
 * Composes handler response factories for consistency.
 */

import {{ getFaker }} from "../shared/faker-helpers.js";
{response_structure.get('imports', '')}

/**
 * Creates a {flow_pascal} flow response with valid test data.
 *
 * Structure matches what {flow_name}Flow returns:
{response_structure['comment']}
 *
 * This factory composes handler response factories, ensuring consistency
 * and reusability across all flows.
 *
 * @param overrides - Partial overrides for the response
 * @returns Mock {flow_pascal} flow response
 */
export function {factory_function}(overrides?: Partial<any>): any {{
  const faker = getFaker();

  const raw = {{
{response_structure['code']}
    ...overrides,
  }};

  return raw;
}}

/**
 * Creates a batch of {flow_pascal} flow responses.
 *
 * @param count - Number of responses to create
 * @param overrides - Partial overrides applied to all responses
 * @returns Array of mock {flow_pascal} flow responses
 */
export function {batch_function}(count: number = 3, overrides?: Partial<any>): any[] {{
  return Array.from({{ length: count }}, (_, i) =>
    {factory_function}({{
      ...overrides,
    }})
  );
}}
"""

    @staticmethod
    def _extract_flow_response_structure_from_yaml(
        operation_id: str,
        orchestrator_domain: str,
        context: GenerationContext,
        flow_name: Optional[str] = None
    ) -> tuple[List[str], Dict[str, str]]:
        """
        Extract response structure from YAML config by parsing orchestration flow.
        Returns tuple of (field_names, handler_mapping) where handler_mapping maps field_name -> handler_name.

        Args:
            operation_id: Operation ID from YAML (e.g., "getBlockchainNetworks")
            orchestrator_domain: Orchestrator domain name
            context: Generation context
        """
        try:
            from pathlib import Path
            import yaml

            project_root = context.config.paths.project_root
            yaml_spec_path = project_root / "orchestrators" / "openapi" / "src" / "yaml" / f"{orchestrator_domain}.yaml"

            if not yaml_spec_path.exists():
                context.logger.debug(f"YAML spec not found: {yaml_spec_path}")
                return [], {}

            with open(yaml_spec_path, "r", encoding="utf-8") as f:
                spec = yaml.safe_load(f)

            paths = spec.get("paths", {})

            # Find the operation in YAML
            # If multiple operations have same operationId, use flow_name to match
            # flow_name is derived from path (e.g., "blockchain-networks" vs "blockchain-networks-chainId")
            operation = None
            matched_path = None

            for path, methods in paths.items():
                for method, op in methods.items():
                    if op.get("operationId") == operation_id:
                        # If flow_name provided, try to match by path pattern
                        if flow_name:
                            # flow_name is kebab-case of flow (e.g., "blockchain-networks-chainId")
                            # Check if path matches flow_name pattern
                            path_kebab = path.replace("/", "-").replace("{", "").replace("}", "").strip("-")
                            if flow_name in path_kebab or path_kebab in flow_name:
                                operation = op
                                matched_path = path
                                break
                        else:
                            # No flow_name, take first match
                            operation = op
                            matched_path = path
                            break
                if operation:
                    break

            if not operation:
                context.logger.debug(f"Operation {operation_id} (flow: {flow_name}) not found in YAML")
                return [], {}

            flow_steps = operation.get("x-orchestration-flow", [])
            if not flow_steps:
                return [], {}

            # Find composeResponse step to get dependsOn fields
            compose_step = None
            step_id_to_handler = {}

            for step in flow_steps:
                step_id = step.get("stepId", "")
                step_kind = step.get("kind", "")

                if step_kind == "backend-call":
                    handler_name = step.get("handler", "")
                    if handler_name and step_id:
                        step_id_to_handler[step_id] = handler_name

                if step_kind == "bff-internal" and step_id == "composeResponse":
                    compose_step = step

            if not compose_step:
                # Fallback: use all backend-call stepIds as fields
                fields = list(step_id_to_handler.keys())
                field_to_handler = {field: step_id_to_handler[field] for field in fields}
                return fields, field_to_handler

            # Extract dependsOn fields from composeResponse step
            depends_on = compose_step.get("dependsOn", [])
            if not depends_on:
                return [], {}

            # Map dependsOn stepIds to handlers
            # Deduplicate: if same stepId appears multiple times, only include once
            seen_fields = set()
            fields = []
            field_to_handler = {}

            for step_id in depends_on:
                if step_id in step_id_to_handler and step_id not in seen_fields:
                    # Use stepId as field name (e.g., "chains", "chainAdapters")
                    fields.append(step_id)
                    field_to_handler[step_id] = step_id_to_handler[step_id]
                    seen_fields.add(step_id)

            return fields, field_to_handler
        except Exception as e:
            context.logger.debug(f"Error extracting flow response structure from YAML for {operation_id}: {e}")
            return [], {}

    @staticmethod
    def _extract_flow_response_structure(flow_file_path: Optional[str], context: GenerationContext) -> tuple[List[str], Dict[str, str]]:
        """
        Extract response structure from flow file by parsing the result object and handler imports.
        DEPRECATED: Use _extract_flow_response_structure_from_yaml instead.
        Returns tuple of (field_names, handler_mapping) where handler_mapping maps field_name -> handler_name.
        """
        if not flow_file_path:
            return [], {}

        try:
            from pathlib import Path
            import re

            flow_path = Path(flow_file_path)
            if not flow_path.exists():
                return [], {}

            content = flow_path.read_text()

            # Extract handler imports: import { handlerName } from "@cuur/core/domain/handlers/index.js"
            handler_imports = {}
            import_pattern = r'import\s+\{\s*([^}]+)\s*\}\s+from\s+["\']@cuur/core/([^/]+)/handlers'
            import_matches = re.findall(import_pattern, content)
            for handlers_str, domain in import_matches:
                # Parse multiple handlers: { handler1, handler2 } or { handler1 }
                handler_names = [h.strip() for h in handlers_str.split(',')]
                for handler_name in handler_names:
                    handler_imports[handler_name] = domain

            # Find the result object: const result = { ... }
            result_match = re.search(r'const\s+result\s*=\s*\{([^}]+)\}', content, re.MULTILINE | re.DOTALL)
            if not result_match:
                return [], {}

            result_content = result_match.group(1)

            # Extract field names (e.g., "chains: chains," or "transfer: transfer,")
            field_pattern = r'(\w+)\s*:'
            fields = re.findall(field_pattern, result_content)

            # Filter out common keywords
            excluded = {'data', 'meta', 'type', 'from', 'to'}
            fields = [f for f in fields if f not in excluded]

            # Map fields to handlers by finding handler calls
            # Pattern: const field = await handlerName(...)
            field_to_handler = {}
            for field in fields:
                # Look for: const {field} = await {handler}(...)
                field_pattern = rf'const\s+{field}\s*=\s*await\s+(\w+)\s*\('
                match = re.search(field_pattern, content)
                if match:
                    handler_name = match.group(1)
                    field_to_handler[field] = handler_name

            return fields, field_to_handler
        except Exception as e:
            context.logger.debug(f"Error extracting flow response structure from {flow_file_path}: {e}")
            return [], {}

    @staticmethod
    def _build_response_structure_code(
        fields: List[str],
        field_to_handler: Dict[str, str],
        entities_map: Dict[str, str],
        yaml_spec_path: Optional[str] = None,
        context: Optional[GenerationContext] = None,
        flow_file_path: Optional[str] = None
    ) -> dict:
        """
        Build response structure code and comment.
        Generates mock handler responses (DataEnvelope structures) for each field.

        Uses the handler mapping extracted from the flow file to determine which
        handler response factories to import and use.

        Args:
            fields: List of field names in the response
            field_to_handler: Dict mapping field_name -> handler_name (extracted from flow file)
            entities_map: Dict mapping entity_name -> core_domain_name
            yaml_spec_path: Optional path to YAML spec
            context: Optional generation context
            flow_file_path: Optional path to flow file

        Returns:
            dict with 'code', 'comment', and 'imports' keys
        """
        if not fields:
            return {
                'comment': ' * - Structure inferred from flow return statement',
                'code': '    // Add response fields based on flow return structure',
                'imports': ''
            }

        # Build comment
        fields_list = ', '.join(fields)
        comment = f" * - Fields: {fields_list}"

        # Build code - use handler response factories for each field
        code_lines = []
        imports_lines = []

        for field in fields:
            # Use handler name from flow file mapping
            handler_name = field_to_handler.get(field)

            if not handler_name:
                # Fallback: try to infer from field name
                # For plural fields (chains, wallets), assume list handler
                # For singular fields (transfer, account), assume create/get handler
                field_singular = FactoryBuilder._singularize_field_name(field)
                field_pascal = pascal_case(field_singular)

                # Check if field is plural (ends with 's' and not a known singular)
                if field.endswith('s') and field != field_singular:
                    handler_name = f"list{field_pascal}"
                else:
                    # Try create first, then get
                    handler_name = f"create{field_pascal}"

            # Import handler response factory
            handler_kebab = kebab_case(handler_name)
            handler_pascal = pascal_case(handler_name)
            imports_lines.append(f"import {{ create{handler_pascal}Response }} from \"../handler-responses/{handler_kebab}.factory.js\";")

            # Use handler response factory
            code_lines.append(f"    {field}: create{handler_pascal}Response(),")

        code = '\n'.join(code_lines)
        imports_code = '\n'.join(imports_lines) if imports_lines else ''

        return {
            'comment': comment,
            'code': code,
            'imports': imports_code
        }

    @staticmethod
    def build_entities_factory_file(
        entities_map: Dict[str, str],
        header: str,
        context: GenerationContext,
        orchestrator_domain: str
    ) -> str:
        """
        Build a single file containing all entity factories.

        Args:
            entities_map: Dict mapping entity_name -> core_domain_name
            header: File header
            context: Generation context

        Returns:
            Single file content with all entity factories
        """
        imports_set: Set[str] = set()
        entity_factories: List[str] = []

        # Group entities by domain to optimize imports
        domain_to_entities: Dict[str, List[str]] = {}
        for entity_name, core_domain_name in entities_map.items():
            if core_domain_name not in domain_to_entities:
                domain_to_entities[core_domain_name] = []
            domain_to_entities[core_domain_name].append(entity_name)

        # Build imports per domain
        # Pattern: Import schema objects (e.g., fiatbankingSchemas) and extract schemas
        imports_lines: List[str] = []
        schema_extractions: List[str] = []

        for core_domain_name, entity_names in sorted(domain_to_entities.items()):
            type_imports = []

            # Generate schema object variable name (e.g., "fiat-banking" -> "fiatbankingSchemas")
            domain_schemas_var = core_domain_name.replace('-', '').lower() + "Schemas"

            # Import schema object
            imports_lines.append(
                f"import {{ {domain_schemas_var} }} from \"@cuur/core/{core_domain_name}/index.js\";"
            )

            # Extract schemas and build type imports
            for entity_name in sorted(entity_names):
                entity_pascal = pascal_case(entity_name)
                type_imports.append(entity_pascal)
                type_imports.append(f"Create{entity_pascal}Input")

                # Extract schemas from schema object
                schema_extractions.append(f"const Z{entity_pascal} = {domain_schemas_var}.{entity_pascal};")
                # Get input schema name from configuration (may override default)
                input_schema_name = get_input_schema_name(entity_name, core_domain_name)
                if input_schema_name:
                    schema_extractions.append(f"const ZCreate{entity_pascal}Input = {domain_schemas_var}.{input_schema_name};")
                else:
                    schema_extractions.append(f"const ZCreate{entity_pascal}Input = {domain_schemas_var}.Create{entity_pascal}Request;")

            # Import types separately
            imports_lines.append(
                f"import type {{ {', '.join(sorted(set(type_imports))) } }} from \"@cuur/core/{core_domain_name}/index.js\";"
            )

        # Build factory functions for each entity
        for entity_name, core_domain_name in sorted(entities_map.items()):
            entity_pascal = pascal_case(entity_name)
            entity_camel = camel_case(entity_name)

            # Factory function names
            factory_function = f"create{entity_pascal}"
            factory_input_function = f"create{entity_pascal}Input"
            batch_function = f"{entity_camel}Batch"

            # Schema names (from @cuur/core)
            schema_type = f"Z{entity_pascal}"
            input_schema_type = f"ZCreate{entity_pascal}Input"

            # Get entity configuration from mappings
            entity_config = get_entity_config(entity_name, core_domain_name)

            # Generate entity-specific field defaults from configuration
            entity_fields_lines = []
            for field_rule in entity_config.entity_fields:
                # Check if field has a condition (for domain-specific variations)
                if field_rule.condition is None or field_rule.condition(entity_name, core_domain_name):
                    entity_fields_lines.append(f"    {field_rule.field_name}: {field_rule.generation_code},")

            entity_fields_str = "\n".join(entity_fields_lines) if entity_fields_lines else "    // Add entity-specific fields here"

            # Generate input factory field defaults from configuration
            input_fields_lines = []
            for field_rule in entity_config.input_fields:
                # Check if field has a condition (for domain-specific variations)
                if field_rule.condition is None or field_rule.condition(entity_name, core_domain_name):
                    input_fields_lines.append(f"    {field_rule.field_name}: {field_rule.generation_code},")

            if not input_fields_lines:
                input_fields_lines.append("    // Add input-specific fields here (no id, createdAt, updatedAt)")

            input_fields_str = "\n".join(input_fields_lines)

            entity_factory = f"""
/**
 * {entity_pascal} Factory
 *
 * Generates test data for {entity_pascal} entity.
 * Uses Zod schemas from @cuur/core for validation.
 */

/**
 * Creates a {entity_pascal} entity with valid test data.
 *
 * @param overrides - Partial overrides for the entity
 * @returns Validated {entity_pascal} entity
 */
export function {factory_function}(overrides?: Partial<{entity_pascal}>): {entity_pascal} {{
  const faker = getFaker();

  // Generate valid ID characters (exclude I, O, L, U for regex compatibility)
  // Pattern: [0-9A-HJKMNP-TV-Z] excludes I, O, L, U
  const validIdChars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
{entity_config.id_generation_code}
  const raw = {{
{entity_fields_str}
    ...overrides,
  }};

  return {schema_type}.parse(raw);
}}

/**
 * Creates a Create{entity_pascal}Input DTO with valid test data.
 *
 * @param overrides - Partial overrides for the input
 * @returns Validated Create{entity_pascal}Input
 */
export function {factory_input_function}(overrides?: Partial<Create{entity_pascal}Input>): Create{entity_pascal}Input {{
  const faker = getFaker();

  // Generate valid ID characters (exclude I, O, L, U for regex compatibility)
  // Pattern: [0-9A-HJKMNP-TV-Z] excludes I, O, L, U
  const validIdChars = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

  const raw = {{
{input_fields_str}
    ...overrides,
  }};

  return {input_schema_type}.parse(raw);
}}

/**
 * Creates a batch of {entity_pascal} entities.
 *
 * @param count - Number of entities to create
 * @param overrides - Partial overrides applied to all entities
 * @returns Array of validated {entity_pascal} entities
 */
export function {batch_function}(count: number = 3, overrides?: Partial<{entity_pascal}>): {entity_pascal}[] {{
  return Array.from({{ length: count }}, (_, i) =>
    {factory_function}({{
      ...overrides,
      // Ensure unique IDs
      id: `${{overrides?.id || ""}}-${{i}}`,
    }})
  );
}}"""
            entity_factories.append(entity_factory)

        imports_code = '\n'.join(imports_lines)
        schema_extractions_code = '\n'.join(schema_extractions)
        factories_code = '\n'.join(entity_factories)

        return f"""{header}
/**
 * Entity Factories
 *
 * Generates test data for all entities used by flows in this orchestrator domain.
 * Uses Zod schemas from @cuur/core for validation.
 *
 * Only includes entities that are actually referenced by handler responses in flows.
 */

import {{ getFaker }} from "./shared/faker-helpers.js";
{imports_code}

{schema_extractions_code}

{factories_code}
"""



    @staticmethod
    def build_factories_index(
        flow_names: Set[str],
        domain_name: str,
        header: str
    ) -> str:
        """
        Build factories index file (barrel export).

        Args:
            flow_names: Set of flow names
            domain_name: Domain name
            header: File header

        Returns:
            Index file content
        """
        exports = []
        for flow_name in sorted(flow_names):
            flow_kebab = kebab_case(flow_name)
            exports.append(f"export * from \"./{flow_kebab}.factory.js\";")

        return f"""{header}
/**
 * Factories Barrel Export
 *
 * Re-exports all factory functions for this domain.
 */

{chr(10).join(exports)}
"""

    @staticmethod
    def map_entity_to_core_domain(
        entity_name: str,
        entity_to_domain_map: dict
    ) -> Optional[str]:
        """
        Map an entity name to its core domain.

        Args:
            entity_name: Entity name to map
            entity_to_domain_map: Dictionary mapping entity names to core domain names

        Returns:
            Core domain name or None if not found
        """
        return entity_to_domain_map.get(entity_name)

    @staticmethod
    def _infer_core_domain_from_entity(
        entity_name: str,
        context: GenerationContext
    ) -> str:
        """
        Infer core domain name from entity name by discovering entities from schemas.

        Args:
            entity_name: Entity name (e.g., "Account", "Order")
            context: Generation context

        Returns:
            Core domain name (e.g., "identity", "exchange")
        """
        # Discover entities from schemas to get entity -> domain mapping
        entities_map = FactoryBuilder.discover_entities_from_schemas(context)
        core_domain = entities_map.get(entity_name)

        if core_domain:
            return core_domain

        # Fallback: try to infer from entity name patterns
        entity_lower = entity_name.lower()
        # Check for escrow first (before account check)
        if "escrow" in entity_lower:
            return "escrow"
        elif "account" in entity_lower or "org" in entity_lower:
            return "identity"
        elif "order" in entity_lower or "trade" in entity_lower or "market" in entity_lower:
            return "exchange"
        elif "wallet" in entity_lower or "chain" in entity_lower:
            return "blockchain"
        elif "fiat" in entity_lower:
            return "fiat-banking"
        elif "custody" in entity_lower:
            return "custodian"
        elif "kyc" in entity_lower or "case" in entity_lower:
            return "compliance"
        else:
            # Default fallback
            return "identity"

    @staticmethod
    def build_shared_faker_helpers(header: str) -> str:
        """
        Build shared faker helpers file.
        This provides seedFaker and getFaker utilities.
        """
        return f"""{header}
/**
 * Faker Helpers
 *
 * Provides deterministic faker instance with seeding support.
 */

import {{ faker }} from "@faker-js/faker";

let fakerInstance: typeof faker | null = null;

/**
 * Seeds the faker instance for deterministic test data.
 *
 * @param seed - Seed value (default: 99999)
 */
export function seedFaker(seed: number = 99999): void {{
  faker.seed(seed);
  fakerInstance = faker;
}}

/**
 * Gets the seeded faker instance.
 * If not seeded, seeds with default value.
 *
 * @returns Faker instance
 */
export function getFaker(): typeof faker {{
  if (!fakerInstance) {{
    seedFaker(99999);
  }}
  return fakerInstance!;
}}
"""
