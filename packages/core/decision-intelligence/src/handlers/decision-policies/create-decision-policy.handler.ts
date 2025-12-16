/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { CreateDecisionPolicyResponse } from "@cuur-cde/core/decision-intelligence";
import type { DecisionPolicyRepository } from "@cuur-cde/core/decision-intelligence";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create decision policy
 */
export async function createDecisionPolicy(
    repo: DecisionPolicyRepository,
    orgId: string,
    input: unknown
): Promise<CreateDecisionPolicyResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const decisionPolicy = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: decisionPolicy,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
