# API Standardization Impact Analysis

**Total Errors**: 61
**Total Operations**: 331 across 26 domains
**Affected Files**: 19 (6% edge cases)

---

## Executive Summary

✅ **36% of errors (22 errors) can be fixed by simple API changes**
❌ **64% of errors (39 errors) require generator fixes**

**Recommendation**: Fix API issues first (quick wins), then address generator logic. Don't complicate generators for edge cases.

---

## Errors Fixable by API Standardization (22 errors - 36%)

### 1. Missing Create\*Request Types (9 errors - 15%)

**Problem**: Operations named `create*` but no `requestBody` defined

**Affected Operations**:

- `createEventDeliveryRetry` (events)
- `createAuthPassword` (auth)
- `createAuthSessionToken` (auth)
- `createCustodyTransaction` (custodian)
- `createPassword` (identity)
- `createNotificationPreferences` (notifications)
- `createRiskLimit` (risk-limits)
- `createSandboxConfig` (sandbox)
- `createSandboxTime` (sandbox)
- `createTrustConfig` (tenancy-trust)

**Fix**: Add `requestBody` schemas OR rename to action verbs (e.g., `retryEventDelivery`)

**Complexity**: ⭐ LOW - Just add schemas

---

### 2. ID-Only Schemas (3 errors - 5%)

**Problem**: Only ID types exist, not full entity schemas

**Affected**:

- `Index` → Only `IndexId` exists (pricing-refdata)
- `TransferRequest` → Only `TransferRequestId` exists (transfer-agent)
- `TransferRestriction` → Only `TransferRestrictionId` exists (transfer-agent)

**Fix**: Define full entity schemas OR mark as reference-only

**Complexity**: ⭐⭐ MEDIUM - Need to design entity schemas

---

### 3. Missing Entity Schemas (4 errors - 5%)

**Problem**: Entity schemas referenced but not defined

**Affected**:

- `AccountRegistration` (identity)
- `MfaVerification` (identity)
- `Password` (identity)
- `ShareholderRegistry` (transfer-agent)

**Fix**: Define these entity schemas in OpenAPI specs

**Complexity**: ⭐ LOW - Just add schema definitions

---

### 4. Plural/Singular Inconsistency (1 error - 2%)

**Problem**: Mixed plural/singular operation IDs

**Affected**:

- `getRiskLimits` (plural) vs `getRiskLimitById` (singular)
- Generator creates `RiskLimitsRepository` but should be `RiskLimitRepository`

**Fix**: Standardize to singular: `getRiskLimit`, `updateRiskLimit`, `getRiskLimitById`

**Complexity**: ⭐ LOW - Just rename operations

---

### 5. Missing Response Types (1 error - 2%)

**Problem**: Response type not defined

**Affected**:

- `UpdatePasswordResponse` (identity)

**Fix**: Define `UpdatePasswordResponse` schema

**Complexity**: ⭐ LOW - Just add response schema

---

### 6. Missing Gateway Entity Types (3 errors - 5%)

**Problem**: Gateway operations return response types, not entity types

**Affected**:

- `Health` → Should be `GetHealthResponse` or define `Health` entity
- `Heartbeat` → Should be `GetHeartbeatResponse` or define `Heartbeat` entity
- `Readiness` → Should be `GetReadinessResponse` or define `Readiness` entity

**Fix**: Define entity schemas OR use response types consistently

**Complexity**: ⭐ LOW - Just add entity definitions

---

### 7. Content Type Issues (2 errors - 3%)

**Problem**: Operations support multiple content types but generator only handles one

**Affected**:

- E-documents upload: supports both `multipart/form-data` and `application/json`

**Fix**: Standardize to single content type OR update generator

**Complexity**: ⭐⭐ MEDIUM - Either change API or enhance generator

---

## Errors Requiring Generator Fixes (39 errors - 64%)

### Handler Response Type Mismatches (~11 errors)

- Array vs single object returns
- Empty data responses
- Response type extraction logic

### Other Generator Issues (~28 errors)

- TS2300, TS2551, TS7056, TS2739, TS2741, TS2740, TS2559, TS2322, TS2308

**These are generator logic problems, not API modeling issues**

---

## Summary Table

| Category                | Errors | % Total | Fix Complexity | Can Fix via API? |
| ----------------------- | ------ | ------- | -------------- | ---------------- |
| Missing Create\*Request | 9      | 15%     | ⭐ LOW         | ✅ YES           |
| ID-Only Schemas         | 3      | 5%      | ⭐⭐ MEDIUM    | ✅ YES           |
| Missing Entity Schemas  | 4      | 5%      | ⭐ LOW         | ✅ YES           |
| Plural/Singular         | 1      | 2%      | ⭐ LOW         | ✅ YES           |
| Missing Response Types  | 1      | 2%      | ⭐ LOW         | ✅ YES           |
| Gateway Entities        | 3      | 5%      | ⭐ LOW         | ✅ YES           |
| Content Types           | 2      | 3%      | ⭐⭐ MEDIUM    | ✅ YES           |
| **API Fixable Total**   | **22** | **36%** |                | ✅               |
| Generator Issues        | 39     | 64%     | Various        | ❌ NO            |

---

## Recommended Action Plan

### Phase 1: Quick API Wins (15 errors - 25%)

**Estimated Effort**: 2-3 hours

1. Add missing `requestBody` schemas (9 errors) - 1 hour
2. Define missing response types (1 error) - 15 min
3. Define gateway entities (3 errors) - 30 min
4. Fix plural/singular operations (1 error) - 15 min
5. Define missing entity schemas (4 errors) - 1 hour

**Result**: 15 errors fixed with simple API changes

---

### Phase 2: Generator Fixes (39 errors - 64%)

**Estimated Effort**: 4-6 hours

- Fix handler response type logic
- Fix other generator edge cases
- These are generator problems, not API problems

---

### Phase 3: Remaining API Issues (7 errors - 11%)

**Estimated Effort**: 2-3 hours

1. ID-only schemas - define full entities (3 errors)
2. Content type standardization (2 errors)
3. Any remaining edge cases (2 errors)

---

## Conclusion

**Key Insight**: Only 6% of files (19 out of 331 operations) have errors.

**36% of errors are fixable by API standardization** - mostly missing schemas (easy to add)

**64% of errors require generator fixes** - these are generator logic issues

**Recommendation**:

- ✅ Fix API issues first (quick wins, low risk)
- ✅ Then fix generator logic (incremental, no API changes needed)
- ❌ Don't complicate generators for 6% edge cases

**Total API Changes Needed**: ~15-20 schema additions/renames
