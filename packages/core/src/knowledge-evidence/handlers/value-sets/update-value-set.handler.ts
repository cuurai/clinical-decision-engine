/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { UpdateValueSetResponse } from "../../types/index.js";
import type { ValueSetRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../../shared/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update value set
 */
export async function updateValueSet(
    repo: ValueSetRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateValueSetResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const valueSet = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: valueSet,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
