/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetDecisionRequestResponse } from "../../types/index.js"
import type { DecisionRequestRepository } from "../../repositories/index.js"
import { diTransactionId } from "../../utils/transaction-id.js"

/**
 * Get decision request by ID
 */
export async function getDecisionRequest(
    repo: DecisionRequestRepository,
    orgId: string,
    id: string
): Promise<GetDecisionRequestResponse> {
  const decisionRequest = await repo.findById(orgId, id);
  if (!decisionRequest) {
    throw new Error("Not found");
  }

  return {
    data: decisionRequest,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
