/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-knowledge-evidence.json
 */

import type { GetOntologyTermResponse } from "../../types/index.js";
import type { OntologyTermRepository } from "../../repositories/index.js";
import { keTransactionId } from "../../../shared/helpers/id-generator.js";

/**
 * Get ontology term by ID
 */
export async function getOntologyTerm(
    repo: OntologyTermRepository,
    orgId: string,
    id: string
): Promise<GetOntologyTermResponse> {
  const ontologyTerm = await repo.findById(orgId, id);
  if (!ontologyTerm) {
    throw new Error("Not found");
  }

  return {
    data: ontologyTerm,
    meta: {
      correlationId: keTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };

}
