"""
Update Body Builder - Builds handler body for update/patch operations
"""

from typing import Dict, Any
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.generators.core.handlers.body.response_analyzer import ResponseAnalyzer


class UpdateBodyBuilder:
    """Builds update handler body"""

    @staticmethod
    def build(
        context: GenerationContext,
        operation: Dict[str, Any],
        resource: str,
        entity_var: str,
        id_function: str
    ) -> str:
        """Build update handler body"""
        responses = operation.get("responses", {})
        is_204_response = "204" in responses and ("200" not in responses and "201" not in responses)

        if is_204_response:
            return UpdateBodyBuilder._build_204_response_body(id_function)

        # Check for OperationSuccessResponse
        uses_operation_success = ResponseAnalyzer.uses_operation_success(operation, context, "200")
        if uses_operation_success:
            return UpdateBodyBuilder._build_operation_success_body(id_function)

        # Check for array response
        is_array_response = ResponseAnalyzer.is_array_response(operation, context, "200")
        if is_array_response:
            return UpdateBodyBuilder._build_array_response_body(entity_var, id_function)

        # Normal update response
        return UpdateBodyBuilder._build_normal_response_body(entity_var, id_function)

    @staticmethod
    def _build_204_response_body(id_function: str) -> str:
        """Build 204 No Content response body"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  await repo.update(orgId, id, validated);

  // 3. Return NoContentResponse (204 No Content)
  return {{
    data: {{ success: true }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_operation_success_body(id_function: str) -> str:
        """Build OperationSuccessResponse body"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  await repo.update(orgId, id, validated);

  // 3. Return success response (OperationSuccessResponse)
  return {{
    data: {{ success: true }},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_array_response_body(entity_var: str, id_function: str) -> str:
        """Build array response body"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const {entity_var} = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope (array response)
  return {{
    data: [{entity_var}],
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""

    @staticmethod
    def _build_normal_response_body(entity_var: str, id_function: str) -> str:
        """Build normal update response body"""
        return f"""  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const {entity_var} = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {{
    data: {entity_var},
    meta: {{
      correlationId: {id_function}(),
      timestamp: new Date().toISOString(),
    }},
  }};
"""
