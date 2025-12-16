/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { UpdateConceptMapResponse } from "../../types/index.js";
import type { ConceptMapRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update concept map
 */
export async function updateConceptMap(
    repo: ConceptMapRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateConceptMapResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const conceptMap = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: conceptMap,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
