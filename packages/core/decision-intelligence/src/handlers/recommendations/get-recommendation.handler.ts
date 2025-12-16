/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { GetRecommendationResponse } from "@cuur-cde/core/decision-intelligence/types";
import type { RecommendationRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";

/**
 * Get recommendation by ID
 */
export async function getRecommendation(
    repo: RecommendationRepository,
    orgId: string,
    id: string
): Promise<GetRecommendationResponse> {
  const recommendation = await repo.findById(orgId, id);
  if (!recommendation) {
    throw new Error("Not found");
  }

  return {
    data: recommendation,
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
