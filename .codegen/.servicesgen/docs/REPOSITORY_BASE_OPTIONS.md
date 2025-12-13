# Repository Base Type Options Analysis

## Current Approach

**Base Repositories:**
- `ReadRepository<TEntity, TId, TListParams>` - list, get, findById
- `CrudRepository<TEntity, TCreate, TUpdate, TId, TListParams>` - extends ReadRepository + create, update, delete

**Current Logic:**
- If resource has `create` operation → use `CrudRepository`
- Otherwise → use `ReadRepository`

**Issues:**
- Resources with only `create` get full CRUD methods (update/delete may not exist)
- Resources with only `update` get ReadRepository (can't call update)
- Handler generator must detect capabilities to avoid calling non-existent methods

---

## Option A: Explicit Base Repositories (Recommended ✅)

### Proposed Structure

```typescript
// Base read operations
ReadRepository<TEntity, TId, TListParams>
  - list(orgId, params)
  - findById(orgId, id)
  - get(orgId, id)

// Single operation extensions
CreateReadRepository<TEntity, TCreate, TId, TListParams> extends ReadRepository
  - create(orgId, data)

UpdateReadRepository<TEntity, TUpdate, TId, TListParams> extends ReadRepository
  - update(orgId, id, data)

DeleteReadRepository<TEntity, TId, TListParams> extends ReadRepository
  - delete(orgId, id)

// Two operation combinations
CreateUpdateReadRepository<TEntity, TCreate, TUpdate, TId, TListParams> extends ReadRepository
  - create(orgId, data)
  - update(orgId, id, data)

CreateDeleteReadRepository<TEntity, TCreate, TId, TListParams> extends ReadRepository
  - create(orgId, data)
  - delete(orgId, id)

UpdateDeleteReadRepository<TEntity, TUpdate, TId, TListParams> extends ReadRepository
  - update(orgId, id, data)
  - delete(orgId, id)

// Full CRUD
CrudRepository<TEntity, TCreate, TUpdate, TId, TListParams> extends ReadRepository
  - create(orgId, data)
  - update(orgId, id, data)
  - delete(orgId, id)
```

### Pros ✅

1. **Type Safety**: TypeScript prevents calling non-existent methods at compile time
2. **Explicit Intent**: Repository type clearly shows what operations are supported
3. **No Handler Detection Needed**: Handlers can call methods directly, TypeScript enforces correctness
4. **Better IDE Support**: Autocomplete only shows available methods
5. **Self-Documenting**: Repository interface tells you exactly what's available
6. **Easier Debugging**: Clear error messages when wrong method is called

### Cons ❌

1. **More Base Types**: 7 base repository types instead of 2
2. **More Maintenance**: Need to maintain all combinations
3. **Repository Generator Complexity**: Must detect exact operation combination

### Implementation Complexity

**Repository Generator:**
```python
has_create = any(verb == "create" for verb, _, _ in resource_operations)
has_update = any(verb in ["update", "patch"] for verb, _, _ in resource_operations)
has_delete = any(verb == "delete" for verb, _, _ in resource_operations)

if has_create and has_update and has_delete:
    use_crud = True
elif has_create and has_update:
    use_create_update = True
elif has_create and has_delete:
    use_create_delete = True
elif has_update and has_delete:
    use_update_delete = True
elif has_create:
    use_create = True
elif has_update:
    use_update = True
elif has_delete:
    use_delete = True
else:
    use_read = True
```

**Handler Generator:**
- No capability detection needed
- Just call methods directly
- TypeScript will error if method doesn't exist

---

## Option B: Keep Current Approach + Better Detection

### Current Approach Enhanced

**Keep:** ReadRepository and CrudRepository only

**Enhancement:** Better handler generator detection

**Pros:**
- Simpler base repository structure
- Less maintenance

**Cons:**
- Handler generator still needs complex detection logic
- Less type-safe (runtime vs compile-time errors)
- Unclear what operations are supported from type alone

---

## Option C: Hybrid Approach

**Base Repositories:**
- `ReadRepository` - read operations only
- `CreateReadRepository` - read + create
- `UpdateReadRepository` - read + update
- `CrudRepository` - full CRUD

**Logic:**
- If only `create` → `CreateReadRepository`
- If only `update` → `UpdateReadRepository`
- If `create` + `update` + `delete` → `CrudRepository`
- Otherwise → `ReadRepository`

**Pros:**
- Covers most common cases
- Simpler than full explicit approach
- Still type-safe for common patterns

**Cons:**
- Doesn't cover all combinations (e.g., create + delete without update)
- Still need some detection logic

---

## Recommendation: Option A (Explicit Base Repositories) ✅

### Why?

1. **Type Safety First**: TypeScript catches errors at compile time, not runtime
2. **Self-Documenting**: Repository type tells you exactly what's available
3. **Simpler Handlers**: No detection logic needed in handler generator
4. **Better Developer Experience**: IDE autocomplete only shows valid methods
5. **Future-Proof**: Easy to add new combinations if needed

### Implementation Plan

1. **Phase 1**: Add new base repository types to `_base-repository.ts`
2. **Phase 2**: Update repository generator to detect exact operation combination
3. **Phase 3**: Simplify handler generator (remove capability detection)
4. **Phase 4**: Regenerate all repositories
5. **Phase 5**: Verify all handlers compile correctly

### Migration Impact

- **Breaking Changes**: None (just more granular types)
- **Repository Files**: Regenerate all (~88 repositories)
- **Handler Files**: Regenerate all (handlers will be simpler)
- **Testing**: TypeScript compiler will catch any issues

---

## Comparison Table

| Aspect | Current | Option A (Explicit) | Option B (Enhanced) | Option C (Hybrid) |
|--------|---------|-------------------|---------------------|-------------------|
| Base Types | 2 | 7 | 2 | 4 |
| Type Safety | Medium | High | Medium | High |
| Handler Complexity | High | Low | Medium | Medium |
| Maintenance | Low | Medium | Low | Low |
| Self-Documenting | Low | High | Low | Medium |
| Compile-Time Errors | Some | All | Some | Most |

---

## Conclusion

**Recommendation: Option A (Explicit Base Repositories)**

The explicit approach provides better type safety, clearer intent, and simpler handler code. The additional base repository types are a one-time cost that pays dividends in maintainability and developer experience.

**Next Steps:**
1. Review this proposal
2. If approved, implement base repository types
3. Update generators
4. Regenerate all code
5. Verify compilation
