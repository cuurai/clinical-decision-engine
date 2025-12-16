/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetScoringTemplateResponse } from "@cuur-cde/core/knowledge-evidence";
import type { ScoringTemplateRepository } from "@cuur-cde/core/knowledge-evidence";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence";

/**
 * Get scoring template by ID
 */
export async function getScoringTemplate(
    repo: ScoringTemplateRepository,
    orgId: string,
    id: string
): Promise<GetScoringTemplateResponse> {
  const scoringTemplate = await repo.findById(orgId, id);
  if (!scoringTemplate) {
    throw new Error("Not found");
  }

  return {
    data: scoringTemplate,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
