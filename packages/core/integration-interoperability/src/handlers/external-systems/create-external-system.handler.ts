/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { CreateExternalSystemResponse } from "@cuur-cde/core/integration-interoperability/types";
import type { ExternalSystemRepository } from "@cuur-cde/core/integration-interoperability/repositories";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create external system
 */
export async function createExternalSystem(
    repo: ExternalSystemRepository,
    orgId: string,
    input: unknown
): Promise<CreateExternalSystemResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const externalSystem = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: externalSystem,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
