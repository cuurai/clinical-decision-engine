/**
 * Core Converter Utilities and Response Types
 */
/**
 * Convert API timestamps to ISO string format
 */
export function timestampsToApi(data) {
    if (!data)
        return data;
    return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
    };
}
/**
 * Convert database timestamps to API format
 */
export function timestamsFromApi(data) {
    if (!data)
        return data;
    return {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
}
/**
 * Wrap response data in standard envelope
 */
export function wrapResponse(data, correlationId) {
    return {
        data,
        ...(correlationId && { meta: { correlationId } }),
    };
}
/**
 * Wrap array response data in standard envelope
 */
export function wrapListResponse(data, correlationId) {
    return {
        data,
        ...(correlationId && { meta: { correlationId } }),
    };
}
/**
 * Converter Presets for standardized API responses
 */
export var ConverterPresets;
(function (ConverterPresets) {
    function standardApiResponse(data, options) {
        if (!data)
            return data;
        // If data is an array
        if (Array.isArray(data)) {
            return data.map((item) => convertTimestamps(item, options?.dateFields));
        }
        return convertTimestamps(data, options?.dateFields);
    }
    ConverterPresets.standardApiResponse = standardApiResponse;
    function convertTimestamps(obj, dateFields) {
        if (!obj || typeof obj !== "object")
            return obj;
        const result = { ...obj };
        const fieldsToConvert = dateFields && dateFields.length > 0 ? dateFields : ["createdAt", "updatedAt"];
        fieldsToConvert.forEach((field) => {
            if (result[field] && typeof result[field] === "string") {
                result[field] = new Date(result[field]).toISOString();
            }
        });
        return result;
    }
})(ConverterPresets || (ConverterPresets = {}));
//# sourceMappingURL=core-converters.js.map