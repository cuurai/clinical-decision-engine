/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { ListDiagnosticReportsParams, ListDiagnosticReportsResponse } from "../../types/index.js";
import type { DiagnosticReportRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../shared/helpers";

/**
 * List diagnostic reports
 */
export async function listDiagnosticReports(
    repo: DiagnosticReportRepository,
    orgId: string,
    params?: ListDiagnosticReportsParams
): Promise<ListDiagnosticReportsResponse> {
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
