/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetObservationResponse } from "../../types/index.js";
import type { ObservationRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../utils/transaction-id.js";

/**
 * Get observation by ID
 */
export async function getObservation(
    repo: ObservationRepository,
    orgId: string,
    id: string
): Promise<GetObservationResponse> {
  const observation = await repo.findById(orgId, id);
  if (!observation) {
    throw new Error("Not found");
  }

  return {
    data: observation,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
