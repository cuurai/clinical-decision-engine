/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetHLMappingProfileResponse } from "@cuur-cde/core/integration-interoperability";
import type { HL7MappingProfileRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

/**
 * Get HL7 mapping profile by ID
 */
export async function getHL7MappingProfile(
    repo: HL7MappingProfileRepository,
    orgId: string,
    id: string
): Promise<GetHLMappingProfileResponse> {
  const hLMappingProfile = await repo.findById(orgId, id);
  if (!hLMappingProfile) {
    throw new Error("Not found");
  }

  return {
    data: hLMappingProfile,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
