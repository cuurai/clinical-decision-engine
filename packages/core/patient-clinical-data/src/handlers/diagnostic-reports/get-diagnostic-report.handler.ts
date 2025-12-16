/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetDiagnosticReportResponse } from "@cuur-cde/core/patient-clinical-data/types";
import type { DiagnosticReportRepository } from "@cuur-cde/core/patient-clinical-data/repositories";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data/utils/transaction-id";

/**
 * Get diagnostic report by ID
 */
export async function getDiagnosticReport(
    repo: DiagnosticReportRepository,
    orgId: string,
    id: string
): Promise<GetDiagnosticReportResponse> {
  const diagnosticReport = await repo.findById(orgId, id);
  if (!diagnosticReport) {
    throw new Error("Not found");
  }

  return {
    data: diagnosticReport,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
