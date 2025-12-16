/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetFHIRMappingProfileResponse } from "@cuur-cde/core/integration-interoperability/types";
import type { FHIRMappingProfileRepository } from "@cuur-cde/core/integration-interoperability/repositories";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability/utils/transaction-id";

/**
 * Get FHIR mapping profile by ID
 */
export async function getFHIRMappingProfile(
    repo: FHIRMappingProfileRepository,
    orgId: string,
    id: string
): Promise<GetFHIRMappingProfileResponse> {
  const fHIRMappingProfile = await repo.findById(orgId, id);
  if (!fHIRMappingProfile) {
    throw new Error("Not found");
  }

  return {
    data: fHIRMappingProfile,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
