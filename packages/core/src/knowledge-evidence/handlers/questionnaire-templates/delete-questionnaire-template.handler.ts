/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { QuestionnaireTemplateRepository } from "../../repositories/index.js";
import { knoTransactionId } from "../../shared/helpers";

/**
 * Delete questionnaire template
 */
export async function deleteQuestionnaireTemplate(
    repo: QuestionnaireTemplateRepository,
    orgId: string,
    id: string
): Promise<any> {
  await repo.delete(orgId, id);
  // For 204 No Content responses, return void (no response body)
  // For 200 OK responses, return success response
  return {
    data: { success: true },
    meta: {
      correlationId: knoTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
