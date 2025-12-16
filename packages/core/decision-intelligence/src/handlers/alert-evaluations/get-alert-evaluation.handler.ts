/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetAlertEvaluationResponse } from "@cuur-cde/core/decision-intelligence/types";
import type { AlertEvaluationRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";

/**
 * Get alert evaluation by ID
 */
export async function getAlertEvaluation(
    repo: AlertEvaluationRepository,
    orgId: string,
    id: string
): Promise<GetAlertEvaluationResponse> {
  const alertEvaluation = await repo.findById(orgId, id);
  if (!alertEvaluation) {
    throw new Error("Not found");
  }

  return {
    data: alertEvaluation,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
