/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetIntegrationJobResponse } from "../../types/index.js";
import type { IntegrationJobRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

/**
 * Get integration job by ID
 */
export async function getIntegrationJob(
    repo: IntegrationJobRepository,
    orgId: string,
    id: string
): Promise<GetIntegrationJobResponse> {
  const integrationJob = await repo.findById(orgId, id);
  if (!integrationJob) {
    throw new Error("Not found");
  }

  return {
    data: integrationJob,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
