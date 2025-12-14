/**
 * Response Wrapper Utilities
 *
 * Wraps OpenAPI-generated response types to include the standard envelope:
 * { data: T, meta?: { correlationId?: string } }
 */

import type { ApiResponse, ApiListResponse } from "./core-converters.js";
export type WrapResponse<T> = ApiResponse<T>;

/**
 * Wrap an OpenAPI list response type to include the standard envelope
 *
 * @example
 * type ListUsersResponse = WrapListResponse<operations["listUsers"]["responses"]["200"]["content"]["application/json"]>;
 */
export type WrapListResponse<T extends any[]> = T extends any[]
  ? ApiListResponse<T[number]>
  : ApiListResponse<T>;

/**
 * Create a wrapped response
 */
export function createResponse<T>(data: T, correlationId?: string): ApiResponse<T> {
  return {
    data,
    ...(correlationId && { meta: { correlationId } }),
  };
}

/**
 * Create a wrapped list response
 */
export function createListResponse<T>(data: T[], correlationId?: string): ApiListResponse<T> {
  return {
    data,
    ...(correlationId && { meta: { correlationId } }),
  };
}
