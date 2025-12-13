/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-workflow-care-pathways.json
 */

import type { ListCarePlansParams, ListCarePlansResponse } from "../../types/index.js";
import type { CarePlanRepository } from "../../repositories/index.js";
import { wcTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * List care plans
 */
export async function listCarePlans(
    repo: CarePlanRepository,
    orgId: string,
    params?: ListCarePlansParams
): Promise<ListCarePlansResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: wcTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  };

}
