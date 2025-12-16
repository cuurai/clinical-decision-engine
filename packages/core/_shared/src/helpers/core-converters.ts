/**
 * Core Converter Utilities and Response Types
 */

/**
 * Standard API Response Envelope (simple version with optional meta)
 * @internal Use ApiResponse from types/responses.types.ts for public APIs
 */
export interface SimpleApiResponse<T> {
  data: T;
  meta?: {
    correlationId?: string;
    timestamp?: string;
  };
}

/**
 * Standard API List Response Envelope (simple version with optional meta)
 * @internal Use ApiListResponse from types/responses.types.ts for public APIs
 */
export interface SimpleApiListResponse<T> {
  data: T[];
  meta?: {
    correlationId?: string;
    timestamp?: string;
    totalCount?: number;
    pageSize?: number;
    pageNumber?: number;
  };
}

/**
 * Convert API timestamps to ISO string format
 */
export function timestampsToApi(data: any): any {
  if (!data) return data;

  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
  };
}

/**
 * Convert database timestamps to API format
 */
export function timestamsFromApi(data: any): any {
  if (!data) return data;

  return {
    ...data,
    createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
  };
}

/**
 * Wrap response data in standard envelope
 */
export function wrapResponse<T>(data: T, correlationId?: string): SimpleApiResponse<T> {
  return {
    data,
    ...(correlationId && { meta: { correlationId } }),
  };
}

/**
 * Wrap array response data in standard envelope
 */
export function wrapListResponse<T>(data: T[], correlationId?: string): SimpleApiListResponse<T> {
  return {
    data,
    ...(correlationId && { meta: { correlationId } }),
  };
}
/**
 * Converter Presets for standardized API responses
 */
export namespace ConverterPresets {
  export function standardApiResponse<T>(data: T, options?: { dateFields?: string[] }): T {
    if (!data) return data;

    // If data is an array
    if (Array.isArray(data)) {
      return data.map((item) => convertTimestamps(item, options?.dateFields)) as T;
    }

    return convertTimestamps(data, options?.dateFields) as T;
  }

  function convertTimestamps(obj: any, dateFields?: string[]): any {
    if (!obj || typeof obj !== "object") return obj;

    const result = { ...obj };
    const fieldsToConvert =
      dateFields && dateFields.length > 0 ? dateFields : ["createdAt", "updatedAt"];

    fieldsToConvert.forEach((field) => {
      if (result[field] && typeof result[field] === "string") {
        result[field] = new Date(result[field]).toISOString();
      }
    });

    return result;
  }
}
