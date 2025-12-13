/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetDiagnosticReportResponse } from "../../types/index.js";
import type { DiagnosticReportRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../shared/helpers/id-generator.js";

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
