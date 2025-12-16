/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { CreateDecisionRequestResponse } from "../../types/index.js"
import type { DecisionRequestRepository } from "../../repositories/index.js"
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
 * Create decision request (immutable)
 *
 * Creates an immutable decision request. Once created, decision requests cannot be
 * modified to ensure audit trail integrity.
 * 
 */
export async function createDecisionRequest(
    repo: DecisionRequestRepository,
    orgId: string,
    input: unknown
): Promise<CreateDecisionRequestResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const decisionRequest = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: decisionRequest,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
