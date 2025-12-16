/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetAllergyResponse } from "@cuur-cde/core/patient-clinical-data/types";
import type { AllergyRepository } from "@cuur-cde/core/patient-clinical-data/repositories";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data/utils/transaction-id";

/**
 * Get allergy by ID
 */
export async function getAllergy(
    repo: AllergyRepository,
    orgId: string,
    id: string
): Promise<GetAllergyResponse> {
  const allergy = await repo.findById(orgId, id);
  if (!allergy) {
    throw new Error("Not found");
  }

  return {
    data: allergy,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
