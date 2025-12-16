/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { CreateThresholdProfileResponse } from "@cuur-cde/core/decision-intelligence/types";
import type { ThresholdProfileRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create threshold profile
 */
export async function createThresholdProfile(
    repo: ThresholdProfileRepository,
    orgId: string,
    input: unknown
): Promise<CreateThresholdProfileResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const thresholdProfile = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: thresholdProfile,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
