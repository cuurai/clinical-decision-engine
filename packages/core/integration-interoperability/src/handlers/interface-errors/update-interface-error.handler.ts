/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { UpdateInterfaceErrorResponse } from "@cuur-cde/core/integration-interoperability";
import type { InterfaceErrorRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update interface error
 */
export async function updateInterfaceError(
    repo: InterfaceErrorRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateInterfaceErrorResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const interfaceError = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: interfaceError,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
