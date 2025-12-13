"""
Domain Builder - Generates domain wrapper files
"""

from pathlib import Path
from typing import List, Dict, Any
from cuur_codegen.utils.file import ensure_directory, write_file
from cuur_codegen.utils.string import kebab_case, pascal_case
from ..config_reader import load_orchestrator_domains_config


class DomainBuilder:
    """Builds domain wrapper files"""

    @staticmethod
    def generate_domain_wrappers(output_dir: Path, domain_name: str, spec: Dict[str, Any]) -> List[Path]:
        """Generate domain wrapper files"""
        domain_dir = output_dir / "domain"
        ensure_directory(domain_dir)

        files = []
        # Extract core domains from orchestrator config instead of spec
        project_root = output_dir.parent.parent.parent.parent
        core_domains = []

        try:
            orchestrator_config = load_orchestrator_domains_config(project_root)
            for domain_config in orchestrator_config.orchestrator_domains:
                if domain_config.name == domain_name:
                    core_domains = [cd.name for cd in domain_config.core_domains]
                    break
        except Exception:
            pass

        for core_domain in core_domains:
            domain_file = domain_dir / f"{kebab_case(core_domain)}.domain.ts"
            content = f'''/**
 * {pascal_case(core_domain)} Domain Wrapper
 *
 * Thin wrapper around @cuur/core {core_domain} domain types and operations.
 */

export class {pascal_case(core_domain.replace('-', '_'))}Domain {{
  // TODO: Implement domain wrapper methods
}}
'''
            write_file(domain_file, content)
            files.append(domain_file)

        return files
