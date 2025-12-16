/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetModelVersionResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { ModelVersionRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";

/**
 * Get model version by ID
 */
export async function getModelVersion(
    repo: ModelVersionRepository,
    orgId: string,
    id: string
): Promise<GetModelVersionResponse> {
  const modelVersion = await repo.findById(orgId, id);
  if (!modelVersion) {
    throw new Error("Not found");
  }

  return {
    data: modelVersion,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
