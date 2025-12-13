/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-decision-intelligence.json
 */

import type { ListSimulationScenariosParams, ListSimulationScenariosResponse } from "../../types/index.js";
import type { SimulationScenarioRepository } from "../../repositories/index.js";
import { decTransactionId } from "../../shared/helpers";

/**
 * List simulation scenarios
 */
export async function listSimulationScenarios(
    repo: SimulationScenarioRepository,
    orgId: string,
    params?: ListSimulationScenariosParams
): Promise<ListSimulationScenariosResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, params);


  // Return paginated response matching OpenAPI response type
  // Structure matches ProviderAccountListResponse: { data: { items: [...] }, meta: { ... } }
  return {
    data: {
      items: result.items,
    },
    meta: {
      correlationId: decTransactionId(),
      timestamp: new Date().toISOString(),
      pagination: {
        nextCursor: result.nextCursor ?? null,
        prevCursor: result.prevCursor ?? null,
        limit: result.items.length,
      },
    },
  };

}
