/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetAPIClientResponse } from "../../types/index.js";
import type { APIClientRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

/**
 * Get API client by ID
 */
export async function getAPIClient(
    repo: APIClientRepository,
    orgId: string,
    id: string
): Promise<GetAPIClientResponse> {
  const aPIClient = await repo.findById(orgId, id);
  if (!aPIClient) {
    throw new Error("Not found");
  }

  return {
    data: aPIClient,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
