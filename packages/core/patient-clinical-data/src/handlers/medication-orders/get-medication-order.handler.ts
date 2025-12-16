/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetMedicationOrderResponse } from "@cuur-cde/core/patient-clinical-data";
import type { MedicationOrderRepository } from "@cuur-cde/core/patient-clinical-data";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data";

/**
 * Get medication order by ID
 */
export async function getMedicationOrder(
    repo: MedicationOrderRepository,
    orgId: string,
    id: string
): Promise<GetMedicationOrderResponse> {
  const medicationOrder = await repo.findById(orgId, id);
  if (!medicationOrder) {
    throw new Error("Not found");
  }

  return {
    data: medicationOrder,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
