/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { UpdateQuestionnaireTemplateResponse } from "@cuur-cde/core/knowledge-evidence";
import type { QuestionnaireTemplateRepository } from "@cuur-cde/core/knowledge-evidence";
import { keTransactionId } from "@cuur-cde/core/knowledge-evidence";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update questionnaire template
 */
export async function updateQuestionnaireTemplate(
    repo: QuestionnaireTemplateRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateQuestionnaireTemplateResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const questionnaireTemplate = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: questionnaireTemplate,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
