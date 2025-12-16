/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { ListThresholdProfilesParams, ListThresholdProfilesResponse } from "@cuur-cde/core/decision-intelligence/types";
import type { ThresholdProfileRepository } from "@cuur-cde/core/decision-intelligence/repositories";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence/utils/transaction-id";

/**
 * List threshold profiles
 */
export async function listThresholdProfiles(
    repo: ThresholdProfileRepository,
    orgId: string,
    params?: ListThresholdProfilesParams
): Promise<ListThresholdProfilesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


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
  } as ListThresholdProfilesResponse;

}
