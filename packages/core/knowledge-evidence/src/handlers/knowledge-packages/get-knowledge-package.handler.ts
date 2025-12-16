/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetKnowledgePackageResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { KnowledgePackageRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";

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
