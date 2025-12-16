/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { CreateIntegrationRunResponse } from "../../types/index.js";
import type { IntegrationRunRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create integration run (immutable)
 *
 * Creates an immutable integration run record. Once created, runs cannot be
 * modified to ensure audit trail integrity.
 * 
 */
export async function createIntegrationRun(
    repo: IntegrationRunRepository,
    orgId: string,
    input: unknown
): Promise<CreateIntegrationRunResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const integrationRun = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: integrationRun,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
