/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetDataImportBatchResponse } from "@cuur-cde/core/integration-interoperability";
import type { DataImportBatchRepository } from "@cuur-cde/core/integration-interoperability";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability";

/**
 * Get data import batch by ID
 */
export async function getDataImportBatch(
    repo: DataImportBatchRepository,
    orgId: string,
    id: string
): Promise<GetDataImportBatchResponse> {
  const dataImportBatch = await repo.findById(orgId, id);
  if (!dataImportBatch) {
    throw new Error("Not found");
  }

  return {
    data: dataImportBatch,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
