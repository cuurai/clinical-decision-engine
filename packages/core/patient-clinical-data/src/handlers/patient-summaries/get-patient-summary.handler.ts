/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetPatientSummaryResponse } from "@cuur-cde/core/patient-clinical-data/types";
import type { PatientSummaryRepository } from "@cuur-cde/core/patient-clinical-data/repositories";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data/utils/transaction-id";

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
