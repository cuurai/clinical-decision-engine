#!/usr/bin/env python3
"""
Wrap OpenAPI response definitions in allOf envelopes.
Handles both single-item and list response formats.
"""

import re
from pathlib import Path
from typing import Tuple
import yaml

DOMAIN_CONFIG = {
    'openapi-decision-intelligence.yaml': 'Dec',
    'openapi-integration-interoperability.yaml': 'Int',
    'openapi-knowledge-evidence.yaml': 'Kno',
    'openapi-patient-clinical-data.yaml': 'Pat',
    'openapi-workflow-care-pathways.yaml': 'Wor',
}

def validate_yaml(content: str) -> Tuple[bool, str]:
    """Validate YAML syntax"""
    try:
        yaml.safe_load(content)
        return True, ""
    except yaml.YAMLError as e:
        return False, str(e)

def wrap_list_response(content: str, prefix: str) -> str:
    """
    Wrap list responses (type: array with items: $ref)
    Before:
      "200":
        description: ...
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: "#/components/schemas/Entity"

    After:
      "200":
        description: ...
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/{Prefix}ApiListResponse"
                - type: object
                  properties:
                    data:
                      type: array
                      items:
                        $ref: "#/components/schemas/Entity"
    """

    # Match list response pattern
    pattern = r'("200"):\s*\n(\s+)description: ([^\n]+)\n(\s+)content:\n(\s+)application/json:\n(\s+)schema:\n(\s+)type: array\n(\s+)items:\n(\s+)(\$ref: "[^"]+")'

    def replace_list(m):
        status = m.group(1)
        indent1 = m.group(2)  # description indent
        desc = m.group(3)
        indent2 = m.group(4)  # content indent
        indent3 = m.group(5)  # application/json indent
        indent4 = m.group(6)  # schema indent
        indent5 = m.group(7)  # type: array indent
        indent6 = m.group(8)  # items indent
        ref = m.group(10)

        list_resp = f"{prefix}ApiListResponse"

        return f'''{status}:
{indent1}description: {desc}
{indent2}content:
{indent3}application/json:
{indent4}schema:
{indent5}allOf:
{indent5}  - $ref: "#/components/schemas/{list_resp}"
{indent5}  - type: object
{indent5}    properties:
{indent5}      data:
{indent5}        type: array
{indent5}        items:
{indent5}          {ref}'''

    return re.sub(pattern, replace_list, content, flags=re.MULTILINE)

def wrap_single_response(content: str, prefix: str) -> str:
    """
    Wrap single responses (direct $ref)
    Before:
      "201":
        description: ...
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/Entity"

    After:
      "201":
        description: ...
        content:
          application/json:
            schema:
              allOf:
                - $ref: "#/components/schemas/{Prefix}ApiResponse"
                - type: object
                  properties:
                    data:
                      $ref: "#/components/schemas/Entity"
    """

    # Match single response pattern (201 or 200 without array)
    pattern = r'("201"|"200"):\s*\n(\s+)description: ([^\n]+)\n(\s+)content:\n(\s+)application/json:\n(\s+)schema:\n(\s+)(\$ref: "[^"]+")\n(?=\s{4}(?:"[0-9]{3}":|responses:|parameters:|patch:|delete:|post:|get:|put:))'

    def replace_single(m):
        status = m.group(1)
        indent1 = m.group(2)  # description indent
        desc = m.group(3)
        indent2 = m.group(4)  # content indent
        indent3 = m.group(5)  # application/json indent
        indent4 = m.group(6)  # schema indent
        indent5 = m.group(7)  # $ref indent
        ref = m.group(8)

        resp = f"{prefix}ApiResponse"

        return f'''{status}:
{indent1}description: {desc}
{indent2}content:
{indent3}application/json:
{indent4}schema:
{indent5}allOf:
{indent5}  - $ref: "#/components/schemas/{resp}"
{indent5}  - type: object
{indent5}    properties:
{indent5}      data:
{indent5}        {ref}
'''

    return re.sub(pattern, replace_single, content, flags=re.MULTILINE)

def process_file(filepath: Path, prefix: str) -> Tuple[bool, str]:
    """Process a single OpenAPI file"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # First wrap list responses
    content = wrap_list_response(content, prefix)

    # Then wrap single responses
    content = wrap_single_response(content, prefix)

    # Validate
    is_valid, error = validate_yaml(content)
    if not is_valid:
        return False, f"YAML validation failed: {error}"

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    return True, "Wrapped and validated"

def main():
    openapi_dir = Path('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi')

    print("=" * 80)
    print("Wrapping Response Definitions")
    print("=" * 80)
    print()

    all_success = True

    for filename, prefix in DOMAIN_CONFIG.items():
        filepath = openapi_dir / filename

        if not filepath.exists():
            print(f"✗ {filename}: Not found")
            all_success = False
            continue

        print(f"Processing: {filename}")
        success, message = process_file(filepath, prefix)

        if success:
            print(f"  ✓ {message}")
        else:
            print(f"  ✗ {message}")
            all_success = False

    print()
    print("=" * 80)
    return 0 if all_success else 1

if __name__ == '__main__':
    import sys
    sys.exit(main())
