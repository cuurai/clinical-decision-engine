"""
Pipeline Stages - Domain processing and post-processing stages
"""

from pathlib import Path
from typing import List, Optional, Dict, Any

from cuur_codegen.core.config import Config, DomainConfig
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.core.logger import Logger
from cuur_codegen.core.errors import GenerationError
from cuur_codegen.base.context_factory import ContextFactory
from cuur_codegen.utils.openapi import load_openapi_spec
from cuur_codegen.utils.file import file_exists
from cuur_codegen.core.generator import BaseGenerator, GenerateResult


class DomainProcessingStage:
    """Stage for processing individual domains"""

    def __init__(
        self,
        config: Config,
        logger: Logger,
        generators: Dict[str, BaseGenerator],
    ):
        """
        Initialize domain processing stage.

        Args:
            config: Configuration
            logger: Logger instance
            generators: Dictionary of generators
        """
        self.config = config
        self.logger = logger
        self.generators = generators

    def process_domain(
        self, domain: DomainConfig, options: Any
    ) -> GenerateResult:
        """
        Process a single domain through the pipeline.

        Args:
            domain: Domain configuration
            options: Pipeline options

        Returns:
            Generation result
        """
        # Create context using ContextFactory
        context = ContextFactory.create_domain_context(
            config=self.config,
            domain=domain,
            logger=self.logger,
            spec=None,  # Will load after path resolution
        )

        # Check if this is an orchestrator layer generation using layer config
        from cuur_codegen.pipeline.layer_config import is_orchestrator_layer as check_orchestrator_layer, get_core_domain_layers
        selected_layers = options.layers or get_core_domain_layers()
        is_orchestrator_layer = any(check_orchestrator_layer(layer) for layer in selected_layers)

        # Check if domain is an orchestrator domain (for tests layer which handles both)
        is_orchestrator_domain = False
        try:
            from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config
            orchestrator_config = load_orchestrator_domains_config(self.config.paths.project_root)
            orchestrator_domain_names = {d.name for d in orchestrator_config.orchestrator_domains}
            is_orchestrator_domain = domain.name in orchestrator_domain_names
        except FileNotFoundError:
            # Check if flows directory exists (heuristic)
            flows_path = self.config.paths.project_root / "orchestrators" / "domains" / "src" / domain.name / "flows"
            is_orchestrator_domain = flows_path.exists()

        # For orchestrator domains or orchestrator layers, skip spec loading
        # (generators will load core domain specs or use YAML files directly)
        # Core domain layers require OpenAPI specs
        if not is_orchestrator_layer and not is_orchestrator_domain:
            # Load OpenAPI spec using context's bundled_path property
            bundled_path = context.bundled_path

            # Check that bundled file exists (no bundling in servicesgen)
            if not file_exists(bundled_path):
                raise GenerationError(
                    f"Bundled spec not found: {bundled_path}. "
                    "Ensure OpenAPI spec has been bundled separately.",
                    domain.name,
                )

            spec = load_openapi_spec(bundled_path)

            # Update context with loaded spec
            context.spec = spec
        else:
            # For orchestrator domains, set empty spec (generators will load core domain specs)
            context.spec = {}

        # Clean output directories if requested
        if options.clean:
            self._clean_output_directories(context)

        # Use layer configuration to determine which generators to run
        from cuur_codegen.pipeline.layer_config import (
            get_execution_order_for_layers,
            get_generators_for_layers,
            get_core_domain_layers,
        )

        # Determine which layers to process
        selected_layers = options.layers or get_core_domain_layers()  # Default to core layers

        # Get generators for selected layers (layer_config handles orchestrator filtering)
        generators_to_run = set(get_generators_for_layers(selected_layers))

        # Get execution order from layer configuration
        generator_order = get_execution_order_for_layers(selected_layers)

        # Filter to only generators that are actually registered
        generator_order = [g for g in generator_order if g in generators_to_run]

        self.logger.debug(
            f"Layers: {selected_layers}, "
            f"Generators: {generator_order}"
        )

        # Run generators in order
        for generator_name in generator_order:
            generator = self.generators.get(generator_name)
            if not generator:
                self.logger.debug(f"Generator '{generator_name}' not found in registry")
                continue

            if not self._is_generator_enabled(generator_name):
                self.logger.debug(f"Skipping disabled generator: {generator.name}")
                continue

            self._run_generator(generator, context, generator_name)

        return GenerateResult(files=[], warnings=[])

    def _clean_output_directories(self, context: GenerationContext) -> None:
        """Clean output directories for domain"""
        from cuur_codegen.utils.file import clean_directory
        from cuur_codegen.utils.generator_setup import GeneratorSetup

        # Clean adapters output
        adapters_dir = GeneratorSetup.get_output_directory(
            context, generator_type="adapter", layer="adapters", clean=False
        )
        if adapters_dir.exists():
            clean_directory(adapters_dir)

        # Clean services output
        services_dir = GeneratorSetup.get_output_directory(
            context, generator_type="service", layer="services", clean=False
        )
        if services_dir.exists():
            clean_directory(services_dir)

        # Clean tests output
        tests_dir = GeneratorSetup.get_output_directory(
            context, generator_type="tests", layer="tests", clean=False
        )
        if tests_dir.exists():
            clean_directory(tests_dir)

    def _is_generator_enabled(self, generator_name: str) -> bool:
        """Check if generator is enabled"""
        # Check layer configs
        if generator_name == "adapter":
            return self.config.layers.adapters.repositories.enabled
        elif generator_name == "service":
            return self.config.layers.services.services.enabled
        elif generator_name == "tests":
            return self.config.layers.tests.tests.enabled

        return True

    def _run_generator(
        self, generator: BaseGenerator, context: GenerationContext, generator_name: str
    ) -> None:
        """Run a generator and handle errors"""
        try:
            self.logger.debug(f"Running generator: {generator.name}")
            result = generator.generate(context)
            if result.warnings:
                for warning in result.warnings:
                    self.logger.warn(f"  Warning: {warning}")
        except Exception as e:
            raise GenerationError(
                f"Generator '{generator_name}' failed: {str(e)}",
                context.domain_name,
                generator_name,
            )


class PostProcessingStage:
    """Stage for post-processing tasks (main index builders)"""

    def __init__(
        self,
        config: Config,
        logger: Logger,
        generators: Dict[str, BaseGenerator],
    ):
        """
        Initialize post-processing stage.

        Args:
            config: Configuration
            logger: Logger instance
            generators: Dictionary of generators
        """
        self.config = config
        self.logger = logger
        self.generators = generators

    def run_post_processing(
        self, domains: List[str], layers: Optional[List[str]] = None
    ) -> List[str]:
        """
        Run post-processing tasks.

        Args:
            domains: List of processed domain names
            layers: Optional list of layers to process

        Returns:
            List of error messages (empty if successful)
        """
        errors: List[str] = []

        # Generate adapters main index if adapters layer is enabled
        if not layers or "adapters" in layers:
            try:
                from cuur_codegen.utils.adapters_index_builder import AdaptersIndexBuilder
                self.logger.step("Generating adapters main index.ts...")
                builder = AdaptersIndexBuilder(self.logger)
                result_files, warnings, builder_errors = builder.build_main_index(self.config, None)
                if result_files:
                    self.logger.success(f"✓ Adapters main index.ts generated ({len(result_files)} files)")
                    if warnings:
                        for warning in warnings:
                            self.logger.warn(f"  Warning: {warning}")
                if builder_errors:
                    errors.extend(builder_errors)
            except Exception as e:
                errors.append(f"Adapters main index generation error: {str(e)}")
                self.logger.error(f"✗ Failed to generate adapters main index: {str(e)}")

        return errors
