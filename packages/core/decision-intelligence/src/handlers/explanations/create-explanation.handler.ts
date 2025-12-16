/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { CreateExplanationResponse } from "../../types/index.js"
import type { ExplanationRepository } from "../../repositories/index.js"
import { diTransactionId } from "../../utils/transaction-id.js"
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create explanation
 */
export async function createExplanation(
    repo: ExplanationRepository,
    orgId: string,
    input: unknown
): Promise<CreateExplanationResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const explanation = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: explanation,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
