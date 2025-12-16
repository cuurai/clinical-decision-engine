/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetHLMessageResponse } from "@cuur-cde/core/integration-interoperability";
import type { HL7MessageRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

/**
 * Get HL7 message by ID
 */
export async function getHL7Message(
    repo: HL7MessageRepository,
    orgId: string,
    id: string
): Promise<GetHLMessageResponse> {
  const hLMessage = await repo.findById(orgId, id);
  if (!hLMessage) {
    throw new Error("Not found");
  }

  return {
    data: hLMessage,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
