/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { ThresholdProfileRepository } from "../../repositories/index.js";
import { decTransactionId } from "../../shared/helpers";

/**
 * Delete threshold profile
 */
export async function deleteThresholdProfile(
    repo: ThresholdProfileRepository,
    orgId: string,
    id: string
): Promise<any> {
  await repo.delete(orgId, id);
  // For 204 No Content responses, return void (no response body)
  // For 200 OK responses, return success response
  return {
    data: { success: true },
    meta: {
      correlationId: decTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
