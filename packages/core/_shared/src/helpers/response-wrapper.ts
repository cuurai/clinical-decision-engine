/**
 * Response Wrapper Utilities
 *
 * Wraps OpenAPI-generated response types to include the standard envelope:
 * { data: T, meta?: { correlationId?: string } }
 */

import type { SimpleApiResponse, SimpleApiListResponse } from "./core-converters.js";
export type WrapResponse<T> = SimpleApiResponse<T>;

/**
 * Wrap an OpenAPI list response type to include the standard envelope
 *
 * @example
 * type ListUsersResponse = WrapListResponse<operations["listUsers"]["responses"]["200"]["content"]["application/json"]>;
 */
export type WrapListResponse<T extends any[]> = T extends any[]
  ? SimpleApiListResponse<T[number]>
  : SimpleApiListResponse<T>;

/**
 * Create a wrapped response
 */
export function createResponse<T>(data: T, correlationId?: string): SimpleApiResponse<T> {
  return {
    data,
    ...(correlationId && { meta: { correlationId } }),
  };
}

/**
 * Create a wrapped list response
 */
export function createListResponse<T>(data: T[], correlationId?: string): SimpleApiListResponse<T> {
  return {
    data,
    ...(correlationId && { meta: { correlationId } }),
  };
}
