/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetAPICredentialResponse } from "../../types/index.js";
import type { APICredentialRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../utils/transaction-id.js";

/**
 * Get API credential by ID
 */
export async function getAPICredential(
    repo: APICredentialRepository,
    orgId: string,
    id: string
): Promise<GetAPICredentialResponse> {
  const aPICredential = await repo.findById(orgId, id);
  if (!aPICredential) {
    throw new Error("Not found");
  }

  return {
    data: aPICredential,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
