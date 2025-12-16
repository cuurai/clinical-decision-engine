/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetIntegrationRunResponse } from "../../types/index.js";
import type { IntegrationRunRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../utils/transaction-id.js";

/**
 * Get integration run by ID
 */
export async function getIntegrationRun(
    repo: IntegrationRunRepository,
    orgId: string,
    id: string
): Promise<GetIntegrationRunResponse> {
  const integrationRun = await repo.findById(orgId, id);
  if (!integrationRun) {
    throw new Error("Not found");
  }

  return {
    data: integrationRun,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
