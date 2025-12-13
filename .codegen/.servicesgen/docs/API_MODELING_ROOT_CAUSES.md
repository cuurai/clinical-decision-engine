# API Modeling Root Causes - Edge Cases Analysis

## Overview

This document analyzes the root causes of edge cases encountered during code generation from OpenAPI specifications. These issues stem from inconsistencies between operation IDs, schema names, and API modeling patterns.

## Root Cause Categories

### 1. **Missing Request Body Schemas** (TS2552, TS2724)

**Problem**: Operations with `create` verb but no `requestBody` defined.

**Example**: `createEventDeliveryRetry`

```yaml
/event-deliveries/{deliveryId}/retry:
  post:
    operationId: createEventDeliveryRetry
    # NO requestBody - only path parameters
    parameters:
      - name: deliveryId
        in: path
```

**Root Cause**:

- Generator assumes all `create` operations have request bodies
- API design uses path parameters instead of request body for some create operations
- Generator generates `CreateEventDeliveryRetryRequest` type that doesn't exist

**Impact**:

- Repository generator tries to import non-existent `Create*Request` types
- TypeScript compilation fails

**API Modeling Issue**:

- **Inconsistent pattern**: Some creates use request bodies, others use path parameters
- **Naming confusion**: Operation ID suggests "create" but it's more of an "action" (retry)
- **Missing schema**: Should either have a request body schema OR operation should be named differently (e.g., `retryEventDelivery`)

**Recommendation**:

1. Use action verbs for operations without request bodies: `retryEventDelivery` instead of `createEventDeliveryRetry`
2. OR add a request body schema (even if empty `{}`) for consistency
3. OR use a different HTTP method (PUT/PATCH) for idempotent actions

---

### 2. **ID-Only Schemas vs Entity Schemas** (TS2724)

**Problem**: Schemas exist only as ID types, not full entity types.

**Examples**:

- `IndexId` exists, but `Index` entity doesn't
- `TransferRequestId` exists, but `TransferRequest` entity doesn't
- `TransferRestrictionId` exists, but `TransferRestriction` entity doesn't

**Root Cause**:

- Operation IDs extract resource names (e.g., `listIndices` → `Index`)
- Generator looks for entity schema `Index` but only finds `IndexId`
- These resources might be:
  - **Read-only collections** (no CRUD, only list/get by ID)
  - **Reference data** (IDs only, full entities in another service)
  - **Incomplete API modeling** (entity schemas not yet defined)

**API Modeling Issue**:

- **Missing entity definitions**: API defines IDs but not full entity schemas
- **Unclear ownership**: Entities might be defined in another service/domain
- **Incomplete modeling**: Schemas are placeholders for future implementation

**Recommendation**:

1. Define full entity schemas for all resources that have operations
2. OR mark resources as "reference-only" (IDs only) and document this pattern
3. OR use different operation naming (e.g., `getIndexById` → `getIndexReference`)

---

### 3. **Plural vs Singular Operation Naming Inconsistency** (TS2724)

**Problem**: Same resource has both plural and singular operations.

**Example**: Risk Limits

```yaml
operationId: getRiskLimits      # Plural - returns collection
operationId: getRiskLimitById   # Singular - returns single entity
operationId: updateRiskLimits   # Plural - updates collection
operationId: updateRiskLimit    # Singular - updates single entity
```

**Root Cause**:

- Generator groups operations by resource using `resource_for_grouping()`
- This normalizes to singular: `getRiskLimits` → `risk-limit`, `getRiskLimitById` → `risk-limit`
- Repository name is extracted from first operation found: `RiskLimitsRepository`
- But entity type is singular: `RiskLimit`
- Mismatch: `RiskLimitsRepository` vs `RiskLimitRepository`

**API Modeling Issue**:

- **Inconsistent naming**: Mix of plural and singular operation IDs
- **Unclear resource model**: Is it a collection resource or individual resource?
- **REST anti-pattern**: Should be `/risk-limits` (collection) and `/risk-limits/{id}` (item)

**Recommendation**:

1. **Standardize to singular**: `getRiskLimit`, `updateRiskLimit`, `getRiskLimitById`
2. **OR standardize to plural**: `getRiskLimits`, `updateRiskLimits`, `getRiskLimitById` (keep ID operations singular)
3. **OR use RESTful paths**: `/risk-limits` (collection) vs `/risk-limits/{id}` (item) - operation IDs can be consistent

---

### 4. **Response Type vs Entity Type Confusion** (TS2724)

**Problem**: Generator extracts response type names instead of entity type names.

**Example**: `UpdatePasswordResponse` doesn't exist, but handler expects it.

**Root Cause**:

- Operation `updatePassword` returns a response
- Generator tries to extract entity from response schema
- Response schema might reference a response type, not an entity type
- Generator falls back to `UpdatePasswordResponse` which doesn't exist

**API Modeling Issue**:

- **Response schemas not properly structured**: Response types mixed with entity types
- **Missing response type definitions**: Response types not exported from types generator
- **allOf alias confusion**: Response schemas use allOf aliases that resolve to response types, not entities

**Recommendation**:

1. Structure responses consistently: `{ data: Entity, meta: Meta }`
2. Define response types explicitly in OpenAPI spec
3. Use consistent naming: `UpdatePasswordResponse` should exist if operation returns it

---

### 5. **Domain Prefix Inconsistency** (TS2724)

**Problem**: Entity schemas use domain prefixes inconsistently.

**Example**: `PasswordReset` resource → `AuthPasswordReset` entity

**Root Cause**:

- Operation IDs don't include domain prefix: `createPasswordReset`
- Entity schemas do include domain prefix: `AuthPasswordReset`
- Generator extracts `PasswordReset` from operation ID
- Entity lookup fails because schema is `AuthPasswordReset`

**API Modeling Issue**:

- **Inconsistent naming**: Some entities have domain prefixes, others don't
- **Unclear scope**: Domain prefix suggests domain-specific entity, but operation ID doesn't
- **Cross-domain confusion**: Entities might be shared across domains

**Recommendation**:

1. **Consistent prefixing**: Either all entities have domain prefixes OR none do
2. **OR consistent operation IDs**: Include domain prefix in operation IDs: `createAuthPasswordReset`
3. **OR document pattern**: Clearly document when/why domain prefixes are used

---

## Summary of API Modeling Anti-Patterns

1. **Action Operations Named as Creates**: Operations without request bodies named with `create` verb
2. **Missing Entity Definitions**: ID types defined but full entity schemas missing
3. **Plural/Singular Inconsistency**: Same resource uses both plural and singular operation IDs
4. **Response Type Confusion**: Response types not clearly separated from entity types
5. **Domain Prefix Inconsistency**: Some entities prefixed, others not, without clear pattern
6. **allOf Alias Overuse**: Response schemas use allOf aliases that obscure actual entity types

## Recommendations for API Modeling

### 1. **Consistent Operation Naming**

- Use action verbs for operations without request bodies: `retry`, `cancel`, `approve`
- Use CRUD verbs only when appropriate: `create` = has request body, `get` = read-only
- Standardize plural/singular: Use singular for item operations, plural for collection operations

### 2. **Complete Schema Definitions**

- Define full entity schemas for all resources with operations
- If entities are reference-only, document this pattern clearly
- Avoid ID-only schemas unless explicitly reference data

### 3. **Consistent Response Structure**

- Use consistent response envelope: `{ data: Entity, meta: Meta }`
- Define response types explicitly
- Avoid allOf aliases that obscure entity types

### 4. **Domain Prefix Strategy**

- Document when/why domain prefixes are used
- Apply consistently across all entities in a domain
- OR remove prefixes and use namespacing in code generation

### 5. **Resource Modeling**

- Follow RESTful patterns: `/resources` (collection) vs `/resources/{id}` (item)
- Use consistent operation IDs that match resource names
- Group related operations under same resource name

## Generator Improvements Made

1. **Domain Prefix Matching**: Added logic to try domain-prefixed entity names
2. **Response Type Filtering**: Filter out Response/Request/Envelope types when extracting entities
3. **allOf Alias Resolution**: Resolve allOf aliases to find actual entity types
4. **Singular/Plural Matching**: Try both singular and plural variations
5. **Missing Request Body Handling**: Detect operations without request bodies and handle gracefully

## Next Steps

1. **API Spec Review**: Review OpenAPI specs for consistency
2. **Pattern Documentation**: Document naming patterns and conventions
3. **Generator Enhancements**: Continue improving generator to handle edge cases
4. **Validation Rules**: Add OpenAPI linting rules to catch these issues early
