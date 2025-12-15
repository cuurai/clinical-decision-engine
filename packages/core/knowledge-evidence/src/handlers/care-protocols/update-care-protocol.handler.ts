/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { UpdateCareProtocolResponse } from "../../types/index.js";
import type { CareProtocolRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../../../_shared/src/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update care protocol template
 */
export async function updateCareProtocol(
    repo: CareProtocolRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateCareProtocolResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const careProtocol = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: careProtocol,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
