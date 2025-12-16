/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetDecisionPolicyResponse } from "../../types/index.js"
import type { DecisionPolicyRepository } from "../../repositories/index.js"
import { diTransactionId } from "../../utils/transaction-id.js"

/**
 * Get decision policy by ID
 */
export async function getDecisionPolicy(
    repo: DecisionPolicyRepository,
    orgId: string,
    id: string
): Promise<GetDecisionPolicyResponse> {
  const decisionPolicy = await repo.findById(orgId, id);
  if (!decisionPolicy) {
    throw new Error("Not found");
  }

  return {
    data: decisionPolicy,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
