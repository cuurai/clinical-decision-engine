/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { ListMedicationStatementsParams, ListMedicationStatementsResponse } from "../../types/index.js";
import type { MedicationStatementRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../shared/helpers";

/**
 * List medication statements
 */
export async function listMedicationStatements(
    repo: MedicationStatementRepository,
    orgId: string,
    params?: ListMedicationStatementsParams
): Promise<ListMedicationStatementsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  };

}
