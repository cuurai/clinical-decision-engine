/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetDocumentResponse } from "../../types/index.js";
import type { DocumentRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../utils/transaction-id.js";

/**
 * Get document reference by ID
 */
export async function getDocument(
    repo: DocumentRepository,
    orgId: string,
    id: string
): Promise<GetDocumentResponse> {
  const document = await repo.findById(orgId, id);
  if (!document) {
    throw new Error("Not found");
  }

  return {
    data: document,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
