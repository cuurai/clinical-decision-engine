/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetTaskResponse } from "@cuur-cde/core/workflow-care-pathways/types";
import type { TaskRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";

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
