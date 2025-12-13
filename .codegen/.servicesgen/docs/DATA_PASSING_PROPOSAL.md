# Proposal: Data Passing Between Handler Steps

## Current State

Currently, the YAML `x-orchestration-flow` only supports:
- `dependsOn`: Execution order (ensures step B runs after step A)
- No data passing: Each handler receives only `repo`, `orgId`, and original request data

## Proposed YAML Extension

Add support for passing data from one handler's output to another handler's input:

```yaml
x-orchestration-flow:
  - stepId: preTradeCheckLogs
    kind: backend-call
    handler: listPreTradeCheckLogs
    # ... other fields

  - stepId: feesPreview
    kind: backend-call
    handler: createFeesPreview
    dependsOn:
      - preTradeCheckLogs
    # NEW: Specify how to pass data from previous step
    inputFrom:
      step: preTradeCheckLogs  # Which step's result to use
      mapping:                  # How to map the result
        # Option 1: Extract specific fields from previous result
        extract:
          orderId: "preTradeCheckLogs.data.items[0].orderId"
          accountId: "preTradeCheckLogs.data.items[0].accountId"
        # Option 2: Use entire previous result
        use: "preTradeCheckLogs"
        # Option 3: Transform previous result
        transform:
          expression: "{ orderId: preTradeCheckLogs.data.items[0].orderId, amount: body.amount }"
```

## Implementation Options

### Option 1: Simple Field Extraction
```yaml
inputFrom:
  step: preTradeCheckLogs
  extract:
    orderId: "data.items[0].orderId"  # Path into previous result
    accountId: "data.items[0].accountId"
```

### Option 2: JSONPath Expression
```yaml
inputFrom:
  step: preTradeCheckLogs
  jsonPath: "$.data.items[0].orderId"  # Standard JSONPath
```

### Option 3: JavaScript Expression (Most Flexible)
```yaml
inputFrom:
  step: preTradeCheckLogs
  expression: |
    {
      orderId: preTradeCheckLogs.data.items[0].orderId,
      amount: body.amount,
      metadata: { source: 'preTradeCheck' }
    }
```

## Generated Code Example

With the YAML above, the generator would produce:

```typescript
const preTradeCheckLogs = await listPreTradeCheckLogs(deps.preTradeCheckLogRepo, orgId, query || {});

// Extract data from previous step
const feesPreviewInput = {
  orderId: preTradeCheckLogs.data.items[0].orderId,
  accountId: preTradeCheckLogs.data.items[0].accountId,
  amount: body.amount
};

const feesPreview = await createFeesPreview(deps.feesPreviewRepo, orgId, feesPreviewInput);
```

## Recommendation

**Option 3 (JavaScript Expression)** is most flexible but requires:
- Expression evaluation at runtime (or compile-time code generation)
- Type safety considerations

**Option 1 (Simple Field Extraction)** is simpler and safer:
- Easy to validate
- Type-safe
- Clear intent

## Questions

1. Should we support passing data to:
   - Body/input parameters? (for create/update handlers)
   - Query parameters? (for list/get handlers)
   - Both?

2. Should we validate that the extracted data matches the handler's expected input schema?

3. Should we support merging data from multiple previous steps?
