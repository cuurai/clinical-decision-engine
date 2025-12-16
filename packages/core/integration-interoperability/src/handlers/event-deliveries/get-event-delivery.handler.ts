/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetEventDeliveryResponse } from "../../types/index.js";
import type { EventDeliveryRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../utils/transaction-id.js";

/**
 * Get event delivery by ID
 */
export async function getEventDelivery(
    repo: EventDeliveryRepository,
    orgId: string,
    id: string
): Promise<GetEventDeliveryResponse> {
  const eventDelivery = await repo.findById(orgId, id);
  if (!eventDelivery) {
    throw new Error("Not found");
  }

  return {
    data: eventDelivery,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
