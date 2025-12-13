# Remaining API Schema Issues

These schemas need to be fixed in the OpenAPI spec or handled differently in the generator.

## Summary

- **Fixed**: 4/8 schemas (session, transfer-request, transfer-restriction, index)
- **Remaining**: 4 schemas with issues

## identity / account-registration

- **Issue**: `RegisterResponse` has inline object schema in `data` property, not a `$ref` to `AccountRegistration`
- **Current**: `AccountRegistration` (exists in OpenAPI but not exported by openapi-zod-client)
- **Should be**: Use `LoginResponse` (similar structure with accessToken, accountId) OR skip entity generation for inline schemas
- **Status**: ⚠️ Needs API fix or generator workaround

## identity / mfa-verification

- **Issue**: `MfaBackupCodesResponse` has inline object schema in `data` property, not a `$ref` to `MfaVerification`
- **Current**: `MfaVerification` (exists in OpenAPI but not exported by openapi-zod-client)
- **Should be**: Extract from inline schema OR skip entity generation
- **Status**: ⚠️ Needs API fix or generator workaround

## identity / password

- **Issue**: `updatePassword` operation returns `204 No Content` - no entity schema needed
- **Current**: `Password` (exists in OpenAPI but not exported, and shouldn't be used)
- **Should be**: Skip entity generation for 204 responses
- **Status**: ✅ Can be fixed in generator (skip 204 responses)

## transfer-agent / shareholder-registry

- **Issue**: Schema `ShareholderRegistry` doesn't exist in OpenAPI
- **Current**: `ShareholderRegistry` (does not exist)
- **Should be**: Check what operations exist and extract from response schemas
- **Status**: ⚠️ Needs investigation

## Recommendations

1. **For inline schemas** (`account-registration`, `mfa-verification`):
   - Option A: Fix API to use named schemas instead of inline objects
   - Option B: Update generator to skip entity generation for resources with inline schemas
   - Option C: Use a generic type or similar schema (e.g., `LoginResponse` for registration)

2. **For 204 responses** (`password`):
   - Update generator to skip entity generation when operation only returns 204

3. **For missing schemas** (`shareholder-registry`):
   - Investigate what operations exist and extract entity from response schemas
