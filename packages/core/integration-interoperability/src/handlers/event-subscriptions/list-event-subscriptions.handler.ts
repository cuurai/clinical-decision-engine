/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { ListEventSubscriptionsParams, ListEventSubscriptionsResponse } from "@cuur-cde/core/integration-interoperability/types";
import type { EventSubscriptionRepository } from "@cuur-cde/core/integration-interoperability/repositories";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability/utils/transaction-id";

/**
 * List event subscriptions
 */
export async function listEventSubscriptions(
    repo: EventSubscriptionRepository,
    orgId: string,
    params?: ListEventSubscriptionsParams
): Promise<ListEventSubscriptionsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  } as ListEventSubscriptionsResponse;

}
