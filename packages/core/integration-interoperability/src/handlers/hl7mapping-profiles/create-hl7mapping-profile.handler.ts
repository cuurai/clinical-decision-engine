/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { CreateHLMappingProfileResponse } from "../../types/index.js";
import type { HL7MappingProfileRepository } from "../../repositories/index.js";
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
 * Create HL7 mapping profile
 */
export async function createHL7MappingProfile(
    repo: HL7MappingProfileRepository,
    orgId: string,
    input: unknown
): Promise<CreateHLMappingProfileResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const hLMappingProfile = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: hLMappingProfile,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
