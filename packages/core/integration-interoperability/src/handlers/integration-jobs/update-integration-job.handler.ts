/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { UpdateIntegrationJobResponse } from "@cuur-cde/core/integration-interoperability";
import type { IntegrationJobRepository } from "@cuur-cde/core/integration-interoperability";
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
 * Update integration job
 */
export async function updateIntegrationJob(
    repo: IntegrationJobRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateIntegrationJobResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const integrationJob = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: integrationJob,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
