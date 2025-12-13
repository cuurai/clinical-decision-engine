#!/usr/bin/env python3
"""
Fix GET handler return statements to unwrap data/meta.
GET endpoints return raw objects, not wrapped.
"""

import re
from pathlib import Path

def fix_get_handler(filepath):
    """Remove response wrapping from get handler."""
    with open(filepath, 'r') as f:
        lines = f.readlines()

    # Find return { data: { ... }, meta: { ... } };
    # and extract the content between data: { and the closing }

    in_return = False
    in_data = False
    data_content = []
    data_indent = 0
    return_start_idx = None
    return_end_idx = None
    data_start_idx = None
    brace_count = 0

    for i, line in enumerate(lines):
        if not in_return and 'return {' in line:
            in_return = True
            return_start_idx = i
            continue

        if in_return and not in_data and 'data: {' in line:
            in_data = True
            data_indent = len(line) - len(line.lstrip())
            data_start_idx = i
            # Extract everything after "data: {"
            match = re.search(r'data:\s*\{', line)
            if match:
                rest = line[match.end():]
                if rest.strip() and rest.strip() != '}':
                    data_content.append(rest)
            continue

        if in_return and in_data:
            # Check if this line closes the data block
            if '},' in line or ('};' in line and 'meta:' not in line):
                # End of data block
                # Extract content before the closing brace
                content = line.rstrip()
                if content.endswith('},'):
                    content = content[:-2]
                elif content.endswith('}'):
                    content = content[:-1]

                if content.strip():
                    data_content.append(content + '\n')

                # Now we have all the data content, replace the whole return block
                # Find the end of the return statement
                for j in range(i + 1, len(lines)):
                    if '};' in lines[j]:
                        return_end_idx = j
                        break

                if return_start_idx is not None and return_end_idx is not None:
                    # Build the new return statement
                    # Get the indentation of the return
                    return_indent = len(lines[return_start_idx]) - len(lines[return_start_idx].lstrip())

                    # Build new return
                    new_return = ' ' * return_indent + 'return {\n'
                    new_return += ''.join(data_content)
                    new_return += ' ' * return_indent + '};\n'

                    # Replace lines from return_start_idx to return_end_idx
                    lines[return_start_idx:return_end_idx + 1] = [new_return]

                break

    # Write back
    with open(filepath, 'w') as f:
        f.writelines(lines)

    return return_start_idx is not None

def main():
    """Main entry point."""
    workspace = Path('/Users/nrahal/@code/fazezero-apps/cuurai/cuur-mcps/clinical-decision-engine/packages/core')

    count = 0
    for handler_file in sorted(workspace.rglob('get-*.handler.ts')):
        try:
            if fix_get_handler(handler_file):
                count += 1
                print(f"  Fixed: {handler_file.relative_to(workspace)}")
        except Exception as e:
            print(f"  Error {handler_file.name}: {e}")

    print(f"\n✓ Fixed {count} GET handlers")
    return 0

if __name__ == '__main__':
    import sys
    sys.exit(main())
