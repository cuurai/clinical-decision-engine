/**
 * Transaction ID Generators for Different Domains
 */
import { randomUUID } from "crypto";
/**
 * Generates a unique transaction ID for Decision Intelligence operations
 */
export function decTransactionId() {
    return `DEC-${randomUUID()}`;
}
/**
 * Generates a unique transaction ID for Integration Interoperability operations
 */
export function intTransactionId() {
    return `INT-${randomUUID()}`;
}
/**
 * Generates a unique transaction ID for Knowledge Evidence operations
 */
export function knoTransactionId() {
    return `KNO-${randomUUID()}`;
}
/**
 * Generates a unique transaction ID for Patient Clinical Data operations
 */
export function patTransactionId() {
    return `PAT-${randomUUID()}`;
}
/**
 * Generates a unique transaction ID for Workflow Care Pathways operations
 */
export function worTransactionId() {
    return `WOR-${randomUUID()}`;
}
/**
 * Generates a generic unique ID
 */
export function generateId() {
    return randomUUID();
}
// Aliases for handler convenience (shorter prefixes)
export const diTransactionId = decTransactionId;
export const iiTransactionId = intTransactionId;
export const keTransactionId = knoTransactionId;
export const pcTransactionId = patTransactionId;
export const wcTransactionId = worTransactionId;
//# sourceMappingURL=id-generator.js.map