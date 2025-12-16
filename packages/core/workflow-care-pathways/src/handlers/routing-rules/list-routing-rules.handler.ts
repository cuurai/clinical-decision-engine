/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { ListRoutingRulesParams, ListRoutingRulesResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { RoutingRuleRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";

/**
 * List routing rules
 */
export async function listRoutingRules(
    repo: RoutingRuleRepository,
    orgId: string,
    params?: ListRoutingRulesParams
): Promise<ListRoutingRulesResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


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
  } as ListRoutingRulesResponse;

}
