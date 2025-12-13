# Entity Detection Ruleset

## Overview

This document defines the **strict, deterministic rules** for identifying **Entities** vs **DTOs/Requests/Responses** in Zod schema files.

**CRITICAL**: ALL RULES MUST PASS. If ANY rule fails, the schema is REJECTED as an entity.

---

## The 6 Rules (E1-E6)

### RULE E1: Must be `z.object({...})` ✅
**Purpose**: Structural requirement - entities are object schemas, not primitives.

**Check**: Schema definition must match pattern `const SchemaName = z.object({...})`

**Rejects**:
- Primitive types (`z.string()`, `z.number()`, `z.enum()`)
- Type aliases (`const ChainRecordId = z.string()`)

**Example**:
```typescript
// ✅ PASS: Chain is z.object
const Chain = z.object({ id: ..., name: ... });

// ❌ FAIL: ChainRecordId is z.string
const ChainRecordId = z.string();
```

---

### RULE E2: Must NOT contain `data`/`meta` at top level ✅
**Purpose**: Response structure check - entities don't have response wrappers.

**Check**: Schema fields must NOT include `data` or `meta` at top level.

**Rejects**:
- Response wrappers (`{ data: Entity, meta: {...} }`)
- Pagination structures (`{ data: { items: [...] }, meta: {...} }`)

**Example**:
```typescript
// ✅ PASS: Chain has no data/meta fields
const Chain = z.object({ id: ..., name: ... });

// ❌ FAIL: GetChainResponse has data field
const GetChainResponse = z.object({ data: Chain, meta: ResponseMeta });
```

---

### RULE E3: Name must NOT end with Request/Response/Error/Envelope ✅
**Purpose**: Naming convention check - entities don't follow request/response naming.

**Check**: Schema name must NOT end with:
- `Request`
- `Response`
- `Error`
- `ValidationError`
- `Problem`
- `Envelope`

**Rejects**:
- `CreateChainRequest`
- `GetChainResponse`
- `ValidationError`
- `DataEnvelope`

**Example**:
```typescript
// ✅ PASS: Chain doesn't end with excluded suffix
const Chain = z.object({ ... });

// ❌ FAIL: CreateChainRequest ends with "Request"
const CreateChainRequest = Chain.and(...);
```

---

### RULE E4: Must NOT be a primitive wrapper ✅
**Purpose**: Type check - entities are complex objects, not type aliases.

**Check**: Schema name must NOT match excluded patterns:
- `.*Id$` (e.g., `ChainRecordId`, `WalletId`)
- `.*Meta$` (e.g., `ResponseMeta`)
- `.*Info$` (e.g., `PageInfo`)
- `Timestamp$`, `NullableTimestamp$`

**Rejects**:
- `ChainRecordId`
- `ResponseMeta`
- `PageInfo`

**Example**:
```typescript
// ✅ PASS: Chain is not a primitive wrapper
const Chain = z.object({ ... });

// ❌ FAIL: ChainRecordId matches .*Id$ pattern
const ChainRecordId = z.string();
```

---

### RULE E5: Must NOT be constructed with envelopes ✅
**Purpose**: Composition check - entities aren't wrapped in response structures.

**Check**: Schema definition must NOT use `.and(DataEnvelope)` or `.and(ResponseMeta)`.

**Rejects**:
- `DataEnvelope.and(z.object({ data: Entity }))`
- `ResponseMeta.and(...)`

**Example**:
```typescript
// ✅ PASS: Chain is standalone object
const Chain = z.object({ ... });

// ❌ FAIL: GetChainResponse uses DataEnvelope
const GetChainResponse = DataEnvelope.and(z.object({ data: Chain }));
```

---

### RULE E6: Must have `id` field + domain indicators ✅
**Purpose**: Domain validation - entities are persisted domain objects.

**Check**: Schema MUST have:
1. **Required**: `id` field (persisted domain objects have IDs)
2. **Required**: At least 2 domain indicators total:
   - `id` field (always counts as 1)
   - `name` field (or name-like fields)
   - `status` field
   - Timestamps (`createdAt`, `updatedAt`, `timestamp`, etc.)
   - Enum fields
   - Number fields

**Rejects**:
- `WalletBalance` (no `id` field = DTO/value object)
- `ChainServiceHealth` (no `id` field = response DTO)
- `HealthMetrics` (no `id` field = response DTO)
- Objects with `id` but no other domain indicators

**Example**:
```typescript
// ✅ PASS: Chain has id + name + status + timestamps (4 indicators)
const Chain = z.object({
  id: ChainRecordId.regex(...),
  name: z.string(),
  status: z.enum([...]),
  createdAt: z.string().datetime(),
  ...
});

// ❌ FAIL: WalletBalance has no id field
const WalletBalance = z.object({
  chainId: z.string(),
  amount: z.string(),
  ...
});

// ❌ FAIL: ChainServiceHealth has no id field
const ChainServiceHealth = z.object({
  status: z.enum([...]),
  adaptersHealthy: z.number(),
  ...
});
```

---

## Rule Execution Flow

```
For each schema in schemas export:
  ├─ RULE E3: Check name suffix → FAIL? REJECT
  ├─ RULE E4: Check excluded patterns → FAIL? REJECT
  ├─ RULE E1: Check z.object structure → FAIL? REJECT
  ├─ RULE E5: Check envelope composition → FAIL? REJECT
  ├─ Extract schema definition
  ├─ RULE E2: Check data/meta fields → FAIL? REJECT
  └─ RULE E6: Check id + domain indicators → FAIL? REJECT

  ✅ ALL RULES PASSED → ACCEPT AS ENTITY
```

---

## Examples

### ✅ Valid Entities

```typescript
// Chain - has id + name + status + timestamps
const Chain = z.object({
  id: ChainRecordId.regex(/^BL_.../),
  name: z.string(),
  status: z.enum(["ACTIVE", "DEPRECATED", "DISABLED"]),
  createdAt: z.string().datetime(),
  ...
});

// Wallet - has id + address + status + timestamps
const Wallet = z.object({
  id: WalletId.regex(/^BL_.../),
  address: z.string(),
  status: z.enum(["ACTIVE", "DISABLED"]),
  createdAt: z.string().datetime(),
  ...
});
```

### ❌ Invalid (Rejected)

```typescript
// WalletBalance - NO id field (DTO/value object)
const WalletBalance = z.object({
  chainId: z.string(),
  amount: z.string(),
  ...
});

// ChainServiceHealth - NO id field (response DTO)
const ChainServiceHealth = z.object({
  status: z.enum([...]),
  adaptersHealthy: z.number(),
  ...
});

// GetChainResponse - has data field (response wrapper)
const GetChainResponse = DataEnvelope.and(
  z.object({ data: Chain })
);

// CreateChainRequest - ends with "Request"
const CreateChainRequest = Chain.and(...);
```

---

## Summary

**Entities** = Persisted domain objects with:
- ✅ `z.object({...})` structure
- ✅ `id` field (required)
- ✅ Domain indicators (name, status, timestamps, enums)
- ✅ No response wrappers
- ✅ No request/response naming

**DTOs/Requests/Responses** = Data transfer objects:
- ❌ No `id` field
- ❌ Response wrappers (`data`, `meta`)
- ❌ Request/Response naming
- ❌ Envelope composition

---

**Last Updated**: 2025-01-XX
**Version**: 1.0.0
