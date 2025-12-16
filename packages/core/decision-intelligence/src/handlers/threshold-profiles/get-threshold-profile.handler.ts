/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetThresholdProfileResponse } from "@cuur-cde/core/decision-intelligence/types";
import type { ThresholdProfileRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";

/**
 * Get threshold profile by ID
 */
export async function getThresholdProfile(
    repo: ThresholdProfileRepository,
    orgId: string,
    id: string
): Promise<GetThresholdProfileResponse> {
  const thresholdProfile = await repo.findById(orgId, id);
  if (!thresholdProfile) {
    throw new Error("Not found");
  }

  return {
    data: thresholdProfile,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
