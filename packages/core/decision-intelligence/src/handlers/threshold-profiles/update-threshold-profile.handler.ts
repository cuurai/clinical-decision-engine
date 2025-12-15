/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { UpdateThresholdProfileResponse } from "../../types/index.js";
import type { ThresholdProfileRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/src/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update threshold profile
 */
export async function updateThresholdProfile(
    repo: ThresholdProfileRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateThresholdProfileResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const thresholdProfile = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: thresholdProfile,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
