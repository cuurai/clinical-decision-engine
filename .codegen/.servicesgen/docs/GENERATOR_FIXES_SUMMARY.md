# Generator Fixes Summary

## Quick Reference: Patterns to Apply

### 1. Handler Mock Pattern (CRITICAL - Blocks All Tests)

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py`

**Current State**: Flow tests don't generate handler mocks

**Required Fix**:
```python
# In FlowTestBuilder.build_flow_test(), detect handlers and generate:
handler_mocks = FlowTestBuilder._detect_handler_imports(flow.flow_file)
mock_code = FlowTestBuilder._generate_handler_mocks(handler_mocks)

# Add to template before imports:
{mock_code}
```

**Pattern**:
```typescript
// Detect: import { createPayment } from "@cuur/core/treasury/handlers/index.js";
// Generate:
vi.mock("@cuur/core/treasury/handlers/index.js", () => ({
  createPayment: vi.fn(),
}));

import { createPayment as mockCreatePayment } from "@cuur/core/treasury/handlers/index.js";
```

### 2. Factory Schema Import Pattern (CRITICAL - Blocks Factory Generation)

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/factory_builder.py` (lines 660-677)

**Current State**: Tries to import schemas directly (doesn't exist)

**Required Fix**:
```python
# Change from:
imports_lines.append(
    f"import {{ {', '.join(schema_imports) } }} from \"@cuur/core/{raw_domain_name}/index.js\";"
)

# To:
# 1. Import schema object
domain_schemas_var = raw_domain_name.replace('-', '').lower() + "Schemas"
imports_lines.append(
    f"import {{ {domain_schemas_var} }} from \"@cuur/core/{raw_domain_name}/index.js\";"
)
# 2. Extract schemas
schema_extractions = []
for entity_name in sorted(entity_names):
    entity_pascal = pascal_case(entity_name)
    schema_extractions.append(f"const Z{entity_pascal} = {domain_schemas_var}.{entity_pascal};")
    schema_extractions.append(f"const ZCreate{entity_pascal}Input = {domain_schemas_var}.Create{entity_pascal}Request;")
```

**Pattern**:
```typescript
// ✅ CORRECT
import { fiatbankingSchemas } from "@cuur/core/fiat-banking/index.js";
import type { FiatAccount, CreateFiatAccountInput } from "@cuur/core/fiat-banking/index.js";

const ZFiatAccount = fiatbankingSchemas.FiatAccount;
const ZCreateFiatAccountInput = fiatbankingSchemas.CreateFiatAccountRequest;
```

### 3. Mock Reset Pattern (IMPORTANT - Prevents Test Interference)

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py` (line 83-92)

**Required Fix**:
```python
beforeEach(() => {{
  deps = createMockDependencies();
  context = {{
    orgId: TEST_ORG_ID,
    accountId: "{test_account_id}",
  }};
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_DATE);
  seedFaker(FAKER_SEED);
  vi.clearAllMocks();  # ADD THIS
  # Reset handler mocks if they exist
  {handler_mock_resets}
}});
```

**Pattern**:
```typescript
vi.clearAllMocks();
vi.mocked(deps.fiatAccountRepo.findById).mockResolvedValue(null);
vi.mocked(mockCreatePayment).mockReset(); // If handler mocks exist
```

### 4. Error Assertion Pattern (IMPROVES TEST QUALITY)

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py` (lines 166-195)

**Required Fix**: Update error handling tests to check error codes:
```python
# Change from:
).rejects.toThrow("ACCOUNT_NOT_FOUND");

# To:
try:
    await flow(...);
    expect.fail("Should have thrown FlowError");
except (error):
    expect(error).toBeInstanceOf(FlowError);
    if error instanceof FlowError:
        expect(error.code).toBe("ACCOUNT_NOT_FOUND");
```

### 5. Factory Data Generation Pattern (IMPROVES DATA VALIDITY)

**Location**: `.servicesgen/src/cuur_codegen/generators/tests/builders/factory_builder.py` (lines 707-750)

**Required Fixes**:

#### orgId Generation
```python
# Generate valid orgId (exclude I, O)
valid_chars = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"
org_id_suffix = "".join([faker.helpers.arrayElement(list(valid_chars)) for _ in range(26)])
org_id = f"ID_{org_id_suffix}"
```

#### Date Formatting
```python
# Always use ISO strings, not Date objects
createdAt: new Date().toISOString(),
updatedAt: new Date().toISOString(),
```

#### Enum Values
```python
# Use valid enum values from schema
status: faker.helpers.arrayElement(["ACTIVE", "SUSPENDED", "CLOSED"]),
```

## Implementation Order

1. **Factory Schema Imports** (Priority 1) - Blocks factory generation
2. **Handler Mock Pattern** (Priority 1) - Blocks flow tests
3. **Mock Reset Pattern** (Priority 2) - Prevents test interference
4. **Error Assertion Pattern** (Priority 3) - Improves test quality
5. **Factory Data Generation** (Priority 3) - Improves data validity

## Testing Checklist

After implementing each fix:

- [ ] Regenerate tests: `cuur-codegen generate --domain accounts-funding --layer tests`
- [ ] Verify generated code matches patterns
- [ ] Run tests: `pnpm test` in test domain
- [ ] Check for linter errors
- [ ] Verify all tests pass

## Files to Modify

1. `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_test_builder.py`
   - Add handler mock detection and generation
   - Update beforeEach to include mock resets
   - Update error assertions

2. `.servicesgen/src/cuur_codegen/generators/tests/builders/factory_builder.py`
   - Fix schema imports (lines 660-677)
   - Fix factory data generation (lines 707-750)

3. `.servicesgen/src/cuur_codegen/generators/tests/builders/flow_discovery.py` (may need new file)
   - Add handler import detection from flow files

## Example: Complete Fixed Flow Test

See `.servicesgen/docs/GENERATOR_FIXES_PATTERNS.md` for complete examples.
