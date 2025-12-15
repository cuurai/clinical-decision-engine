/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { UpdateDataExportBatchResponse } from "../../types/index.js";
import type { DataExportBatchRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../../../_shared/src/helpers/id-generator.js";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): any {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input;
}


/**
 * Update data export batch
 */
export async function updateDataExportBatch(
    repo: DataExportBatchRepository,
    orgId: string,
    id: string,
    input: unknown
): Promise<UpdateDataExportBatchResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call (update operation)
  const dataExportBatch = await repo.update(orgId, id, validated);

  // 3. Repository result → response envelope
  return {
    data: dataExportBatch,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
