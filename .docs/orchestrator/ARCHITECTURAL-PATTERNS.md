# Orchestrator Architectural Patterns

This document defines the architectural patterns that orchestrator use-cases must follow to maintain Clean Architecture + DDD principles.

## ✅ Correct Patterns

### 1. Domain Aggregates, Not Object Literals

**❌ Wrong:**

```ts
const externalSystem = {
  id: this.generateId(),
  orgId: input.orgId,
  name: input.name,
  // ...
};
```

**✅ Correct:**

```ts
const externalSystem = this.externalSystemFactory.provision({
  orgId: input.orgId,
  name: input.name,
  // ...
});
```

**Why:** Domain aggregates enforce invariants, handle ID generation, and prevent schema bleed.

---

### 2. Domain Factories for Creation

**❌ Wrong:**

```ts
private generateId(): string {
  return `ID_${Date.now()}_...`;
}
```

**✅ Correct:**

```ts
interface ExternalSystemFactory {
  provision(params: ProvisionParams): ExternalSystem;
}
```

**Why:** ID generation is a domain/infrastructure concern. Factories encapsulate creation logic and invariants.

---

### 3. Repository `load()`/`save()` Pattern, Not CRUD

**❌ Wrong:**

```ts
await repository.create(orgId, entity as any);
await repository.update(orgId, id, changes);
const entity = await repository.get(orgId, id);
```

**✅ Correct:**

```ts
interface Repository {
  load(id: string): Promise<Aggregate | null>;
  save(aggregate: Aggregate): Promise<void>;
}

const entity = await repository.load(id);
entity.performOperation(params);
await repository.save(entity);
```

**Why:**

- Repository handles org scoping internally
- No `as any` type coercion needed
- Aggregate boundaries are respected
- Persistence shape is hidden from orchestrator
- No partial updates

---

### 4. Domain Decides Status, Not Orchestrator

**❌ Wrong:**

```ts
status: healthCheck.status === "healthy" ? "active" : "inactive";
```

**✅ Correct:**

```ts
const connection = externalSystem.attachConnection({
  config: input.connection,
  initialHealth: healthCheck,
  provisionedBy: input.provisionedBy,
});
// Domain aggregate decides status based on health check
```

**Why:** Status determination is a domain rule, not orchestration logic.

---

### 5. Domain Aggregate Methods for State Transitions

**❌ Wrong:**

```ts
// Orchestrator mutates state directly
await repository.update(orgId, id, {
  status: "escalated",
  metadata: {
    escalationLevel: newLevel,
    workQueueIds: newQueues,
  },
});

// Orchestrator decides status
const finalStatus = input.type === "dismissed" ? "dismissed" : "resolved";
```

**✅ Correct:**

```ts
// Ask domain aggregate to perform operation
alert.escalate({
  escalationLevel: escalationDecision.escalationLevel,
  targetWorkQueueIds: escalationDecision.targetWorkQueueIds,
  reason: escalationDecision.reason,
  escalatedAt: new Date(),
});

// Domain decides status based on resolution type
alert.resolve({
  resolvedBy: input.resolvedBy,
  resolutionType: input.resolutionType ?? "resolved",
  resolvedAt: new Date(),
});

await repository.save(alert);
```

**Why:**

- Domain aggregates enforce invariants
- State transitions are explicit and validated
- No partial updates that break consistency
- No metadata hacking

---

### 6. Explicit Domain State, Not Metadata

**❌ Wrong:**

```ts
// Domain knowledge hidden in metadata
(alert.metadata as any)?.escalationLevel;
alert.metadata.previousWorkQueueIds;
alert.metadata.workQueueIds;

// Orchestrator reasons about internal shape
const currentLevel = ((alert.metadata as any)?.escalationLevel as number) ?? 0;
```

**✅ Correct:**

```ts
// Explicit domain properties
alert.escalationLevel;
alert.workQueueIds;
alert.previousWorkQueueIds;

// Domain aggregate exposes clear interface
const currentLevel = alert.escalationLevel;
```

**Why:**

- Domain state is explicit and type-safe
- No `as any` type coercions
- Prevents schema drift
- Clear contracts between layers

---

### 7. Repository `load()`/`save()` Pattern

**❌ Wrong:**

```ts
// CRUD methods with orgId parameter
const entity = await repository.get(orgId, id);
await repository.update(orgId, id, changes);
await repository.create(orgId, entity as any);
```

**✅ Correct:**

```ts
// Load/save pattern - repository handles org scoping
const entity = await repository.load(id);
entity.performOperation(params);
await repository.save(entity);
```

**Why:**

- Repository handles org scoping internally
- No partial updates
- Aggregate consistency maintained
- Cleaner interface

---

### 8. Value Objects for Configuration

**❌ Wrong:**

```ts
connection: {
  endpoint: string;
  protocol: "hl7" | "fhir" | "rest" | "soap";
  authentication: {
    type: string;
    credentials: Record<string, unknown>;
  }
}
```

**✅ Correct:**

```ts
interface ConnectionConfigVO {
  readonly endpoint: string;
  readonly authentication: ConnectionAuthenticationVO;
  readonly protocol: "hl7" | "fhir" | "rest" | "soap";
  readonly settings: Record<string, unknown>;
}
```

**Why:** Value objects encapsulate integration-specific details and provide type safety.

---

## Architecture Layers

```
┌─────────────────────────────────────────┐
│         Orchestrator Layer              │
│  (Use Cases - Business Workflows)      │
│  - Coordinates domain services          │
│  - No persistence logic                 │
│  - No framework code                    │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│          Domain Layer                    │
│  (Aggregates, Factories, Services)      │
│  - Business rules & invariants           │
│  - ID generation                         │
│  - Status determination                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Infrastructure Layer               │
│  (Repositories, Adapters)               │
│  - Persistence implementation            │
│  - External service integration          │
└─────────────────────────────────────────┘
```

---

## Example: Correct Use Case Structure

```ts
export class ProvisionExternalSystemConnectionUseCase {
  constructor(
    // Domain factory (not repository for creation)
    private readonly externalSystemFactory: ExternalSystemFactory,

    // Repositories use save() pattern
    private readonly externalSystemRepository: ExternalSystemRepository,
    private readonly connectionRepository: ConnectionRepository,

    // Domain services
    private readonly connectionHealthService: ConnectionHealthService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: Input): Promise<Output> {
    // 1. Ask domain factory to create aggregate
    const externalSystem = this.externalSystemFactory.provision({
      orgId: input.orgId,
      name: input.name,
      // ...
    });

    // 2. Perform side effects (health check)
    const healthCheck = await this.connectionHealthService.testConnection(
      input.connection,
      input.orgId
    );

    // 3. Ask domain aggregate to perform operation
    // Domain decides status based on health check
    const connection = externalSystem.attachConnection({
      config: input.connection,
      initialHealth: healthCheck,
      provisionedBy: input.provisionedBy,
    });

    // 4. Persist aggregates (repository handles org scoping)
    await this.externalSystemRepository.save(externalSystem);
    await this.connectionRepository.save(connection);

    // 5. Emit audit event
    await this.auditService.record("EVENT_TYPE", {
      // ...
    });

    return {
      externalSystemId: externalSystem.id,
      connectionId: connection.id,
      healthStatus: healthCheck.status,
    };
  }
}
```

---

## Checklist for New Use Cases

- [ ] Uses domain factories for aggregate creation (not object literals)
- [ ] No ID generation in orchestrator
- [ ] Repository uses `load()`/`save()` pattern (not `get()`/`update()`/`create()`)
- [ ] Domain aggregates perform state transitions (not orchestrator mutations)
- [ ] Domain state is explicit (not hidden in metadata)
- [ ] Domain aggregates decide status/rules (not orchestrator)
- [ ] Configuration uses value objects
- [ ] No `as any` type coercions
- [ ] Repository handles org scoping internally
- [ ] Domain services are interfaces (not implementations)

---

## Migration Guide

When updating existing use-cases:

1. **Replace object literals** → Domain factory calls
2. **Remove ID generation** → Move to domain factory
3. **Change `create()`/`update()`** → Use `save()` pattern
4. **Move status logic** → Domain aggregate methods
5. **Wrap configs** → Value objects
6. **Remove `as any`** → Proper typing via aggregates
