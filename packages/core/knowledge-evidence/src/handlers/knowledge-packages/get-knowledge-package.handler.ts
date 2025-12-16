/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetKnowledgePackageResponse } from "../../types/index.js";
import type { KnowledgePackageRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../utils/transaction-id.js";

/**
 * Get knowledge package by ID
 */
export async function getKnowledgePackage(
    repo: KnowledgePackageRepository,
    orgId: string,
    id: string
): Promise<GetKnowledgePackageResponse> {
  const knowledgePackage = await repo.findById(orgId, id);
  if (!knowledgePackage) {
    throw new Error("Not found");
  }

  return {
    data: knowledgePackage,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
