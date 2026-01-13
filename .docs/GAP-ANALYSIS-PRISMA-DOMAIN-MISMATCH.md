# Gap Analysis: Prisma Schema vs Domain Types Mismatch

**Date:** 2025-01-XX
**Status:** 🔴 Critical
**Impact:** 653 TypeScript compilation errors across adapters

---

## Executive Summary

After successfully renaming all Prisma models from `*Input` to domain names (e.g., `DecisionPolicyInput` → `DecisionPolicy`), we discovered **fundamental type mismatches** between the Prisma schema definitions and the domain types used in adapters. These mismatches prevent compilation and require systematic fixes.

**Key Findings:**

- ✅ Model names now match domain names (completed)
- ❌ Field definitions don't match domain types (653 errors)
- ❌ Missing Prisma models for some domain entities
- ❌ Type conversion logic missing in adapters

---

## 1. Missing `id` Field in CreateInput

### Problem

Prisma schema requires `id` to be provided in `CreateInput`, but domain types don't include `id` (it's generated).

### Example

**Prisma Schema:**

```prisma
model ThresholdProfile {
  id        String   @id @db.Char(33) /// Format: XX_<ULID>
  // ... other fields
}
```

**Domain Type (from OpenAPI):**

```typescript
type ThresholdProfileInput = {
  name: string;
  description?: string;
  // NO id field - it's generated
};
```

**Error:**

```
error TS2322: Property 'id' is missing in type '{ orgId: string; name: string; ... }'
but required in type 'ThresholdProfileCreateInput'.
```

### Affected Models

- `ThresholdProfile`
- `DecisionPolicy`
- `DecisionRequest`
- `DecisionResult`
- `AlertEvaluation`
- And ~50+ other models

### Solution Options

1. **Option A (Recommended):** Add `toPersistence` mapper in adapters that generates ULID
2. **Option B:** Change Prisma schema to auto-generate IDs (requires migration)
3. **Option C:** Update domain types to include `id` (breaks API contract)

---

## 2. Required vs Optional Field Mismatches

### Problem

Prisma schema defines fields as required (`String`), but domain types have them as optional (`string?`).

### Example

**Prisma Schema:**

```prisma
model ThresholdProfile {
  description String  // Required
  category String    // Required
  thresholds String  // Required
  metadata String    // Required
}
```

**Domain Type:**

```typescript
type ThresholdProfileInput = {
  name: string;
  description?: string; // Optional
  category?: string; // Optional
  thresholds?: Record<string, unknown>; // Optional, different type
  metadata?: Record<string, unknown>; // Optional, different type
};
```

**Error:**

```
error TS2322: Type '{ orgId: string; name: string; description?: string; ... }'
is not assignable to type 'ThresholdProfileCreateInput'.
  Property 'description' is incompatible: Type 'string | undefined' is not assignable to type 'string'.
```

### Affected Fields

- `description` (many models)
- `category` (many models)
- `metadata` (all models - type mismatch too)
- `configuration` (DecisionPolicy, etc.)
- `context` (DecisionRequest)
- `result` (DecisionResult)

### Solution

Add default values in `toPersistence` mapper:

```typescript
toPersistence(domain: ThresholdProfileInput) {
  return {
    description: domain.description ?? '',
    category: domain.category ?? '',
    thresholds: JSON.stringify(domain.thresholds ?? {}),
    metadata: JSON.stringify(domain.metadata ?? {}),
  };
}
```

---

## 3. Type Conversion Mismatches

### Problem

Domain types use rich TypeScript types (`Record<string, unknown>`, enums), but Prisma stores them as `String` (JSON serialized).

### Example

**Domain Type:**

```typescript
type DecisionPolicyInput = {
  configuration: Record<string, unknown>; // Rich object
  metadata?: Record<string, unknown>; // Rich object
};
```

**Prisma Schema:**

```prisma
model DecisionPolicy {
  configuration String  // Stored as JSON string
  metadata String       // Stored as JSON string
}
```

**Error:**

```
error TS2322: Type '{ configuration: Record<string, never>; ... }'
is not assignable to type 'DecisionPolicyCreateInput'.
  Types of property 'configuration' are incompatible.
    Type 'Record<string, never>' is not assignable to type 'string'.
```

### Affected Fields

- `configuration` (DecisionPolicy, etc.)
- `metadata` (all models)
- `context` (DecisionRequest)
- `result` (DecisionResult)
- `thresholds` (ThresholdProfile)

### Solution

Add JSON serialization in `toPersistence` and deserialization in `toDomain`:

```typescript
toPersistence(domain: DecisionPolicyInput) {
  return {
    configuration: JSON.stringify(domain.configuration),
    metadata: JSON.stringify(domain.metadata ?? {}),
  };
}

toDomain(prisma: PrismaDecisionPolicy) {
  return {
    configuration: JSON.parse(prisma.configuration),
    metadata: JSON.parse(prisma.metadata),
  };
}
```

---

## 4. Enum Value Mismatches

### Problem

Domain types use string literals that don't match Prisma enum values.

### Example

**Domain Type:**

```typescript
type DecisionPolicyInput = {
  status: "draft" | "active" | "deprecated"; // String literals
};
```

**Prisma Schema:**

```prisma
enum StatusEnum {
  active
  snoozed
  overridden
  resolved
}
```

**Error:**

```
error TS2322: Type '"draft"' is not assignable to type 'StatusEnum'.
```

### Affected Enums

- `StatusEnum` - domain has `"draft"`, Prisma doesn't
- `RequesttypeEnum` - value mismatches
- `PriorityEnum` - value mismatches
- Other enums

### Solution

1. Update Prisma schema enums to match domain enums
2. Or add enum mapping in adapters

---

## 5. Missing Prisma Models

### Problem

Some domain entities don't have corresponding Prisma models.

### Example

**Domain Type:**

```typescript
type DecisionPolicyThresholdProfile = {
  // ... fields
};
```

**Error:**

```
error TS2339: Property 'decisionPolicyThresholdProfile' does not exist on type 'PrismaClient'.
```

### Missing Models

- `DecisionPolicyThresholdProfile` (junction table)
- Possibly others

### Solution

Add missing models to Prisma schema or create them as derived entities.

---

## 6. Cursor Pagination Type Mismatches

### Problem

Cursor pagination uses empty object `{}` for cursor, but Prisma expects `WhereUniqueInput`.

### Example

**Adapter Code:**

```typescript
cursor: {
  id: params.cursor;
} // params.cursor might be undefined
```

**Error:**

```
error TS2345: Type '{ id: {}; }' is not assignable to type 'AlertEvaluationWhereUniqueInput'.
  Types of property 'id' are incompatible.
    Type '{}' is not assignable to type 'string'.
```

### Solution

Add proper type guards:

```typescript
cursor: params.cursor ? { id: params.cursor } : undefined;
```

---

## 7. Foreign Key Field Mismatches

### Problem

Domain types have optional foreign keys, but Prisma requires them.

### Example

**Domain Type:**

```typescript
type AlertEvaluationInput = {
  decisionSessionId?: string; // Optional
};
```

**Prisma Schema:**

```prisma
model AlertEvaluation {
  decisionSessionId String @db.Char(33)  // Required
}
```

**Error:**

```
error TS2322: Type 'string | undefined' is not assignable to type 'string'.
```

### Solution

Handle optional foreign keys in `toPersistence` or update Prisma schema to allow nulls.

---

## Error Statistics

### By Error Type

- **TS2322** (Type mismatch): ~400 errors
- **TS2339** (Property doesn't exist): ~50 errors
- **TS2345** (Argument type mismatch): ~150 errors
- **TS2551** (Property typo): ~50 errors
- **Other**: ~3 errors

### By Category

1. Missing `id` in CreateInput: ~100 errors
2. Required vs Optional: ~200 errors
3. Type conversion (JSON): ~150 errors
4. Enum mismatches: ~50 errors
5. Missing models: ~10 errors
6. Cursor pagination: ~50 errors
7. Foreign keys: ~93 errors

---

## Recommended Solution Strategy

### Phase 1: Add Mapping Functions (High Priority)

1. Create `toPersistence()` and `toDomain()` helpers in each adapter
2. Handle `id` generation (ULID)
3. Handle optional → required conversions
4. Handle JSON serialization/deserialization

### Phase 2: Fix Prisma Schema (Medium Priority)

1. Make optional fields nullable in Prisma (`String?`)
2. Add missing enum values
3. Add missing models

### Phase 3: Fix Adapter Code (Low Priority)

1. Fix cursor pagination type guards
2. Fix foreign key handling
3. Add proper error handling

---

## Implementation Priority

### 🔴 Critical (Blocking)

1. Add `id` generation in adapters
2. Add JSON serialization for metadata/configuration fields
3. Fix required vs optional field mismatches

### 🟡 High Priority

1. Fix enum value mismatches
2. Add missing Prisma models
3. Fix cursor pagination

### 🟢 Medium Priority

1. Refactor adapters to use mapping functions consistently
2. Add unit tests for mapping functions
3. Document mapping patterns

---

## Next Steps

1. **Create shared mapper utilities** in `packages/core/_shared/src/mappers/`
2. **Update each adapter** to use mappers
3. **Update Prisma schema** to align with domain types where possible
4. **Add integration tests** to verify mappings

---

## Appendix: Affected Files

### Decision Intelligence Adapter

- `threshold-profile.dao.repository.ts`
- `decision-policy.dao.repository.ts`
- `decision-request.dao.repository.ts`
- `decision-result.dao.repository.ts`
- `alert-evaluation.dao.repository.ts`
- `decision-policy-threshold-profile.dao.repository.ts`
- And ~30+ more files

### Other Adapters

- Integration & Interoperability: ~50 files
- Knowledge & Evidence: ~40 files
- Patient Clinical Data: ~30 files
- Workflow & Care Pathways: ~40 files

**Total:** ~200 adapter files need updates

---

## Conclusion

The model rename was successful, but revealed deeper architectural mismatches between Prisma schema and domain types. These need systematic fixes through:

1. **Adapter mapping layer** (immediate)
2. **Prisma schema updates** (medium-term)
3. **Type system alignment** (long-term)

The good news: These are **fixable** and follow predictable patterns. With proper mapper utilities, most fixes can be automated or templated.

