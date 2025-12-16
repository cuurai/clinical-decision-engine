/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetModelDefinitionResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { ModelDefinitionRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";

/**
 * Get model definition by ID
 */
export async function getModelDefinition(
    repo: ModelDefinitionRepository,
    orgId: string,
    id: string
): Promise<GetModelDefinitionResponse> {
  const modelDefinition = await repo.findById(orgId, id);
  if (!modelDefinition) {
    throw new Error("Not found");
  }

  return {
    data: modelDefinition,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
