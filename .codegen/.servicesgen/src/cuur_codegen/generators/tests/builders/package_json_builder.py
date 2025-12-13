"""
Package.json Builder for Tests

Generates package.json files for test packages using shared dependency constants.
"""

from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import pascal_case
from .package_json_constants import (
    get_dependencies,
    get_dev_dependencies,
    TEST_SCRIPTS,
)
import json


class PackageJsonBuilder:
    """Builds package.json files for test packages"""

    @staticmethod
    def build_package_json(context: GenerationContext, is_orchestrator_domain: bool = False) -> str:
        """
        Generate package.json content for test package using shared constants.

        Args:
            context: Generation context
            is_orchestrator_domain: Whether this is an orchestrator domain

        Returns:
            package.json content as JSON string
        """
        domain_name = context.domain_name
        domain_pascal = pascal_case(domain_name)

        # Use shared dependency constants
        dependencies = get_dependencies(is_orchestrator_domain)
        dev_dependencies = get_dev_dependencies(is_orchestrator_domain)

        package_json = {
            "name": f"@quub/tests-{domain_name}",
            "version": "1.0.0",
            "description": f"Quub Exchange - {domain_pascal} Tests",
            "type": "module",
            "scripts": TEST_SCRIPTS.copy(),
            "dependencies": dependencies,
            "devDependencies": dev_dependencies,
        }

        return json.dumps(package_json, indent=2) + "\n"

    @staticmethod
    def validate_package_json(package_json_path: str, is_orchestrator_domain: bool = False) -> tuple[bool, list[str]]:
        """
        Validate that a package.json file matches expected dependencies.

        Args:
            package_json_path: Path to package.json file
            is_orchestrator_domain: Whether this is an orchestrator domain

        Returns:
            Tuple of (is_valid, list_of_errors)
        """
        import json
        from pathlib import Path

        errors = []
        expected_deps = get_dependencies(is_orchestrator_domain)
        expected_dev_deps = get_dev_dependencies(is_orchestrator_domain)

        try:
            with open(package_json_path, "r", encoding="utf-8") as f:
                actual = json.load(f)

            # Check dependencies
            actual_deps = actual.get("dependencies", {})
            for dep, version in expected_deps.items():
                if dep not in actual_deps:
                    errors.append(f"Missing dependency: {dep}")
                elif actual_deps[dep] != version:
                    errors.append(f"Dependency version mismatch: {dep} (expected {version}, got {actual_deps[dep]})")

            # Check for unexpected dependencies
            for dep in actual_deps:
                if dep not in expected_deps:
                    errors.append(f"Unexpected dependency: {dep}")

            # Check dev dependencies
            actual_dev_deps = actual.get("devDependencies", {})
            for dep, version in expected_dev_deps.items():
                if dep not in actual_dev_deps:
                    errors.append(f"Missing dev dependency: {dep}")
                elif actual_dev_deps[dep] != version:
                    errors.append(f"Dev dependency version mismatch: {dep} (expected {version}, got {actual_dev_deps[dep]})")

            # Check for unexpected dev dependencies
            for dep in actual_dev_deps:
                if dep not in expected_dev_deps:
                    errors.append(f"Unexpected dev dependency: {dep}")

            # Check scripts
            expected_scripts = TEST_SCRIPTS.copy()
            actual_scripts = actual.get("scripts", {})
            for script, command in expected_scripts.items():
                if script not in actual_scripts:
                    errors.append(f"Missing script: {script}")
                elif actual_scripts[script] != command:
                    errors.append(f"Script mismatch: {script} (expected {command}, got {actual_scripts[script]})")

        except FileNotFoundError:
            errors.append(f"File not found: {package_json_path}")
        except json.JSONDecodeError as e:
            errors.append(f"Invalid JSON: {e}")

        return len(errors) == 0, errors
