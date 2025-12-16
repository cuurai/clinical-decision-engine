import { generateId } from "@cuur-cde/core/_shared";

/**
 * Generates a unique transaction ID for Integration Interoperability operations
 */
export const intTransactionId = () => generateId("INT");
export const iiTransactionId = intTransactionId;
