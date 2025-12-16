/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { ListAlertEvaluationsParams, ListAlertEvaluationsResponse } from "@cuur-cde/core/decision-intelligence";
import type { AlertEvaluationRepository } from "@cuur-cde/core/decision-intelligence";
import { diTransactionId } from "@cuur-cde/core/decision-intelligence";

/**
 * List alert evaluations
 */
export async function listAlertEvaluations(
    repo: AlertEvaluationRepository,
    orgId: string,
    params?: ListAlertEvaluationsParams
): Promise<ListAlertEvaluationsResponse> {
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
  } as ListAlertEvaluationsResponse;

}
