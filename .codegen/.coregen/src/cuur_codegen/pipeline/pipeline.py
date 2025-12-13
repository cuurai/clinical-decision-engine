"""
Pipeline Orchestrator - Coordinates all code generators in sequence
"""

from pathlib import Path
from typing import List, Optional, Dict
from dataclasses import dataclass
from datetime import datetime
import subprocess

from cuur_codegen.base.config import Config, DomainConfig
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.logger import Logger, create_logger
from cuur_codegen.base.errors import GenerationError
from cuur_codegen.base.generator import BaseGenerator
from cuur_codegen.base.generator_registry import GeneratorRegistry
from cuur_codegen.base.context_factory import ContextFactory
from cuur_codegen.utils.openapi import load_openapi_spec
from cuur_codegen.utils.file import file_exists
from cuur_codegen.utils.openapi_bundler import OpenApiBundler
from cuur_codegen.pipeline.stages import DomainProcessingStage, PostProcessingStage
from cuur_codegen.generators.core.handler import HandlerGenerator
from cuur_codegen.generators.core.repository import RepositoryGenerator
from cuur_codegen.generators.core.types import TypesGenerator
from cuur_codegen.generators.core.schemas_file import SchemasGenerator
from cuur_codegen.generators.core.converter import ConverterGenerator
from cuur_codegen.generators.core.schema import SchemaGenerator
from cuur_codegen.generators.core.index_builder import IndexBuilderGenerator
from cuur_codegen.generators.core.main_index_builder import MainIndexBuilderGenerator
from cuur_codegen.generators.core.shared_types import SharedTypesGenerator
from cuur_codegen.extractors.openapi_typescript_extractor import OpenApiTypeScriptExtractor
from cuur_codegen.extractors.openapi_zod_client_extractor import OpenApiZodClientExtractor
from cuur_codegen.generators.sdk.domain_client import DomainClientGenerator
from cuur_codegen.generators.sdk.index_builder import SdkIndexBuilderGenerator


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
        bundle: bool = False,
    ):
        self.clean = clean
        self.validate = validate
        self.skip_build = skip_build
        self.parallel = parallel
        self.fail_fast = fail_fast
        self.rollback = rollback
        self.bundle = bundle


class Pipeline:
    """Pipeline orchestrator for code generation"""

    def __init__(self, config: Config, logger: Optional[Logger] = None):
        self.config = config
        # Convert log_level to LogLevel enum if needed
        from cuur_codegen.base.config import LogLevel
        log_level = config.log_level
        if isinstance(log_level, str):
            log_level = LogLevel(log_level)

        self.logger = logger or create_logger(
            level=log_level,
            verbose=config.verbose,
        )
        self.steps: List[StepResult] = []

        # Initialize bundler
        self.bundler = OpenApiBundler(self.logger)

        # Initialize generator registry
        self.registry = GeneratorRegistry(self.logger)
        self._register_generators()

        # Initialize stages
        self.domain_stage = DomainProcessingStage(
            config=self.config,
            logger=self.logger,
            bundler=self.bundler,
            generators=self.generators,
            extractors=self.extractors,
            sdk_generators=self.sdk_generators,
        )
        self.post_processing_stage = PostProcessingStage(
            config=self.config,
            logger=self.logger,
            generators=self.generators,
            extractors=self.extractors,
            sdk_generators=self.sdk_generators,
        )

    def _register_generators(self) -> None:
        """Register all generators in the registry"""
        # Register core generators
        self.registry.register("schemas_file", SchemasGenerator)
        self.registry.register("types", TypesGenerator)
        self.registry.register("schema", SchemaGenerator)
        self.registry.register("repository", RepositoryGenerator)
        self.registry.register("handler", HandlerGenerator)
        self.registry.register("converter", ConverterGenerator)
        self.registry.register("index_builder", IndexBuilderGenerator)
        self.registry.register("main_index_builder", MainIndexBuilderGenerator)
        self.registry.register("shared_types", SharedTypesGenerator)

        # Register SDK extractors
        self.registry.register("openapi_typescript_extractor", OpenApiTypeScriptExtractor)
        self.registry.register("openapi_zod_client_extractor", OpenApiZodClientExtractor)

        # Register SDK generators
        self.registry.register("domain_client", DomainClientGenerator)
        self.registry.register("sdk_index_builder", SdkIndexBuilderGenerator)

    @property
    def generators(self) -> Dict[str, BaseGenerator]:
        """Get core generators (backward compatibility)"""
        return {
            "schemas_file": self.registry.get("schemas_file"),
            "types": self.registry.get("types"),
            "schema": self.registry.get("schema"),
            "repository": self.registry.get("repository"),
            "handler": self.registry.get("handler"),
            "converter": self.registry.get("converter"),
            "index_builder": self.registry.get("index_builder"),
            "main_index_builder": self.registry.get("main_index_builder"),
            "shared_types": self.registry.get("shared_types"),
        }

    @property
    def extractors(self) -> Dict[str, BaseGenerator]:
        """Get extractors (backward compatibility)"""
        return {
            "openapi_typescript_extractor": self.registry.get("openapi_typescript_extractor"),
            "openapi_zod_client_extractor": self.registry.get("openapi_zod_client_extractor"),
        }

    @property
    def sdk_generators(self) -> Dict[str, BaseGenerator]:
        """Get SDK generators (backward compatibility)"""
        return {
            "domain_client": self.registry.get("domain_client"),
            "sdk_index_builder": self.registry.get("sdk_index_builder"),
        }

    def execute(self, domains: List[str], options: Optional[PipelineOptions] = None) -> PipelineResult:
        """Execute the complete pipeline"""
        options = options or PipelineOptions()
        start_time = datetime.now()

        self.logger.header("Quub CodeGen Pipeline", f"Processing {len(domains)} domain(s)")

        errors: List[str] = []
        succeeded = 0
        failed = 0

        for domain_name in domains:
            self.logger.step(f"Processing domain: {domain_name}")

            try:
                # Find domain config
                domain_config = self._find_domain_config(domain_name)
                if not domain_config:
                    raise GenerationError(f"Domain not found: {domain_name}")

                # Process domain using domain stage
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

        # Generate main index.ts after all domains are processed
        # Only generate if at least one domain succeeded AND core layer is enabled
        core_layer = getattr(self.config.layers, 'core', None) or getattr(self.config.layers, 'base', None)
        core_enabled = core_layer and any([
            core_layer.handlers.enabled,
            core_layer.types.enabled,
            core_layer.schemas_file.enabled,
            core_layer.converters.enabled,
        ])

        # Post-processing: Generate main index and shared types
        if succeeded > 0:
            # Get list of processed domains
            processed_domains = [d for d in domains if self._find_domain_config(d) is not None]

            # Check SDK layer
            sdk_layer = getattr(self.config.layers, 'sdk', None)
            sdk_enabled = sdk_layer and sdk_layer.enabled

            # Run post-processing stage
            self.logger.step("Running post-processing...")
            post_processing_errors = self.post_processing_stage.run_post_processing(
                domains=processed_domains,
                core_enabled=core_enabled,
                sdk_enabled=sdk_enabled,
            )
            errors.extend(post_processing_errors)

            if post_processing_errors:
                self.logger.error("✗ Post-processing failed")
            else:
                self.logger.success("✓ Post-processing completed")
        elif succeeded > 0 and not core_enabled:
            self.logger.debug("Skipping post-processing (core layer disabled)")

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

    def _find_domain_config(self, domain_name: str) -> Optional[DomainConfig]:
        """Find domain configuration"""
        for domain in self.config.domains:
            if domain.name == domain_name:
                return domain
        return None

    def _process_domain(self, domain: DomainConfig, options: PipelineOptions) -> None:
        """Process a single domain through the pipeline"""
        # Create context first to get proper path resolution
        context = GenerationContext(
            config=self.config,
            domain=domain,
            logger=self.logger,
            spec=None,  # Will load after path resolution
        )

        # Load OpenAPI spec using context's bundled_path property
        bundled_path = context.bundled_path

        # Bundle the OpenAPI spec if --bundle flag is set or if bundled file is missing/outdated
        spec_path = domain.spec_path if domain.spec_path else domain.default_spec_path
        openapi_dir = self.config.paths.openapi_dir
        source_path = openapi_dir / spec_path

        # Try src subdirectory if source doesn't exist
        if not source_path.exists():
            openapi_src_dir = openapi_dir / "src"
            if openapi_src_dir.exists():
                source_path = openapi_src_dir / spec_path
                openapi_dir = openapi_src_dir

        # Bundle if explicitly requested, or if bundled file is missing/outdated
        if options.bundle or not file_exists(bundled_path) or self.bundler.should_rebundle(source_path, bundled_path):
            if source_path.exists():
                self.bundler.bundle_domain(domain, source_path, bundled_path, openapi_dir)
            elif not file_exists(bundled_path):
                # Only raise error if bundled file doesn't exist and we can't create it
                raise GenerationError(
                    f"Bundled spec not found: {bundled_path} and source not found: {source_path}. Use --bundle to generate it.",
                    domain.name,
                )
        else:
            # If bundling is disabled, check that bundled file exists
            if not file_exists(bundled_path):
                raise GenerationError(
                    f"Bundled spec not found: {bundled_path}. Use --bundle to generate it.",
                    domain.name,
                )

        spec = load_openapi_spec(bundled_path)

        # Update context with loaded spec
        context.spec = spec

        # Clean output directories if requested
        if options.clean:
            self._clean_output_directories(context)

        # Core generators only - skip if core layer is disabled
        core_layer = getattr(self.config.layers, 'core', None) or getattr(self.config.layers, 'base', None)
        core_enabled = core_layer and any([
            core_layer.handlers.enabled,
            core_layer.types.enabled,
            core_layer.schemas_file.enabled,
            core_layer.converters.enabled,
            core_layer.schemas.enabled if hasattr(core_layer, 'schemas') else False,
        ])

        # Check if SDK layer is enabled
        sdk_config = self.config.layers.sdk
        sdk_enabled = sdk_config and sdk_config.enabled

        # Track if any generators actually ran
        generators_ran = False

        # Run extractors if either core or SDK is enabled (extractors are shared)
        if core_enabled or sdk_enabled:
            types_extractor = self.extractors.get("openapi_typescript_extractor")
            schemas_extractor = self.extractors.get("openapi_zod_client_extractor")

            # Run types extractor if core types or SDK types are enabled
            if types_extractor:
                should_run = False
                if core_enabled and core_layer and core_layer.types.enabled:
                    should_run = True
                elif sdk_enabled and sdk_config.generate_types:
                    should_run = True

                if should_run:
                    self.logger.debug(f"Running extractor: {types_extractor.name}")
                    self._run_generator(types_extractor, context, "openapi_typescript_extractor")
                    generators_ran = True

            # Run schemas extractor if core schemas_file or SDK schemas are enabled
            if schemas_extractor:
                should_run = False
                if core_enabled and core_layer and core_layer.schemas_file.enabled:
                    should_run = True
                elif sdk_enabled and sdk_config.generate_schemas:
                    should_run = True

                if should_run:
                    self.logger.debug(f"Running extractor: {schemas_extractor.name}")
                    self._run_generator(schemas_extractor, context, "openapi_zod_client_extractor")
                    generators_ran = True

        if core_enabled:

            generator_order = [
                "schemas_file",
                "types",
                "schema",
                "repository",
                "handler",
                "converter",
            ]

            for generator_name in generator_order:
                generator = self.generators.get(generator_name)
                if not generator:
                    self.logger.debug(f"Generator '{generator_name}' not found in registry")
                    continue

                # Debug: Log which generator is about to run
                self.logger.debug(f"About to run generator: '{generator_name}' -> {generator.name}")

                # Check if generator is enabled
                is_enabled = True

                # Check legacy config
                if self.config.generators:
                    generator_config = getattr(self.config.generators, generator_name, None)
                    if generator_config and not generator_config.enabled:
                        is_enabled = False

                # Check core layer configs
                if core_layer:
                    if generator_name == "handler" and not core_layer.handlers.enabled:
                        is_enabled = False
                    elif generator_name == "repository" and not core_layer.handlers.enabled:
                        is_enabled = False
                    elif generator_name == "types" and not core_layer.types.enabled:
                        is_enabled = False
                    elif generator_name == "schemas_file" and not core_layer.schemas_file.enabled:
                        is_enabled = False
                    elif generator_name == "converter" and not core_layer.converters.enabled:
                        is_enabled = False
                    elif generator_name == "schema" and not (hasattr(core_layer, 'schemas') and core_layer.schemas.enabled):
                        is_enabled = False
                    # index_builder runs if any generator ran (checked after loop)

                if not is_enabled:
                    self.logger.debug(f"Skipping disabled generator: {generator_name}")
                    continue

                self._run_generator(generator, context, generator_name)
                generators_ran = True

            # Run index_builder only if at least one generator ran
            if generators_ran:
                index_builder = self.generators.get("index_builder")
                if index_builder:
                    self.logger.debug(f"Running index builder (generators ran)")
                    self._run_generator(index_builder, context, "index_builder")
        else:
            # Show helpful message when no generators are enabled
            disabled_generators = []
            if core_layer:
                if not core_layer.handlers.enabled:
                    disabled_generators.append("handlers")
                if not core_layer.types.enabled:
                    disabled_generators.append("types")
                if not core_layer.schemas_file.enabled:
                    disabled_generators.append("schemas_file")
                if not core_layer.converters.enabled:
                    disabled_generators.append("converters")
                if not (hasattr(core_layer, 'schemas') and core_layer.schemas.enabled):
                    disabled_generators.append("schemas")

            self.logger.warn(
                f"[yellow]⚠[/yellow]  No generators enabled for domain '{context.domain_name}'"
            )
            self.logger.info(
                f"   All core generators are disabled. Enable generators in your config file:"
            )
            self.logger.info(
                f"   [dim]layers.core.{{generator}}.enabled = true[/dim]"
            )
            if disabled_generators:
                self.logger.info(
                    f"   [dim]Disabled generators: {', '.join(disabled_generators)}[/dim]"
                )

        # Run SDK domain client generator (if SDK layer is enabled)
        # Note: Extractors now run as part of core generation above
        sdk_config = self.config.layers.sdk
        self.logger.info(f"[SDK] Checking SDK config for {context.domain_name}: enabled={sdk_config.enabled if sdk_config else None}, generate_clients={sdk_config.generate_clients if sdk_config else None}")
        if sdk_config and sdk_config.enabled and sdk_config.generate_clients:
            domain_client_generator = self.sdk_generators.get("domain_client")
            if domain_client_generator:
                self.logger.info(f"Generating SDK domain client for {context.domain_name}...")
                self._run_generator(domain_client_generator, context, "domain_client")
                generators_ran = True
                self.logger.info(f"✅ Generated SDK domain client: {context.domain_name}.client.ts")
            else:
                self.logger.warn(f"SDK domain client generator not found in registry")
        elif sdk_config and sdk_config.enabled and not sdk_config.generate_clients:
            self.logger.debug(f"SDK clients generation disabled for {context.domain_name}")
        elif not sdk_config:
            self.logger.debug(f"SDK config not found")
        elif not sdk_config.enabled:
            self.logger.debug(f"SDK layer disabled")

        # Show message if no generators ran at all
        if not generators_ran:
            self.logger.info("")
            self.logger.info(
                "[dim]💡 Tip: Enable at least one generator in your config file to generate code.[/dim]"
            )

        # Validate build if requested
        if options.validate and not options.skip_build:
            self._validate_build(context)

    def _run_generator(
        self, generator, context: GenerationContext, generator_name: str
    ) -> None:
        """Run a single generator"""
        step_start = datetime.now()
        self.logger.step(f"Running {generator.name}...")

        try:
            result = generator.generate(context)
            duration = (datetime.now() - step_start).total_seconds()

            step_result = StepResult(
                step=generator_name,
                domain=context.domain_name,
                success=result.success,
                duration=duration,
                error="; ".join(result.errors) if result.errors else None,
            )
            self.steps.append(step_result)

            if result.success:
                self.logger.success(f"✓ {generator.name} completed ({len(result.files)} files)")
                if result.warnings:
                    for warning in result.warnings:
                        self.logger.warn(f"  Warning: {warning}")
            else:
                raise GenerationError(
                    f"Generator failed: {'; '.join(result.errors)}",
                    context.domain_name,
                    generator_name,
                )

        except Exception as e:
            duration = (datetime.now() - step_start).total_seconds()
            error_msg = str(e)

            step_result = StepResult(
                step=generator_name,
                domain=context.domain_name,
                success=False,
                duration=duration,
                error=error_msg,
            )
            self.steps.append(step_result)

            raise

    def _clean_output_directories(self, context: GenerationContext) -> None:
        """Clean output directories"""
        self.logger.debug("Cleaning output directories...")

        # Use get_output_dir to get core output directory
        domain_dir = context.config.get_output_dir("core") / context.domain_name
        dirs_to_clean = [
            domain_dir,
        ]

        for dir_path in dirs_to_clean:
            if dir_path and dir_path.exists():
                clean_directory(dir_path)
                self.logger.debug(f"Cleaned: {dir_path}")

    def _validate_build(self, context: GenerationContext) -> None:
        """Validate generated code by running build"""
        self.logger.step("Validating build...")

        try:
            # Run TypeScript build
            cmd = ["pnpm", "build", "--filter", f"@cuur/core"]
            result = subprocess.run(
                cmd,
                cwd=str(context.config.paths.project_root),
                capture_output=True,
                text=True,
                timeout=300,
            )

            if result.returncode == 0:
                self.logger.success("✓ Build validation passed")
            else:
                raise GenerationError(
                    f"Build validation failed: {result.stderr}",
                    context.domain_name,
                )

        except subprocess.TimeoutExpired:
            raise GenerationError("Build validation timed out", context.domain_name)
        except Exception as e:
            raise GenerationError(f"Build validation error: {str(e)}", context.domain_name)

    # _bundle_domain_spec method removed - now using OpenApiBundler class
    # Bundling logic has been moved to OpenApiBundler.bundle_domain()

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
