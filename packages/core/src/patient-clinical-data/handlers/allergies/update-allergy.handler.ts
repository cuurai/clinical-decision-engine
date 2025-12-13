/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { UpdateAllergyResponse } from "../../types/index.js";
import type { AllergyRepository } from "../../repositories/index.js";
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
 * Update allergy
 */
export async function updateAllergy(
    repo: AllergyRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateAllergyResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const allergy = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: allergy,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
