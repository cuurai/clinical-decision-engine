"""
Pipeline Orchestrator - Coordinates all code generators in sequence

This module orchestrates the code generation pipeline by:
1. Determining which domains to process (raw vs orchestrator)
2. Filtering out inappropriate domains for each layer
3. Executing generators in the correct order
4. Handling errors and reporting results

For layer configuration, see: pipeline.layer_config
"""

from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from cuur_codegen.core.config import Config, DomainConfig
from cuur_codegen.core.logger import Logger, create_logger
from cuur_codegen.core.errors import GenerationError
from cuur_codegen.core.config_loader import ConfigLoader
from cuur_codegen.base.generator_registry import GeneratorRegistry
from cuur_codegen.pipeline.stages import DomainProcessingStage, PostProcessingStage
from cuur_codegen.pipeline.layer_config import (
    get_layer_config,
    is_orchestrator_layer,
    is_core_domain_layer,
    get_execution_order_for_layers,
    get_generators_for_layers,
    get_core_domain_layers,
    get_orchestrator_layers,
)

# Generator imports
from cuur_codegen.generators.services.service import ServiceGenerator
from cuur_codegen.generators.adapters.adapter import AdapterGenerator
from cuur_codegen.generators.tests.test import TestGenerator
from cuur_codegen.generators.orchestrators.aggregator import AggregatorGenerator
from cuur_codegen.generators.orchestrators.orchestrator_flow import OrchestratorFlowGenerator


@dataclass
class StepResult:
    """Result of a pipeline step"""

    step: str
    domain: str
    success: bool
    duration: float
    error: Optional[str] = None


@dataclass
class PipelineResult:
    """Result of pipeline execution"""

    success: bool
    total_duration: float
    steps: List[StepResult]
    domains_processed: int
    domains_succeeded: int
    domains_failed: int
    errors: List[str]


class PipelineOptions:
    """Pipeline execution options"""

    def __init__(
        self,
        clean: bool = False,
        validate: bool = True,
        skip_build: bool = False,
        parallel: bool = False,
        fail_fast: bool = True,
        rollback: bool = False,
        layers: Optional[List[str]] = None,
    ):
        self.clean = clean
        self.validate = validate
        self.skip_build = skip_build
        self.parallel = parallel
        self.fail_fast = fail_fast
        self.rollback = rollback
        self.layers = layers or []  # Empty list means use config defaults


class Pipeline:
    """Pipeline orchestrator for code generation"""

    def __init__(self, config: Optional[Config] = None, logger: Optional[Logger] = None, config_path: Optional[Path] = None):
        """
        Initialize pipeline.

        Args:
            config: Optional Config object (will be loaded if not provided)
            logger: Optional logger instance
            config_path: Optional path to config file (used if config not provided)
        """
        # Load config if not provided
        if config is None:
            config_loader = ConfigLoader(logger)
            config = config_loader.load_config(config_path)

        self.config = config
        # Convert log_level to LogLevel enum if needed
        from cuur_codegen.core.config import LogLevel
        log_level = config.log_level
        if isinstance(log_level, str):
            log_level = LogLevel(log_level)

        self.logger = logger or create_logger(
            level=log_level,
            verbose=config.verbose,
        )
        self.steps: List[StepResult] = []

        # Initialize generator registry
        self.registry = GeneratorRegistry(self.logger)

        # Register generators (servicesgen only: services, adapters (includes Prisma schema generation), tests, orchestrators)
        self.registry.register("adapter", AdapterGenerator)  # AdapterGenerator includes Prisma schema generation
        self.registry.register("service", ServiceGenerator)
        self.registry.register("tests", TestGenerator)
        # Orchestrator generators
        self.registry.register("orchestrator_aggregator", AggregatorGenerator)
        self.registry.register("orchestrator_flow", OrchestratorFlowGenerator)

        # Initialize pipeline stages
        self.domain_stage = DomainProcessingStage(
            config=self.config,
            logger=self.logger,
            generators=self.registry.get_all(),
        )
        self.post_processing_stage = PostProcessingStage(
            config=self.config,
            logger=self.logger,
            generators=self.registry.get_all(),
        )

    def execute(self, domains: List[str], options: Optional[PipelineOptions] = None) -> PipelineResult:
        """
        Execute the complete pipeline

        Args:
            domains: List of domain names to process (or ["all"] for all domains)
            options: Pipeline execution options

        Returns:
            PipelineResult with execution summary
        """
        options = options or PipelineOptions()
        start_time = datetime.now()

        # Determine which layers are being processed
        selected_layers = options.layers or get_core_domain_layers()  # Default to core domain layers

        # Determine if we're processing orchestrator or core domains
        processing_orchestrator = any(is_orchestrator_layer(layer) for layer in selected_layers)
        processing_core = any(is_core_domain_layer(layer) for layer in selected_layers)

        # Resolve domains to process based on layer type
        domains_to_process = self._resolve_domains(domains, processing_orchestrator, processing_core, options)

        # Log what we're processing
        # Determine domain type based on selected layers (not individual domains)
        if processing_orchestrator and not processing_core:
            domain_type = "orchestrator"
        elif processing_core and not processing_orchestrator:
            domain_type = "core"
        else:
            domain_type = "mixed"  # Both selected (shouldn't happen, but handle gracefully)

        self.logger.header(
            "Quub CodeGen Pipeline",
            f"Processing {len(domains_to_process)} {domain_type} domain(s) for layers: {', '.join(selected_layers)}"
        )

        # Get orchestrator domain names to check domain type
        orchestrator_domain_names = self._get_orchestrator_domain_names()

        # If processing orchestrator layers and config file doesn't exist,
        # treat all explicitly provided domains as orchestrator domains
        if processing_orchestrator and not processing_raw and not orchestrator_domain_names:
            # Config file not found, but we're processing orchestrator layers
            # Treat all provided domains as orchestrator domains
            orchestrator_domain_names = set(domains_to_process)

        # Process each domain
        errors: List[str] = []
        succeeded = 0
        failed = 0

        for domain_name in domains_to_process:
            self.logger.step(f"Processing domain: {domain_name}")

            try:
                # Determine if this specific domain is orchestrator or raw
                # This ensures we use the correct config even if both layer types are selected
                is_orchestrator_domain = domain_name in orchestrator_domain_names

                # Get domain config (orchestrator domains use synthetic config, core domains use config file)
                domain_config = self._get_domain_config(domain_name, is_orchestrator_domain)
                if not domain_config:
                    raise GenerationError(f"Domain not found: {domain_name}")

                # Process domain through all selected layers
                self.domain_stage.process_domain(domain_config, options)
                succeeded += 1
                self.logger.success(f"✓ Completed domain: {domain_name}")

            except Exception as e:
                failed += 1
                error_msg = str(e)
                errors.append(f"{domain_name}: {error_msg}")
                self.logger.error(f"✗ Failed domain: {domain_name} - {error_msg}")

                if options.fail_fast:
                    break

        # Run post-processing stage (e.g., main index builders)
        if succeeded > 0:
            post_processing_errors = self.post_processing_stage.run_post_processing(
                domains=domains_to_process,
                layers=selected_layers,
            )
            errors.extend(post_processing_errors)

        total_duration = (datetime.now() - start_time).total_seconds()

        result = PipelineResult(
            success=failed == 0,
            total_duration=total_duration,
            steps=self.steps,
            domains_processed=succeeded + failed,
            domains_succeeded=succeeded,
            domains_failed=failed,
            errors=errors,
        )

        # Print summary
        self._print_summary(result)

        return result

    def _resolve_domains(
        self,
        domains: List[str],
        processing_orchestrator: bool,
        processing_core: bool,
        options: Optional[PipelineOptions] = None
    ) -> List[str]:
        """
        Resolve which domains to process based on layer type

        Args:
            domains: Requested domain names (or ["all"])
            processing_orchestrator: Whether orchestrator layers are selected
            processing_core: Whether core domain layers are selected
            options: Pipeline options (used to check if tests layer is selected)

        Returns:
            List of domain names to process
        """
        # Get orchestrator domain names for filtering (needed for core domain processing)
        orchestrator_domain_names = self._get_orchestrator_domain_names()

        # Handle orchestrator-only processing
        if processing_orchestrator and not processing_core:
            # Load orchestrator domains from configuration
            from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config
            try:
                orchestrator_config = load_orchestrator_domains_config(self.config.paths.project_root)
                if not domains or (len(domains) == 1 and domains[0] == "all"):
                    # Process all orchestrator domains
                    return [d.name for d in orchestrator_config.orchestrator_domains]
                else:
                    # Process specified orchestrator domains
                    return domains
            except FileNotFoundError:
                # Config file not found - if domains are explicitly provided, process them anyway
                if domains and len(domains) > 0 and domains[0] != "all":
                    self.logger.warn("Orchestrator domains config not found, but processing explicitly provided domains")
                    return domains
                else:
                    self.logger.warn("Orchestrator domains config not found, falling back to core domain mode")
                    processing_orchestrator = False

        # Handle core domain processing (adapters, services, tests)
        # Tests layer generates factories for both orchestrator domains (flow tests) and core domains (entity factories)
        is_tests_layer = "tests" in (options.layers if options else [])

        # Special handling for tests layer: process both orchestrator and core domains
        if is_tests_layer:
            if not domains or (len(domains) == 1 and domains[0] == "all"):
                # Tests layer: Generate tests for both orchestrator domains (flows) and core domains (factories)
                result_domains = []

                # Add orchestrator domains (for flow tests)
                try:
                    from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config
                    orchestrator_config = load_orchestrator_domains_config(self.config.paths.project_root)
                    result_domains.extend([d.name for d in orchestrator_config.orchestrator_domains])
                except FileNotFoundError:
                    pass

                # Add core domains (for entity factories)
                try:
                    from cuur_codegen.core.core_domains_config import load_core_domains_config
                    core_domains_config = load_core_domains_config(self.config.paths.project_root)
                    if core_domains_config:
                        core_domain_names = [d.name for d in core_domains_config.domains if d.enabled]
                        result_domains.extend(core_domain_names)
                except FileNotFoundError:
                    pass

                # Remove duplicates and return
                return list(dict.fromkeys(result_domains))  # Preserves order, removes duplicates
            else:
                # Specific domains requested for tests - process both orchestrator and core domains
                # Don't filter - let TestGenerator decide how to handle each domain
                return domains

        if processing_core:
            if not domains or (len(domains) == 1 and domains[0] == "all"):
                # Process all core domains from config
                all_domains = [d.name for d in self.config.domains if d.enabled]
                # Filter out orchestrator domains (never mix core and orchestrator)
                core_domains = [d for d in all_domains if d not in orchestrator_domain_names]

                # Log if any orchestrator domains were filtered out
                filtered_orchestrator = [d for d in all_domains if d in orchestrator_domain_names]
                if filtered_orchestrator:
                    self.logger.debug(
                        f"Filtered out {len(filtered_orchestrator)} orchestrator domain(s) from core domain processing: {', '.join(filtered_orchestrator)}"
                    )
                return core_domains
            else:
                # Filter requested domains - never mix core and orchestrator
                # Only include core domains, exclude orchestrator domains
                core_domains = []
                for domain_name in domains:
                    if domain_name not in orchestrator_domain_names:
                        core_domains.append(domain_name)
                    else:
                        self.logger.warn(
                            f"Skipping orchestrator domain '{domain_name}' - "
                            f"use --layer orchestrators to generate orchestrator domains"
                        )
                return core_domains

        # Handle case where both orchestrator and core are selected (shouldn't happen, but handle gracefully)
        if processing_orchestrator and processing_core:
            self.logger.warn(
                "Both orchestrator and core domain layers selected. "
                "Processing core domains only. Use separate runs for orchestrator layers."
            )
            # Process core domains (orchestrator domains should be processed separately)
            if not domains or (len(domains) == 1 and domains[0] == "all"):
                all_domains = [d.name for d in self.config.domains if d.enabled]
                return [d for d in all_domains if d not in orchestrator_domain_names]
            else:
                return [d for d in domains if d not in orchestrator_domain_names]

        return []

    def _get_orchestrator_domain_names(self) -> set:
        """Get set of orchestrator domain names for filtering"""
        try:
            from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config
            orchestrator_config = load_orchestrator_domains_config(self.config.paths.project_root)
            return {d.name for d in orchestrator_config.orchestrator_domains}
        except FileNotFoundError:
            return set()  # No orchestrator config, no filtering needed

    def _get_domain_config(self, domain_name: str, is_orchestrator: bool) -> Optional[DomainConfig]:
        """
        Get domain configuration

        Args:
            domain_name: Domain name
            is_orchestrator: Whether this is an orchestrator domain

        Returns:
            DomainConfig or None
        """
        if is_orchestrator:
            # Orchestrator domains use synthetic config (not in main config file)
            return DomainConfig(name=domain_name, enabled=True)
        else:
            # Core domains come from config file
            return self._find_domain_config(domain_name)

    def _find_domain_config(self, domain_name: str) -> Optional[DomainConfig]:
        """Find domain configuration from config file"""
        for domain in self.config.domains:
            if domain.name == domain_name:
                return domain
        return None


    def _print_summary(self, result: PipelineResult) -> None:
        """Print pipeline summary"""
        self.logger.header("Pipeline Summary")

        rows = [
            {"Metric": "Domains Processed", "Value": str(result.domains_processed)},
            {"Metric": "Domains Succeeded", "Value": str(result.domains_succeeded)},
            {"Metric": "Domains Failed", "Value": str(result.domains_failed)},
            {"Metric": "Total Duration", "Value": f"{result.total_duration:.2f}s"},
            {"Metric": "Status", "Value": "✓ Success" if result.success else "✗ Failed"},
        ]

        self.logger.table("Pipeline Results", rows)

        if result.errors:
            self.logger.error("Errors:")
            for error in result.errors:
                self.logger.error(f"  - {error}")
