/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type {
  CreateChecklistInstanceResponse,
  CreateChecklistInstanceInput,
} from "@cuur-cde/core/workflow-care-pathways";
import type { ChecklistInstanceRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../utils/transaction-id.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): CreateChecklistInstanceInput {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input as CreateChecklistInstanceInput;
}

/**
 * Create checklist instance
 */
export async function createChecklistInstance(
  repo: ChecklistInstanceRepository,
  orgId: string,
  input: unknown
): Promise<CreateChecklistInstanceResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  if (!validated.data) {
    throw new Error("Invalid input: data is required");
  }
  const checklistInstance = await repo.create(orgId, validated.data);

  // 3. Repository result → response envelope
  return {
    data: checklistInstance,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };
}
