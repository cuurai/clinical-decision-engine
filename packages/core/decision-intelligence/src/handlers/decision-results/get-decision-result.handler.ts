/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetDecisionResultResponse } from "@cuur-cde/core/decision-intelligence";
import type { DecisionResultRepository } from "@cuur-cde/core/decision-intelligence";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence";

/**
 * Get decision result by ID
 */
export async function getDecisionResult(
    repo: DecisionResultRepository,
    orgId: string,
    id: string
): Promise<GetDecisionResultResponse> {
  const decisionResult = await repo.findById(orgId, id);
  if (!decisionResult) {
    throw new Error("Not found");
  }

  return {
    data: decisionResult,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
