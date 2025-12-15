/**
 * Response Wrapper Utilities
 *
 * Wraps OpenAPI-generated response types to include the standard envelope:
 * { data: T, meta?: { correlationId?: string } }
 */
/**
 * Create a wrapped response
 */
export function createResponse(data, correlationId) {
    return {
        data,
        ...(correlationId && { meta: { correlationId } }),
    };
}
/**
 * Create a wrapped list response
 */
export function createListResponse(data, correlationId) {
    return {
        data,
        ...(correlationId && { meta: { correlationId } }),
    };
}
//# sourceMappingURL=response-wrapper.js.map