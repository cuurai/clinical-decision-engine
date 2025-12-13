/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { ListDecisionPolicyThresholdProfilesResponse } from "../../types/index.js";
import type { DecisionPolicyThresholdProfileRepository } from "../../repositories/index.js";
import { decTransactionId } from "../../../shared/helpers";

/**
 * List decision policy threshold profiles
 */
export async function listDecisionPolicyThresholdProfiles(
    repo: DecisionPolicyThresholdProfileRepository,
    orgId: string
): Promise<ListDecisionPolicyThresholdProfilesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: result.items,
    meta: {
      correlationId: decTransactionId(),
      timestamp: new Date().toISOString(),
      totalCount: result.total ?? result.items.length,
      pageSize: result.items.length,
      pageNumber: 1,
    },
  };

}
