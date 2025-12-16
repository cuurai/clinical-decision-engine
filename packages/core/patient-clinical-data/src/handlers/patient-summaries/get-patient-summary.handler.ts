/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetPatientSummaryResponse } from "../../types/index.js";
import type { PatientSummaryRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../utils/transaction-id.js";

/**
 * Get patient summary
 */
export async function getPatientSummary(
    repo: PatientSummaryRepository,
    orgId: string,
    id: string
): Promise<GetPatientSummaryResponse> {
  const patientSummary = await repo.findById(orgId, id);
  if (!patientSummary) {
    throw new Error("Not found");
  }

  return {
    data: patientSummary,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
