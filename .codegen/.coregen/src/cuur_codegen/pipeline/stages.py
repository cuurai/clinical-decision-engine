"""
Pipeline Stages - Domain processing and post-processing stages
"""

from pathlib import Path
from typing import List, Optional, Dict, Any

from cuur_codegen.base.config import Config, DomainConfig
from cuur_codegen.base.context import GenerationContext
from cuur_codegen.base.logger import Logger
from cuur_codegen.base.errors import GenerationError
from cuur_codegen.base.context_factory import ContextFactory
from cuur_codegen.utils.openapi import load_openapi_spec
from cuur_codegen.utils.file import file_exists
from cuur_codegen.utils.openapi_bundler import OpenApiBundler
from cuur_codegen.base.generator import BaseGenerator, GenerateResult


class DomainProcessingStage:
    """Stage for processing individual domains"""

    def __init__(
        self,
        config: Config,
        logger: Logger,
        bundler: OpenApiBundler,
        generators: Dict[str, BaseGenerator],
        extractors: Dict[str, BaseGenerator],
        sdk_generators: Optional[Dict[str, BaseGenerator]] = None,
    ):
        """
        Initialize domain processing stage.

        Args:
            config: Configuration
            logger: Logger instance
            bundler: OpenAPI bundler
            generators: Dictionary of generators
            extractors: Dictionary of extractors
            sdk_generators: Dictionary of SDK generators (optional)
        """
        self.config = config
        self.logger = logger
        self.bundler = bundler
        self.generators = generators
        self.extractors = extractors
        self.sdk_generators = sdk_generators or {}

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

        # Load OpenAPI spec using context's bundled_path property
        bundled_path = context.bundled_path

        # Bundle the OpenAPI spec if needed
        if options.bundle:
            source_path = self._get_source_path(domain)
            if not file_exists(bundled_path) or self.bundler.should_rebundle(
                source_path, bundled_path
            ):
                if source_path.exists():
                    openapi_dir = self.config.paths.openapi_dir
                    # Try src subdirectory if source doesn't exist
                    if not source_path.exists():
                        openapi_src_dir = openapi_dir / "src"
                        if openapi_src_dir.exists():
                            openapi_dir = openapi_src_dir
                    self.bundler.bundle_domain(domain, source_path, bundled_path, openapi_dir)
                else:
                    # This should not happen as _get_source_path raises an error, but keep as fallback
                    raise GenerationError(
                        f"Source OpenAPI spec not found: {source_path}\n"
                        f"💡 Try: git checkout main -- openapi/",
                        domain.name,
                    )
        else:
            # If bundling is disabled, check that bundled file exists
            if not file_exists(bundled_path):
                source_path = self._get_source_path(domain)
                error_msg = f"""
❌ Bundled OpenAPI spec not found: {bundled_path}

💡 Solutions:
1. Generate the bundled file by running with --bundle flag:
   quub-coregen generate --domain {domain.name} --bundle

2. Or restore from main branch:
   git checkout main -- openapi/src/.bundled/

3. If the source file exists ({source_path}), bundling will create the bundled file automatically.
"""
                raise GenerationError(error_msg.strip(), domain.name)

        spec = load_openapi_spec(bundled_path)

        # Update context with loaded spec
        context.spec = spec

        # Clean output directories if requested
        if options.clean:
            self._clean_output_directories(context)

        # Check if core layer is enabled
        core_layer = getattr(self.config.layers, "core", None) or getattr(
            self.config.layers, "base", None
        )
        core_enabled = core_layer and any(
            [
                core_layer.handlers.enabled,
                core_layer.types.enabled,
                core_layer.schemas_file.enabled,
                core_layer.converters.enabled,
                core_layer.schemas.enabled if hasattr(core_layer, "schemas") else False,
            ]
        )

        # Check if SDK layer is enabled (for extractors)
        sdk_layer = getattr(self.config.layers, "sdk", None)
        sdk_enabled = sdk_layer and sdk_layer.enabled

        # Run extractors if either core or SDK is enabled (extractors are shared)
        if core_enabled or sdk_enabled:
            self._run_extractors(context, core_layer if core_enabled else None)

        # Run SDK domain client generator (if SDK layer is enabled and core is not)
        # This allows SDK-only generation
        if sdk_enabled and sdk_layer.generate_clients and not core_enabled:
            domain_client_generator = self.sdk_generators.get("domain_client")
            if domain_client_generator:
                self.logger.info(f"Generating SDK domain client for {context.domain_name}...")
                self._run_generator(domain_client_generator, context, "domain_client")
                self.logger.info(f"✅ Generated SDK domain client: {context.domain_name}.client.ts")
            else:
                self.logger.warn(f"SDK domain client generator not found in registry")

        # If core is not enabled, skip core generators
        if not core_enabled:
            return GenerateResult(files=[], warnings=[])

        # Run generators in order
        generator_order = [
            "schemas_file",
            "types",
            "schema",
            "repository",
            "handler",
            "converter",
        ]

        generators_ran = False
        for generator_name in generator_order:
            generator = self.generators.get(generator_name)
            if not generator:
                self.logger.debug(f"Generator '{generator_name}' not found in registry")
                continue

            if not self._is_generator_enabled(generator_name, core_layer):
                self.logger.debug(f"Skipping disabled generator: {generator.name}")
                continue

            self._run_generator(generator, context, generator_name)
            generators_ran = True

        # Run index_builder only if at least one generator ran
        if generators_ran:
            index_builder = self.generators.get("index_builder")
            if index_builder:
                self.logger.debug(f"Running index builder (generators ran)")
                self._run_generator(index_builder, context, "index_builder")

        return GenerateResult(files=[], warnings=[])

    def _get_source_path(self, domain: DomainConfig) -> Path:
        """Get source OpenAPI spec path for domain"""
        spec_path = domain.spec_path if domain.spec_path else domain.default_spec_path
        openapi_dir = self.config.paths.openapi_dir

        # Check if openapi directory exists
        if not openapi_dir.exists():
            available_files = []
            suggestions = []

            # Check if we're in the right directory
            project_root = self.config.paths.project_root.resolve()
            possible_openapi_dirs = [
                project_root / "openapi",
                project_root / "openapi" / "src",
                project_root.parent / "openapi",
                project_root.parent / "openapi" / "src",
            ]

            for possible_dir in possible_openapi_dirs:
                if possible_dir.exists():
                    suggestions.append(f"  - {possible_dir}")
                    yaml_files = list(possible_dir.glob("*.yaml"))
                    if yaml_files:
                        available_files.extend([f.name for f in yaml_files[:5]])

            error_msg = f"""
❌ OpenAPI directory not found: {openapi_dir}

Expected location: {openapi_dir}
Domain: {domain.name}
Spec file: {spec_path}

💡 Suggestions:
"""
            if suggestions:
                error_msg += "\nFound these OpenAPI directories:\n"
                error_msg += "\n".join(suggestions)
                error_msg += "\n\nUpdate your config file (.quub-coregen.json) to point to the correct openapi directory."
            else:
                error_msg += f"""
1. Ensure the openapi directory exists at: {openapi_dir}
2. Or restore it from the main branch:
   git checkout main -- openapi/

3. Check your config file (.quub-coregen.json) paths configuration:
   {{
     "paths": {{
       "openapi_dir": "openapi/src",
       ...
     }}
   }}
"""

            if available_files:
                error_msg += f"\n📄 Found {len(available_files)} YAML files in alternative locations:\n"
                error_msg += f"   {', '.join(available_files[:5])}\n"

            raise GenerationError(error_msg.strip(), domain.name)

        source_path = openapi_dir / spec_path

        # Try src subdirectory if source doesn't exist
        if not source_path.exists():
            openapi_src_dir = openapi_dir / "src"
            if openapi_src_dir.exists():
                source_path = openapi_src_dir / spec_path
            else:
                # Provide helpful error message
                yaml_files = list(openapi_dir.glob("*.yaml"))
                src_yaml_files = []
                if openapi_src_dir.exists():
                    src_yaml_files = list(openapi_src_dir.glob("*.yaml"))

                error_msg = f"""
❌ OpenAPI spec file not found for domain '{domain.name}'

Expected file: {source_path}
Also checked: {openapi_src_dir / spec_path if openapi_src_dir.exists() else 'N/A'}

💡 Available files:
"""
                if yaml_files:
                    error_msg += f"\nIn {openapi_dir}:\n"
                    for f in sorted(yaml_files)[:10]:
                        error_msg += f"  - {f.name}\n"

                if src_yaml_files:
                    error_msg += f"\nIn {openapi_src_dir}:\n"
                    for f in sorted(src_yaml_files)[:10]:
                        error_msg += f"  - {f.name}\n"

                if not yaml_files and not src_yaml_files:
                    error_msg += f"""
No YAML files found in:
  - {openapi_dir}
  - {openapi_src_dir}

💡 To restore OpenAPI files from main branch:
   git checkout main -- openapi/
"""
                else:
                    error_msg += f"""
💡 Suggestions:
1. Check if the file name matches the domain name (e.g., '{domain.name}.yaml')
2. Restore missing files from main branch:
   git checkout main -- openapi/
3. Verify your domain configuration in the config file
"""

                raise GenerationError(error_msg.strip(), domain.name)

        return source_path

    def _clean_output_directories(self, context: GenerationContext) -> None:
        """Clean output directories for domain"""
        from cuur_codegen.utils.file import clean_directory

        core_output_dir = context.config.get_output_dir("core")
        domain_dir = core_output_dir / context.domain_name

        if domain_dir.exists():
            clean_directory(domain_dir)

    def _run_extractors(
        self, context: GenerationContext, core_layer: Any
    ) -> None:
        """Run OpenAPI extractors"""
        types_extractor = self.extractors.get("openapi_typescript_extractor")
        schemas_extractor = self.extractors.get("openapi_zod_client_extractor")

        # Check SDK layer config
        sdk_layer = getattr(self.config.layers, "sdk", None)
        sdk_enabled = sdk_layer and sdk_layer.enabled

        # Run types extractor if core types or SDK types are enabled
        if types_extractor:
            should_run = False
            if core_layer and core_layer.types.enabled:
                should_run = True
            elif sdk_enabled and sdk_layer.generate_types:
                should_run = True

            if should_run:
                self.logger.debug(f"Running extractor: {types_extractor.name}")
                self._run_generator(types_extractor, context, "openapi_typescript_extractor")

        # Run schemas extractor if core schemas_file or SDK schemas are enabled
        if schemas_extractor:
            should_run = False
            if core_layer and core_layer.schemas_file.enabled:
                should_run = True
            elif sdk_enabled and sdk_layer.generate_schemas:
                should_run = True

            if should_run:
                self.logger.debug(f"Running extractor: {schemas_extractor.name}")
                self._run_generator(
                    schemas_extractor, context, "openapi_zod_client_extractor"
                )

    def _is_generator_enabled(self, generator_name: str, core_layer: Any) -> bool:
        """Check if generator is enabled"""
        # Check legacy config
        if self.config.generators:
            generator_config = getattr(self.config.generators, generator_name, None)
            if generator_config and not generator_config.enabled:
                return False

        # Check core layer configs
        if core_layer:
            if generator_name == "handler" and not core_layer.handlers.enabled:
                return False
            elif generator_name == "repository" and not core_layer.handlers.enabled:
                return False
            elif generator_name == "types" and not core_layer.types.enabled:
                return False
            elif generator_name == "schemas_file" and not core_layer.schemas_file.enabled:
                return False
            elif generator_name == "converter" and not core_layer.converters.enabled:
                return False
            elif generator_name == "schema" and not (
                hasattr(core_layer, "schemas") and core_layer.schemas.enabled
            ):
                return False

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
    """Stage for post-processing tasks (main index, shared types)"""

    def __init__(
        self,
        config: Config,
        logger: Logger,
        generators: Dict[str, BaseGenerator],
        extractors: Dict[str, BaseGenerator],
        sdk_generators: Optional[Dict[str, BaseGenerator]] = None,
    ):
        """
        Initialize post-processing stage.

        Args:
            config: Configuration
            logger: Logger instance
            generators: Dictionary of generators
            extractors: Dictionary of extractors
            sdk_generators: Dictionary of SDK generators (optional)
        """
        self.config = config
        self.logger = logger
        self.generators = generators
        self.extractors = extractors
        self.sdk_generators = sdk_generators or {}

    def run_post_processing(
        self, domains: List[str], core_enabled: bool, sdk_enabled: bool = False
    ) -> List[str]:
        """
        Run post-processing tasks.

        Args:
            domains: List of processed domain names
            core_enabled: Whether core layer is enabled

        Returns:
            List of error messages (empty if successful)
        """
        errors: List[str] = []

        # Generate SDK domains index if SDK is enabled
        if sdk_enabled:
            sdk_index_builder = self.sdk_generators.get("sdk_index_builder")
            if sdk_index_builder:
                try:
                    self.logger.step("Generating SDK domains index.ts...")
                    # Create a dummy context for SDK index builder (it doesn't need domain-specific context)
                    from cuur_codegen.base.context_factory import ContextFactory
                    from cuur_codegen.base.config import DomainConfig

                    # Use first domain as context (index builder doesn't use domain-specific data)
                    if domains:
                        dummy_domain = DomainConfig(name=domains[0], enabled=True)
                        context = ContextFactory.create_domain_context(
                            config=self.config,
                            domain=dummy_domain,
                            logger=self.logger,
                            spec=None,
                        )
                        result = sdk_index_builder.generate(context)
                        if result.files:
                            self.logger.success(f"✓ SDK domains index.ts generated ({len(result.files)} files)")
                        if result.warnings:
                            for warning in result.warnings:
                                self.logger.warn(f"  Warning: {warning}")
                except Exception as e:
                    errors.append(f"SDK index generation error: {str(e)}")
                    self.logger.error(f"✗ Failed to generate SDK domains index: {str(e)}")

        if not core_enabled:
            return errors

        # Generate main index
        main_index_generator = self.generators.get("main_index_builder")
        if main_index_generator:
            try:
                self.logger.step("Generating main index.ts...")
                # MainIndexBuilderGenerator uses generate_main_index() method
                result = main_index_generator.generate_main_index(
                    self.config, domains
                )
                if result.success:
                    self.logger.success(f"✓ Main index.ts generated ({len(result.files)} files)")
                    if result.warnings:
                        for warning in result.warnings:
                            self.logger.warn(f"  Warning: {warning}")
                else:
                    errors.append(f"Main index generation failed: {'; '.join(result.errors)}")
            except Exception as e:
                errors.append(f"Main index generation error: {str(e)}")
                self.logger.error(f"✗ Failed to generate main index: {str(e)}")

        # Generate shared types
        shared_types_generator = self.generators.get("shared_types")
        if shared_types_generator:
            try:
                self.logger.step("Generating shared types...")
                # SharedTypesGenerator uses generate_shared_types() method
                result = shared_types_generator.generate_shared_types(self.config)
                if result.success:
                    self.logger.success(f"✓ Shared types generated ({len(result.files)} files)")
                    if result.warnings:
                        for warning in result.warnings:
                            self.logger.warn(f"  Warning: {warning}")
                else:
                    errors.append(f"Shared types generation failed: {'; '.join(result.errors)}")
            except Exception as e:
                errors.append(f"Shared types generation error: {str(e)}")
                self.logger.error(f"✗ Failed to generate shared types: {str(e)}")

        return errors
