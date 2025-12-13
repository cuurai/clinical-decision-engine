"""
Orchestrator Flow Generator - Generates orchestrator domain structure from YAML OpenAPI specs

Reads from: platform/orchestrators/openapi/src/yaml/{domain}.yaml
Outputs to: platform/orchestrators/domains/src/{domain}/
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import yaml

from cuur_codegen.base.generator_bases import FileGenerator
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.file import ensure_directory, write_file

from .builders import (
    ContextBuilder,
    ErrorsBuilder,
    LoggerBuilder,
    HandlerBuilder,
    RoutesBuilder,
    DepsBuilder,
    ConfigBuilder,
    PackageJsonBuilder,
)
from .flows import FlowBuilder


class OrchestratorFlowGenerator(FileGenerator):
    """Generates complete orchestrator domain structure from YAML OpenAPI specs"""

    @property
    def name(self) -> str:
        return "Orchestrator Flow Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "orchestrator_flow"

    def get_layer(self) -> str:
        """Orchestrator layer"""
        return "orchestrators"

    def validate_context(self, context: GenerationContext) -> None:
        """Skip spec validation - we load YAML files directly"""
        pass

    def should_generate_index(self) -> bool:
        """Don't generate index file"""
        return False

    def generate_files(
        self, context: GenerationContext, output_dir: Path
    ) -> List[Path]:
        """
        Generate complete orchestrator domain structure from YAML OpenAPI spec.

        Args:
            context: Generation context (domain_name is orchestrator domain name)
            output_dir: Output directory (orchestrators/domains/src/{domain})

        Returns:
            List of generated file paths
        """
        files: List[Path] = []

        # Find YAML spec file
        project_root = context.config.paths.project_root
        # project_root is already platform/, so don't add platform/ again
        yaml_spec_path = (
            project_root / "orchestrators" / "openapi" / "src" / "yaml" /
            f"{context.domain_name}.yaml"
        )

        if not yaml_spec_path.exists():
            context.logger.warn(
                f"Orchestrator YAML spec not found: {yaml_spec_path}"
            )
            return files

        # Load YAML spec
        try:
            with open(yaml_spec_path, "r", encoding="utf-8") as f:
                spec = yaml.safe_load(f)
        except Exception as e:
            context.logger.error(f"Failed to load YAML spec: {e}")
            return files

        # Extract domain name from spec
        domain_name = spec.get("info", {}).get("x-quub-domain") or context.domain_name

        # output_dir already includes {domain} from folder structure config
        # So we use it directly, not adding domain_name again
        domain_output_dir = output_dir
        ensure_directory(domain_output_dir)

        # Generate context extraction utility
        context_file = domain_output_dir / "context.ts"
        write_file(context_file, ContextBuilder.build_context(domain_name))
        files.append(context_file)

        # Generate errors/flow-error.ts
        errors_dir = domain_output_dir / "errors"
        ensure_directory(errors_dir)
        error_file = errors_dir / "flow-error.ts"
        write_file(error_file, ErrorsBuilder.build_flow_error(domain_name))
        files.append(error_file)

        # Generate logger.ts
        logger_file = domain_output_dir / "logger.ts"
        write_file(logger_file, LoggerBuilder.build_logger(domain_name))
        files.append(logger_file)

        # Generate handler.ts
        handler_file = HandlerBuilder.generate_handler(domain_output_dir, domain_name, spec)
        if handler_file:
            files.append(handler_file)

        # Generate routes.ts
        routes_file = RoutesBuilder.generate_routes(domain_output_dir, domain_name, spec)
        if routes_file:
            files.append(routes_file)

        # Generate deps.ts
        deps_file = DepsBuilder.generate_deps(domain_output_dir, domain_name, spec, project_root)
        if deps_file:
            files.append(deps_file)

        # Generate flows
        flow_files = FlowBuilder.generate_flows(domain_output_dir, domain_name, spec, project_root)
        files.extend(flow_files)

        # Generate config
        config_file = ConfigBuilder.generate_config(domain_output_dir, domain_name, spec)
        if config_file:
            files.append(config_file)

        # Generate package.json (tsconfig.json is not generated per-domain)
        package_file = PackageJsonBuilder.generate_package_json(domain_output_dir, domain_name, spec)
        if package_file:
            files.append(package_file)

        return files
