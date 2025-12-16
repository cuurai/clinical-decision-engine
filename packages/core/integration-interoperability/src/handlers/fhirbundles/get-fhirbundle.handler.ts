/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetFHIRBundleResponse } from "@cuur-cde/core/integration-interoperability/types";
import type { FHIRBundleRepository } from "@cuur-cde/core/integration-interoperability/repositories";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability/utils/transaction-id";

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
