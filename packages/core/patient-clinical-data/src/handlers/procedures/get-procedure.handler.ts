/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-patient-clinical-data.json
 */

import type { GetProcedureResponse } from "../../types/index.js";
import type { ProcedureRepository } from "../../repositories/index.js";
import { pcTransactionId } from "../../../../_shared/src/helpers/id-generator.js";

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
