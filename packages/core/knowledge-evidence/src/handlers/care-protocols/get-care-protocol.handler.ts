/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetCareProtocolResponse } from "@cuur-cde/core/knowledge-evidence";
import type { CareProtocolRepository } from "@cuur-cde/core/knowledge-evidence";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence";

/**
 * Get care protocol template by ID
 */
export async function getCareProtocol(
    repo: CareProtocolRepository,
    orgId: string,
    id: string
): Promise<GetCareProtocolResponse> {
  const careProtocol = await repo.findById(orgId, id);
  if (!careProtocol) {
    throw new Error("Not found");
  }

  return {
    data: careProtocol,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
