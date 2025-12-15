/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetImmunizationResponse } from "../../types/index.js";
import type { ImmunizationRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

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
