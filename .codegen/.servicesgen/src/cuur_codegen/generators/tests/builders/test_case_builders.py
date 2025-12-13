"""
Test Case Builders

Generates test cases for different handler operations (create, list, get, update, delete)
"""

from typing import Optional
from .handler_discovery import HandlerInfo
from .repository_discovery import RepositoryInfo


class TestCaseBuilders:
    """Builds test cases for different operations"""

    @staticmethod
    def build_create_tests(
        _operation: HandlerInfo,
        repo: Optional[RepositoryInfo],
        resource_pascal: str,
        _handler_name: str,
        handler_call: str,
        _test_org_id: str,
        _entity_pascal: str,
        factory_function: str,
        input_factory_function: Optional[str]
    ) -> str:
        """Build create handler test cases"""
        input_factory = input_factory_function or factory_function
        repo_param = "repo, " if repo else ""

        return f"""  describe("✅ Happy Path", () => {{
    it("should create {resource_pascal.lower()} with valid data", async () => {{
      const input = {input_factory}();

      const result = await {handler_call}(
        {repo_param}TEST_ORG_ID,
        input
      );

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBeDefined();
      expect(result.data?.orgId).toBe(TEST_ORG_ID);
    }});
  }});

  describe("🔒 Org Isolation", () => {{
    it("should enforce org isolation", async () => {{
      const input = {input_factory}();

      const result = await {handler_call}(
        {repo_param}TEST_ORG_ID,
        input
      );

      expect(result.data?.orgId).toBe(TEST_ORG_ID);
    }});
  }});"""

    @staticmethod
    def build_list_tests(
        _operation: HandlerInfo,
        repo: Optional[RepositoryInfo],
        resource_pascal: str,
        _handler_name: str,
        handler_call: str,
        _test_org_id: str,
        _entity_pascal: str,
        factory_function: str
    ) -> str:
        """Build list handler test cases"""
        if not repo:
            return f"""  describe("✅ Happy Path", () => {{
    it("should list {resource_pascal.lower()}s", async () => {{
      const result = await {handler_call}(TEST_ORG_ID);

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    }});
  }});"""

        return f"""  describe("✅ Happy Path", () => {{
    it("should list {resource_pascal.lower()}s with default pagination", async () => {{
      // Create test data
      await repo.create(TEST_ORG_ID, {factory_function}());

      const result = await {handler_call}(
        repo,
        TEST_ORG_ID,
        {{}}
      );

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.meta).toBeDefined();
    }});

    it("should respect pagination limit", async () => {{
      // Create multiple items
      for (let i = 0; i < 5; i++) {{
        await repo.create(TEST_ORG_ID, {factory_function}());
      }}

      const result = await {handler_call}(
        repo,
        TEST_ORG_ID,
        {{ limit: 2 }}
      );

      expect(result.data?.length).toBeLessThanOrEqual(2);
    }});
  }});

  describe("🔒 Org Isolation", () => {{
    it("should only return {resource_pascal.lower()}s for the specified org", async () => {{
      const otherOrgId = "ID_01HQZX3K8PQRS7VN6M9TW1ABJX";

      await repo.create(TEST_ORG_ID, {factory_function}());
      await repo.create(otherOrgId, {factory_function}());

      const result = await {handler_call}(
        repo,
        TEST_ORG_ID,
        {{}}
      );

      expect(result.data?.every((item: any) => item.orgId === TEST_ORG_ID)).toBe(true);
    }});
  }});"""

    @staticmethod
    def build_get_tests(
        operation: HandlerInfo,
        repo: Optional[RepositoryInfo],
        resource_pascal: str,
        _handler_name: str,
        handler_call: str,
        _test_org_id: str,
        _entity_pascal: str,
        factory_function: str
    ) -> str:
        """Build get handler test cases"""
        if not repo or not operation.has_repository:
            return f"""  describe("✅ Happy Path", () => {{
    it("should get {resource_pascal.lower()} for org", async () => {{
      const result = await {handler_call}(TEST_ORG_ID);

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    }});
  }});

  describe("❌ Error Cases", () => {{
    it("should return empty array for org with no {resource_pascal.lower()}", async () => {{
      const result = await {handler_call}(TEST_ORG_ID);

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBe(0);
    }});
  }});"""

        return f"""  describe("✅ Happy Path", () => {{
    it("should get {resource_pascal.lower()} by id", async () => {{
      const created = await repo.create(TEST_ORG_ID, {factory_function}());

      const result = await {handler_call}(
        repo,
        TEST_ORG_ID,
        created.id
      );

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(created.id);
      expect(result.data?.orgId).toBe(TEST_ORG_ID);
    }});
  }});

  describe("❌ Error Cases", () => {{
    it("should return null for non-existent {resource_pascal.lower()}", async () => {{
      const result = await {handler_call}(
        repo,
        TEST_ORG_ID,
        "non-existent-id"
      );

      expect(result.data).toBeNull();
    }});
  }});

  describe("🔒 Org Isolation", () => {{
    it("should not return {resource_pascal.lower()} from different org", async () => {{
      const otherOrgId = "ID_01HQZX3K8PQRS7VN6M9TW1ABJX";
      const created = await repo.create(otherOrgId, {factory_function}());

      const result = await {handler_call}(
        repo,
        TEST_ORG_ID,
        created.id
      );

      expect(result.data).toBeNull();
    }});
  }});"""

    @staticmethod
    def build_update_tests(
        _operation: HandlerInfo,
        repo: Optional[RepositoryInfo],
        resource_pascal: str,
        _handler_name: str,
        handler_call: str,
        _test_org_id: str,
        _entity_pascal: str,
        factory_function: str
    ) -> str:
        """Build update handler test cases"""
        if not repo:
            return ""

        return f"""  describe("✅ Happy Path", () => {{
    it("should update {resource_pascal.lower()} with valid data", async () => {{
      const created = await repo.create(TEST_ORG_ID, {factory_function}());

      const result = await {handler_call}(
        repo,
        TEST_ORG_ID,
        created.id,
        {{}}
      );

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe(created.id);
    }});
  }});

  describe("🔒 Org Isolation", () => {{
    it("should not update {resource_pascal.lower()} from different org", async () => {{
      const otherOrgId = "ID_01HQZX3K8PQRS7VN6M9TW1ABJX";
      const created = await repo.create(otherOrgId, {factory_function}());

      await expect(
        {handler_call}(repo, TEST_ORG_ID, created.id, {{}})
      ).rejects.toThrow();
    }});
  }});"""

    @staticmethod
    def build_delete_tests(
        _operation: HandlerInfo,
        repo: Optional[RepositoryInfo],
        resource_pascal: str,
        _handler_name: str,
        handler_call: str,
        _test_org_id: str,
        _entity_pascal: str,
        factory_function: str
    ) -> str:
        """Build delete handler test cases"""
        if not repo:
            return ""

        return f"""  describe("✅ Happy Path", () => {{
    it("should delete {resource_pascal.lower()}", async () => {{
      const created = await repo.create(TEST_ORG_ID, {factory_function}());

      await {handler_call}(
        repo,
        TEST_ORG_ID,
        created.id
      );

      const result = await repo.findById(TEST_ORG_ID, created.id);
      expect(result).toBeNull();
    }});
  }});

  describe("🔒 Org Isolation", () => {{
    it("should not delete {resource_pascal.lower()} from different org", async () => {{
      const otherOrgId = "ID_01HQZX3K8PQRS7VN6M9TW1ABJX";
      const created = await repo.create(otherOrgId, {factory_function}());

      await expect(
        {handler_call}(repo, TEST_ORG_ID, created.id)
      ).rejects.toThrow();
    }});
  }});"""

