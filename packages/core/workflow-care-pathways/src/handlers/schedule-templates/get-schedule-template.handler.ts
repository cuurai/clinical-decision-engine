/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { GetScheduleTemplateResponse } from "../../types/index.js";
import type { ScheduleTemplateRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get schedule template by ID
 */
export async function getScheduleTemplate(
    repo: ScheduleTemplateRepository,
    orgId: string,
    id: string
): Promise<GetScheduleTemplateResponse> {
  const scheduleTemplate = await repo.findById(orgId, id);
  if (!scheduleTemplate) {
    throw new Error("Not found");
  }

  return {
    data: scheduleTemplate,
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
