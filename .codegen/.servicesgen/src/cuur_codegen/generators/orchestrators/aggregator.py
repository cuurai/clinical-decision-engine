"""
Aggregator Generator - Generates aggregator classes for Orchestrators

Configuration:
    The aggregator generator reads orchestrator domain configuration from:
    - .servicesgen/config/.orchestrator-domains.yaml (preferred)
    - .servicesgen/config/.orchestrator-domains.json

    This config file defines:
    - Orchestrator domains and their mappings to core domains
    - Aggregators and their core domain calls
    - Core domain registry (service URLs and ports)

    See config_reader.py for the configuration structure and format.
"""

from pathlib import Path
from typing import List, Optional
from cuur_codegen.utils.string import camel_case, pascal_case, kebab_case

from cuur_codegen.base.generator_bases import FileGenerator
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.file import ensure_directory, write_file

from .builders import AggregatorBuilder
from .config_reader import AggregatorConfig, OrchestratorDomainConfig


class AggregatorGenerator(FileGenerator):
    """Generates aggregator classes for Orchestrator layer"""

    @property
    def name(self) -> str:
        return "Orchestrator Aggregator Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "orchestrator_aggregator"

    def get_layer(self) -> str:
        """Orchestrator layer"""
        return "orchestrators"

    def validate_context(self, context: GenerationContext) -> None:
        """
        Override validation to skip spec check for orchestrator domains.
        Orchestrator domains don't have their own specs - they use core domain specs.
        """
        # Skip spec validation - orchestrator domains use configuration instead
        pass

    def should_generate_index(self) -> bool:
        """Generate index file per orchestrator domain"""
        return True

    def generate_index(
        self,
        context: GenerationContext,
        output_dir: Path,
        files: List[Path],
    ) -> Optional[Path]:
        """Generate index file in orchestrator domain aggregators directory"""
        # Only generate index if there are actual aggregator files
        if not files:
            return None

        # Use orchestrator domain-specific aggregators directory
        project_root = context.config.paths.project_root
        aggregators_dir = (
            project_root / "orchestrators" / "src" / "domains" /
            context.domain_name / "aggregators"
        )
        return super().generate_index(context, aggregators_dir, files)

    def should_clean(self) -> bool:
        """Don't clean - aggregators are cross-domain"""
        return False

    def generate_files(
        self, context: GenerationContext, output_dir: Path
    ) -> List[Path]:
        """
        Generate aggregator files for orchestrator domains.

        Args:
            context: Generation context (domain_name is orchestrator domain name)
            output_dir: Output directory (orchestrators/src/domains/{orchestrator_domain}/aggregators)

        Returns:
            List of generated file paths
        """
        files: List[Path] = []

        # Load orchestrator domain configuration
        from .config_reader import load_orchestrator_domains_config
        try:
            orchestrator_config = load_orchestrator_domains_config(context.config.paths.project_root)
        except FileNotFoundError:
            context.logger.warn(
                f"Orchestrator domains config not found, skipping aggregator generation"
            )
            return files

        # Get orchestrator domain configuration
        orchestrator_domain_config = None
        for domain in orchestrator_config.orchestrator_domains:
            if domain.name == context.domain_name:
                orchestrator_domain_config = domain
                break

        if not orchestrator_domain_config:
            context.logger.warn(
                f"Orchestrator domain '{context.domain_name}' not found in config, "
                f"skipping aggregator generation"
            )
            return files

        # Generate aggregators in orchestrator domain-specific directory
        project_root = context.config.paths.project_root
        orchestrator_domain_aggregators_dir = (
            project_root / "orchestrators" / "domains" / "src" /
            context.domain_name / "aggregators"
        )
        ensure_directory(orchestrator_domain_aggregators_dir)

        # Generate aggregators from orchestrator domain configuration
        from cuur_codegen.utils.string import generate_file_name
        for aggregator_config in orchestrator_domain_config.aggregators:
            aggregator_file = (
                orchestrator_domain_aggregators_dir /
                generate_file_name(aggregator_config.name, "aggregator")
            )

            header = self.generate_header(
                context,
                f"{aggregator_config.name} - {aggregator_config.description}",
            )

            # Build aggregator content using orchestrator domain configuration
            content = self._build_orchestrator_aggregator(
                context,
                aggregator_config,
                orchestrator_domain_config,
                header,
            )

            write_file(aggregator_file, content)
            files.append(aggregator_file)

            context.logger.info(
                f"Generated aggregator: {aggregator_file.name} "
                f"for orchestrator domain '{context.domain_name}'"
            )

        return files

    def _build_orchestrator_aggregator(
        self,
        context: GenerationContext,
        aggregator_config: AggregatorConfig,
        orchestrator_domain_config: OrchestratorDomainConfig,
        header: str,
    ) -> str:
        """Build aggregator TypeScript code from orchestrator domain configuration"""
        aggregator_name = pascal_case(aggregator_config.name.replace(" ", "").replace("-", ""))

        # Import service clients for core domains used by this aggregator
        service_imports = []
        service_properties = []
        constructor_params = []

        # Get unique core domains used by this aggregator
        core_domains_used = set()
        for call in aggregator_config.core_domain_calls:
            core_domains_used.add(call.domain)

        from cuur_codegen.utils.string import generate_file_name
        for core_domain_name in sorted(core_domains_used):
            core_domain_pascal = pascal_case(core_domain_name.replace("-", "_"))
            core_domain_camel = camel_case(core_domain_name.replace("-", "_"))
            # Import from domain-specific folder (use kebab-case for file name)
            client_file_name = generate_file_name(core_domain_name, "client").replace(".ts", "")
            service_imports.append(
                f'import {{ {core_domain_pascal}Client }} from "../services/clients/{client_file_name}.js";'
            )
            service_properties.append(f"  private {core_domain_camel}Client: {core_domain_pascal}Client;")
            constructor_params.append(f"{core_domain_camel}Client: {core_domain_pascal}Client")

        # Build method body from aggregator calls
        method_body_lines = []
        for i, call in enumerate(aggregator_config.core_domain_calls):
            core_domain_camel = camel_case(call.domain.replace("-", "_"))
            operation_camel = camel_case(call.operation)

            if i == 0:
                # First call - assign result
                method_body_lines.append(f"    const result = await this.{core_domain_camel}Client.{operation_camel}(params);")
            else:
                # Subsequent calls - await but don't assign (for now)
                method_body_lines.append(f"    await this.{core_domain_camel}Client.{operation_camel}(params);")

        method_body_lines.append("    return result;")

        # Build class
        class_content = f"""{header}

/**
 * {aggregator_config.description}
 *
 * Combines data from multiple core domain services into optimized responses.
 */

{chr(10).join(service_imports)}

export class {aggregator_name}Aggregator {{
{chr(10).join(service_properties)}

  constructor({", ".join(constructor_params)}) {{
{chr(10).join([f"    this.{camel_case(cd.replace('-', '_'))}Client = {camel_case(cd.replace('-', '_'))}Client;" for cd in sorted(core_domains_used)])}
  }}

  /**
   * {aggregator_config.description}
   */
  async execute(params?: any): Promise<any> {{
{chr(10).join(method_body_lines)}
  }}
}}
"""

        return class_content.strip()
