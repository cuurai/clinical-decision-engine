#!/usr/bin/env python3
"""
Update YAML stepIds to be more readable

Replaces patterns like:
- callCustodian0 -> custodyTransactions (based on handler name)
- callExchange0 -> markets (based on handler name)
"""

import yaml
import re
from pathlib import Path
from typing import Dict, Any
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from quub_codegen.utils.string import camel_case, extract_resource_from_operation_id, extract_verb_from_operation_id


def generate_readable_step_id(step: Dict[str, Any]) -> str:
    """
    Generate a readable stepId from step configuration.

    Args:
        step: Step dictionary from YAML

    Returns:
        Readable stepId (e.g., "custodyTransactions" instead of "callCustodian0")
    """
    step_id = step.get("stepId", "")
    handler = step.get("handler", "")
    operation_id = step.get("operationId", "")
    service = step.get("service", "")

    # If stepId already looks good (no trailing numbers), return as-is
    if step_id and not re.match(r'.*\d+$', step_id):
        return step_id

    # Extract resource from handler name
    if handler:
        verb = extract_verb_from_operation_id(handler)
        resource = extract_resource_from_operation_id(handler)
        if resource:
            return camel_case(resource)

    # Fallback: use operation ID
    if operation_id:
        verb = extract_verb_from_operation_id(operation_id)
        resource = extract_resource_from_operation_id(operation_id)
        if resource:
            return camel_case(resource)

    # Last resort: clean up stepId
    if step_id.startswith("call"):
        cleaned = re.sub(r'call(\w+)\d+', r'\1', step_id)
        return camel_case(cleaned) if cleaned else "result"

    return step_id


def update_yaml_file(yaml_path: Path) -> bool:
    """
    Update stepIds in a YAML file.

    Returns:
        True if file was updated, False otherwise
    """
    try:
        with open(yaml_path, 'r', encoding='utf-8') as f:
            content = f.read()
            spec = yaml.safe_load(content)

        updated = False
        paths = spec.get("paths", {})

        for path, methods in paths.items():
            for method, operation in methods.items():
                flow_steps = operation.get("x-orchestration-flow", [])
                if not flow_steps:
                    continue

                for step in flow_steps:
                    if step.get("kind") == "backend-call":
                        old_step_id = step.get("stepId", "")
                        new_step_id = generate_readable_step_id(step)

                        if old_step_id != new_step_id:
                            step["stepId"] = new_step_id
                            updated = True

                            # Update dependencies that reference this stepId
                            for other_step in flow_steps:
                                depends_on = other_step.get("dependsOn", [])
                                if isinstance(depends_on, list) and old_step_id in depends_on:
                                    depends_on[depends_on.index(old_step_id)] = new_step_id
                                    updated = True

        if updated:
            # Write back to file
            with open(yaml_path, 'w', encoding='utf-8') as f:
                yaml.dump(spec, f, default_flow_style=False, sort_keys=False, allow_unicode=True, width=120)
            return True

        return False
    except Exception as e:
        print(f"Error processing {yaml_path}: {e}")
        return False


def main():
    """Update all YAML files in orchestrators/openapi/src/yaml/"""
    project_root = Path(__file__).parent.parent.parent
    yaml_dir = project_root / "platform" / "orchestrators" / "openapi" / "src" / "yaml"

    if not yaml_dir.exists():
        print(f"YAML directory not found: {yaml_dir}")
        return

    yaml_files = list(yaml_dir.glob("*.yaml"))
    print(f"Found {len(yaml_files)} YAML files")

    updated_count = 0
    for yaml_file in yaml_files:
        if update_yaml_file(yaml_file):
            print(f"✓ Updated: {yaml_file.name}")
            updated_count += 1
        else:
            print(f"  Skipped: {yaml_file.name} (no changes needed)")

    print(f"\nUpdated {updated_count} out of {len(yaml_files)} files")


if __name__ == "__main__":
    main()
