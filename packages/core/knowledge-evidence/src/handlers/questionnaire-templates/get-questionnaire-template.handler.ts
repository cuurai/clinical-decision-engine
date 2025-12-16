/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetQuestionnaireTemplateResponse } from "@cuur-cde/core/knowledge-evidence/types";
import type { QuestionnaireTemplateRepository } from "@cuur-cde/core/knowledge-evidence/repositories";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence/utils/transaction-id";

/**
 * Get questionnaire template by ID
 */
export async function getQuestionnaireTemplate(
    repo: QuestionnaireTemplateRepository,
    orgId: string,
    id: string
): Promise<GetQuestionnaireTemplateResponse> {
  const questionnaireTemplate = await repo.findById(orgId, id);
  if (!questionnaireTemplate) {
    throw new Error("Not found");
  }

  return {
    data: questionnaireTemplate,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
