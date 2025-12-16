/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetEncounterResponse } from "@cuur-cde/core/patient-clinical-data/types";
import type { EncounterRepository } from "@cuur-cde/core/patient-clinical-data/repositories";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data/utils/transaction-id";

/**
 * Get encounter by ID
 */
export async function getEncounter(
    repo: EncounterRepository,
    orgId: string,
    id: string
): Promise<GetEncounterResponse> {
  const encounter = await repo.findById(orgId, id);
  if (!encounter) {
    throw new Error("Not found");
  }

  return {
    data: encounter,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
