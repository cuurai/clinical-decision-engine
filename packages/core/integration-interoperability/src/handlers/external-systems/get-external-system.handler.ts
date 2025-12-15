/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetExternalSystemResponse } from "../../types/index.js";
import type { ExternalSystemRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

/**
 * Get external system by ID
 */
export async function getExternalSystem(
    repo: ExternalSystemRepository,
    orgId: string,
    id: string
): Promise<GetExternalSystemResponse> {
  const externalSystem = await repo.findById(orgId, id);
  if (!externalSystem) {
    throw new Error("Not found");
  }

  return {
    data: externalSystem,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
