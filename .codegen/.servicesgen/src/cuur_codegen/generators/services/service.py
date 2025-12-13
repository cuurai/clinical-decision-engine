"""
Service Generator - Generates Fastify service layer code
"""

from pathlib import Path
from typing import Dict, Any, List

from cuur_codegen.base.generator_bases import FileGenerator
from cuur_codegen.core.context import GenerationContext
from cuur_codegen.utils.openapi import extract_operations
from cuur_codegen.utils.string import extract_resource_from_operation_id, kebab_case
from cuur_codegen.utils.file import ensure_directory, write_file, file_exists, clean_directory

from .builders import DependenciesBuilder, IndexBuilder, MainBuilder, PackageJsonBuilder
from .routes import RoutesBuilder
from cuur_codegen.utils.string import camel_case


class ServiceGenerator(FileGenerator):
    """Generates Fastify service layer files"""

    @property
    def name(self) -> str:
        return "Service Generator"

    @property
    def version(self) -> str:
        return "1.0.0"

    @property
    def type(self) -> str:
        return "service"

    def should_generate_index(self) -> bool:
        """ServiceGenerator has custom index generation, don't use base class index"""
        return False

    def generate_files(
        self, context: GenerationContext, output_dir: Path
    ) -> List[Path]:
        """
        Generate service files.

        Args:
            context: Generation context
            output_dir: Base output directory (services/{domain})

        Returns:
            List of generated file paths
        """
        files: List[Path] = []
        warnings: List[str] = []

        # ServiceGenerator has custom directory structure: services/{domain}/src/{dependencies,routes}
        service_dir = output_dir
        src_dir = service_dir / "src"
        deps_dir = src_dir / "dependencies"
        routes_dir = src_dir / "routes"

        ensure_directory(src_dir)
        ensure_directory(deps_dir)
        ensure_directory(routes_dir)

        # Clean subdirectories before generation
        if deps_dir.exists():
            clean_directory(deps_dir)
        if routes_dir.exists():
            clean_directory(routes_dir)
        # Clean specific files that will be regenerated
        for file_pattern in ["index.ts", "main.ts"]:
            file_path = src_dir / file_pattern
            if file_path.exists() and file_path.is_file():
                file_path.unlink()

        # Extract operations from spec
        operations = extract_operations(context.spec)

        # Group operations by resource
        from .routes.operation_grouper import OperationGrouper
        resource_routes = OperationGrouper.group_operations_by_resource(operations)
        resources_list = list(resource_routes.keys())

        # PRIMARY: Build repository names from OpenAPI resources (source of truth)
        # Repositories are generated from OpenAPI resources, so this is the authoritative source
        from cuur_codegen.utils.string import singularize, camel_case
        from .builders.repository_discovery import RepositoryDiscovery
        from .routes.handler_signature_checker import HandlerSignatureChecker

        available_repos = set()
        for resource in resources_list:
            # Extract singular form for repo name (matches repository generator naming)
            resource_singular = singularize(resource)
            repo_name = f"{camel_case(resource_singular)}Repo"
            available_repos.add(repo_name)

        # VALIDATION: Check filesystem to validate repositories exist (warn if missing)
        # This ensures repositories have been generated and helps catch mismatches
        discovered_repos = RepositoryDiscovery.discover_repositories(
            context.domain_name,
            context
        )
        filesystem_repos = {f"{repo.name}Repo" for repo in discovered_repos}

        # Warn if OpenAPI resources expect repositories that don't exist in filesystem
        missing_repos = available_repos - filesystem_repos
        if missing_repos:
            context.logger.warn(
                f"Repositories expected from OpenAPI but not found in filesystem: {', '.join(sorted(missing_repos))}. "
                f"Ensure repository generator has been run for this domain."
            )

        # Also warn if filesystem has repositories not in OpenAPI (might indicate stale files)
        extra_repos = filesystem_repos - available_repos
        if extra_repos:
            context.logger.debug(
                f"Repositories found in filesystem but not in OpenAPI spec: {', '.join(sorted(extra_repos))}"
            )

        # Check which handlers actually need repositories and orgId by inspecting handler files
        # Also map operationId to actual handler function names
        handler_needs_repo: Dict[str, bool] = {}
        handler_needs_org_id: Dict[str, bool] = {}
        handler_name_map: Dict[str, str] = {}

        for resource, resource_ops in resource_routes.items():
            for op_data in resource_ops:
                operation = op_data.get("operation", {})
                operation_id = operation.get("operationId") or op_data.get("operation_id", "")
                if not operation_id:
                    continue

                handler_name_from_op_id = camel_case(operation_id)
                needs_repo, needs_org_id, actual_handler_name = HandlerSignatureChecker.check_handler_signature(
                    handler_name_from_op_id,
                    operation_id,
                    context
                )

                handler_needs_repo[operation_id] = needs_repo
                handler_needs_org_id[operation_id] = needs_org_id
                handler_name_map[operation_id] = actual_handler_name or handler_name_from_op_id

        # Generate dependencies.ts with domain scope: {domain}.dependencies.ts
        domain_name = context.domain_name
        deps_file = deps_dir / f"{domain_name}.dependencies.ts"
        deps_header = self.generate_header(context, "Dependency injection container")
        deps_content = DependenciesBuilder.build_dependencies(context, resources_list, deps_header)
        write_file(deps_file, deps_content)
        files.append(deps_file)

        # Generate index.ts
        index_file = src_dir / "index.ts"
        index_header = self.generate_header(context, "Service entry point with Fastify server")
        index_content = IndexBuilder.build_index(context, index_header)
        write_file(index_file, index_content)
        files.append(index_file)

        # Generate main.ts (always regenerate)
        main_file = src_dir / "main.ts"
        main_header = self.generate_header(context, "Service entry point")
        main_content = MainBuilder.build_main(context, resources_list, main_header)
        write_file(main_file, main_content)
        files.append(main_file)
        context.logger.debug("Generated main.ts")

        # Generate route files for each resource
        from cuur_codegen.utils.string import generate_file_name
        for resource, resource_ops in resource_routes.items():
            route_file = routes_dir / generate_file_name(resource, "routes")
            route_header = self.generate_header(context, f"Routes for {resource}")
            route_content = RoutesBuilder.build_routes_file(
                context,
                resource,
                resource_ops,
                route_header,
                available_repos,
                handler_needs_repo,
                handler_needs_org_id,
                handler_name_map
            )
            write_file(route_file, route_content)
            files.append(route_file)

        # Generate routes index
        routes_index = routes_dir / "index.ts"
        routes_index_header = self.generate_header(context, "All route modules for the service")
        routes_index_content = RoutesBuilder.build_routes_index(context, resource_routes, routes_index_header)
        write_file(routes_index, routes_index_content)
        files.append(routes_index)

        # Generate package.json (only if doesn't exist)
        package_json_file = service_dir / "package.json"
        if not file_exists(package_json_file):
            package_json_content = PackageJsonBuilder.build_package_json(context)
            write_file(package_json_file, package_json_content)
            files.append(package_json_file)
            context.logger.debug("Generated package.json - ensure dependencies are installed")
        else:
            context.logger.debug("package.json already exists - skipping generation")

        # tsconfig.json is not generated (use parent-level tsconfig)

        return files
