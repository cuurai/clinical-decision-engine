"""
Context Builder - Generates context.ts for JWT extraction
"""

from pathlib import Path
from typing import Optional


class ContextBuilder:
    """Builds context.ts file for JWT extraction"""

    @staticmethod
    def build_context(domain_name: str) -> str:
        """Build context.ts content"""
        return '''/**
 * Request Context Extraction
 *
 * Extracts authentication context (orgId, accountId) from JWT tokens.
 * NEVER extracts orgId from URL parameters - always from JWT for security.
 */

import type { APIGatewayProxyEvent } from "aws-lambda";
import jwt from "jsonwebtoken";

export interface JWTPayload {
  accountId: string;
  orgIds: string[];
  email?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
}

export interface RequestContext {
  orgId: string;
  accountId: string;
  email?: string;
  roles?: string[];
}

/**
 * Extract JWT token from Authorization header
 */
function extractToken(event: APIGatewayProxyEvent): string | null {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;

  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer "
}

/**
 * Decode and verify JWT token
 *
 * Verifies the JWT signature using JWT_SECRET environment variable.
 * Throws error if token is expired, invalid, or signature verification fails.
 */
function decodeJWT(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured. Authentication cannot proceed.");
  }

  try {
    // Verify signature AND decode
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(`JWT token has expired at ${error.expiredAt}`);
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(`Invalid JWT token: ${error.message}`);
    }
    throw new Error(`Failed to verify JWT: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract orgId from JWT token
 *
 * Security: orgId is ALWAYS extracted from JWT, never from URL parameters.
 *
 * Flow:
 * 1. Extract JWT from Authorization header
 * 2. Decode JWT to get orgIds array
 * 3. Check X-Org-Id header (if present) and validate it's in user's orgIds
 * 4. Default to first orgId if no header present
 *
 * @param event - API Gateway event
 * @returns Organization ID from JWT token
 * @throws Error if JWT is missing, invalid, or user has no orgs
 */
export function extractOrgIdFromJWT(event: APIGatewayProxyEvent): string {
  const token = extractToken(event);

  if (!token) {
    throw new Error("Missing or invalid Authorization header. Expected: Bearer <token>");
  }

  const payload = decodeJWT(token);

  // Validate required claims
  if (!payload.accountId) {
    throw new Error("JWT missing required claim: accountId");
  }

  if (!payload.orgIds || !Array.isArray(payload.orgIds) || payload.orgIds.length === 0) {
    throw new Error("JWT missing required claim: orgIds (user has no organizations)");
  }

  // Check for explicit org selection via header (multi-org users)
  const requestedOrgId = event.headers?.["x-org-id"] || event.headers?.["X-Org-Id"];

  if (requestedOrgId) {
    // Validate requested org is in user's authorized list
    if (!payload.orgIds.includes(requestedOrgId)) {
      throw new Error(
        `Unauthorized: user not authorized for requested organization. ` +
        `Requested: ${requestedOrgId}, Authorized: ${payload.orgIds.join(", ")}`
      );
    }

    return requestedOrgId;
  }

  // Default: Use primary org (first in list)
  return payload.orgIds[0];
}

/**
 * Extract full request context from JWT token
 *
 * @param event - API Gateway event
 * @returns Request context with orgId, accountId, and optional fields
 * @throws Error if JWT is missing or invalid
 */
export function extractContext(event: APIGatewayProxyEvent): RequestContext {
  const token = extractToken(event);

  if (!token) {
    throw new Error("Missing or invalid Authorization header. Expected: Bearer <token>");
  }

  const payload = decodeJWT(token);

  // Validate required claims
  if (!payload.accountId) {
    throw new Error("JWT missing required claim: accountId");
  }

  if (!payload.orgIds || !Array.isArray(payload.orgIds) || payload.orgIds.length === 0) {
    throw new Error("JWT missing required claim: orgIds (user has no organizations)");
  }

  // Extract orgId (with header support)
  const orgId = extractOrgIdFromJWT(event);

  return {
    orgId,
    accountId: payload.accountId,
    email: payload.email,
    roles: payload.roles,
  };
}
'''
