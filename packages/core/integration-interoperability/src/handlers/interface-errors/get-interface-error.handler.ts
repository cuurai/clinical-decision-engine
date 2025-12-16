/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetInterfaceErrorResponse } from "@cuur-cde/core/integration-interoperability";
import type { InterfaceErrorRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

/**
 * Get interface error by ID
 */
export async function getInterfaceError(
    repo: InterfaceErrorRepository,
    orgId: string,
    id: string
): Promise<GetInterfaceErrorResponse> {
  const interfaceError = await repo.findById(orgId, id);
  if (!interfaceError) {
    throw new Error("Not found");
  }

  return {
    data: interfaceError,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
