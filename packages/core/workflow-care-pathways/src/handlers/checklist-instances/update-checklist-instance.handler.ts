/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type {
  UpdateChecklistInstanceResponse,
  UpdateChecklistInstanceInput,
} from "@cuur-cde/core/workflow-care-pathways";
import type { ChecklistInstanceRepository } from "@cuur-cde/core/workflow-care-pathways";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): UpdateChecklistInstanceInput {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input as UpdateChecklistInstanceInput;
}

/**
 * Update checklist instance
 */
export async function updateChecklistInstance(
  repo: ChecklistInstanceRepository,
  orgId: string,
  id: string,
  input: unknown
): Promise<UpdateChecklistInstanceResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  // Update requests are wrapped, extract data property
  const updateData = (validated as any).data ?? validated;
  const checklistInstance = await repo.update(orgId, id, updateData);

  // 3. Repository result → response envelope
  return {
    data: checklistInstance,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };
}
