"""
Test Index Builder

Generates test barrel exports (index.ts)
"""

from cuur_codegen.utils.string import pascal_case
from .repository_discovery import RepositoryInfo


class TestIndexBuilder:
    """Builds test index files"""

    @staticmethod
    def build_test_index(
        repositories: list[RepositoryInfo],
        domain_name: str,
        header: str
    ) -> str:
        """Build test index file with barrel exports"""
        domain_pascal = pascal_case(domain_name)

        mock_exports = "\n".join(
            f"  {f'Mock{r.interface_name}'},"
            for r in repositories
        )

        return f"""{header}
/**
 * {domain_pascal} Service Test Utilities
 *
 * Barrel export for mock repositories and test helpers.
 * Import these in {domain_name} service tests for consistent mocking.
 *
 * NOTE: Mock repositories are service-specific and live here, NOT in @quub/factories.
 * @quub/factories contains only reusable data factories.
 */

// Mock Repositories (service-specific, from mocks/)
export {{
{mock_exports}
}} from "./mocks/index.js";

// Test setup helpers
export {{
  TEST_JWT_SECRET,
  TEST_ORG_ID,
  TEST_ACCOUNT_ID,
  TEST_USER_EMAIL,
  generateAuthToken,
  parseJsonResponse,
}} from "./e2e/setup.js";
"""
