/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { ListEpisodeOfCareCarePlansResponse } from "../../types/index.js";
import type { EpisodeOfCareCarePlanRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../utils/transaction-id.js";

/**
 * List episode of care care plans
 */
export async function listEpisodeOfCareCarePlans(
    repo: EpisodeOfCareCarePlanRepository,
    orgId: string
): Promise<ListEpisodeOfCareCarePlansResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  } as ListEpisodeOfCareCarePlansResponse;

}
