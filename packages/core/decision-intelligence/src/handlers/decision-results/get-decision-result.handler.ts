/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetDecisionResultResponse } from "../../types/index.js";
import type { DecisionResultRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/helpers/id-generator.js";

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
