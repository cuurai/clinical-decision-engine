import { generateId } from "@cuur-cde/core/_shared";

/**
 * Generates a unique transaction ID for Decision Intelligence operations
 */
export const decTransactionId = () => generateId("DEC");
export const diTransactionId = decTransactionId;
