/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type { GetDataImportBatchResponse } from "../../types/index.js";
import type { DataImportBatchRepository } from "../../repositories/index.js";
import { iiTransactionId } from "../../utils/transaction-id.js";

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
