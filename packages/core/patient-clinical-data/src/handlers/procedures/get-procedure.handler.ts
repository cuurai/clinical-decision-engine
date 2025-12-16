/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetProcedureResponse } from "@cuur-cde/core/patient-clinical-data/types";
import type { ProcedureRepository } from "@cuur-cde/core/patient-clinical-data/repositories";
import { pcTransactionId } from "@cuur-cde/core/patient-clinical-data/utils/transaction-id";

/**
 * Get procedure by ID
 */
export async function getProcedure(
    repo: ProcedureRepository,
    orgId: string,
    id: string
): Promise<GetProcedureResponse> {
  const procedure = await repo.findById(orgId, id);
  if (!procedure) {
    throw new Error("Not found");
  }

  return {
    data: procedure,
    meta: {
      correlationId: pcTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
