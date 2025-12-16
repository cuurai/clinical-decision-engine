/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetMedicationStatementResponse } from "@cuur-cde/core/patient-clinical-data";
import type { MedicationStatementRepository } from "@cuur-cde/core/patient-clinical-data";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data";

/**
 * Get medication statement by ID
 */
export async function getMedicationStatement(
    repo: MedicationStatementRepository,
    orgId: string,
    id: string
): Promise<GetMedicationStatementResponse> {
  const medicationStatement = await repo.findById(orgId, id);
  if (!medicationStatement) {
    throw new Error("Not found");
  }

  return {
    data: medicationStatement,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
