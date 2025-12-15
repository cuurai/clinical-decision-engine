/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type {
  UpdateChecklistTemplateResponse,
  UpdateChecklistTemplateInput,
} from "../../types/index.js";
import type { ChecklistTemplateRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): UpdateChecklistTemplateInput {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input as UpdateChecklistTemplateInput;
}

/**
 * Update checklist template
 */
export async function updateChecklistTemplate(
  repo: ChecklistTemplateRepository,
  orgId: string,
  id: string,
  input: unknown
): Promise<UpdateChecklistTemplateResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  // Update requests are wrapped, extract data property
  const updateData = (validated as any).data ?? validated;
  const checklistTemplate = await repo.update(orgId, id, updateData);

  // 3. Repository result → response envelope
  return {
    data: checklistTemplate,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };
}
