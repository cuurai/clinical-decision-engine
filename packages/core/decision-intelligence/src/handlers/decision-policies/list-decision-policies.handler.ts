/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { ListDecisionPoliciesParams, ListDecisionPoliciesResponse } from "../../types/index.js"
import type { DecisionPolicyRepository } from "../../repositories/index.js"
import { diTransactionId } from "../../utils/transaction-id.js"

/**
 * List decision policies
 */
export async function listDecisionPolicies(
    repo: DecisionPolicyRepository,
    orgId: string,
    params?: ListDecisionPoliciesParams
): Promise<ListDecisionPoliciesResponse> {
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
  } as ListDecisionPoliciesResponse;

}
