import { generateId } from "@cuur-cde/core/_shared";

/**
 * Generates a unique transaction ID for Patient Clinical Data operations
 */
export const patTransactionId = () => generateId("PAT");
export const pcTransactionId = patTransactionId;
