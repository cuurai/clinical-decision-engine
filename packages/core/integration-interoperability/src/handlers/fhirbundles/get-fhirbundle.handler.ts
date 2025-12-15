/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetFHIRBundleResponse } from "../../types/index.js";
import type { FHIRBundleRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

/**
 * Get FHIR bundle by ID
 */
export async function getFHIRBundle(
    repo: FHIRBundleRepository,
    orgId: string,
    id: string
): Promise<GetFHIRBundleResponse> {
  const fHIRBundle = await repo.findById(orgId, id);
  if (!fHIRBundle) {
    throw new Error("Not found");
  }

  return {
    data: fHIRBundle,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
