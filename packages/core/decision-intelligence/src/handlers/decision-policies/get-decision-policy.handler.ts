/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetDecisionPolicyResponse } from "@cuur-cde/core/decision-intelligence";
import type { DecisionPolicyRepository } from "@cuur-cde/core/decision-intelligence";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence";

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
