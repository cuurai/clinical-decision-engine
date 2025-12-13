/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetRiskAssessmentResponse } from "../../types/index.js";
import type { RiskAssessmentRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get risk assessment by ID
 */
export async function getRiskAssessment(
    repo: RiskAssessmentRepository,
    orgId: string,
    id: string
): Promise<GetRiskAssessmentResponse> {
  const riskAssessment = await repo.findById(orgId, id);
  if (!riskAssessment) {
    throw new Error("Not found");
  }

  return {
    data: riskAssessment,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
