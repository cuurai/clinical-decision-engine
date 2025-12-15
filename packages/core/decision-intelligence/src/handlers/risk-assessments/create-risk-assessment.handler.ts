/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { CreateRiskAssessmentResponse } from "../../types/index.js";
import type { RiskAssessmentRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create risk assessment
 */
export async function createRiskAssessment(
    repo: RiskAssessmentRepository,
    orgId: string,
    input: unknown
): Promise<CreateRiskAssessmentResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const riskAssessment = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: riskAssessment,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
