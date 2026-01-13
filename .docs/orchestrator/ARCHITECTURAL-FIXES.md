# Architectural Fixes Applied

This document summarizes the architectural violations that were fixed and the patterns now enforced.

## ✅ Fixed Use Cases

### 1. `ProvisionExternalSystemConnectionUseCase`

**File**: `interoperability-ingestion/use-cases/provision-external-system-connection.usecase.ts`

**Fixes Applied**:

- ✅ Replaced object literal with `ExternalSystemFactory.provision()`
- ✅ Removed ID generation from orchestrator
- ✅ Changed `repository.create()` to `repository.save()` pattern
- ✅ Domain aggregate (`externalSystem.attachConnection()`) now decides connection status
- ✅ Introduced `ConnectionConfigVO` value object
- ✅ Repository interfaces now use `save()` pattern with org scoping handled internally

**Before**:

```ts
const externalSystem = {
  id: this.generateId(),
  orgId: input.orgId,
  // ...
};
await this.externalSystemRepository.create(input.orgId, externalSystem as any);
```

**After**:

```ts
const externalSystem = this.externalSystemFactory.provision({...});
const connection = externalSystem.attachConnection({...});
await this.externalSystemRepository.save(externalSystem);
await this.connectionRepository.save(connection);
```

---

### 2. `StartDecisionSessionUseCase`

**File**: `decision-session/use-cases/start-decision-session.usecase.ts`

**Fixes Applied**:

- ✅ Replaced object literal with `DecisionSessionFactory.start()`
- ✅ Removed ID generation from orchestrator
- ✅ Changed `repository.create()` to `repository.save()` pattern
- ✅ Domain factory handles all creation logic and invariants

**Before**:

```ts
const decisionSession = {
  id: this.generateId(),
  orgId: input.orgId,
  // ...
};
await this.decisionSessionRepository.create(input.orgId, decisionSession as any);
```

**After**:

```ts
const decisionSession = this.decisionSessionFactory.start({...});
await this.decisionSessionRepository.save(decisionSession);
```

---

## 📋 Remaining Use Cases to Fix

The following use-cases still need architectural fixes:

### Decision Session Orchestrator

- [x] `start-decision-session.usecase.ts` - ✅ Fixed: Uses factory, save() pattern
- [x] `refresh-decision-session-context.usecase.ts` - ✅ Fixed: Uses domain aggregate method, load()/save() pattern
- [x] `submit-decision-request.usecase.ts` - ✅ Fixed: Uses factory, save() pattern, explicit domain properties
- [x] `execute-decision-evaluation.usecase.ts` - ✅ Fixed: Uses factory, save() pattern, explicit domain properties
- [x] `produce-decision-result-bundle.usecase.ts` - ✅ Fixed: Uses factories, save() pattern, no ID generation
- [x] `generate-decision-explanation-bundle.usecase.ts` - ✅ Fixed: Uses factory, save() pattern, domain aggregate methods
- [x] `close-decision-session.usecase.ts` - ✅ Fixed: Uses domain aggregate method, load()/save() pattern

### Alert & Escalation Orchestrator

- [x] `create-alert-from-decision-result.usecase.ts` - ✅ Fixed: Uses factory, save() pattern
- [ ] `route-alert-to-work-queue.usecase.ts` - Use domain aggregate methods
- [x] `escalate-alert.usecase.ts` - ✅ Fixed: Uses domain aggregate methods, load()/save() pattern
- [x] `acknowledge-alert.usecase.ts` - ✅ Fixed: Uses domain aggregate methods, load()/save() pattern
- [x] `resolve-alert.usecase.ts` - ✅ Fixed: Uses domain aggregate methods, load()/save() pattern
- [ ] `generate-alert-explanation.usecase.ts` - Use factory, save() pattern

### Interoperability Ingestion Orchestrator

- [ ] `run-integration-job.usecase.ts` - Use factory, save() pattern
- [x] `ingest-hl7-message.usecase.ts` - ✅ Fixed: Uses factory, save() pattern, domain aggregate methods
- [x] `ingest-fhir-bundle.usecase.ts` - ✅ Fixed: Uses factory, save() pattern, domain aggregate methods
- [ ] `normalize-inbound-clinical-data.usecase.ts` - Use value objects
- [ ] `persist-normalized-records.usecase.ts` - Use save() pattern
- [ ] `handle-ingestion-errors.usecase.ts` - Use factory, save() pattern

---

## 🎯 Key Patterns to Apply

### Pattern 1: Domain Factories

```ts
// ❌ Wrong
const entity = { id: generateId(), ... };

// ✅ Correct
const entity = this.entityFactory.create({...});
```

### Pattern 2: Repository save() Pattern

```ts
// ❌ Wrong
await repository.create(orgId, entity as any);
await repository.update(orgId, id, changes);

// ✅ Correct
await repository.save(entity);
```

### Pattern 3: Domain Aggregate Methods

```ts
// ❌ Wrong
entity.status = healthCheck.status === "healthy" ? "active" : "inactive";

// ✅ Correct
const entity = aggregate.performOperation({ healthCheck });
```

### Pattern 4: Value Objects

```ts
// ❌ Wrong
connection: { endpoint: string; protocol: string; ... }

// ✅ Correct
connection: ConnectionConfigVO
```

---

## 🔧 Next Steps

1. **Implement Domain Layer**:

   - Create domain aggregates (ExternalSystem, DecisionSession, Alert, etc.)
   - Create domain factories
   - Implement domain methods for state transitions

2. **Update Repository Interfaces**:

   - Change from CRUD to `save()`/`findById()` pattern
   - Remove orgId parameter (handle internally)
   - Remove `as any` type coercions

3. **Fix Remaining Use Cases**:

   - Apply patterns from fixed examples
   - Use domain factories instead of object literals
   - Use domain aggregate methods for operations

4. **Add Domain Services**:
   - Implement interfaces defined in use-cases
   - Keep domain services pure (no persistence)

---

## 📚 Reference

See `ARCHITECTURAL-PATTERNS.md` for detailed pattern documentation.
