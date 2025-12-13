#!/usr/bin/env python3
"""
Wrap ALL OpenAPI response schemas in response envelopes (list and single).
Regenerate all OpenAPI types from updated specs.
"""

import yaml
import re
from pathlib import Path
import subprocess

# OpenAPI file mappings
OPENAPI_CONFIGS = {
    'openapi/openapi-decision-intelligence.yaml': {
        'response_schema': 'DecApiResponse',
        'list_response_schema': 'DecApiListResponse',
        'prefix': 'DEC',
    },
    'openapi/openapi-integration-interoperability.yaml': {
        'response_schema': 'IntApiResponse',
        'list_response_schema': 'IntApiListResponse',
        'prefix': 'INT',
    },
    'openapi/openapi-knowledge-evidence.yaml': {
        'response_schema': 'KnoApiResponse',
        'list_response_schema': 'KnoApiListResponse',
        'prefix': 'KNO',
    },
    'openapi/openapi-patient-clinical-data.yaml': {
        'response_schema': 'PatApiResponse',
        'list_response_schema': 'PatApiListResponse',
        'prefix': 'PAT',
    },
    'openapi/openapi-workflow-care-pathways.yaml': {
        'response_schema': 'WorApiResponse',
        'list_response_schema': 'WorApiListResponse',
        'prefix': 'WOR',
    },
}

def wrap_openapi_responses(filepath, config):
    """
    Load OpenAPI YAML, wrap all response schemas in envelopes, save back.
    Handles both list (array) and single (object) responses.
    """
    print(f"  Processing {Path(filepath).name}...", end=" ", flush=True)

    try:
        with open(filepath, 'r') as f:
            spec = yaml.safe_load(f)

        if not spec or 'paths' not in spec:
            print("✗ Invalid OpenAPI spec")
            return False

        response_schema = config['response_schema']
        list_response_schema = config['list_response_schema']

        wrapped_count = 0

        # Iterate through all paths and operations
        for path, path_item in spec.get('paths', {}).items():
            for method, operation in path_item.items():
                if not isinstance(operation, dict) or 'responses' not in operation:
                    continue

                # Process each response
                for status_code, response in operation['responses'].items():
                    if not isinstance(response, dict) or 'content' not in response:
                        continue

                    for media_type, media_content in response['content'].items():
                        if 'schema' not in media_content:
                            continue

                        schema = media_content['schema']

                        # Skip if already wrapped in allOf
                        if 'allOf' in schema:
                            continue

                        # Check if list response (array)
                        is_list = False
                        if schema.get('type') == 'array':
                            is_list = True
                        elif 'items' in schema:
                            is_list = True

                        # Skip error responses and non-2xx codes
                        if not str(status_code).startswith('2'):
                            continue

                        # Get the schema reference
                        schema_ref = None
                        if '$ref' in schema:
                            schema_ref = schema['$ref']
                            schema_name = schema_ref.split('/')[-1]
                        elif is_list and 'items' in schema and '$ref' in schema['items']:
                            schema_ref = schema['items']['$ref']
                            schema_name = schema_ref.split('/')[-1]
                        else:
                            continue

                        # Create wrapped schema
                        if is_list:
                            wrapped = {
                                'allOf': [
                                    {'$ref': f'#/components/schemas/{list_response_schema}'},
                                    {
                                        'type': 'object',
                                        'properties': {
                                            'data': {
                                                'type': 'array',
                                                'items': {'$ref': schema_ref}
                                            }
                                        }
                                    }
                                ]
                            }
                        else:
                            # Single response
                            wrapped = {
                                'allOf': [
                                    {'$ref': f'#/components/schemas/{response_schema}'},
                                    {
                                        'type': 'object',
                                        'properties': {
                                            'data': {'$ref': schema_ref}
                                        }
                                    }
                                ]
                            }

                        media_content['schema'] = wrapped
                        wrapped_count += 1

        # Save back to file
        with open(filepath, 'w') as f:
            yaml.dump(spec, f, default_flow_style=False, sort_keys=False, allow_unicode=True, width=120)

        print(f"✓ Wrapped {wrapped_count} responses")
        return True

    except Exception as e:
        print(f"✗ Error: {str(e)[:40]}")
        import traceback
        traceback.print_exc()
        return False

def regenerate_types(type_files):
    """Regenerate OpenAPI types using openapi-typescript."""
    print("\n  Regenerating OpenAPI types...")

    try:
        # Run all type generations in parallel
        commands = []
        for openapi_path, type_path in type_files:
            cmd = f"npx openapi-typescript openapi/{openapi_path} -o packages/core/{type_path}"
            commands.append(cmd)

        for cmd in commands:
            print(f"    Running: {cmd}")
            result = subprocess.run(cmd, shell=True, cwd='/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine')
            if result.returncode != 0:
                print(f"✗ Type generation failed for {cmd}")
                return False

        print("  ✓ All types regenerated successfully")
        return True

    except Exception as e:
        print(f"  ✗ Type regeneration failed: {e}")
        return False

def main():
    """Main entry point."""
    import os
    os.chdir('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine')

    print("Wrapping OpenAPI responses in envelopes...")
    all_ok = True
    for filepath, config in OPENAPI_CONFIGS.items():
        ok = wrap_openapi_responses(filepath, config)
        all_ok = all_ok and ok

    if all_ok:
        # Regenerate types
        type_files = [
            ('openapi-decision-intelligence.yaml', 'src/decision-intelligence/openapi/decision-intelligence.openapi.types.ts'),
            ('openapi-integration-interoperability.yaml', 'src/integration-interoperability/openapi/integration-interoperability.openapi.types.ts'),
            ('openapi-knowledge-evidence.yaml', 'src/knowledge-evidence/openapi/knowledge-evidence.openapi.types.ts'),
            ('openapi-patient-clinical-data.yaml', 'src/patient-clinical-data/openapi/patient-clinical-data.openapi.types.ts'),
            ('openapi-workflow-care-pathways.yaml', 'src/workflow-care-pathways/openapi/workflow-care-pathways.openapi.types.ts'),
        ]
        return 0 if regenerate_types(type_files) else 1
    else:
        print("\n✗ Some OpenAPI files failed processing")
        return 1

if __name__ == '__main__':
    import sys
    sys.exit(main())
