/**
 * Generic ID Generator
 *
 * Provides a simple, domain-agnostic ID generation utility.
 * Domain-specific ID generators should be defined in each domain's utils folder.
 */

import { randomUUID } from "crypto";

/**
 * Generates a unique ID with an optional prefix
 *
 * @param prefix - Optional prefix to prepend to the UUID
 * @returns A unique ID string
 */
export function generateId(prefix?: string): string {
  return prefix ? `${prefix}-${randomUUID()}` : randomUUID();
}

