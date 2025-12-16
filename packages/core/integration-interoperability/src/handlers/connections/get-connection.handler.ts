/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetConnectionResponse } from "@cuur-cde/core/integration-interoperability/types";
import type { ConnectionRepository } from "@cuur-cde/core/integration-interoperability/repositories";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability/utils/transaction-id";

/**
 * Get connection by ID
 */
export async function getConnection(
    repo: ConnectionRepository,
    orgId: string,
    id: string
): Promise<GetConnectionResponse> {
  const connection = await repo.findById(orgId, id);
  if (!connection) {
    throw new Error("Not found");
  }

  return {
    data: connection,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
