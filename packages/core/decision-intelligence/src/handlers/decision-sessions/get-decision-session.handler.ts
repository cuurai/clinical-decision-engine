/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetDecisionSessionResponse } from "@cuur-cde/core/decision-intelligence/types";
import type { DecisionSessionRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";

/**
 * Get decision session by ID
 */
export async function getDecisionSession(
    repo: DecisionSessionRepository,
    orgId: string,
    id: string
): Promise<GetDecisionSessionResponse> {
  const decisionSession = await repo.findById(orgId, id);
  if (!decisionSession) {
    throw new Error("Not found");
  }

  return {
    data: decisionSession,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
