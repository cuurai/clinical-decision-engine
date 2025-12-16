/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { CreateImmunizationResponse } from "../../types/index.js";
import type { ImmunizationRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create immunization
 */
export async function createImmunization(
    repo: ImmunizationRepository,
    orgId: string,
    input: unknown
): Promise<CreateImmunizationResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const immunization = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: immunization,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
