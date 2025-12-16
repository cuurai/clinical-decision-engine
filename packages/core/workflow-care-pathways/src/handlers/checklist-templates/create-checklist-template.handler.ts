/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type {
  CreateChecklistTemplateResponse,
  CreateChecklistTemplateInput,
} from "@cuur-cde/core/workflow-care-pathways/types";
import type { ChecklistTemplateRepository } from "@cuur-cde/core/workflow-care-pathways/repositories";
import { wcTransactionId } from "@cuur-cde/core/workflow-care-pathways/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): CreateChecklistTemplateInput {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input as CreateChecklistTemplateInput;
}

/**
 * Create checklist template
 */
export async function createChecklistTemplate(
  repo: ChecklistTemplateRepository,
  orgId: string,
  input: unknown
): Promise<CreateChecklistTemplateResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  if (!validated.data) {
    throw new Error("Invalid input: data is required");
  }
  const checklistTemplate = await repo.create(orgId, validated.data);

  // 3. Repository result → response envelope
  return {
    data: checklistTemplate,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };
}
