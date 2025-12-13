/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetPatientResponse } from "../../types/index.js";
import type { PatientRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get patient by ID
 */
export async function getPatient(
    repo: PatientRepository,
    orgId: string,
    id: string
): Promise<GetPatientResponse> {
  const patient = await repo.findById(orgId, id);
  if (!patient) {
    throw new Error("Not found");
  }

  return {
    data: patient,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
