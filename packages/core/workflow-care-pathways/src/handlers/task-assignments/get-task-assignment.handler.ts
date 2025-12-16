/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetTaskAssignmentResponse } from "@cuur-cde/core/workflow-care-pathways";
import type { TaskAssignmentRepository } from "@cuur-cde/core/workflow-care-pathways";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways";

/**
 * Get task assignment by ID
 */
export async function getTaskAssignment(
    repo: TaskAssignmentRepository,
    orgId: string,
    id: string
): Promise<GetTaskAssignmentResponse> {
  const taskAssignment = await repo.findById(orgId, id);
  if (!taskAssignment) {
    throw new Error("Not found");
  }

  return {
    data: taskAssignment,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
