/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { UpdateMedicationOrderResponse } from "../../types/index.js";
import type { MedicationOrderRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../shared/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update medication order
 */
export async function updateMedicationOrder(
    repo: MedicationOrderRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateMedicationOrderResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const medicationOrder = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: medicationOrder,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
