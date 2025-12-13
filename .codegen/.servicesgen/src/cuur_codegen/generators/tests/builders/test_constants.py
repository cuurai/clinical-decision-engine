"""
Test Constants Builder

Centralized test configuration constants
"""

from dataclasses import dataclass


@dataclass
class TestConstants:
    """Test configuration constants"""
    FIXED_DATE: str = "2025-01-01T00:00:00Z"
    FAKER_SEED: int = 12345
    TEST_ORG_ID: str = "ID_01HQZX3K8PQRS7VN6M9TW1ABJZ"
    TEST_ACCOUNT_ID: str = "ID_01HQZX3K8PQRS7VN6M9TW1ABJZ"
    TEST_USER_EMAIL: str = "test@example.com"
    TEST_JWT_SECRET: str = "test-secret-key-for-e2e-testing"


# Singleton instance
TEST_CONSTANTS = TestConstants()


def generate_test_constants() -> str:
    """Generate test constants code snippet"""
    return f"""  const FIXED_DATE = new Date("{TEST_CONSTANTS.FIXED_DATE}");
  const FAKER_SEED = {TEST_CONSTANTS.FAKER_SEED};
  const TEST_ORG_ID = "{TEST_CONSTANTS.TEST_ORG_ID}";"""

