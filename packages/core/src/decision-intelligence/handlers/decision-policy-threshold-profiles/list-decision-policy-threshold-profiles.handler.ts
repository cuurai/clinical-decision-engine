/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/.bundled/openapi-decision-intelligence.json
 */

import type { ListDecisionPolicyThresholdProfilesResponse } from "../../types/index.js";
import type { DecisionPolicyThresholdProfileRepository } from "../../repositories/index.js";
import { diTransactionId } from "../../../shared/helpers/id-generator.js";

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
  };

}
