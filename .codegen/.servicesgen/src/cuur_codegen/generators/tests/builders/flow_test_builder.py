"""
Flow Test Builder

Generates individual orchestrator flow test files
"""

from typing import Optional, List, Dict, Set
from pathlib import Path
import re
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import kebab_case, pascal_case
from .flow_discovery import FlowInfo
from .test_constants import TEST_CONSTANTS, generate_test_constants


class FlowTestBuilder:
    """Builds orchestrator flow test files"""

    @staticmethod
    def build_flow_test(
        flow: FlowInfo,
        domain_name: str,
        header: str,
        context: GenerationContext
    ) -> str:
        """Build flow test file content"""
        flow_name = flow.flow_name
        flow_import_name = flow.flow_name

        # Extract flow name for factory import (e.g., "fundingBalancesFlow" -> "fundingBalances")
        flow_base_name = flow_name.replace("Flow", "")
        flow_pascal = pascal_case(flow_base_name)
        flow_kebab = kebab_case(flow_base_name)

        test_org_id = TEST_CONSTANTS.TEST_ORG_ID
        test_account_id = "test-account-id"

        # Detect handlers used in flow file
        handler_mocks = FlowTestBuilder._detect_handler_imports(
            flow.flow_file,
            context.config.paths.project_root
        )
        mock_calls, mock_imports = FlowTestBuilder._generate_handler_mocks(handler_mocks)
        # Add logger mock for orchestrator domains (flows import logger from ../logger.js)
        logger_mock_call, logger_mock_import = FlowTestBuilder._generate_logger_mock(domain_name)
        # Combine all mock calls (must come before imports)
        all_mock_calls = []
        if logger_mock_call:
            all_mock_calls.append(logger_mock_call)
        if mock_calls:
            all_mock_calls.append(mock_calls)
        # Combine all mock imports
        all_mock_imports = []
        if logger_mock_import:
            all_mock_imports.append(logger_mock_import)
        if mock_imports:
            all_mock_imports.append(mock_imports)
        handler_mock_resets = FlowTestBuilder._generate_handler_mock_resets(handler_mocks)

        # Detect request body schema for create flows
        request_body_entity = None
        request_body_factory = None
        if flow.verb.lower() == "create" and flow.has_body:
            request_body_entity = FlowTestBuilder._detect_request_body_schema(
                flow.flow_file,
                context.config.paths.project_root
            )
            if request_body_entity:
                request_body_factory = f"create{request_body_entity}Input"

        # Extract handler-to-field mapping from YAML for mock return values
        operation_id = flow.operation_id if hasattr(flow, 'operation_id') else None
        if not operation_id:
            # Try to derive from flow name (e.g., "fundingAccountsOverviewFlow" -> "getFundingAccountsOverview")
            operation_id = pascal_case(flow_name.replace("Flow", ""))
            operation_id = "get" + operation_id if not operation_id.startswith(("get", "create", "update", "delete", "list")) else operation_id

        # Get handler-to-field mapping from YAML
        from .factory_builder import FactoryBuilder
        response_fields, field_to_handler = FactoryBuilder._extract_flow_response_structure_from_yaml(
            operation_id,
            domain_name,
            context,
            flow_kebab
        )

        # Build test content based on verb
        test_content, request_body_import = FlowTestBuilder._build_test_content(
            flow,
            flow_name,
            flow_import_name,
            test_org_id,
            test_account_id,
            domain_name,
            flow_pascal,
            flow_kebab,
            handler_mocks,
            request_body_factory,
            field_to_handler
        )

        # Get YAML path for reference
        yaml_path = f"platform/orchestrators/openapi/src/yaml/{domain_name}.yaml"

        # Extract flow name for factory import
        flow_base_name = flow_name.replace("Flow", "")
        flow_pascal = pascal_case(flow_base_name)
        flow_kebab = kebab_case(flow_base_name)

        # Format mock calls (must come before all imports, but vi needs to be imported first)
        # Note: vi.mock calls are hoisted, but vi.fn() inside them needs vi to be imported
        # So we import vi first, then mocks, then other imports
        mock_calls_section = "\n".join(all_mock_calls) if all_mock_calls else ""
        # Format all imports together - vitest import first (needed for vi.fn() in mocks)
        all_imports = [
            'import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";'
        ]
        if all_mock_imports:
            all_imports.extend(all_mock_imports)
        all_imports.extend([
            f'import {{ {flow_import_name} }} from "@quub/orchestrators/{domain_name}/flows/{kebab_case(flow.flow_name.replace("Flow", ""))}.flow.js";',
            f'import type {{ Dependencies }} from "@quub/orchestrators/{domain_name}/deps.js";',
            f'import type {{ RequestContext }} from "@quub/orchestrators/{domain_name}/context.js";',
            f'import {{ FlowError }} from "@quub/orchestrators/{domain_name}/errors/flow-error.js";',
            f'import {{ seedFaker }} from "../factories/shared/faker-helpers.js";',
            f'import {{ create{flow_pascal}Response }} from "../factories/flows/{flow_kebab}.factory.js";',
        ])
        if request_body_import:
            all_imports.append(request_body_import.strip())
        all_imports.append('import { createMockDependencies } from "../mocks/index.js";')

        return f"""{header}
/**
 * {flow_name} Flow Tests
 *
 * Tests orchestrator flow defined in:
 * - YAML (source of truth): {yaml_path}
 * - Generated: {flow.flow_file}
 *
 * Strategy: Mock dependencies (DAO repositories), test flow orchestration matches YAML specification
 *
 * ⚠️  NO-DRIFT: Tests are generated from YAML config. If YAML changes, regenerate tests.
 */

{chr(10).join(all_imports[:1])}
{mock_calls_section}
{chr(10).join(all_imports[1:])}

describe("{flow_name} - Flow Orchestration", () => {{
  let deps: Dependencies;
  let context: RequestContext;
{generate_test_constants()}

  beforeEach(() => {{
    deps = createMockDependencies();
    context = {{
      orgId: TEST_ORG_ID,
      accountId: "{test_account_id}",
    }};
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
    seedFaker(FAKER_SEED);
    vi.clearAllMocks();
    // Reset handler mocks
{handler_mock_resets}
  }});

  afterEach(() => {{
    vi.useRealTimers();
  }});

{test_content}
}});
"""

    @staticmethod
    def _detect_handler_imports(flow_file: str, project_root: Path) -> Dict[str, str]:
        """
        Detect handler imports from flow file.

        Returns dict mapping handler_name -> import_path
        Example: {"createPayment": "@cuur/core/treasury/handlers/index.js"}
        """
        handler_imports: Dict[str, str] = {}
        flow_path = Path(flow_file)

        if not flow_path.exists():
            return handler_imports

        try:
            content = flow_path.read_text(encoding="utf-8")
            # Pattern: import { handlerName } from "@cuur/core/{domain}/handlers/index.js";
            pattern = r'import\s+\{\s*(\w+)\s*\}\s+from\s+"(@cuur/core/[^"]+/handlers/index\.js)"'
            matches = re.findall(pattern, content)

            for handler_name, import_path in matches:
                handler_imports[handler_name] = import_path
        except Exception:
            pass

        return handler_imports

    @staticmethod
    def _generate_handler_mocks(handler_imports: Dict[str, str]) -> tuple[str, str]:
        """Generate vi.mock() calls for handlers. Returns (mock_calls, import_statements)"""
        if not handler_imports:
            return ("", "")

        # Group handlers by import path
        path_to_handlers: Dict[str, List[str]] = {}
        for handler_name, import_path in handler_imports.items():
            if import_path not in path_to_handlers:
                path_to_handlers[import_path] = []
            path_to_handlers[import_path].append(handler_name)

        mock_calls = []
        import_statements = []

        for import_path, handlers in sorted(path_to_handlers.items()):
            handlers_list = ", ".join([f"{h}: vi.fn()" for h in sorted(handlers)])
            handlers_names = ", ".join(sorted(handlers))
            mock_calls.append(
                f'// Mock the {handlers_names} handler(s) - use the same alias path as the flow\n'
                f'vi.mock("{import_path}", () => ({{\n'
                f'  {handlers_list},\n'
                f'}}));'
            )

            # Generate import statements
            for handler_name in sorted(handlers):
                mock_name = f"mock{pascal_case(handler_name)}"
                import_statements.append(
                    f'import {{ {handler_name} as {mock_name} }} from "{import_path}";'
                )

        mock_calls_str = "\n".join(mock_calls) if mock_calls else ""
        import_statements_str = "\n".join(import_statements) if import_statements else ""
        return (mock_calls_str, import_statements_str)

    @staticmethod
    def _generate_handler_mock_resets(handler_imports: Dict[str, str]) -> str:
        """Generate mock reset calls for handlers"""
        if not handler_imports:
            return "    // No handler mocks to reset"

        reset_calls = []
        for handler_name in sorted(handler_imports.keys()):
            mock_name = f"mock{pascal_case(handler_name)}"
            reset_calls.append(f"    vi.mocked({mock_name}).mockReset();")

        return "\n".join(reset_calls) if reset_calls else "    // No handler mocks to reset"

    @staticmethod
    def _generate_mock_setup_code(
        handler_mocks: Dict[str, str],
        field_to_handler: Optional[Dict[str, str]],
        flow_pascal: str
    ) -> str:
        """Generate code to set up mock return values from factory response"""
        if not handler_mocks:
            return ""

        # Reverse mapping: handler_name -> field_name (if available)
        handler_to_field = {}
        if field_to_handler:
            handler_to_field = {v: k for k, v in field_to_handler.items()}

        setup_lines = []
        for handler_name in sorted(handler_mocks.keys()):
            mock_name = f"mock{pascal_case(handler_name)}"
            field_name = handler_to_field.get(handler_name)
            if field_name:
                setup_lines.append(f"      {mock_name}.mockResolvedValue(expected.{field_name});")
            else:
                # Fallback: derive field name from handler name
                # e.g., "listWallets" -> "wallets", "listChainAdapters" -> "chainAdapters"
                handler_lower = handler_name.lower()
                if handler_lower.startswith("list"):
                    field_name_camel = handler_lower[4:]  # Remove "list" prefix
                    # Handle common patterns
                    if "chainadapter" in field_name_camel:
                        field_name_camel = "chainAdapters"
                    elif field_name_camel.endswith("s"):
                        # Already plural, convert to camelCase
                        if "chain" in field_name_camel:
                            field_name_camel = "chains"
                        elif "wallet" in field_name_camel:
                            field_name_camel = "wallets"
                    else:
                        # Make plural
                        field_name_camel = field_name_camel + "s"
                elif handler_lower.startswith("get"):
                    field_name_camel = handler_lower[3:]  # Remove "get" prefix
                elif handler_lower.startswith("create"):
                    field_name_camel = handler_lower[6:]  # Remove "create" prefix
                else:
                    field_name_camel = handler_lower
                setup_lines.append(f"      {mock_name}.mockResolvedValue(expected.{field_name_camel});")

        return "\n".join(setup_lines) if setup_lines else ""

    @staticmethod
    def _generate_handler_verification_code(handler_mocks: Dict[str, str]) -> str:
        """Generate code to verify handlers were called"""
        if not handler_mocks:
            return ""

        verification_lines = []
        for handler_name in sorted(handler_mocks.keys()):
            mock_name = f"mock{pascal_case(handler_name)}"
            verification_lines.append(f"      expect({mock_name}).toHaveBeenCalledTimes(1);")

        return "\n".join(verification_lines) if verification_lines else ""

    @staticmethod
    def _generate_org_isolation_verification(handler_mocks: Dict[str, str]) -> str:
        """Generate code to verify handlers are called with orgId"""
        if not handler_mocks:
            return "      // No handlers to verify"

        verification_lines = []
        for handler_name in sorted(handler_mocks.keys()):
            mock_name = f"mock{pascal_case(handler_name)}"
            verification_lines.append(
                f"      expect({mock_name}).toHaveBeenCalledWith(\n"
                f"        expect.anything(),\n"
                f"        TEST_ORG_ID,\n"
                f"        expect.anything()\n"
                f"      );"
            )

        return "\n".join(verification_lines) if verification_lines else "      // No handlers to verify"

    @staticmethod
    def _get_first_handler_mock(handler_mocks: Dict[str, str]) -> str:
        """Get the first handler mock name for error simulation"""
        if not handler_mocks:
            return ""
        first_handler = sorted(handler_mocks.keys())[0]
        return f"mock{pascal_case(first_handler)}"

    @staticmethod
    def _generate_error_simulation_code(handler_mocks: Dict[str, str]) -> str:
        """Generate code to simulate handler error"""
        if not handler_mocks:
            return "      // No handlers to simulate error"
        first_handler = sorted(handler_mocks.keys())[0]
        mock_name = f"mock{pascal_case(first_handler)}"
        return f"      {mock_name}.mockRejectedValue(new FlowError(\"HANDLER_ERROR\", \"Handler failed\", 500));"

    @staticmethod
    def _generate_logger_mock(domain_name: str) -> tuple[str, str]:
        """Generate logger mock for orchestrator domains. Returns (mock_call, import_statement)"""
        # Mock the logger module that orchestrator flows import
        # Use @quub/orchestrators path alias
        logger_path = f"@quub/orchestrators/{domain_name}/logger.js"
        mock_call = f"""// Mock logger for orchestrator flows
vi.mock("{logger_path}", () => ({{
  logger: {{
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  }},
}}));"""
        # Logger mock doesn't need imports (it's just mocked, not imported)
        return (mock_call, "")

    @staticmethod
    def _detect_request_body_schema(flow_file: str, project_root: Path) -> Optional[str]:
        """
        Detect request body schema from flow file.
        Looks for patterns like: identitySchemas.CreateAccountRequest.parse(body)

        Returns entity name (e.g., "Account") or None
        """
        flow_path = Path(flow_file)
        if not flow_path.exists():
            return None

        try:
            content = flow_path.read_text(encoding="utf-8")
            # Pattern: {domain}Schemas.Create{Entity}Request.parse(body)
            pattern = r'(\w+)Schemas\.Create(\w+)Request\.parse\(body\)'
            match = re.search(pattern, content)
            if match:
                return match.group(2)  # Return entity name (e.g., "Account")
        except Exception:
            pass

        return None

    @staticmethod
    def _build_test_content(
        flow: FlowInfo,
        flow_name: str,
        flow_import_name: str,
        test_org_id: str,
        test_account_id: str,
        domain_name: str,
        flow_pascal: str,
        flow_kebab: str,
        handler_mocks: Dict[str, str],
        request_body_factory: Optional[str] = None,
        field_to_handler: Optional[Dict[str, str]] = None
    ) -> tuple[str, str]:
        """Build test content based on flow type"""
        verb = flow.verb.lower()

        # Common test structure for all flows
        if flow.has_body and request_body_factory:
            body_param = f"body: {request_body_factory}()"
        elif flow.has_body:
            body_param = "body: {}"
        else:
            body_param = ""
        params_param = "params: {}" if flow.has_params else ""
        query_param = "query: {}" if flow.has_query else ""

        params_list = []
        if body_param:
            params_list.append(body_param)
        if params_param:
            params_list.append(params_param)
        if query_param:
            params_list.append(query_param)

        params_str = ", ".join(params_list) if params_list else ""
        # Format context line: if params exist, add comma; otherwise no comma
        context_line = "context," if params_str else "context"
        # Format params line: if params exist, add them with proper indentation; otherwise empty
        params_str_line = f"          {params_str}" if params_str else ""

        # Add import for request body factory if needed
        request_body_import = ""
        if request_body_factory:
            request_body_import = f"import {{ {request_body_factory} }} from \"../factories/{domain_name}.entity.factory.js\";\n"

        # Generate mock setup and verification code
        mock_setup_code = FlowTestBuilder._generate_mock_setup_code(
            handler_mocks, field_to_handler or {}, flow_pascal
        )
        handler_verification_code = FlowTestBuilder._generate_handler_verification_code(handler_mocks)
        org_isolation_verification = FlowTestBuilder._generate_org_isolation_verification(handler_mocks)
        first_handler_mock = FlowTestBuilder._get_first_handler_mock(handler_mocks)

        if verb == "create":
            test_code = f"""  describe("✅ Happy Path", () => {{
    it("should execute {flow_name} successfully", async () => {{
      // Use factory to create expected response structure
      const expected = create{flow_pascal}Response();
{mock_setup_code}
      const result = await {flow_import_name}(
        {{
          {context_line}{params_str_line}
        }},
        deps
      );

      expect(result).toBeDefined();
      // Verify result structure matches expected response
      expect(result).toMatchObject(expected);
{handler_verification_code}
    }});
  }});

  describe("🔒 Org Isolation", () => {{
    it("should enforce org isolation", async () => {{
      // Set up minimal mocks for org isolation test
      const expected = create{flow_pascal}Response();
{mock_setup_code}
      await {flow_import_name}(
        {{
          {context_line}{params_str_line}
        }},
        deps
      );

      // Verify handlers are called with orgId from context
{org_isolation_verification}
    }});
  }});

  describe("⚠️ Error Handling", () => {{
    it("should handle validation errors", async () => {{
      // Test ZodError handling
      await expect(
        {flow_import_name}(
          {{
            context,
            body: {{ invalid: "data" }},
            {params_param if params_param else ""}
            {query_param if query_param else ""}
          }},
          deps
        )
      ).rejects.toThrow(FlowError);

      // Verify error code
      try {{
        await {flow_import_name}(
          {{
            context,
            body: {{ invalid: "data" }},
            {params_param if params_param else ""}
            {query_param if query_param else ""}
          }},
          deps
        );
        expect.fail("Should have thrown FlowError");
      }} catch (error) {{
        expect(error).toBeInstanceOf(FlowError);
        if (error instanceof FlowError) {{
          expect(error.code).toBe("VALIDATION_ERROR");
        }}
      }}
    }});

    it("should propagate FlowError", async () => {{
      // Simulate handler error
      {f"const {first_handler_mock} = mock{pascal_case(sorted(handler_mocks.keys())[0]) if handler_mocks else ''};" if first_handler_mock else "// No handlers to mock"}
      {f"{first_handler_mock}.mockRejectedValue(new FlowError(\"HANDLER_ERROR\", \"Handler failed\", 500));" if first_handler_mock else ""}

      await expect(
        {flow_import_name}(
          {{
            {context_line}{params_str_line}
          }},
          deps
        )
      ).rejects.toThrow(FlowError);
    }});
  }});"""
            return (test_code, request_body_import)

        elif verb == "list" or verb == "get":
            test_code = f"""  describe("✅ Happy Path", () => {{
    it("should execute {flow_name} successfully", async () => {{
      // Use factory to create expected response structure
      const expected = create{flow_pascal}Response();
{mock_setup_code}
      const result = await {flow_import_name}(
        {{
          {context_line}{params_str_line}
        }},
        deps
      );

      expect(result).toBeDefined();
      // Verify result structure matches expected response
      expect(result).toMatchObject(expected);
{handler_verification_code}
    }});
  }});

  describe("🔒 Org Isolation", () => {{
    it("should enforce org isolation", async () => {{
      // Set up minimal mocks for org isolation test
      const expected = create{flow_pascal}Response();
{mock_setup_code}
      await {flow_import_name}(
        {{
          {context_line}{params_str_line}
        }},
        deps
      );

      // Verify handlers are called with orgId from context
{org_isolation_verification}
    }});
  }});

  describe("⚠️ Error Handling", () => {{
    it("should propagate FlowError", async () => {{
      // Simulate handler error
{FlowTestBuilder._generate_error_simulation_code(handler_mocks)}
      await expect(
        {flow_import_name}(
          {{
            {context_line}{params_str_line}
          }},
          deps
        )
      ).rejects.toThrow(FlowError);
    }});
  }});"""
            return (test_code, request_body_import)

        else:
            test_code = f"""  describe("✅ Happy Path", () => {{
    it("should execute {flow_name} successfully", async () => {{
      // Use factory to create expected response structure
      const expected = create{flow_pascal}Response();
{mock_setup_code}
      const result = await {flow_import_name}(
        {{
          {context_line}{params_str_line}
        }},
        deps
      );

      expect(result).toBeDefined();
      // Verify result structure matches expected response
      expect(result).toMatchObject(expected);
{handler_verification_code}
    }});
  }});

  describe("🔒 Org Isolation", () => {{
    it("should enforce org isolation", async () => {{
      // Set up minimal mocks for org isolation test
      const expected = create{flow_pascal}Response();
{mock_setup_code}
      await {flow_import_name}(
        {{
          {context_line}{params_str_line}
        }},
        deps
      );

      // Verify handlers are called with orgId from context
{org_isolation_verification}
    }});
  }});

  describe("⚠️ Error Handling", () => {{
    it("should propagate FlowError", async () => {{
      // Simulate handler error
{FlowTestBuilder._generate_error_simulation_code(handler_mocks)}
      await expect(
        {flow_import_name}(
          {{
            {context_line}{params_str_line}
          }},
          deps
        )
      ).rejects.toThrow(FlowError);
    }});
  }});"""
            return (test_code, request_body_import)
