/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { ListDecisionResultRecommendationsResponse } from "../../types/index.js";
import type { DecisionResultRecommendationRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../../_shared/helpers/id-generator.js";

/**
 * List decision result recommendations
 */
export async function listDecisionResultRecommendations(
    repo: DecisionResultRecommendationRepository,
    orgId: string
): Promise<ListDecisionResultRecommendationsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: diTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  } as ListDecisionResultRecommendationsResponse;

}
