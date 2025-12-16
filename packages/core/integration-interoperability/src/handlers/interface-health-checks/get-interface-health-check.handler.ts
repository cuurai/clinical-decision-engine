/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetInterfaceHealthCheckResponse } from "@cuur-cde/core/integration-interoperability";
import type { InterfaceHealthCheckRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

/**
 * Get interface health check by ID
 */
export async function getInterfaceHealthCheck(
    repo: InterfaceHealthCheckRepository,
    orgId: string,
    id: string
): Promise<GetInterfaceHealthCheckResponse> {
  const interfaceHealthCheck = await repo.findById(orgId, id);
  if (!interfaceHealthCheck) {
    throw new Error("Not found");
  }

  return {
    data: interfaceHealthCheck,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
