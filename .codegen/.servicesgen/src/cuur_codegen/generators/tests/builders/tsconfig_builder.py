"""
TSConfig Builder for Tests

Generates tsconfig.json files for test packages with proper path mappings
"""

import json
from pathlib import Path
from cuur_codegen.core.context import GenerationContext


class TestTsConfigBuilder:
    """Builds tsconfig.json files for test packages"""

    @staticmethod
    def build_tsconfig(
        domain_name: str,
        is_orchestrator_domain: bool,
        header: str,
        context: GenerationContext
    ) -> str:
        """
        Build tsconfig.json content for test package

        Args:
            domain_name: Domain name (e.g., "trading-markets")
            is_orchestrator_domain: Whether this is an orchestrator domain
            header: File header comment
            context: Generation context

        Returns:
            tsconfig.json content
        """
        project_root = context.config.paths.project_root

        # Calculate relative path to tsconfig.base.json
        # From: platform/tests/src/{domain}/tsconfig.json
        # To: tsconfig.base.json (root)
        # Relative: ../../../../tsconfig.base.json
        extends_path = "../../../../tsconfig.base.json"

        # Build references - always include core and adapters
        references = [
            {"path": "../../../../packages/core/packages/core"},
            {"path": "../../../../platform/adapters"}
        ]

        # Add orchestrator reference if this is an orchestrator domain
        if is_orchestrator_domain:
            orchestrator_ref_path = f"../../../../platform/orchestrators/domains/src/{domain_name}"
            references.append({"path": orchestrator_ref_path})

        # Format references as JSON
        references_json = ",\n    ".join(
            f'{{ "path": "{ref["path"]}" }}'
            for ref in references
        )

        return f"""{header}
{{
  "extends": "{extends_path}",
  "compilerOptions": {{
    "rootDir": ".",
    "outDir": "./dist"
  }},
  "include": ["**/*.ts"],
  "exclude": ["dist"],
  "references": [
    {references_json}
  ]
}}
"""
