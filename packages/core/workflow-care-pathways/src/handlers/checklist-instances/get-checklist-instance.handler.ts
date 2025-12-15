/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetChecklistInstanceResponse } from "../../types/index.js";
import type { ChecklistInstanceRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

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
