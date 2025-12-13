"""
Test Generator - Generates test infrastructure and test files
"""

from pathlib import Path
from typing import Dict, Any, List, Optional
from collections import defaultdict

from cuur_codegen.base.generator_bases import FileGenerator
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.string import kebab_case, generate_file_name, pascal_case
from cuur_codegen.utils.file import ensure_directory, write_file

from .builders import (
    RepositoryDiscovery,
    HandlerDiscovery,
    FlowDiscovery,
    MockRepositoryBuilder,
    MockDependenciesBuilder,
    TestSetupBuilder,
    HandlerTestBuilder,
    FlowTestBuilder,
    TestIndexBuilder,
    PackageJsonBuilder,
    FactoryBuilder,
)


class TestGenerator(FileGenerator):
    """Generates test files and infrastructure"""

    @property
    def name(self) -> str:
        return "Test Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "tests"

    def should_generate_index(self) -> bool:
        """TestGenerator has custom index generation, don't use base class index"""
        return False

    def validate_context(self, context: GenerationContext) -> None:
        """Validate generation context - skip spec validation for orchestrator domains"""
        # Check if this is an orchestrator domain
        is_orchestrator_domain = TestGenerator._is_orchestrator_domain(context.domain_name, context)

        # Only validate spec for core domains
        if not is_orchestrator_domain:
            super().validate_context(context)
        else:
            # For orchestrator domains, only check if domain is enabled
            if not context.domain.enabled:
                from cuur_codegen.core.errors import GenerationError
                raise GenerationError(
                    f"Domain {context.domain_name} is disabled",
                    context.domain_name,
                    self.type
                )

    def generate_files(
        self, context: GenerationContext, output_dir: Path
    ) -> List[Path]:
        """
        Generate test files.

        Args:
            context: Generation context
            output_dir: Output directory (already resolved by FolderStructureConfig)
                       - Orchestrator domains: platform/tests/src/orchestrators/{domain}/
                       - Core domains: platform/tests/src/core/{domain}/

        Returns:
            List of generated file paths
        """
        files: List[Path] = []
        domain_name = context.domain_name
        # output_dir is already correctly resolved by FolderStructureConfig.get_layer_output_path
        # which handles orchestrator vs core domain routing
        test_dir = output_dir

        ensure_directory(test_dir)

        # Check if this is an orchestrator domain
        is_orchestrator_domain = TestGenerator._is_orchestrator_domain(domain_name, context)

        if is_orchestrator_domain:
            # Generate tests for orchestrator flows
            # Note: output_dir is already correct (orchestrators/{domain}/), no need to override
            return TestGenerator._generate_orchestrator_flow_tests(
                domain_name, test_dir, context, files
            )
        else:
            # Generate core domain entity factories
            # Note: output_dir is already correct (core/{domain}/), no need to override
            return TestGenerator._generate_core_domain_factories(
                domain_name, test_dir, context, files
            )

    @staticmethod
    def _is_orchestrator_domain(domain_name: str, context: GenerationContext) -> bool:
        """Check if domain is an orchestrator domain"""
        try:
            from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config
            orchestrator_config = load_orchestrator_domains_config(context.config.paths.project_root)
            orchestrator_domain_names = {d.name for d in orchestrator_config.orchestrator_domains}
            return domain_name in orchestrator_domain_names
        except FileNotFoundError:
            # Check if flows directory exists (heuristic)
            flows_path = context.config.paths.project_root / "orchestrators" / "domains" / "src" / domain_name / "flows"
            return flows_path.exists()

    @staticmethod
    def _generate_core_domain_factories(
        domain_name: str,
        test_dir: Path,
        context: GenerationContext,
        files: List[Path]
    ) -> List[Path]:
        """Generate core domain entity factories"""
        # test_dir is already correctly resolved by FolderStructureConfig.get_layer_output_path
        # to platform/tests/src/core/{domain}/
        context.logger.debug(f"Generating core domain factories for {domain_name} in {test_dir}")
        ensure_directory(test_dir)

        generator = TestGenerator()
        generator.logger = context.logger

        # Generate core domain factories
        # Flattened structure: files directly in factories/ directory
        # - {domain}.entity.factory.ts
        # - {domain}.request.factory.ts
        # - {domain}.response.factory.ts
        factories_dir = test_dir / "factories"
        ensure_directory(factories_dir)

        # Generate shared faker helpers for core domain
        faker_helpers_file = factories_dir / "faker-helpers.ts"
        faker_helpers_header = generator.generate_header(
            context,
            "Faker Helpers for Deterministic Test Data"
        )
        faker_helpers_content = FactoryBuilder.build_shared_faker_helpers(faker_helpers_header)
        write_file(faker_helpers_file, faker_helpers_content)
        files.append(faker_helpers_file)

        # Generate factories from models directory
        from .builders.models_factory_builder import ModelsFactoryBuilder
        models_builder = ModelsFactoryBuilder(context)

        # Generate all factory files
        # Create header with correct core domain name
        generator_name = generator.name
        version = context.config.version or "1.0.0"
        factory_header = f"""/**
 * {pascal_case(domain_name)} Domain Factories
 *
 * Generated by {generator_name} v{generator.version}
 * Generator Version: {version}
 * Domain: {domain_name}
 *
 * ⚠️  DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated. Any manual changes will be overwritten.
 */

"""
        factory_files = models_builder.build_all_factories_for_domain(domain_name, factory_header)

        for relative_path, file_content in factory_files:
            # Create directory structure matching models: {entity-name}/{entity|dto}/
            factory_file = factories_dir / relative_path
            ensure_directory(factory_file.parent)
            write_file(factory_file, file_content)
            files.append(factory_file)
            context.logger.debug(f"Generated factory file: {relative_path}")

        # Note: Core domain package.json files are NOT generated
        # Core domains are factories (imported), not test suites
        # Dependencies are managed by parent @quub/factories package.json
        # TypeScript path mapping handles all imports
        context.logger.debug("Skipping package.json generation for core domain (factories only, not test suites)")

        return files

    @staticmethod
    def _generate_handler_tests(
        domain_name: str,
        test_dir: Path,
        context: GenerationContext,
        files: List[Path]
    ) -> List[Path]:
        """Generate tests for core domain handlers (existing behavior)"""
        # Step 1: Generate core domain entity factories
        # These live in tests/src/core/{domain}/factories/entities/{domain}.entity.factory.ts
        # Use test_dir which is already correctly resolved, or construct path relative to project_root
        if context.config.paths.project_root.name == "platform":
            core_factories_dir = context.config.paths.project_root / "tests" / "src" / "core" / domain_name / "factories"
        else:
            core_factories_dir = context.config.paths.project_root / "platform" / "tests" / "src" / "core" / domain_name / "factories"
        entities_dir = core_factories_dir / "entities"
        ensure_directory(entities_dir)
        ensure_directory(core_factories_dir / "requests")
        ensure_directory(core_factories_dir / "responses")

        generator = TestGenerator()
        generator.logger = context.logger

        # Generate shared faker helpers for core domain
        core_shared_dir = core_factories_dir / "shared"
        ensure_directory(core_shared_dir)

        faker_helpers_file = core_shared_dir / "faker-helpers.ts"
        faker_helpers_header = generator.generate_header(
            context,
            "Faker Helpers for Deterministic Test Data"
        )
        faker_helpers_content = FactoryBuilder.build_shared_faker_helpers(faker_helpers_header)
        write_file(faker_helpers_file, faker_helpers_content)
        files.append(faker_helpers_file)

        # Generate factories from models directory
        from .builders.models_factory_builder import ModelsFactoryBuilder
        models_builder = ModelsFactoryBuilder(context)

        # Generate all factory files
        # Create header with correct core domain name
        generator_name = generator.name
        version = context.config.version or "1.0.0"
        factory_header = f"""/**
 * {pascal_case(domain_name)} Domain Factories
 *
 * Generated by {generator_name} v{generator.version}
 * Generator Version: {version}
 * Domain: {domain_name}
 *
 * ⚠️  DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated. Any manual changes will be overwritten.
 */

"""
        factory_files = models_builder.build_all_factories_for_domain(domain_name, factory_header)

        for relative_path, file_content in factory_files:
            # Create directory structure matching models: {entity-name}/{entity|dto}/
            factory_file = factories_dir / relative_path
            ensure_directory(factory_file.parent)
            write_file(factory_file, file_content)
            files.append(factory_file)
            context.logger.debug(f"Generated factory file: {relative_path}")

        # Discover repositories from core
        repositories = RepositoryDiscovery.discover_repositories(
            domain_name,
            context
        )

        if not repositories:
            context.logger.warn(
                f"No repositories found for domain {domain_name} - skipping test generation"
            )
            return files

        # Generate mock repositories
        mocks_dir = test_dir / "mocks"
        ensure_directory(mocks_dir)

        # Generate mocks/index.ts (consolidated - all mocks in one file)
        mocks_index_file = mocks_dir / "index.ts"
        generator = TestGenerator()
        generator.logger = context.logger
        mocks_index_header = generator.generate_header(
            context,
            "Mock Repositories for Testing"
        )
        mocks_index_content = MockRepositoryBuilder.build_combined_mocks(
            repositories,
            domain_name,
            mocks_index_header
        )
        write_file(mocks_index_file, mocks_index_content)
        files.append(mocks_index_file)

        # Continue with handler test generation...
        return TestGenerator._continue_handler_test_generation(
            domain_name, test_dir, context, files, repositories
        )

    @staticmethod
    def _ensure_core_domain_factories(
        core_domain_name: str,
        context: GenerationContext,
        files: List[Path]
    ) -> None:
        """
        Ensure core domain factories exist for a given core domain.
        This is called when generating orchestrator tests that depend on core domain factories.

        Args:
            core_domain_name: Core domain name (e.g., "identity", "auth", "exchange")
            context: Generation context
            files: List of files (for tracking, but core factories are generated separately)
        """
        # Core domain factories live in tests/src/core/{domain}/factories/ (flattened structure):
        # - {domain}.entity.factory.ts
        # - {domain}.request.factory.ts
        # - {domain}.response.factory.ts
        # Use path relative to project_root, checking if project_root is already platform/
        if context.config.paths.project_root.name == "platform":
            core_factories_dir = context.config.paths.project_root / "tests" / "src" / "core" / core_domain_name / "factories"
        else:
            core_factories_dir = context.config.paths.project_root / "platform" / "tests" / "src" / "core" / core_domain_name / "factories"

        # Check if entity factory file already exists
        core_entity_file = core_factories_dir / f"{core_domain_name}.entity.factory.ts"
        if core_entity_file.exists():
            context.logger.debug(f"Core domain factory already exists for {core_domain_name}, skipping generation")
            return

        # Generate core domain factories directory
        ensure_directory(core_factories_dir)

        generator = TestGenerator()
        generator.logger = context.logger

        # Generate shared faker helpers for core domain
        faker_helpers_file = core_factories_dir / "faker-helpers.ts"
        if not faker_helpers_file.exists():
            faker_helpers_header = generator.generate_header(
                context,
                "Faker Helpers for Deterministic Test Data"
            )
            faker_helpers_content = FactoryBuilder.build_shared_faker_helpers(faker_helpers_header)
            write_file(faker_helpers_file, faker_helpers_content)

        # Generate factories from models directory
        from .builders.models_factory_builder import ModelsFactoryBuilder
        models_builder = ModelsFactoryBuilder(context)

        # Generate all factory files
        # Create header with correct core domain name (not orchestrator domain)
        generator_name = generator.name
        version = context.config.version or "1.0.0"
        factory_header = f"""/**
 * {pascal_case(core_domain_name)} Domain Factories
 *
 * Generated by {generator_name} v{generator.version}
 * Generator Version: {version}
 * Domain: {core_domain_name}
 *
 * ⚠️  DO NOT EDIT THIS FILE MANUALLY
 * This file is auto-generated. Any manual changes will be overwritten.
 */

"""
        factory_files = models_builder.build_all_factories_for_domain(core_domain_name, factory_header)

        for relative_path, file_content in factory_files:
            # Create directory structure matching models: {entity-name}/{entity|dto}/
            factory_file = core_factories_dir / relative_path
            ensure_directory(factory_file.parent)
            write_file(factory_file, file_content)
            context.logger.debug(f"Generated factory file: {relative_path}")


    @staticmethod
    def _continue_handler_test_generation(
        domain_name: str,
        test_dir: Path,
        context: GenerationContext,
        files: List[Path],
        repositories: List
    ) -> List[Path]:
        """Continue handler test generation (rest of existing logic)"""
        generator = TestGenerator()
        generator.logger = context.logger

        # Generate test setup files
        setup_dir = test_dir / "__setup__"
        ensure_directory(setup_dir)

        # vitest.setup.ts
        vitest_setup_file = setup_dir / "vitest.setup.ts"
        vitest_setup_header = generator.generate_header(
            context,
            "Vitest global setup"
        )
        vitest_setup_content = TestSetupBuilder.build_vitest_setup(
            domain_name,
            vitest_setup_header
        )
        write_file(vitest_setup_file, vitest_setup_content)
        files.append(vitest_setup_file)

        # test-db.setup.ts
        test_db_setup_file = setup_dir / "test-db.setup.ts"
        test_db_setup_header = generator.generate_header(
            context,
            "Test database setup"
        )
        test_db_setup_content = TestSetupBuilder.build_test_db_setup(
            domain_name,
            test_db_setup_header
        )
        write_file(test_db_setup_file, test_db_setup_content)
        files.append(test_db_setup_file)

        # Generate e2e setup
        e2e_dir = test_dir / "e2e"
        ensure_directory(e2e_dir)

        e2e_setup_file = e2e_dir / "setup.ts"
        e2e_setup_header = generator.generate_header(context, "E2E test setup")
        e2e_setup_content = TestSetupBuilder.build_e2e_setup(
            domain_name,
            e2e_setup_header
        )
        write_file(e2e_setup_file, e2e_setup_content)
        files.append(e2e_setup_file)

        # Generate test directories (unit, integration, handlers, routes)
        ensure_directory(test_dir / "unit")
        ensure_directory(test_dir / "integration")
        ensure_directory(test_dir / "handlers")
        ensure_directory(test_dir / "routes")

        # Discover handlers and generate handler test files
        handlers = HandlerDiscovery.discover_handlers(domain_name, context)

        # Group handlers by resource
        handlers_by_resource: Dict[str, List] = defaultdict(list)
        for handler in handlers:
            handlers_by_resource[handler.resource].append(handler)

        # Generate handler test files
        for resource, resource_handlers in handlers_by_resource.items():
            resource_dir = test_dir / "handlers" / kebab_case(resource)
            ensure_directory(resource_dir)

            # Find repository for this resource
            repo = next(
                (r for r in repositories if kebab_case(r.name) == kebab_case(resource)),
                None
            )

            for handler in resource_handlers:
                test_resource_name = f"{kebab_case(handler.verb)}-{kebab_case(handler.resource)}"
                test_file_name = generate_file_name(test_resource_name, "test")
                test_file_path = resource_dir / test_file_name

                test_header = generator.generate_header(
                    context,
                    f"{handler.handler_name} Handler Tests"
                )

                test_content = HandlerTestBuilder.build_handler_test(
                    handler,
                    repo,
                    domain_name,
                    test_header,
                    context
                )

                write_file(test_file_path, test_content)
                files.append(test_file_path)

        # Generate test index
        test_index_file = test_dir / "index.ts"
        test_index_header = generator.generate_header(
            context,
            "Test utilities barrel export"
        )
        test_index_content = TestIndexBuilder.build_test_index(
            repositories,
            domain_name,
            test_index_header
        )
        write_file(test_index_file, test_index_content)
        files.append(test_index_file)

        # Generate or update package.json
        package_json_file = test_dir / "package.json"
        is_orchestrator = TestGenerator._is_orchestrator_domain(context.domain_name, context)

        if not package_json_file.exists():
            # Generate new package.json
            package_json_content = PackageJsonBuilder.build_package_json(context, is_orchestrator_domain=is_orchestrator)
            write_file(package_json_file, package_json_content)
            files.append(package_json_file)
            context.logger.debug("Generated package.json - ensure dependencies are installed")
        else:
            # Validate and update existing package.json if dependencies changed
            is_valid, errors = PackageJsonBuilder.validate_package_json(str(package_json_file), is_orchestrator)
            if not is_valid:
                context.logger.warn(f"package.json validation failed for {context.domain_name}: {errors}")
                context.logger.info(f"Updating package.json to match shared dependency constants")
                package_json_content = PackageJsonBuilder.build_package_json(context, is_orchestrator_domain=is_orchestrator)
                write_file(package_json_file, package_json_content)
                files.append(package_json_file)
            else:
                context.logger.debug("package.json is valid and up-to-date")

        # tsconfig.json is not generated per-domain (use parent-level tsconfig)

        return files

    @staticmethod
    def _generate_orchestrator_flow_tests(
        orchestrator_domain: str,
        test_dir: Path,
        context: GenerationContext,
        files: List[Path]
    ) -> List[Path]:
        """Generate tests for orchestrator flows"""
        # test_dir is already correctly resolved by FolderStructureConfig.get_layer_output_path
        # to platform/tests/src/orchestrators/{orchestrator}/
        context.logger.debug(f"Generating orchestrator tests for {orchestrator_domain} in {test_dir}")
        ensure_directory(test_dir)

        generator = TestGenerator()
        generator.logger = context.logger

        # Discover flows from orchestrator domain
        flows = FlowDiscovery.discover_flows(orchestrator_domain, context)
        context.logger.debug(f"Discovered {len(flows)} flows for {orchestrator_domain} in {test_dir}")

        if not flows:
            context.logger.warn(
                f"No flows found for orchestrator domain {orchestrator_domain} - skipping test generation"
            )
            return files

        context.logger.debug(f"Generating tests for {len(flows)} flows")

        # Discover DAO repositories used by this orchestrator domain
        # Get core domains from orchestrator config
        try:
            from cuur_codegen.generators.orchestrators.config_reader import load_orchestrator_domains_config
            orchestrator_config = load_orchestrator_domains_config(context.config.paths.project_root)
            orchestrator_domain_config = next(
                (d for d in orchestrator_config.orchestrator_domains if d.name == orchestrator_domain),
                None
            )

            repositories = []
            entity_to_domain_map = {}  # Map entity names to core domain names
            core_domains_used = set()  # Track core domains used by this orchestrator
            if orchestrator_domain_config:
                # Discover repositories from all core domains used by this orchestrator
                for core_domain in orchestrator_domain_config.core_domains:
                    core_domains_used.add(core_domain.name)
                    core_repos = RepositoryDiscovery.discover_repositories(core_domain.name, context)
                    repositories.extend(core_repos)
                    # Map entities from this core domain
                    for repo in core_repos:
                        # Extract entity name from repository
                        repo_name = repo.name
                        if repo_name.startswith("Dao"):
                            entity_name = repo_name[3:]  # Remove "Dao" prefix
                        else:
                            entity_name = repo_name
                        if entity_name.endswith("Repository"):
                            entity_name = entity_name[:-10]  # Remove "Repository" suffix
                        if entity_name:
                            entity_to_domain_map[entity_name] = core_domain.name
        except Exception as e:
            context.logger.debug(f"Error discovering repositories for orchestrator domain: {e}")
            repositories = []
            core_domains_used = set()

        # Generate core domain factories for all core domains used by this orchestrator
        # These factories are required by handler response factories
        for core_domain_name in core_domains_used:
            TestGenerator._ensure_core_domain_factories(core_domain_name, context, files)

        # Generate factories using layered approach:
        # 1. Core domain entity factories (generated separately, imported via @quub/factories/{domain}/{domain}.entity.factory.js)
        # 2. Handler response factories (middle layer) - import from core factories
        # 3. Flow factories (top layer) - compose handler responses
        # Orchestrator factories live in tests/src/orchestrators/{orchestrator}/factories/
        factories_dir = test_dir / "factories"
        ensure_directory(factories_dir)

        # Discover entities ONLY from handlers used in flows (not all schemas)
        entities_map = FactoryBuilder.discover_entities_from_flows(flows, orchestrator_domain, context)
        context.logger.debug(f"Discovered {len(entities_map)} entities from flows")

        if flows:
            context.logger.debug(f"Generating factories in {factories_dir}")
            # Generate shared faker helpers
            shared_dir = factories_dir / "shared"
            ensure_directory(shared_dir)

            faker_helpers_file = shared_dir / "faker-helpers.ts"
            faker_helpers_header = generator.generate_header(
                context,
                "Faker Helpers for Deterministic Test Data"
            )
            faker_helpers_content = FactoryBuilder.build_shared_faker_helpers(faker_helpers_header)
            context.logger.debug(f"Writing faker helpers to {faker_helpers_file}")
            write_file(faker_helpers_file, faker_helpers_content)
            files.append(faker_helpers_file)
            context.logger.debug(f"Faker helpers file written: {faker_helpers_file.exists()}")

            # Step 1: Ensure core domain factories exist (they should be generated separately)
            # We don't generate them here - they're imported from @quub/factories/{domain}
            # Core domain factories are generated when running tests for core domains

            # Step 2: Generate handler response factories (middle layer) - import from core factories
            handler_responses_dir = factories_dir / "handler-responses"
            ensure_directory(handler_responses_dir)

            # Discover handlers from YAML and map to schema-discovered entities
            from pathlib import Path
            import yaml
            project_root = context.config.paths.project_root
            yaml_spec_path = project_root / "orchestrators" / "openapi" / "src" / "yaml" / f"{orchestrator_domain}.yaml"

            handler_to_entity = {}
            if yaml_spec_path.exists():
                try:
                    with open(yaml_spec_path, "r", encoding="utf-8") as f:
                        spec = yaml.safe_load(f)

                    paths = spec.get("paths", {})
                    for path, methods in paths.items():
                        for method, operation in methods.items():
                            flow_steps = operation.get("x-orchestration-flow", [])
                            if not flow_steps:
                                continue

                            for step in flow_steps:
                                if step.get("kind") == "backend-call":
                                    handler_name = step.get("handler")
                                    step_id = step.get("stepId", "")
                                    if handler_name and step_id:
                                        # Map handler to entity using schema-discovered entities
                                        entity_name, _ = FactoryBuilder._handler_to_entity(
                                            handler_name, step.get("service", ""), context, schema_entities=entities_map
                                        )
                                        # Only include if entity exists in schema-discovered entities
                                        if entity_name and entity_name in entities_map:
                                            handler_to_entity[handler_name] = (entity_name, step_id)
                except Exception as e:
                    context.logger.debug(f"Error discovering handlers for response factories: {e}")

            # Generate handler response factories
            # Build entity_to_domain_map from entities_map for import resolution
            entity_to_domain_map = entities_map.copy() if entities_map else {}

            for handler_name, (entity_name, field_name) in handler_to_entity.items():
                handler_kebab = kebab_case(handler_name)
                handler_file = handler_responses_dir / f"{handler_kebab}.factory.ts"
                handler_header = generator.generate_header(
                    context,
                    f"{pascal_case(handler_name)} Handler Response Factory"
                )
                handler_content = FactoryBuilder.build_handler_response_factory(
                    handler_name,
                    entity_name,
                    field_name,
                    handler_header,
                    context,
                    orchestrator_domain,
                    entity_to_domain_map=entity_to_domain_map
                )
                write_file(handler_file, handler_content)
                files.append(handler_file)

            # Generate handler responses index
            if handler_to_entity:
                handler_index_file = handler_responses_dir / "index.ts"
                handler_index_header = generator.generate_header(
                    context,
                    "Handler Response Factories Barrel Export"
                )
                handler_index_content = "\n".join([
                    f'export * from "./{kebab_case(handler_name)}.factory.js";'
                    for handler_name in sorted(handler_to_entity.keys())
                ])
                write_file(handler_index_file, f"{handler_index_header}\n\n{handler_index_content}\n")
                files.append(handler_index_file)

            # Step 3: Generate flow factories (top layer) - compose handler responses
            # Flow factories live in tests/src/orchestrators/{orchestrator}/factories/flows/
            flows_dir = factories_dir / "flows"
            ensure_directory(flows_dir)

            flow_names = set()
            for flow in flows:
                # Extract flow name from operationId (e.g., "getFundingBalances" -> "fundingBalances")
                operation_id = flow.operation_id
                flow_name = FactoryBuilder._extract_flow_name_from_operation_id(operation_id)
                flow_names.add(flow_name)

                # Generate flow factory file
                factory_file = flows_dir / f"{kebab_case(flow_name)}.factory.ts"
                factory_header = generator.generate_header(
                    context,
                    f"{pascal_case(flow_name)} Flow Factory"
                )
                factory_content = FactoryBuilder.build_flow_factory_file(
                    flow_name,
                    operation_id,
                    orchestrator_domain,
                    factory_header,
                    context,
                    flow_file_path=flow.flow_file,
                    entities_map=entities_map
                )
                context.logger.debug(f"Writing flow factory to {factory_file}")
                write_file(factory_file, factory_content)
                files.append(factory_file)
                context.logger.debug(f"Flow factory written: {factory_file.exists()}")

            # Generate factories index
            factories_index_file = factories_dir / "index.ts"
            factories_index_header = generator.generate_header(
                context,
                "Factories Barrel Export"
            )
            factories_index_content = FactoryBuilder.build_factories_index(
                flow_names,
                orchestrator_domain,
                factories_index_header
            )
            write_file(factories_index_file, factories_index_content)
            files.append(factories_index_file)

        # Generate mock dependencies
        mocks_dir = test_dir / "mocks"
        ensure_directory(mocks_dir)

        mocks_index_file = mocks_dir / "index.ts"
        mocks_index_header = generator.generate_header(
            context,
            "Mock Dependencies for Orchestrator Flow Testing"
        )
        mocks_index_content = MockDependenciesBuilder.build_mock_dependencies(
            repositories,
            orchestrator_domain,
            mocks_index_header,
            context
        )
        write_file(mocks_index_file, mocks_index_content)
        files.append(mocks_index_file)

        # Generate test setup files
        setup_dir = test_dir / "__setup__"
        ensure_directory(setup_dir)

        vitest_setup_file = setup_dir / "vitest.setup.ts"
        vitest_setup_header = generator.generate_header(
            context,
            "Vitest global setup"
        )
        vitest_setup_content = TestSetupBuilder.build_vitest_setup(
            orchestrator_domain,
            vitest_setup_header
        )
        write_file(vitest_setup_file, vitest_setup_content)
        files.append(vitest_setup_file)

        # Generate test directories
        ensure_directory(test_dir / "unit")
        ensure_directory(test_dir / "integration")
        ensure_directory(test_dir / "flows")

        # Generate flow test files
        flows_dir = test_dir / "flows"
        ensure_directory(flows_dir)

        for flow in flows:
            flow_test_name = kebab_case(flow.flow_name.replace("Flow", ""))
            test_file_name = generate_file_name(flow_test_name, "test")
            test_file_path = flows_dir / test_file_name

            test_header = generator.generate_header(
                context,
                f"{flow.flow_name} Flow Tests"
            )

            test_content = FlowTestBuilder.build_flow_test(
                flow,
                orchestrator_domain,
                test_header,
                context
            )

            write_file(test_file_path, test_content)
            files.append(test_file_path)

        # Generate test index
        test_index_file = test_dir / "index.ts"
        test_index_header = generator.generate_header(
            context,
            "Test utilities barrel export"
        )
        test_index_content = TestIndexBuilder.build_test_index(
            repositories,
            orchestrator_domain,
            test_index_header
        )
        write_file(test_index_file, test_index_content)
        files.append(test_index_file)

        # Generate or update package.json
        package_json_file = test_dir / "package.json"
        is_orchestrator = TestGenerator._is_orchestrator_domain(context.domain_name, context)

        if not package_json_file.exists():
            # Generate new package.json
            package_json_content = PackageJsonBuilder.build_package_json(context, is_orchestrator_domain=is_orchestrator)
            write_file(package_json_file, package_json_content)
            files.append(package_json_file)
            context.logger.debug("Generated package.json - ensure dependencies are installed")
        else:
            # Validate and update existing package.json if dependencies changed
            is_valid, errors = PackageJsonBuilder.validate_package_json(str(package_json_file), is_orchestrator)
            if not is_valid:
                context.logger.warn(f"package.json validation failed for {context.domain_name}: {errors}")
                context.logger.info(f"Updating package.json to match shared dependency constants")
                package_json_content = PackageJsonBuilder.build_package_json(context, is_orchestrator_domain=is_orchestrator)
                write_file(package_json_file, package_json_content)
                files.append(package_json_file)
            else:
                context.logger.debug("package.json is valid and up-to-date")

        # tsconfig.json is not generated per-domain (use parent-level tsconfig)

        # Skip per-domain vitest.config.ts generation - use shared config at platform/tests/src/orchestrators/vitest.config.ts
        # Vitest automatically finds config files in parent directories
        context.logger.debug("Using shared vitest.config.ts from platform/tests/src/orchestrators/")

        return files
