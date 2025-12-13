"""
Handler Test Builder

Generates individual handler test files
"""

from typing import Optional
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import kebab_case, pascal_case, singularize
from .handler_discovery import HandlerInfo
from .repository_discovery import RepositoryInfo
from .test_constants import TEST_CONSTANTS, generate_test_constants
from .test_case_builders import TestCaseBuilders


class HandlerTestBuilder:
    """Builds handler test files"""

    @staticmethod
    def build_handler_test(
        operation: HandlerInfo,
        repo: Optional[RepositoryInfo],
        domain_name: str,
        header: str,
        context: GenerationContext
    ) -> str:
        """Build handler test file content"""
        resource_pascal = pascal_case(operation.resource)
        handler_name = operation.handler_name
        mock_repo_name = f"Mock{repo.interface_name}" if repo else None

        # Infer entity name
        entity_pascal = (
            repo.entity_name if repo
            else pascal_case(singularize(operation.resource))
        )

        # Handler import name
        handler_import_name = handler_name

        # Factory function
        factory_function = f"create{entity_pascal}"
        input_factory_function = None  # Factories don't export input factories

        test_org_id = TEST_CONSTANTS.TEST_ORG_ID

        # Build test content based on verb
        test_content = HandlerTestBuilder._build_test_content(
            operation,
            repo,
            resource_pascal,
            handler_name,
            handler_import_name,
            test_org_id,
            entity_pascal,
            factory_function,
            input_factory_function
        )

        repo_imports = (
            f'import {{ {mock_repo_name} }} from "../../mocks/index.js";'
            if mock_repo_name else ""
        )

        # Factory imports
        factory_imports = f"seedFaker,\n    {factory_function}"

        return f"""{header}
/**
 * {handler_name} Handler Tests
 *
 * Maps to: packages/core/src/{domain_name}/handlers/{kebab_case(
    operation.resource
  )}/{kebab_case(operation.verb)}-{kebab_case(operation.resource)}.ts
 * Strategy: Mock repositories, handler-centric, business rules focus
 */

import {{ describe, it, expect, beforeEach, afterEach, vi }} from "vitest";
import {{ {handler_import_name} as {handler_import_name}Handler }} from "@cuur/core/{domain_name}/handlers/index.js";
{repo_imports}
import {{ {factory_imports} }} from "@quub/factories";

describe("{handler_name} - Business Rules", () => {{
{mock_repo_name and f"  let repo: {mock_repo_name};" or ""}{generate_test_constants()}

  beforeEach(() => {{
{mock_repo_name and f"""    repo = new {mock_repo_name}();
    repo.reset();""" or ""}
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
    seedFaker(FAKER_SEED);
  }});

  afterEach(() => {{
    vi.useRealTimers();
  }});

{test_content}
}});
"""

    @staticmethod
    def _build_test_content(
        operation: HandlerInfo,
        repo: Optional[RepositoryInfo],
        resource_pascal: str,
        handler_name: str,
        handler_import_name: str,
        test_org_id: str,
        entity_pascal: str,
        factory_function: str,
        input_factory_function: Optional[str]
    ) -> str:
        """Build test content based on operation type"""
        handler_call = f"{handler_import_name}Handler"

        verb = operation.verb.lower()
        if verb == "create":
            return TestCaseBuilders.build_create_tests(
                operation, repo, resource_pascal, handler_name, handler_call,
                test_org_id, entity_pascal, factory_function, input_factory_function
            )
        elif verb == "list":
            return TestCaseBuilders.build_list_tests(
                operation, repo, resource_pascal, handler_name, handler_call,
                test_org_id, entity_pascal, factory_function
            )
        elif verb == "get":
            return TestCaseBuilders.build_get_tests(
                operation, repo, resource_pascal, handler_name, handler_call,
                test_org_id, entity_pascal, factory_function
            )
        elif verb == "update":
            return TestCaseBuilders.build_update_tests(
                operation, repo, resource_pascal, handler_name, handler_call,
                test_org_id, entity_pascal, factory_function
            )
        elif verb == "delete":
            return TestCaseBuilders.build_delete_tests(
                operation, repo, resource_pascal, handler_name, handler_call,
                test_org_id, entity_pascal, factory_function
            )
        else:
            return f"""  describe("✅ Happy Path", () => {{
    it("should handle {handler_name}", async () => {{
      // TODO: Implement test
      expect(true).toBe(true);
    }});
  }});"""
