/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { UpdateObservationResponse } from "../../types/index.js";
import type { ObservationRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update observation
 */
export async function updateObservation(
    repo: ObservationRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateObservationResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const observation = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: observation,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
