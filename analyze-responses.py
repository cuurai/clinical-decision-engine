#!/usr/bin/env python3
"""
Wrap OpenAPI response definitions in ApiResponse/ApiListResponse envelopes.
Handles both single-item and list responses safely with YAML validation.
"""

import yaml
import re
import sys
from pathlib import Path
from typing import Tuple, Dict, List

# Domain mappings
DOMAIN_CONFIG = {
    'openapi-decision-intelligence.yaml': {
        'prefix': 'Dec',
        'api_response': 'DecApiResponse',
        'api_list_response': 'DecApiListResponse',
    },
    'openapi-integration-interoperability.yaml': {
        'prefix': 'Int',
        'api_response': 'IntApiResponse',
        'api_list_response': 'IntApiListResponse',
    },
    'openapi-knowledge-evidence.yaml': {
        'prefix': 'Kno',
        'api_response': 'KnoApiResponse',
        'api_list_response': 'KnoApiListResponse',
    },
    'openapi-patient-clinical-data.yaml': {
        'prefix': 'Pat',
        'api_response': 'PatApiResponse',
        'api_list_response': 'PatApiListResponse',
    },
    'openapi-workflow-care-pathways.yaml': {
        'prefix': 'Wor',
        'api_response': 'WorApiResponse',
        'api_list_response': 'WorApiListResponse',
    },
}

def validate_yaml(filepath: Path) -> Tuple[bool, str]:
    """Validate YAML syntax"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            yaml.safe_load(f)
        return True, ""
    except yaml.YAMLError as e:
        return False, str(e)

def extract_response_summary(content: str) -> Dict[str, int]:
    """Count response types to be wrapped"""

    # Pattern for successful responses with status codes 200 and 201
    status_200_count = len(re.findall(r'^\s+"200":\s*$', content, re.MULTILINE))
    status_201_count = len(re.findall(r'^\s+"201":\s*$', content, re.MULTILINE))

    return {
        '200': status_200_count,
        '201': status_201_count,
        'total': status_200_count + status_201_count,
    }

def wrap_responses(filepath: Path, config: Dict) -> Tuple[bool, str, int]:
    """
    Wrap response definitions to match envelope pattern.
    Returns (success, message, wrap_count)
    """

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # First pass: count what we can wrap
    summary = extract_response_summary(content)

    # For now, just validate structure exists
    # Full wrapping requires careful pattern matching to handle:
    # - Different schema references ($ref vs inline)
    # - Different indentation levels
    # - Array vs single object responses

    is_valid, error = validate_yaml(filepath)
    if not is_valid:
        return False, f"YAML validation failed: {error}", 0

    return True, f"Ready for wrapping ({summary['total']} responses detected)", summary['total']

def main():
    openapi_dir = Path('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/openapi')

    files_to_process = list(DOMAIN_CONFIG.keys())

    print("=" * 80)
    print("OpenAPI Response Definition Wrapping")
    print("=" * 80)
    print()

    all_success = True
    total_responses = 0

    for filename in files_to_process:
        filepath = openapi_dir / filename

        if not filepath.exists():
            print(f"✗ {filename}: File not found")
            all_success = False
            continue

        config = DOMAIN_CONFIG[filename]
        success, message, wrap_count = wrap_responses(filepath, config)

        if success:
            print(f"✓ {filename}")
            print(f"  {message}")
            total_responses += wrap_count
        else:
            print(f"✗ {filename}: {message}")
            all_success = False

    print()
    print("=" * 80)

    if all_success:
        print(f"✓ Analysis complete: {total_responses} responses ready for wrapping")
        print("\nNext steps:")
        print("1. Manually wrap each response definition")
        print("2. Or use regex-based tool to wrap all at once")
        print("3. Run npm run build to verify type generation")
        return 0
    else:
        print("✗ Some files require attention")
        return 1

if __name__ == '__main__':
    sys.exit(main())
