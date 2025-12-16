/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { ListPatientConditionsResponse } from "@cuur-cde/core/patient-clinical-data";
import type { PatientConditionRepository } from "@cuur-cde/core/patient-clinical-data";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data";

/**
 * List patient conditions
 */
export async function listPatientConditions(
    repo: PatientConditionRepository,
    orgId: string
): Promise<ListPatientConditionsResponse> {
  // Call repository list method with params (if provided)
  const result = await repo.list(orgId, undefined);


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
  } as ListPatientConditionsResponse;

}
