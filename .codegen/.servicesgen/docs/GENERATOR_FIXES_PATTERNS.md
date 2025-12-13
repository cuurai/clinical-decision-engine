# Generator Fixes Patterns

This document outlines the patterns learned from fixing the `accounts-funding` flow tests that should be applied to the generators to fix all other domains and flows.

## Key Issues Fixed

### 1. Mock Path Pattern (CRITICAL)

**Problem**: Mock paths used relative paths that didn't match the import paths in flows, causing mocks to not intercept imports.

**Current Generator Behavior**:
- Flow tests don't generate handler mocks at all
- When manually added, relative paths are used

**Fixed Pattern**:
```typescript
// ✅ CORRECT: Use alias path matching the flow import
vi.mock("@cuur/core/treasury/handlers/index.js", () => ({
  createPayment: vi.fn(),
}));

import { createPayment as mockCreatePayment } from "@cuur/core/treasury/handlers/index.js";
```

**Generator Fix Required**:
- Detect handler imports in flows (from `@cuur/core/{domain}/handlers/index.js`)
- Generate `vi.mock()` calls using the same alias path
- Import the mocked handler using the same alias path

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py`

### 2. Factory Schema Imports Pattern

**Problem**: Factories tried to import schemas directly (e.g., `ZFiatAccount`) but schemas are exported as objects (e.g., `fiatbankingSchemas`).

**Current Generator Behavior**:
```typescript
// ❌ WRONG: Direct schema imports don't exist
import { ZFiatAccount, ZCreateFiatAccountInput } from "@cuur/core/fiat-banking/index.js";
```

**Fixed Pattern**:
```typescript
// ✅ CORRECT: Import schema objects and extract schemas
import { fiatbankingSchemas } from "@cuur/core/fiat-banking/index.js";
import type { FiatAccount, CreateFiatAccountInput } from "@cuur/core/fiat-banking/index.js";

const ZFiatAccount = fiatbankingSchemas.FiatAccount;
const ZCreateFiatAccountInput = fiatbankingSchemas.CreateFiatAccountRequest;

// Same pattern for other domains:
import { treasurySchemas } from "@cuur/core/treasury/index.js";
import type { Payment, CreatePaymentInput } from "@cuur/core/treasury/index.js";

const ZPayment = treasurySchemas.Payment;
const ZCreatePaymentInput = treasurySchemas.CreatePaymentRequest;
```

**Schema Export Pattern**:
- Domain schemas are exported as `{domain}Schemas` where hyphens are removed
- Examples: `fiat-banking` → `fiatbankingSchemas`, `treasury` → `treasurySchemas`

**Generator Fix Required**:
- Update `FactoryBuilder.build_entities_factory_file()` to:
  1. Import schema objects: `import { {domain}Schemas } from "@cuur/core/{domain}/index.js"`
  2. Extract schemas: `const Z{Entity} = {domain}Schemas.{Entity}`
  3. Import types separately: `import type { {Entity}, Create{Entity}Input } from "@cuur/core/{domain}/index.js"`

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/factory_builder.py` (lines 660-677)

### 3. Mock Reset Pattern

**Problem**: Mocks weren't being reset between tests, causing test interference.

**Fixed Pattern**:
```typescript
beforeEach(() => {
  deps = createMockDependencies();
  context = {
    orgId: TEST_ORG_ID,
    accountId: "test-account-id",
  };
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
  seedFaker(FAKER_SEED);
  vi.clearAllMocks();
  // Reset all mock implementations
  vi.mocked(deps.fiatAccountRepo.findById).mockResolvedValue(null);
  // Reset handler mocks
  vi.mocked(mockCreatePayment).mockReset();
});
```

**Generator Fix Required**:
- Add `vi.clearAllMocks()` in `beforeEach`
- Add mock reset calls for handler mocks if they exist

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py` (line 83-92)

### 4. Error Assertion Pattern

**Problem**: Error assertions checked messages instead of error codes, causing brittle tests.

**Fixed Pattern**:
```typescript
// ✅ CORRECT: Check error code, not message
try {
  await fundingInternalTransferFlow(...);
  expect.fail("Should have thrown FlowError");
} catch (error) {
  expect(error).toBeInstanceOf(FlowError);
  if (error instanceof FlowError) {
    expect(error.code).toBe("ACCOUNT_NOT_FOUND");
  }
}
```

**Generator Fix Required**:
- Update error handling tests to check `error.code` instead of message matching
- Use `expect.fail()` pattern for better error messages

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py` (lines 166-195)

### 5. Factory Data Generation Pattern

**Problem**: Factories generated invalid data that didn't match schema requirements.

**Key Requirements**:
- `orgId`: Must match regex `/^ID_[0-9A-HJKMNP-TV-Z]{26}$/` (excludes I and O)
- `amount`: Payment entity expects `number`, CreatePaymentRequest expects `string`
- `createdAt`/`updatedAt`: Must be ISO strings, not Date objects
- Enum values: Must use valid enum values from schemas

**Fixed Pattern**:
```typescript
export function createFiatAccount(overrides?: Partial<FiatAccount>): FiatAccount {
  const faker = getFaker();

  const raw = {
    id: faker.string.uuid(),
    orgId: `ID_${faker.string.alphanumeric(26)}`, // ❌ WRONG - includes I, O
    // ✅ CORRECT:
    orgId: (() => {
      const validChars = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      const suffix = Array.from({ length: 26 }, () =>
        faker.helpers.arrayElement(validChars.split(""))
      ).join("");
      return `ID_${suffix}`;
    })(),
    createdAt: new Date().toISOString(), // ✅ Must be string
    updatedAt: new Date().toISOString(), // ✅ Must be string
    status: faker.helpers.arrayElement(["ACTIVE", "SUSPENDED", "CLOSED"]), // ✅ Valid enum
    ...overrides,
  };

  return ZFiatAccount.parse(raw);
}
```

**Generator Fix Required**:
- Generate `orgId` with correct character set (exclude I, O)
- Convert dates to ISO strings
- Use `faker.helpers.arrayElement()` with valid enum values from schemas
- Handle type differences (e.g., Payment.amount is number, CreatePaymentRequest.amount is string)

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/factory_builder.py` (lines 707-750)

### 6. Handler Mock Detection Pattern

**Problem**: Flow tests need to detect which handlers are imported and generate mocks for them.

**Detection Strategy**:
1. Parse flow file to find handler imports from `@cuur/core/{domain}/handlers/index.js`
2. Extract handler names (e.g., `createPayment`, `listAccounts`)
3. Generate mock setup for each handler

**Fixed Pattern**:
```typescript
// Detect handlers used in flow
// From: import { createPayment } from "@cuur/core/treasury/handlers/index.js";
// Generate:
vi.mock("@cuur/core/treasury/handlers/index.js", () => ({
  createPayment: vi.fn(),
}));

import { createPayment as mockCreatePayment } from "@cuur/core/treasury/handlers/index.js";
```

**Generator Fix Required**:
- Add handler discovery in `FlowTestBuilder`
- Parse flow file imports to detect handler usage
- Generate mock setup before test content
- Add mock reset in `beforeEach`

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py`

## Implementation Checklist

### Priority 1: Critical Fixes (Blocks All Tests)
- [ ] **Mock Path Pattern**: Update `FlowTestBuilder` to generate handler mocks with alias paths
- [ ] **Factory Schema Imports**: Update `FactoryBuilder` to import schema objects and extract schemas
- [ ] **Mock Reset**: Add `vi.clearAllMocks()` and handler mock resets in `beforeEach`

### Priority 2: Important Fixes (Improves Test Quality)
- [ ] **Error Assertions**: Update error handling tests to check error codes
- [ ] **Factory Data Generation**: Fix orgId generation, date formatting, enum values
- [ ] **Handler Mock Detection**: Automatically detect and mock handlers used in flows

### Priority 3: Nice-to-Have (Polish)
- [ ] Add validation for factory-generated data
- [ ] Improve error messages in test failures
- [ ] Add helper functions for common test patterns

## Testing Strategy

After implementing fixes:

1. **Regenerate tests for one domain**: `cuur-codegen generate --domain accounts-funding --layer tests`
2. **Run tests**: Verify all tests pass
3. **Check generated code**: Verify patterns match fixed examples
4. **Regenerate all domains**: Apply to all orchestrator domains
5. **Run full test suite**: Verify no regressions

## Example: Complete Fixed Flow Test Template

```typescript
// Mock handlers used in flow
vi.mock("@cuur/core/{domain}/handlers/index.js", () => ({
  {handlerName}: vi.fn(),
}));

import { {handlerName} as mock{HandlerName} } from "@cuur/core/{domain}/handlers/index.js";

describe("{flowName} - Flow Orchestration", () => {
  let deps: Dependencies;
  let context: RequestContext;
  const FIXED_DATE = new Date("2025-01-01T00:00:00Z");
  const FAKER_SEED = 12345;
  const TEST_ORG_ID = "ID_01HQZX3K8PQRS7VN6M9TW1ABJZ";

  beforeEach(() => {
    deps = createMockDependencies();
    context = {
      orgId: TEST_ORG_ID,
      accountId: "test-account-id",
    };
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_DATE);
    seedFaker(FAKER_SEED);
    vi.clearAllMocks();
    // Reset handler mocks
    vi.mocked(mock{HandlerName}).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test content...
});
```

## Related Files

- `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py` - Flow test generation
- `.servicesgen/src/cuur_codegen/generators/tests/builders/factory_builder.py` - Factory generation
- `.servicesgen/src/cuur_codegen/generators/orchestrators/flows/validation_mapper.py` - Schema import patterns
