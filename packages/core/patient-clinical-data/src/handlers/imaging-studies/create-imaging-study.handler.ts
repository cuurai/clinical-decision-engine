/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { CreateImagingStudyResponse } from "../../types/index.js";
import type { ImagingStudyRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Create imaging study
 */
export async function createImagingStudy(
    repo: ImagingStudyRepository,
    orgId: string,
    input: unknown
): Promise<CreateImagingStudyResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  const imagingStudy = await repo.create(orgId, validated);

  // 3. Repository result → response envelope
  return {
    data: imagingStudy,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
