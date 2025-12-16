/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { RecommendationRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";

/**
 * Delete recommendation
 */
export async function deleteRecommendation(
    repo: RecommendationRepository,
    orgId: string,
    id: string
): Promise<any> {
  await repo.delete(orgId, id);
  // For 204 No Content responses, return void (no response body)
  // For 200 OK responses, return success response
  return {
    data: { success: true },
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
