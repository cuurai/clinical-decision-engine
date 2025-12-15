/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { CreateProcedureResponse } from "../../types/index.js";
import type { ProcedureRepository } from "../../repositories/index.js";
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
 * Create procedure
 */
export async function createProcedure(
    repo: ProcedureRepository,
    orgId: string,
    input: unknown
): Promise<CreateProcedureResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const procedure = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: procedure,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
