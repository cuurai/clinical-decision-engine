/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetEventSubscriptionResponse } from "@cuur-cde/core/integration-interoperability";
import type { EventSubscriptionRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

/**
 * Get event subscription by ID
 */
export async function getEventSubscription(
    repo: EventSubscriptionRepository,
    orgId: string,
    id: string
): Promise<GetEventSubscriptionResponse> {
  const eventSubscription = await repo.findById(orgId, id);
  if (!eventSubscription) {
    throw new Error("Not found");
  }

  return {
    data: eventSubscription,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
