/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { FHIRBundleRepository } from "../../repositories/index.js";
import { intTransactionId } from "../../shared/helpers";

/**
 * Delete FHIR bundle
 */
export async function deleteFHIRBundle(
    repo: FHIRBundleRepository,
    orgId: string,
    id: string
): Promise<any> {
  await repo.delete(orgId, id);
  // For 204 No Content responses, return void (no response body)
  // For 200 OK responses, return success response
  return {
    data: { success: true },
    meta: {
      correlationId: intTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
