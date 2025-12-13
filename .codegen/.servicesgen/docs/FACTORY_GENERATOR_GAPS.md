# Factory Generator Gaps Documentation

## Overview
This document tracks gaps and issues found in factory generation that were manually fixed during testing. These issues should be addressed in the generator code to prevent future manual fixes.

## Issues Found During `fundingAccountsOverviewFlow` Test Fixes

### 1. Missing Required Fields in Generated Factories

**Issue**: Factory generators were not including all required fields from the schema.

**Examples**:
- `FiatAccount` factory was missing `id`, `status`, and `verificationStatus` fields
- Fields were being skipped if they were optional without defaults, but some are actually required

**Root Cause**: The generator logic skips optional fields without defaults, but doesn't properly distinguish between:
- Optional fields that should be included (for realistic test data)
- Optional fields that can be safely omitted
- Required fields that must always be included

**Fix Required**: Update `_generate_field_code` and field inclusion logic to:
1. Always include required fields
2. Include optional fields that have common patterns (status, verificationStatus, etc.)
3. Only skip truly optional fields that are rarely used

### 2. Incorrect ID Field Generation

**Issue**: ID fields were not using proper helper functions or regex patterns.

**Examples**:
- `orgId` was using `faker.string.alpha(10)` instead of `makeIDId()`
- `ownerAccountId` was using `faker.string.alpha(10)` instead of `makeAccId()`
- `parentWalletId` was using `faker.string.alpha(10)` instead of `makeBLId()`
- `id` fields for `CustodyAccount` (`CU_` prefix) and `EscrowAccount` (`TR_` prefix) were not generating correct patterns

**Root Cause**: The ID field detection logic in `_generate_field_code` only checks for:
- `field_name == "id"`
- Specific prefixes (`BL_`, `ID_`, `acc_`)

It doesn't handle:
- Other ID field names (`orgId`, `ownerAccountId`, `parentWalletId`, `projectId`)
- Other ID prefixes (`CU_`, `TR_`, `pm-prj_`)

**Fix Required**:
1. Expand ID field detection to check field names ending in `Id` (case-insensitive)
2. Extract prefix from regex pattern for any ID field
3. Generate appropriate helper functions for all ID prefixes found
4. Map common ID field names to their expected prefixes:
   - `orgId` → `ID_` prefix → `makeIDId()`
   - `ownerAccountId` → `acc_` prefix → `makeAccId()`
   - `parentWalletId` → `BL_` prefix → `makeBLId()`
   - `projectId` → `pm-prj_` prefix → `makeProjectId()`

### 3. Missing ID Helper Functions

**Issue**: Factories were referencing helper functions that weren't generated.

**Examples**:
- `makeCUId()` for CustodyAccount IDs
- `makeTRId()` for EscrowAccount IDs
- `makeProjectId()` for project IDs (`pm-prj_` prefix)

**Root Cause**: The `_generate_id_helpers` method only generates helpers for `BL`, `ID`, and `Acc` prefixes.

**Fix Required**:
1. Dynamically detect all ID prefixes from regex patterns in fields
2. Generate helper functions for all detected prefixes
3. Use consistent naming: `make{Prefix}Id()` where prefix is uppercase (e.g., `CU_` → `makeCUId()`)

### 4. Incorrect Field Type Generation

**Issue**: Fields were generated with wrong types.

**Examples**:
- `metadata` field was generated as `faker.string.alpha(10)` (string) but schema expects `z.record(z.string())` (object)
- `isPrimarySettlementAccount` was generated as `"false"` (string) but schema expects boolean
- `holdBalance` and `closedAt` were generated as strings but schema allows `null`

**Root Cause**:
1. Object fields (`z.record()`, `z.object()`) were not properly detected
2. Boolean fields with defaults were treated as strings
3. Nullable fields (`z.union([z.string(), z.null()])`) were not handled correctly

**Fix Required**:
1. Detect `z.record()` patterns and generate `{}` for empty records
2. Detect boolean types and generate `false` or `true` (not strings)
3. Handle nullable unions: if field allows `null`, generate `null` as default for optional nullable fields
4. Check for `.default()` values and use them

### 5. Incorrect Regex Pattern Matching

**Issue**: ID regex patterns were not correctly extracted or matched.

**Examples**:
- `CU_[0-9A-HJKMNPQRSTVWXYZ]{26}` pattern was not detected
- `TR_[0-9A-HJKMNPQRSTVWXYZ]{26}` pattern was not detected
- `pm-prj_[0-9A-HJKMNPQRSTVWXYZ]{26}` pattern was not detected

**Root Cause**: The regex pattern extraction only looked for simple prefixes like `BL_`, `ID_`, `acc_` but didn't handle:
- Multi-part prefixes (`pm-prj_`)
- Different character sets in regex patterns

**Fix Required**:
1. Improve regex pattern extraction to handle multi-part prefixes
2. Extract prefix from regex pattern more robustly: `/^([A-Za-z_-]+)/`
3. Handle special cases like `pm-prj_` → `makeProjectId()`

### 6. Missing Field Constraints

**Issue**: Fields with specific constraints (regex, min/max, enum) were not generating appropriate values.

**Examples**:
- `currency` field needs `/^[A-Z]{3}$/` (3 uppercase letters) but was using `faker.finance.currencyCode()` which might not match
- `balance` field needs `/^(0|[1-9]\d*)(\.\d{1,8})?$/` (decimal string) but was using `faker.string.alpha(10)`
- `projectId` needs `/^pm-prj_[0-9A-HJKMNPQRSTVWXYZ]{26}$/` but was using generic string

**Root Cause**: Field constraint detection in `SchemaIntrospector` may not be extracting all constraints, or `_generate_field_code` is not using them properly.

**Fix Required**:
1. Ensure `SchemaIntrospector` extracts all regex patterns, min/max values, and enum constraints
2. Use regex patterns to generate appropriate faker values:
   - `/^[A-Z]{3}$/` → `faker.finance.currencyCode()` (should validate it matches)
   - Decimal string patterns → `faker.number.float().toString()`
   - Specific ID patterns → Use ID helper functions

### 7. Incorrect Function Name in Imports

**Issue**: Handler response factories imported wrong function names.

**Example**:
- `list-escrow-accounts.factory.ts` imported `createEscrowAccount` but factory exports `createEscrow`

**Root Cause**: The handler response factory generator uses entity name to derive function name, but entity name might not match the actual factory function name.

**Fix Required**:
1. Extract actual factory function name from entity factory file
2. Or standardize naming: always use `create{EntityName}` where EntityName is PascalCase

### 8. Missing Nullable Field Handling

**Issue**: Fields that can be `null` were not generating `null` as a valid default.

**Examples**:
- `holdBalance` can be `z.union([z.string(), z.null()]).optional()` but was generating a string
- `closedAt` can be `z.union([z.string(), z.null()]).optional()` but was generating a string

**Root Cause**: Union types with `null` were not detected, and optional nullable fields should default to `null` when not provided.

**Fix Required**:
1. Detect union types that include `null`
2. For optional nullable fields, generate `null` as default
3. For required nullable fields, generate a value (not null)

## Priority Fixes

### High Priority (Blocks Tests)
1. **ID Field Generation** - Fix all ID fields to use proper helpers
2. **Missing Required Fields** - Ensure all required fields are included
3. **Field Type Generation** - Fix object, boolean, and nullable types

### Medium Priority (Causes Validation Errors)
4. **Regex Pattern Matching** - Improve ID prefix extraction
5. **Field Constraints** - Use regex patterns to generate valid values
6. **Missing ID Helpers** - Generate helpers for all ID prefixes

### Low Priority (Code Quality)
7. **Function Name Consistency** - Standardize factory function naming
8. **Nullable Field Handling** - Properly handle null unions

## Test Cases to Add

1. Test ID field detection for all field names (`id`, `orgId`, `ownerAccountId`, `parentWalletId`, `projectId`)
2. Test ID helper generation for all prefixes (`BL_`, `ID_`, `acc_`, `CU_`, `TR_`, `pm-prj_`)
3. Test object field generation (`metadata`, `rpcFeatures`)
4. Test boolean field generation (`isPrimarySettlementAccount`)
5. Test nullable field generation (`holdBalance`, `closedAt`)
6. Test regex constraint generation (`currency`, `balance`)
7. Test required field inclusion (all required fields present)
8. Test optional field inclusion (common optional fields included)
