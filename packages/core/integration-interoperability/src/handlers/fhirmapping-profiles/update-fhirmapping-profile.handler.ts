/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { UpdateFHIRMappingProfileResponse } from "@cuur-cde/core/integration-interoperability/types";
import type { FHIRMappingProfileRepository } from "@cuur-cde/core/integration-interoperability/repositories";
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
 * Update FHIR mapping profile
 */
export async function updateFHIRMappingProfile(
    repo: FHIRMappingProfileRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateFHIRMappingProfileResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const fHIRMappingProfile = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: fHIRMappingProfile,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
