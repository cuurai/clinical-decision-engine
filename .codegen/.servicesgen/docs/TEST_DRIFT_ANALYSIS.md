# Test Drift Analysis & Recommendations

## Current Approach

**Flow Discovery:**
- ✅ Primary: Reads from **generated orchestrator directory** (`*.flow.ts` files)
- ✅ Secondary: Reads from **YAML configs** for metadata enrichment
- ✅ Tests reference actual flow file paths in comments

## Drift Risk Assessment

### ⚠️ Current Issues

1. **Tests tied to generated code, not source of truth**
   - If YAML changes but code isn't regenerated, tests won't reflect changes
   - Tests can't detect when generated code drifts from YAML

2. **Manual edits to flow files**
   - If someone manually edits a `.flow.ts` file, tests will test the edited version
   - But manual edits violate the "no-drift" policy (generated code should never be manually edited)

3. **No validation that code matches spec**
   - Tests don't verify that generated code matches YAML configuration
   - Can't catch generator bugs that produce incorrect code

## Expert Recommendations for No-Drift

### ✅ **Recommended Approach: YAML-First Discovery**

**Principle:** Tests should read from the **source of truth** (YAML), not derived code.

**Benefits:**
1. **True no-drift**: Tests always reflect intended behavior from YAML
2. **Early detection**: Tests fail if generated code doesn't match YAML
3. **Single source of truth**: YAML is the canonical specification
4. **Generator validation**: Tests can verify generator correctness

**Implementation:**

```python
# FlowDiscovery should discover from YAML first
def discover_flows_from_yaml(orchestrator_domain: str, context: GenerationContext):
    """
    Discover flows from YAML (source of truth)
    Then validate that corresponding flow files exist
    """
    yaml_path = project_root / "orchestrators" / "openapi" / "src" / "yaml" / f"{orchestrator_domain}.yaml"

    flows = []
    with open(yaml_path) as f:
        spec = yaml.safe_load(f)

        for path, methods in spec.get("paths", {}).items():
            for method, operation in methods.items():
                flow_steps = operation.get("x-orchestration-flow", [])
                if flow_steps:
                    # Extract flow info from YAML
                    operation_id = operation.get("operationId")

                    # Validate corresponding flow file exists
                    flow_file = _find_flow_file(operation_id, orchestrator_domain)
                    if not flow_file.exists():
                        context.logger.warn(
                            f"Flow file missing for {operation_id} - "
                            "generated code may be out of sync with YAML"
                        )

                    flows.append(FlowInfo(
                        operation_id=operation_id,
                        flow_steps=flow_steps,  # From YAML
                        flow_file=str(flow_file),  # For reference
                        # ... other metadata from YAML
                    ))

    return flows
```

### ✅ **Hybrid Approach (Current + Validation)**

**Keep current approach BUT add validation:**

1. **Discover from generated code** (current)
2. **Cross-reference with YAML** to validate
3. **Fail if mismatch detected**

```python
def discover_flows_with_validation(orchestrator_domain: str, context: GenerationContext):
    """
    Discover flows from generated code, but validate against YAML
    """
    # Discover from generated files (current approach)
    flows_from_code = discover_flows_from_code(orchestrator_domain, context)

    # Discover from YAML
    flows_from_yaml = discover_flows_from_yaml(orchestrator_domain, context)

    # Validate they match
    code_ops = {f.operation_id for f in flows_from_code}
    yaml_ops = {f.operation_id for f in flows_from_yaml}

    if code_ops != yaml_ops:
        missing_in_code = yaml_ops - code_ops
        extra_in_code = code_ops - yaml_ops

        if missing_in_code:
            raise GenerationError(
                f"Generated code missing flows from YAML: {missing_in_code}. "
                "Run orchestrator generation to sync."
            )

        if extra_in_code:
            context.logger.warn(
                f"Generated code has extra flows not in YAML: {extra_in_code}. "
                "Consider cleaning up or updating YAML."
            )

    return flows_from_code  # Use code-based discovery (tests actual implementation)
```

### ✅ **Best Practice: YAML-First with Code Validation**

**Recommended for true no-drift:**

```python
def discover_flows_yaml_first(orchestrator_domain: str, context: GenerationContext):
    """
    Discover flows from YAML (source of truth)
    Validate that generated code exists and matches
    """
    # 1. Read from YAML (source of truth)
    yaml_path = project_root / "orchestrators" / "openapi" / "src" / "yaml" / f"{orchestrator_domain}.yaml"
    flows = []

    with open(yaml_path) as f:
        spec = yaml.safe_load(f)

        for path, methods in spec.get("paths", {}).items():
            for method, operation in methods.items():
                flow_steps = operation.get("x-orchestration-flow", [])
                if not flow_steps:
                    continue

                operation_id = operation.get("operationId")

                # 2. Find corresponding generated flow file
                flow_file = _find_flow_file(operation_id, orchestrator_domain, path)

                # 3. Validate file exists (fail if not)
                if not flow_file.exists():
                    raise GenerationError(
                        f"Flow file missing for operation {operation_id}. "
                        "Run: python3 -m cuur_codegen.cli.main generate --domain {domain} --layer orchestrators"
                    )

                # 4. Optionally validate file content matches YAML expectations
                # (e.g., check step count, handler names, etc.)

                flows.append(FlowInfo(
                    operation_id=operation_id,
                    flow_steps=flow_steps,  # From YAML (source of truth)
                    flow_file=str(flow_file),  # For testing actual implementation
                    # ... metadata from YAML
                ))

    return flows
```

## Recommendation Summary

### 🎯 **For Maximum No-Drift Protection:**

1. **Discover flows from YAML first** (source of truth)
2. **Validate generated code exists** (fail if missing)
3. **Optionally validate code matches YAML** (step count, handlers, etc.)
4. **Tests reference YAML config** in comments, not just flow files

### 🔄 **Migration Path:**

1. **Phase 1**: Add YAML validation to current discovery
2. **Phase 2**: Switch to YAML-first discovery
3. **Phase 3**: Add code validation checks

### 📋 **Test Comments Should Reference:**

```typescript
/**
 * Tests orchestrator flow defined in:
 * - YAML: platform/orchestrators/openapi/src/yaml/{domain}.yaml
 * - Generated: platform/orchestrators/domains/src/{domain}/flows/{flow}.flow.ts
 *
 * Strategy: Tests validate flow orchestration matches YAML specification
 */
```

## Conclusion

**Current approach is good for testing actual implementation**, but **not optimal for no-drift**.

**For true no-drift:**
- ✅ Read from YAML (source of truth)
- ✅ Validate generated code exists
- ✅ Tests reflect YAML specification, not just generated code
- ✅ Can detect when code drifts from spec

**Trade-off:**
- Tests validate "intended behavior" (YAML) vs "actual implementation" (code)
- For generated code, these should be identical
- If they differ, that's a bug to fix!
