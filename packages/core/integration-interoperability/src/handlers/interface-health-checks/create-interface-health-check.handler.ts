/**
 * AUTO-GENERATED CODE — DO NOT EDIT
 *
 * Generator: Handler Generator v1.0.0
 * Source: /Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi/.bundled/openapi-integration-interoperability.json
 */

import type {
  CreateInterfaceHealthCheckResponse,
  CreateInterfaceHealthCheckInput,
} from "@cuur-cde/core/integration-interoperability/types";
import type { InterfaceHealthCheckRepository } from "@cuur-cde/core/integration-interoperability/repositories";
import { iiTransactionId } from "@cuur-cde/core/integration-interoperability/utils/transaction-id";
/**
 * Mapper: input → validated
 */
function mapInputToValidated(input: unknown): CreateInterfaceHealthCheckInput {
  // Note: Request body validation is handled by service layer schemas
  // Handlers accept validated input and focus on business logic
  return input as CreateInterfaceHealthCheckInput;
}

/**
 * Create interface health check (immutable)
 *
 * Creates an immutable interface health check snapshot. Once created, health checks cannot be
 * modified to ensure historical accuracy.
 *
 */
export async function createInterfaceHealthCheck(
  repo: InterfaceHealthCheckRepository,
  orgId: string,
  input: unknown
): Promise<CreateInterfaceHealthCheckResponse> {
  // 1. Validate input
  const validated = mapInputToValidated(input);

  // 2. Domain input → Repository call
  if (!validated.data) {
    throw new Error("Invalid input: data is required");
  }
  const interfaceHealthCheck = await repo.create(orgId, validated.data);

  // 3. Repository result → response envelope
  return {
    data: interfaceHealthCheck,
    meta: {
      correlationId: iiTransactionId(),
      timestamp: new Date().toISOString(),
    },
  };
}
