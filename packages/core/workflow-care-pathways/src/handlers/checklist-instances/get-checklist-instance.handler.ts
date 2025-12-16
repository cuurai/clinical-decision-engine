/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetChecklistInstanceResponse } from "@cuur-cde/core/workflow-care-pathways";
import type { ChecklistInstanceRepository } from "@cuur-cde/core/workflow-care-pathways";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways";

/**
 * Get checklist instance by ID
 */
export async function getChecklistInstance(
    repo: ChecklistInstanceRepository,
    orgId: string,
    id: string
): Promise<GetChecklistInstanceResponse> {
  const checklistInstance = await repo.findById(orgId, id);
  if (!checklistInstance) {
    throw new Error("Not found");
  }

  return {
    data: checklistInstance,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
