/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetIntegrationJobResponse } from "@cuur-cde/core/integration-interoperability";
import type { IntegrationJobRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

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
