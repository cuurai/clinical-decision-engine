/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetChecklistTemplateResponse } from "../../types/index.js";
import type { ChecklistTemplateRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

/**
 * Get checklist template by ID
 */
export async function getChecklistTemplate(
    repo: ChecklistTemplateRepository,
    orgId: string,
    id: string
): Promise<GetChecklistTemplateResponse> {
  const checklistTemplate = await repo.findById(orgId, id);
  if (!checklistTemplate) {
    throw new Error("Not found");
  }

  return {
    data: checklistTemplate,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
