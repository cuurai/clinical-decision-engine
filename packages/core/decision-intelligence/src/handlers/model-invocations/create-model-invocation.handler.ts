/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { CreateModelInvocationResponse } from "../../types/index.js";
import type { ModelInvocationRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create model invocation (immutable)
 *
 * Creates an immutable model invocation record. Once created, invocations cannot be
 * modified to ensure audit trail integrity.
 * 
 */
export async function createModelInvocation(
    repo: ModelInvocationRepository,
    orgId: string,
    input: unknown
): Promise<CreateModelInvocationResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const modelInvocation = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: modelInvocation,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
