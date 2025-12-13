#!/usr/bin/env python3
"""
Update handler names in orchestrator YAML files based on HandlerDiscovery
"""

import yaml
import sys
from pathlib import Path
from typing import Dict, Any, List, Set

# Add parent directory to path to import handler discovery
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from quub_codegen.generators.orchestrators.flows.handler_discovery import HandlerDiscovery
from quub_codegen.generators.orchestrators.flows.handler_mapper import HandlerMapper


def find_handler_fields(obj: Any, path: str = "", results: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Recursively find all handler fields in YAML structure

    Returns list of dicts with: path, value, parent_dict, key
    """
    if results is None:
        results = []

    if isinstance(obj, dict):
        for key, value in obj.items():
            current_path = f"{path}.{key}" if path else key

            # Check for handler fields
            if key in ["handler", "x-handler"]:
                results.append({
                    "path": current_path,
                    "value": value,
                    "parent": obj,
                    "key": key
                })

            # Recursively search nested structures
            find_handler_fields(value, current_path, results)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            find_handler_fields(item, f"{path}[{i}]", results)

    return results


def update_yaml_handlers(yaml_file: Path, project_root: Path) -> bool:
    """
    Update handler names in a YAML file

    Returns True if file was modified, False otherwise
    """
    try:
        with open(yaml_file, "r", encoding="utf-8") as f:
            content = f.read()
            spec = yaml.safe_load(content)
    except Exception as e:
        print(f"  ERROR: Failed to load {yaml_file}: {e}")
        return False

    # Extract domain name from spec
    domain_name = spec.get("info", {}).get("x-quub-domain", "")
    if not domain_name:
        print(f"  WARNING: No x-quub-domain found in {yaml_file.name}")
        return False

    # Find all handler fields
    handler_fields = find_handler_fields(spec)

    if not handler_fields:
        print(f"  No handler fields found in {yaml_file.name}")
        return False

    modified = False
    updates = []

    for field_info in handler_fields:
        handler_value = field_info["value"]
        if not handler_value or not isinstance(handler_value, str):
            continue

        # Extract domain from service if available (for backend-call steps)
        # We need to find the service from the parent structure
        domain = domain_name  # Default to orchestrator domain

        # Try to find service from parent structure (for backend-call steps)
        parent = field_info["parent"]
        if isinstance(parent, dict):
            service = parent.get("service", "")
            if service:
                domain = HandlerMapper.map_service_to_domain(service)

        # Get operation ID from parent structure
        operation_id = ""
        if isinstance(parent, dict):
            operation_id = parent.get("operationId", "")

        # For x-handler fields, try to find the operation ID from the path operation
        if field_info["key"] == "x-handler" and not operation_id:
            # Look for operationId in the same operation object
            # x-handler is typically at paths./path.get.x-handler
            # We need to find the operationId at paths./path.get.operationId
            path_parts = field_info["path"].split(".")
            if len(path_parts) >= 3:
                # Try to find operationId in the same operation
                operation_path = ".".join(path_parts[:-1])  # Remove "x-handler"
                # Navigate to the operation object
                operation_obj = spec
                for part in operation_path.split(".")[1:]:  # Skip "paths"
                    if part.startswith("/"):
                        # Path segment
                        if part in operation_obj:
                            operation_obj = operation_obj[part]
                    elif part in ["get", "post", "put", "delete", "patch"]:
                        # HTTP method
                        if part in operation_obj:
                            operation_obj = operation_obj[part]
                    elif part in operation_obj:
                        operation_obj = operation_obj[part]

                if isinstance(operation_obj, dict):
                    operation_id = operation_obj.get("operationId", "")

        # Map handler name using HandlerDiscovery
        actual_handler_name = HandlerDiscovery.map_handler_name(
            handler_value,
            domain,
            operation_id,
            project_root
        )

        # Check if update is needed
        if actual_handler_name != handler_value:
            updates.append({
                "old": handler_value,
                "new": actual_handler_name,
                "path": field_info["path"]
            })
            field_info["parent"][field_info["key"]] = actual_handler_name
            modified = True

    if modified:
        # Write updated YAML back to file
        try:
            with open(yaml_file, "w", encoding="utf-8") as f:
                yaml.dump(spec, f, default_flow_style=False, sort_keys=False, allow_unicode=True, width=120)

            print(f"  ✓ Updated {len(updates)} handler(s) in {yaml_file.name}:")
            for update in updates:
                print(f"    - {update['old']} → {update['new']} ({update['path']})")
        except Exception as e:
            print(f"  ERROR: Failed to write {yaml_file}: {e}")
            return False
    else:
        print(f"  No updates needed for {yaml_file.name}")

    return modified


def main():
    """Main function"""
    # Determine project root (should be platform/ or actual root)
    script_dir = Path(__file__).parent
    project_root = script_dir.parent.parent  # Go up from .servicesgen/scripts to project root

    # Find tsconfig.base.json to confirm project root
    tsconfig_base = project_root / "tsconfig.base.json"
    if not tsconfig_base.exists():
        # Try parent directory
        project_root = project_root.parent
        tsconfig_base = project_root / "tsconfig.base.json"
        if not tsconfig_base.exists():
            print(f"ERROR: Could not find project root (tsconfig.base.json)")
            sys.exit(1)

    print(f"Project root: {project_root}")

    # Find all YAML files
    yaml_dir = project_root / "platform" / "orchestrators" / "openapi" / "src" / "yaml"
    if not yaml_dir.exists():
        print(f"ERROR: YAML directory not found: {yaml_dir}")
        sys.exit(1)

    yaml_files = sorted(yaml_dir.glob("*.yaml"))

    if not yaml_files:
        print(f"No YAML files found in {yaml_dir}")
        sys.exit(0)

    print(f"\nFound {len(yaml_files)} YAML file(s)\n")

    total_modified = 0
    for yaml_file in yaml_files:
        print(f"Processing {yaml_file.name}...")
        if update_yaml_handlers(yaml_file, project_root):
            total_modified += 1
        print()

    print(f"Summary: Updated {total_modified} out of {len(yaml_files)} YAML file(s)")


if __name__ == "__main__":
    main()
