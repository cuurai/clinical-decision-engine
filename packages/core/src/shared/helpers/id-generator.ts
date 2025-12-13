/**
 * Transaction ID Generators for Different Domains
 */

import { randomUUID } from "crypto";

/**
 * Generates a unique transaction ID for Decision Intelligence operations
 */
export function decTransactionId(): string {
  return `DEC-${randomUUID()}`;
}

/**
 * Generates a unique transaction ID for Integration Interoperability operations
 */
export function intTransactionId(): string {
  return `INT-${randomUUID()}`;
}

/**
 * Generates a unique transaction ID for Knowledge Evidence operations
 */
export function knoTransactionId(): string {
  return `KNO-${randomUUID()}`;
}

/**
 * Generates a unique transaction ID for Patient Clinical Data operations
 */
export function patTransactionId(): string {
  return `PAT-${randomUUID()}`;
}

/**
 * Generates a unique transaction ID for Workflow Care Pathways operations
 */
export function worTransactionId(): string {
  return `WOR-${randomUUID()}`;
}

/**
 * Generates a generic unique ID
 */
export function generateId(): string {
  return randomUUID();
}
