/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { ListMedicationOrdersParams, ListMedicationOrdersResponse } from "../../types/index.js";
import type { MedicationOrderRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../shared/helpers";

/**
 * List medication orders
 */
export async function listMedicationOrders(
    repo: MedicationOrderRepository,
    orgId: string,
    params?: ListMedicationOrdersParams
): Promise<ListMedicationOrdersResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: result.items,
    meta: {
      correlationId: unknownTransactionId(),
      timestamp: new Date().toISOString(),
      totalCount: result.total ?? result.items.length,
      pageSize: result.items.length,
      pageNumber: 1,
    },
  };

}
