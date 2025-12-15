/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { CreateTaskAssignmentResponse } from "../../types/index.js";
import type { TaskAssignmentRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create task assignment
 */
export async function createTaskAssignment(
    repo: TaskAssignmentRepository,
    orgId: string,
    input: unknown
): Promise<CreateTaskAssignmentResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const taskAssignment = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: taskAssignment,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
