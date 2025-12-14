/**
 * Extract organization ID from JWT token in Authorization header
 *
 * This helper function extracts the orgId from the JWT token payload.
 * The JWT token should be in the Authorization header as: "Bearer <token>"
 */
/**
 * Extract orgId from JWT token in request
 *
 * @param request - Fastify request object
 * @returns Organization ID from JWT token, or empty string if not found
 */
export function extractOrgId(request) {
    // First, check X-Org-Id header (used by UI/dashboard)
    const xOrgId = request.headers["x-org-id"];
    if (xOrgId && typeof xOrgId === "string" && xOrgId.trim() !== "") {
        return xOrgId.trim();
    }
    // Fallback to JWT token extraction
    try {
        // Get Authorization header
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return "";
        }
        // Extract token
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        // Decode JWT token (base64 decode the payload)
        // JWT format: header.payload.signature
        const parts = token.split(".");
        if (parts.length !== 3) {
            return "";
        }
        // Decode payload (second part)
        const payload = parts[1];
        // Add padding if needed for base64 decoding
        const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
        const decodedPayload = Buffer.from(paddedPayload, "base64").toString("utf-8");
        const payloadJson = JSON.parse(decodedPayload);
        // Extract orgId from token payload
        // Common JWT payload fields: orgId, organizationId, org_id, sub (if orgId is in sub)
        return (payloadJson.orgId ||
            payloadJson.organizationId ||
            payloadJson.org_id ||
            payloadJson.organization_id ||
            (payloadJson.sub && typeof payloadJson.sub === "string"
                ? payloadJson.sub.split(":")[0]
                : "") ||
            "");
    }
    catch (error) {
        // If token decoding fails, return empty string
        // In production, you might want to log this error
        return "";
    }
}
