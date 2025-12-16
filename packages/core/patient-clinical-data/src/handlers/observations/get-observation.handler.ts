/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetObservationResponse } from "@cuur-cde/core/patient-clinical-data/types";
import type { ObservationRepository } from "@cuur-cde/core/patient-clinical-data/repositories";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data/utils/transaction-id";

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
