/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { UpdateExternalSystemResponse } from "../../types/index.js";
import type { ExternalSystemRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../../shared/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update external system
 */
export async function updateExternalSystem(
    repo: ExternalSystemRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateExternalSystemResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const externalSystem = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: externalSystem,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
