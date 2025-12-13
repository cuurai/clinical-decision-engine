"""
TsConfig Builder - Generates tsconfig.json
"""

import os
from pathlib import Path
from typing import Optional, Dict, Any
from cuur_codegen.utils.file import write_file


class TsConfigBuilder:
    """Builds tsconfig.json file"""

    @staticmethod
    def _find_project_root(output_dir: Path) -> Optional[Path]:
        """
        Find project root by walking up from output_dir looking for tsconfig.base.json

        Args:
            output_dir: Output directory (e.g., platform/orchestrators/domains/src/trading-markets)

        Returns:
            Project root path or None if not found
        """
        current = output_dir.resolve()
        max_depth = 10  # Prevent infinite loops

        for _ in range(max_depth):
            tsconfig_base = current / "tsconfig.base.json"
            if tsconfig_base.exists():
                return current

            # Check if we've reached filesystem root
            parent = current.parent
            if parent == current:
                break
            current = parent

        return None

    @staticmethod
    def _calculate_relative_path(from_path: Path, to_path: Path) -> str:
        """
        Calculate relative path from from_path to to_path

        Args:
            from_path: Starting path (file or directory)
            to_path: Target path (file or directory)

        Returns:
            Relative path string (e.g., "../../../../tsconfig.base.json")
        """
        # Convert to Path objects and resolve to absolute
        from_p = Path(from_path).resolve()
        to_p = Path(to_path).resolve()

        # If from_path is a file, use its parent directory
        if from_p.is_file():
            from_dir = from_p.parent
        else:
            from_dir = from_p

        # If to_path is a file, extract directory and filename
        if to_p.is_file():
            to_dir = to_p.parent
            file_name = to_p.name
        else:
            to_dir = to_p
            file_name = None

        try:
            # Try to calculate relative path directly using Path.relative_to
            relative = to_dir.relative_to(from_dir)
            relative_str = str(relative) if str(relative) != "." else ""

            # Add filename if to_path was a file
            if file_name:
                if relative_str:
                    return f"{relative_str}/{file_name}"
                else:
                    return file_name

            return relative_str if relative_str else "."
        except ValueError:
            # Paths don't share a common root, calculate manually
            # Get path parts, filtering out root (/) and empty parts
            from_parts = [p for p in from_dir.parts if p and p != '/']
            to_parts = [p for p in to_dir.parts if p and p != '/']

            # Find common prefix length
            common_len = 0
            min_len = min(len(from_parts), len(to_parts))
            for i in range(min_len):
                if from_parts[i] == to_parts[i]:
                    common_len += 1
                else:
                    break

            # Calculate levels up (from_dir depth minus common prefix)
            up_levels = len(from_parts) - common_len

            # Calculate levels down (to_dir depth minus common prefix)
            down_parts = to_parts[common_len:]

            # Build path
            if up_levels == 0:
                # Same level or below
                result = "/".join(down_parts) if down_parts else "."
            else:
                # Need to go up first
                up_path = "/".join([".."] * up_levels)
                if down_parts:
                    result = f"{up_path}/{'/'.join(down_parts)}"
                else:
                    result = up_path

            # Add filename if to_path was a file
            if file_name:
                if result == ".":
                    result = file_name
                else:
                    result = f"{result}/{file_name}"

            return result

    @staticmethod
    def build_tsconfig(output_dir: Path, project_root: Optional[Path] = None) -> str:
        """
        Build tsconfig.json content with smart path resolution

        Args:
            output_dir: Output directory for the orchestrator domain
            project_root: Optional project root (may be platform/ or actual root, will be normalized)

        Returns:
            tsconfig.json content as string
        """
        # Find actual project root (where tsconfig.base.json is located)
        actual_root = TsConfigBuilder._find_project_root(output_dir)

        # If project_root was provided but actual_root is different, use actual_root
        # (project_root might be platform/, but we need the actual root)
        if actual_root is None:
            # Fallback: if project_root provided, try its parent
            if project_root is not None:
                parent_root = project_root.parent
                if (parent_root / "tsconfig.base.json").exists():
                    actual_root = parent_root
                else:
                    actual_root = project_root
            else:
                actual_root = project_root

        if actual_root is None:
            # Fallback to hardcoded path if project root not found
            # Count directory depth: platform/orchestrators/domains/src/{domain} = 4 levels
            extends_path = "../../../../../tsconfig.base.json"
            base_url = "../../../../.."
            references_path = "../../../../../packages/core/packages/core"
        else:
            # Calculate relative paths
            # For extends, we want the path from tsconfig.json file to tsconfig.base.json
            tsconfig_file = output_dir / "tsconfig.json"
            tsconfig_base_file = actual_root / "tsconfig.base.json"

            # Calculate relative path: go up from tsconfig_file.parent to actual_root, then to tsconfig.base.json
            # Count directory levels between tsconfig_file.parent and actual_root
            tsconfig_dir_parts = tsconfig_file.parent.parts
            root_parts = actual_root.parts

            # Find common prefix length
            common_len = 0
            min_len = min(len(tsconfig_dir_parts), len(root_parts))
            for i in range(min_len):
                if tsconfig_dir_parts[i] == root_parts[i]:
                    common_len += 1
                else:
                    break

            # Calculate levels up (from tsconfig_dir to common ancestor)
            up_levels = len(tsconfig_dir_parts) - common_len

            # Build relative path: go up 'up_levels' times, then to tsconfig.base.json
            extends_path = "/".join([".."] * up_levels) + "/tsconfig.base.json"

            # For baseUrl, we want the path from output_dir to platform/ (not project root)
            # This allows relative imports like ../../../../adapters/... instead of ../../../../platform/adapters/...
            platform_dir = actual_root / "platform"
            try:
                base_url_relative = platform_dir.relative_to(output_dir)
                base_url = str(base_url_relative) if str(base_url_relative) != "." else "."
            except ValueError:
                base_url_relative = TsConfigBuilder._calculate_relative_path(
                    output_dir,
                    platform_dir
                )
                base_url = base_url_relative if base_url_relative != "." else "."

            # Calculate references path (from output_dir to core package)
            # Point to packages/core (not packages/core/packages/core)
            core_path = actual_root / "packages" / "core"
            try:
                references_relative = core_path.relative_to(output_dir)
                references_path = str(references_relative)
            except ValueError:
                references_path = TsConfigBuilder._calculate_relative_path(
                    output_dir,
                    core_path
                )

        return f'''{{
  "extends": "{extends_path}",
  "compilerOptions": {{
    "rootDir": ".",
    "outDir": "dist"
  }},
  "include": ["**/*.ts"],
  "exclude": ["dist", "node_modules"],
  "references": [
    {{
      "path": "{references_path}"
    }},
    {{
      "path": "../../../../adapters"
    }}
  ]
}}
'''

    @staticmethod
    def generate_tsconfig(output_dir: Path, domain_name: str, spec: Dict[str, Any], project_root: Optional[Path] = None) -> Optional[Path]:
        """
        Generate tsconfig.json with smart path resolution

        Args:
            output_dir: Output directory for the orchestrator domain
            domain_name: Domain name (unused but kept for compatibility)
            spec: OpenAPI spec (unused but kept for compatibility)
            project_root: Optional project root (will be auto-detected if not provided)

        Returns:
            Path to generated tsconfig.json file
        """
        tsconfig_file = output_dir / "tsconfig.json"
        content = TsConfigBuilder.build_tsconfig(output_dir, project_root)
        write_file(tsconfig_file, content)
        return tsconfig_file
