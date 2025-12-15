/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type {
  CreateChecklistInstanceResponse,
  CreateChecklistInstanceInput,
} from "../../types/index.js";
import type { ChecklistInstanceRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";
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
