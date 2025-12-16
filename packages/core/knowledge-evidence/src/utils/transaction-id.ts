import { generateId } from "@cuur-cde/core/_shared";

/**
 * Generates a unique transaction ID for Knowledge Evidence operations
 */
export const knoTransactionId = () => generateId("KNO");
export const keTransactionId = knoTransactionId;
