/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetTaskResponse } from "../../types/index.js";
import type { TaskRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

/**
 * Get task by ID
 */
export async function getTask(
    repo: TaskRepository,
    orgId: string,
    id: string
): Promise<GetTaskResponse> {
  const task = await repo.findById(orgId, id);
  if (!task) {
    throw new Error("Not found");
  }

  return {
    data: task,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
