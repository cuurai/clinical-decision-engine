import { generateId } from "@cuur-cde/core/_shared";

/**
 * Generates a unique transaction ID for Workflow Care Pathways operations
 */
export const worTransactionId = () => generateId("WOR");
export const wcTransactionId = worTransactionId;
