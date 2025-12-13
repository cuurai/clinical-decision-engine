# API Schema Discrepancies Report

Generated: 2025-11-27

## Summary

- **Total Discrepancies**: 35
- **Categories**:
  - Typos in resource names (6)
  - Missing entity schemas (29)
  - Naming mismatches (response schema doesn't match resource)

---

## Discrepancies by Domain

### auth

#### auth-password-reset

- **Resource**: `auth-password-reset`
- **Expected Schema**: `AuthPasswordReset`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `UpdateAuthPasswordRequest|UpdateAuthPasswordResponse|CreatePasswordResetRequest`
- **Recommendation**: Use `PasswordResetResponse` (extracted from `CreateAuthPasswordResetResponse`) or create `AuthPasswordReset` schema

#### auth-password

- **Resource**: `auth-password`
- **Expected Schema**: `AuthPassword`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `ChangePasswordRequest|UpdateAuthPasswordRequest|UpdateAuthPasswordResponse`
- **Recommendation**: Create `AuthPassword` schema or extract from response

#### auth-session-token

- **Resource**: `auth-session-token`
- **Expected Schema**: `AuthSessionToken`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `CreateAuthSessionRequest|AuthSession|CreateAuthSessionResponse`
- **Recommendation**: Use `AuthSession` schema or create `AuthSessionToken` schema

### blockchain

#### chain-adapter-health

- **Resource**: `chain-adapter-health`
- **Expected Schema**: `ChainAdapterHealth`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `ChainRecordId|Chain|ListChainsResponse`
- **Recommendation**: Operation returns `GetHealthMetricsResponse` → `HealthMetrics`. Either:
  - Create `ChainAdapterHealth` schema and update response to `GetChainAdapterHealthResponse`
  - Or rename resource/operation to match `HealthMetrics`

### business-intelligence

#### dashboard-evaluation

- **Resource**: `dashboard-evaluation`
- **Expected Schema**: `DashboardEvaluation`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `AnalyticsDashboard|AnalyticsDashboardResponse|DashboardId`
- **Recommendation**: Use `AnalyticsDashboard` schema or create `DashboardEvaluation` schema

### compliance

#### whitelist-entrie

- **Resource**: `whitelist-entrie` ⚠️ **TYPO**
- **Expected Schema**: `WhitelistEntrie`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `WhitelistEntryId|WhitelistEntry|ListWhitelistEntriesResponse`
- **Recommendation**: Fix typo in resource name: `whitelist-entrie` → `whitelist-entry`. Schema `WhitelistEntry` exists.

### custodian

#### custody-balances

- **Resource**: `custody-balances`
- **Expected Schema**: `CustodyBalances`
- **Status**: ❌ NOT FOUND (Fixed by singular/plural logic → `CustodyBalance`)
- **Similar Schemas Found**: `CustodyAccountId|CustodyAccount|ListCustodyAccountsResponse`
- **Recommendation**: Verify `CustodyBalance` schema exists, or create it

#### custody-proof-by-id

- **Resource**: `custody-proof-by-id`
- **Expected Schema**: `CustodyProofById`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `CustodyAccountId|CustodyAccount|ListCustodyAccountsResponse`
- **Recommendation**: Create `CustodyProofById` schema or extract from response

### e-documents

#### document-content

- **Resource**: `document-content`
- **Expected Schema**: `DocumentContent`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `DocumentId|Document|ListDocumentsResponse`
- **Recommendation**: Use `Document` schema or create `DocumentContent` schema

#### document-signature-status

- **Resource**: `document-signature-status`
- **Expected Schema**: `DocumentSignatureStatus`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `DocumentId|Document|ListDocumentsResponse`
- **Recommendation**: Create `DocumentSignatureStatus` schema or extract from response

### escrow

#### escrow-crypto-deposit

- **Resource**: `escrow-crypto-deposit`
- **Expected Schema**: `EscrowCryptoDeposit`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `EscrowAccountId|EscrowAccount|ListEscrowAccountsResponse`
- **Recommendation**: Use `EscrowAccount` schema or create `EscrowCryptoDeposit` schema

#### escrow-crypto-release

- **Resource**: `escrow-crypto-release`
- **Expected Schema**: `EscrowCryptoRelease`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `EscrowAccountId|EscrowAccount|ListEscrowAccountsResponse`
- **Recommendation**: Use `EscrowAccount` schema or create `EscrowCryptoRelease` schema

#### escrow-deposit

- **Resource**: `escrow-deposit`
- **Expected Schema**: `EscrowDeposit`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `EscrowAccountId|EscrowAccount|ListEscrowAccountsResponse`
- **Recommendation**: Use `EscrowAccount` schema or create `EscrowDeposit` schema

#### escrow-release

- **Resource**: `escrow-release`
- **Expected Schema**: `EscrowRelease`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `EscrowAccountId|EscrowAccount|ListEscrowAccountsResponse`
- **Recommendation**: Use `EscrowAccount` schema or create `EscrowRelease` schema

### events

#### event-deliverie

- **Resource**: `event-deliverie` ⚠️ **TYPO**
- **Expected Schema**: `EventDeliverie`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `EventCategory|EventSchema|ListEventSchemasResponse`
- **Recommendation**: Fix typo: `event-deliverie` → `event-delivery`. Check if `EventDelivery` schema exists.

#### event-delivery-retry

- **Resource**: `event-delivery-retry`
- **Expected Schema**: `EventDeliveryRetry`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `EventCategory|EventSchema|ListEventSchemasResponse`
- **Recommendation**: Create `EventDeliveryRetry` schema or extract from response

### gateway

#### liveness

- **Resource**: `liveness`
- **Expected Schema**: `Liveness`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `GetLivenessResponse`
- **Recommendation**: Extract entity from `GetLivenessResponse` or create `Liveness` schema

### identity

#### account-registration

- **Resource**: `account-registration`
- **Expected Schema**: `AccountRegistration`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `AccountId|ListAccountsResponse|CreateAccountRequest`
- **Recommendation**: Create `AccountRegistration` schema or extract from response

#### mfa-enrollment

- **Resource**: `mfa-enrollment`
- **Expected Schema**: `MfaEnrollment`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: (none)
- **Recommendation**: Create `MfaEnrollment` schema

#### mfa-verification

- **Resource**: `mfa-verification`
- **Expected Schema**: `MfaVerification`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `ValidationError`
- **Recommendation**: Create `MfaVerification` schema (note: `MfaVerification` exists in auth domain)

#### password

- **Resource**: `password`
- **Expected Schema**: `Password`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `ChangePasswordRequest`
- **Recommendation**: Create `Password` schema or extract from response

#### session

- **Resource**: `session`
- **Expected Schema**: `Session`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: (none)
- **Recommendation**: Create `Session` schema (note: `AuthSession` exists in auth domain)

### pricing-refdata

#### fx-rate

- **Resource**: `fx-rate`
- **Expected Schema**: `FxRate`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `PricingFxRateId|LatestFxRate|ListFxRatesResponse`
- **Recommendation**: Use `LatestFxRate` schema or create `FxRate` schema

#### latest-fx-rates

- **Resource**: `latest-fx-rates`
- **Expected Schema**: `LatestFxRates`
- **Status**: ❌ NOT FOUND (Fixed by singular/plural logic → `LatestFxRate`)
- **Similar Schemas Found**: `PricingFxRateId|LatestFxRate|ListFxRatesResponse`
- **Recommendation**: Verify `LatestFxRate` schema is used correctly

### primary-market

#### token-classe

- **Resource**: `token-classe` ⚠️ **TYPO**
- **Expected Schema**: `TokenClasse`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `TokenClassId|TokenStandard|TokenClass`
- **Recommendation**: Fix typo: `token-classe` → `token-class`. Schema `TokenClass` exists.

### sandbox

#### sandbox-clone

- **Resource**: `sandbox-clone`
- **Expected Schema**: `SandboxClone`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `SandboxEnvironmentId|SandboxEnvironment|ListSandboxEnvironmentsResponse`
- **Recommendation**: Use `SandboxEnvironment` schema or create `SandboxClone` schema

#### sandbox-reset

- **Resource**: `sandbox-reset`
- **Expected Schema**: `SandboxReset`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `SandboxEnvironmentId|SandboxEnvironment|ListSandboxEnvironmentsResponse`
- **Recommendation**: Use `SandboxEnvironment` schema or create `SandboxReset` schema

#### sandbox-restore

- **Resource**: `sandbox-restore`
- **Expected Schema**: `SandboxRestore`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `SandboxEnvironmentId|SandboxEnvironment|ListSandboxEnvironmentsResponse`
- **Recommendation**: Use `SandboxEnvironment` schema or create `SandboxRestore` schema

#### sandbox-time

- **Resource**: `sandbox-time`
- **Expected Schema**: `SandboxTime`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `SandboxEnvironmentId|SandboxEnvironment|ListSandboxEnvironmentsResponse`
- **Recommendation**: Create `SandboxTime` schema or extract from response

#### test-data

- **Resource**: `test-data`
- **Expected Schema**: `TestData`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `CreateTestDataRequest|GenerateTestDataResponse`
- **Recommendation**: Extract entity from `GenerateTestDataResponse` or create `TestData` schema

### settlements

#### settlement-batche

- **Resource**: `settlement-batche` ⚠️ **TYPO**
- **Expected Schema**: `SettlementBatche`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `SettlementInstructionId|SettlementInstruction|ListSettlementInstructionsResponse`
- **Recommendation**: Fix typo: `settlement-batche` → `settlement-batch`. Schema `SettlementBatch` exists.

### tenancy-trust

#### webhook-secret

- **Resource**: `webhook-secret`
- **Expected Schema**: `WebhookSecret`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `ApiKeySecret|CreateApiKeySecretResponse|WebhookEndpointId`
- **Recommendation**: Use `ApiKeySecret` schema or create `WebhookSecret` schema

### transfer-agent

#### holder-position

- **Resource**: `holder-position`
- **Expected Schema**: `HolderPosition`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `ShareholderPosition|ListShareholderRegistriesResponse|GetHolderPositionsResponse`
- **Recommendation**: Use `ShareholderPosition` schema or extract from `GetHolderPositionsResponse`

#### shareholder-registrie

- **Resource**: `shareholder-registrie` ⚠️ **TYPO**
- **Expected Schema**: `ShareholderRegistrie`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `ShareholderPosition|ListShareholderRegistriesResponse|ShareholderReportId`
- **Recommendation**: Fix typo: `shareholder-registrie` → `shareholder-registry`. Check if `ShareholderRegistry` schema exists.

### treasury

#### ledger-entrie

- **Resource**: `ledger-entrie` ⚠️ **TYPO**
- **Expected Schema**: `LedgerEntrie`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `LedgerEntry|ListLedgerEntriesResponse`
- **Recommendation**: Fix typo: `ledger-entrie` → `ledger-entry`. Schema `LedgerEntry` exists.

#### reconciliation-status

- **Resource**: `reconciliation-status`
- **Expected Schema**: `ReconciliationStatus`
- **Status**: ❌ NOT FOUND
- **Similar Schemas Found**: `PayStatus|ReconciliationId|Reconciliation`
- **Recommendation**: Use `Reconciliation` schema or create `ReconciliationStatus` schema

---

## Quick Fix Categories

### 1. Typos in Resource Names (6 fixes needed)

Fix these in OpenAPI operation IDs:

- `whitelist-entrie` → `whitelist-entry` (schema: `WhitelistEntry`)
- `event-deliverie` → `event-delivery` (check for `EventDelivery` schema)
- `token-classe` → `token-class` (schema: `TokenClass`)
- `settlement-batche` → `settlement-batch` (schema: `SettlementBatch`)
- `shareholder-registrie` → `shareholder-registry` (check for schema)
- `ledger-entrie` → `ledger-entry` (schema: `LedgerEntry`)

### 2. Missing Entity Schemas (29 fixes needed)

These need entity schemas created in OpenAPI specs:

- `AuthPasswordReset`, `AuthPassword`, `AuthSessionToken`
- `ChainAdapterHealth` (or use `HealthMetrics`)
- `DashboardEvaluation`
- `CustodyProofById`
- `DocumentContent`, `DocumentSignatureStatus`
- `EscrowCryptoDeposit`, `EscrowCryptoRelease`, `EscrowDeposit`, `EscrowRelease`
- `EventDeliveryRetry`
- `Liveness`
- `AccountRegistration`, `MfaEnrollment`, `MfaVerification`, `Password`, `Session`
- `FxRate`
- `SandboxClone`, `SandboxReset`, `SandboxRestore`, `SandboxTime`, `TestData`
- `WebhookSecret`
- `HolderPosition`
- `ReconciliationStatus`

### 3. Response Schema Extraction Opportunities

Some can be fixed by extracting from response schemas (generator already tries this):

- `chain-adapter-health` → extract `HealthMetrics` from `GetHealthMetricsResponse`
- `liveness` → extract from `GetLivenessResponse`
- `test-data` → extract from `GenerateTestDataResponse`
- `holder-position` → extract from `GetHolderPositionsResponse`

---

## Action Items

1. **Fix typos** in OpenAPI operation IDs (6 items)
2. **Create missing schemas** in OpenAPI specs (29 items)
3. **Update response schemas** to match resource names where appropriate
4. **Regenerate code** after fixes: `cuur-codegen generate --layer core --all`

---

## Quick Reference Table

| Domain                | Resource                  | Expected Schema         | Issue Type | Fix                                                                 |
| --------------------- | ------------------------- | ----------------------- | ---------- | ------------------------------------------------------------------- |
| auth                  | auth-password-reset       | AuthPasswordReset       | Missing    | Create schema or use PasswordResetResponse                          |
| auth                  | auth-password             | AuthPassword            | Missing    | Create schema                                                       |
| auth                  | auth-session-token        | AuthSessionToken        | Missing    | Use AuthSession or create schema                                    |
| blockchain            | chain-adapter-health      | ChainAdapterHealth      | Mismatch   | Use HealthMetrics or create ChainAdapterHealth                      |
| business-intelligence | dashboard-evaluation      | DashboardEvaluation     | Missing    | Use AnalyticsDashboard or create schema                             |
| compliance            | whitelist-entrie          | WhitelistEntrie         | **TYPO**   | Fix: whitelist-entrie → whitelist-entry (schema: WhitelistEntry)    |
| custodian             | custody-balances          | CustodyBalances         | Plural     | ✅ Fixed (uses CustodyBalance)                                      |
| custodian             | custody-proof-by-id       | CustodyProofById        | Missing    | Use CustodyProof or create schema                                   |
| e-documents           | document-content          | DocumentContent         | Missing    | Use Document or create schema                                       |
| e-documents           | document-signature-status | DocumentSignatureStatus | Missing    | Create schema                                                       |
| escrow                | escrow-crypto-deposit     | EscrowCryptoDeposit     | Missing    | Use EscrowAccount or create schema                                  |
| escrow                | escrow-crypto-release     | EscrowCryptoRelease     | Missing    | Use EscrowAccount or create schema                                  |
| escrow                | escrow-deposit            | EscrowDeposit           | Missing    | Use EscrowAccount or create schema                                  |
| escrow                | escrow-release            | EscrowRelease           | Missing    | Use EscrowAccount or create schema                                  |
| events                | event-deliverie           | EventDeliverie          | **TYPO**   | Fix: event-deliverie → event-delivery (schema: EventDelivery)       |
| events                | event-delivery-retry      | EventDeliveryRetry      | Missing    | Create schema                                                       |
| gateway               | liveness                  | Liveness                | Missing    | Extract from GetLivenessResponse or create schema                   |
| identity              | account-registration      | AccountRegistration     | Missing    | Create schema                                                       |
| identity              | mfa-enrollment            | MfaEnrollment           | Missing    | Create schema                                                       |
| identity              | mfa-verification          | MfaVerification         | Missing    | Create schema (or use from auth domain)                             |
| identity              | password                  | Password                | Missing    | Create schema                                                       |
| identity              | session                   | Session                 | Missing    | Create schema (or use AuthSession from auth)                        |
| pricing-refdata       | fx-rate                   | FxRate                  | Missing    | Use LatestFxRate or create schema                                   |
| pricing-refdata       | latest-fx-rates           | LatestFxRates           | Plural     | ✅ Fixed (uses LatestFxRate)                                        |
| primary-market        | token-classe              | TokenClasse             | **TYPO**   | Fix: token-classe → token-class (schema: TokenClass)                |
| sandbox               | sandbox-clone             | SandboxClone            | Missing    | Use SandboxEnvironment or create schema                             |
| sandbox               | sandbox-reset             | SandboxReset            | Missing    | Use SandboxEnvironment or create schema                             |
| sandbox               | sandbox-restore           | SandboxRestore          | Missing    | Use SandboxEnvironment or create schema                             |
| sandbox               | sandbox-time              | SandboxTime             | Missing    | Create schema                                                       |
| sandbox               | test-data                 | TestData                | Missing    | Extract from GenerateTestDataResponse or create schema              |
| settlements           | settlement-batche         | SettlementBatche        | **TYPO**   | Fix: settlement-batche → settlement-batch (schema: SettlementBatch) |
| tenancy-trust         | webhook-secret            | WebhookSecret           | Missing    | Use ApiKeySecret or create schema                                   |
| transfer-agent        | holder-position           | HolderPosition          | Missing    | Use ShareholderPosition or extract from GetHolderPositionsResponse  |
| transfer-agent        | shareholder-registrie     | ShareholderRegistrie    | **TYPO**   | Fix: shareholder-registrie → shareholder-registry                   |
| treasury              | ledger-entrie             | LedgerEntrie            | **TYPO**   | Fix: ledger-entrie → ledger-entry (schema: LedgerEntry)             |
| treasury              | reconciliation-status     | ReconciliationStatus    | Missing    | Use Reconciliation or create schema                                 |

---

## Priority Fixes

### High Priority (Typos - Easy Fixes)

1. `whitelist-entrie` → `whitelist-entry`
2. `event-deliverie` → `event-delivery`
3. `token-classe` → `token-class`
4. `settlement-batche` → `settlement-batch`
5. `shareholder-registrie` → `shareholder-registry`
6. `ledger-entrie` → `ledger-entry`

### Medium Priority (Can Extract from Responses)

1. `chain-adapter-health` → extract `HealthMetrics` from response
2. `liveness` → extract from `GetLivenessResponse`
3. `test-data` → extract from `GenerateTestDataResponse`
4. `holder-position` → extract from `GetHolderPositionsResponse`

### Low Priority (Need Schema Creation)

All remaining 29 items need entity schemas created in OpenAPI specs.
