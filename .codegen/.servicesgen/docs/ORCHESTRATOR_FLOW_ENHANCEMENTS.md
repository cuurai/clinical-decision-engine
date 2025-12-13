# Orchestrator Flow Enhancements - Business Analyst Review

## Overview
This document outlines the business scenario enhancements made to orchestrator flows based on a comprehensive business analyst review.

## Key Enhancements Made

### 1. Auth Session - Login Flow (`auth-session.yaml`)
**Issue**: Duplicate `stepId: accounts` causing ambiguity
**Enhancement**:
- Fixed duplicate stepId bug
- Renamed steps: `accountProfile` and `orgProfile` for clarity
- Added data passing: `authAccount` → `accountProfile` → `orgProfile`
- Added step numbers (1-5)
- Improved descriptions for each step

**Business Value**: Ensures proper account and org context is passed through the authentication flow.

### 2. Orders Execution - New Order (`orders-execution.yaml`)
**Issue**: Missing pre-trade risk checks and market status validation
**Enhancement**:
- Added `marketStatus` step to check market availability
- Added `riskCheck` step for pre-trade validation
- Order creation now depends on successful risk check
- Added step numbers (1-5)

**Business Value**: Prevents orders from being placed when markets are halted or risk limits are exceeded.

### 3. Trading Markets - Place Order (`trading-markets.yaml`)
**Issue**: Missing market status check before order placement
**Enhancement**:
- Added `marketStatus` step to verify market is open
- Enhanced `riskCheck` to use POST (create) instead of GET (list)
- Added data passing to `eventReplay`: orderId and status from order result
- Added step numbers (1-6)

**Business Value**: Ensures orders are only placed when markets are operational and risk checks pass.

### 4. Primary Issuance - Subscribe (`primary-issuance.yaml`)
**Issue**: Missing eligibility and offering status checks
**Enhancement**:
- Added `eligibilityCheck` step to verify KYC status
- Added `offeringStatus` step to verify offering is open
- Subscription creation now depends on both validations
- Added step numbers (1-5)

**Business Value**: Ensures only eligible users can subscribe to offerings that are currently open.

### 5. Onboarding - Start (`onboarding-identity.yaml`)
**Issue**: Missing data passing between account → org → kyc steps
**Enhancement**:
- Added `inputFrom` to pass `accountId` from account to org creation
- Added `inputFrom` to pass `orgId` from org to kyc case creation
- Added step numbers (1-5)
- Improved descriptions

**Business Value**: Ensures proper linking between account, organization, and KYC case records.

### 6. Accounts Funding - Fiat Deposit (`accounts-funding.yaml`)
**Issue**: Missing account validation before deposit creation
**Enhancement**:
- Added `accountValidation` step to verify account exists and is active
- Deposit creation now depends on validation
- Added step numbers (1-4)

**Business Value**: Prevents deposits to invalid or inactive accounts.

### 7. Accounts Funding - Fiat Withdrawal (`accounts-funding.yaml`)
**Issue**: Missing account validation and balance check
**Enhancement**:
- Added `accountValidation` step to verify account and balance
- Changed `preTradeCheckLogs` to `riskCheck` with POST method
- Withdrawal creation now depends on both validations
- Added step numbers (1-5)

**Business Value**: Ensures sufficient balance and compliance checks before withdrawal.

### 8. Trading Markets - Market List (`trading-markets.yaml`)
**Enhancement**:
- Added step numbers (1-6)
- Added descriptions for each step
- Improved readability

## Patterns Identified

### Common Enhancements Applied:
1. **Step Numbers**: Added to all flows for better traceability
2. **Data Passing**: Added `inputFrom` where data flows between steps
3. **Validation Steps**: Added account/market/eligibility checks before critical operations
4. **Risk Checks**: Enhanced with proper POST methods for validation
5. **Descriptions**: Improved step descriptions for business clarity

### Business Rules Enforced:
- Orders require market status + risk checks
- Subscriptions require eligibility + offering status
- Withdrawals require account validation + risk checks
- Deposits require account validation
- Onboarding requires proper data linking

## Next Steps

1. Regenerate all orchestrator domains to apply changes
2. Review generated code for handler name mismatches
3. Test enhanced flows in staging environment
4. Document any additional business rules discovered during testing

## Notes

- Handler names may need adjustment based on actual core handler implementations
- Some flows may require additional steps based on specific business requirements
- Consider adding parallel execution where steps don't depend on each other (e.g., symbols and halts in market list)
