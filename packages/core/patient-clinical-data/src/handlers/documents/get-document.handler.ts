/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetDocumentResponse } from "@cuur-cde/core/patient-clinical-data/types";
import type { DocumentRepository } from "@cuur-cde/core/patient-clinical-data/repositories";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data/utils/transaction-id";

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
