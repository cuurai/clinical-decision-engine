/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetImmunizationResponse } from "@cuur-cde/core/patient-clinical-data";
import type { ImmunizationRepository } from "@cuur-cde/core/patient-clinical-data";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data";

/**
 * Get immunization by ID
 */
export async function getImmunization(
    repo: ImmunizationRepository,
    orgId: string,
    id: string
): Promise<GetImmunizationResponse> {
  const immunization = await repo.findById(orgId, id);
  if (!immunization) {
    throw new Error("Not found");
  }

  return {
    data: immunization,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
