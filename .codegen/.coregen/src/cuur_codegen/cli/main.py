"""
CLI entry point using Click

This is a proper tier-1 CLI implementation:
- Uses standard Python entry points (configured in pyproject.toml)
- Installed via: pip install -e .
- CLI command: cuur-coregen
"""

from pathlib import Path
from typing import Optional
import click
import json

from cuur_codegen.base.config import Config, LogLevel
from cuur_codegen.base.logger import create_logger
from cuur_codegen.pipeline.pipeline import Pipeline, PipelineOptions
from cuur_codegen.utils.file import find_project_root


def find_config_file(default_path: Path) -> Path:
    """
    Find config file by checking multiple locations:
    1. Default path relative to current directory
    2. .codegen/.cuur-coregen.json (new location)
    3. If in packages/codegen/, check .cuur-coregen.json in current dir
    4. If in project root, check packages/codegen/.cuur-coregen.json or .codegen/.cuur-coregen.json
    5. Walk up directories to find project root
    """
    # Check if default path exists
    if default_path.exists():
        return default_path

    cwd = Path.cwd()

    # Check .codegen/.cuur-coregen.json (new location)
    codegen_config = cwd / ".codegen" / ".cuur-coregen.json"
    if codegen_config.exists():
        return codegen_config

    # Check if we're in packages/codegen/ and config is in current dir
    local_config = cwd / ".cuur-coregen.json"
    if local_config.exists():
        return local_config

    # Check if we're in project root
    root_config = cwd / "packages" / "codegen" / ".cuur-coregen.json"
    if root_config.exists():
        return root_config

    # Walk up directories to find project root
    current = cwd
    for _ in range(5):  # Limit to 5 levels up
        # Check .codegen/.cuur-coregen.json first (new location)
        codegen_config = current / ".codegen" / ".cuur-coregen.json"
        if codegen_config.exists():
            return codegen_config

        # Check packages/codegen/.cuur-coregen.json (old location)
        test_path = current / "packages" / "codegen" / ".cuur-coregen.json"
        if test_path.exists():
            return test_path

        parent = current.parent
        if parent == current:  # Reached filesystem root
            break
        current = parent

    # Return default path (will show error if doesn't exist)
    return default_path


@click.group()
@click.version_option(version="1.0.0", prog_name="cuur-coregen")
def cli():
    """
    Quub CoreGen - Core SDK code generator for TypeScript

    Configuration file location:
      Default: .codegen/.cuur-coregen.json

    The config file should be located in .codegen/ directory.
    All paths in the config are relative to project root.

    To initialize a new config file:
      cuur-coregen init

    To use a custom config file:
      cuur-coregen generate --config /path/to/config.json
    """
    pass


# Layer selection removed - only core generators are supported


@cli.command()
@click.option(
    "--config",
    "-c",
    type=click.Path(path_type=Path),
    default=Path(".codegen/.cuur-coregen.json"),
    help="Configuration file path (default: .codegen/.cuur-coregen.json)",
)
@click.option(
    "--domain",
    "-d",
    multiple=True,
    help="Domain(s) to generate (can be specified multiple times)",
)
@click.option(
    "--all",
    "all_domains",
    is_flag=True,
    help="Generate all domains",
)
@click.option(
    "--clean",
    is_flag=True,
    help="Clean output directories before generation",
)
@click.option(
    "--no-build",
    is_flag=True,
    help="Skip build validation",
)
@click.option(
    "--bundle",
    is_flag=True,
    help="Bundle OpenAPI YAML files before generation (if not set, uses existing bundled files)",
)
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Verbose logging",
)
@click.option(
    "--log-level",
    type=click.Choice(["debug", "info", "warn", "error"]),
    default="info",
    help="Log level",
)
@click.option(
    "--layer",
    type=click.Choice(["core", "sdk"], case_sensitive=False),
    default="core",
    help="Layer to generate: 'core' (handlers, repositories, DTOs, entities) or 'sdk' (clients, types, schemas)",
)
def generate(
    config: Path,
    domain: tuple[str, ...],
    all_domains: bool,
    clean: bool,
    no_build: bool,
    bundle: bool,
    verbose: bool,
    log_level: str,
    layer: str,
):
    """Generate code for specified domain(s)"""
    try:
        # Find config file (handles multiple locations)
        config_path = find_config_file(config)

        # Load configuration
        if config_path.exists():
            cfg = Config.from_file(config_path)
        else:
            click.echo(f"Configuration file not found: {config_path}", err=True)
            click.echo("Tried locations:", err=True)
            click.echo(f"  - {config_path}", err=True)
            click.echo(f"  - {Path.cwd() / '.cuur-coregen.json'}", err=True)
            click.echo(f"  - {Path.cwd() / 'packages' / 'codegen' / '.cuur-coregen.json'}", err=True)
            click.echo("", err=True)
            click.echo("Using default configuration...", err=True)
            # Find project root to ensure paths are correct regardless of working directory
            project_root = find_project_root(Path.cwd())
            cfg = Config.default(project_root)

        # Override log level and verbose
        cfg.log_level = LogLevel(log_level)
        cfg.verbose = verbose

        # Configure layer based on --layer option
        layer_lower = layer.lower()
        if layer_lower == "sdk":
            # Enable SDK layer
            cfg.layers.sdk.enabled = True
            cfg.layers.sdk.generate_types = True
            cfg.layers.sdk.generate_schemas = True
            cfg.layers.sdk.generate_clients = True
            # Disable core layer
            cfg.layers.core.handlers.enabled = False
            cfg.layers.core.types.enabled = False
            cfg.layers.core.schemas_file.enabled = False
            cfg.layers.core.converters.enabled = False
            cfg.layers.core.schemas.enabled = False
        elif layer_lower == "core":
            # Enable core layer (default)
            cfg.layers.core.handlers.enabled = True
            cfg.layers.core.types.enabled = True
            cfg.layers.core.schemas_file.enabled = True
            cfg.layers.core.converters.enabled = True
            if hasattr(cfg.layers.core, "schemas"):
                cfg.layers.core.schemas.enabled = True
            # Disable SDK layer
            cfg.layers.sdk.enabled = False

        # Determine domains
        if all_domains:
            domains = [d.name for d in cfg.domains if d.enabled]
        elif domain:
            domains = list(domain)
        else:
            click.echo("Error: Must specify --domain or --all", err=True)
            return

        if not domains:
            click.echo("Error: No domains to generate", err=True)
            return

        # Create pipeline
        logger = create_logger(level=LogLevel(log_level), verbose=verbose)
        pipeline = Pipeline(cfg, logger)

        # Create options
        options = PipelineOptions(
            clean=clean,
            validate=not no_build,
            skip_build=no_build,
            bundle=bundle,
        )

        # Execute pipeline
        result = pipeline.execute(domains, options)

        # Exit with appropriate code
        exit(0 if result.success else 1)

    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)
        exit(1)


@cli.command()
@click.option(
    "--config",
    "-c",
    type=click.Path(path_type=Path),
    default=Path(".codegen/.cuur-coregen.json"),
    help="Configuration file path (default: .codegen/.cuur-coregen.json)",
)
@click.option(
    "--domain",
    "-d",
    multiple=True,
    help="Domain(s) to process (can be specified multiple times)",
)
@click.option(
    "--all",
    "all_domains",
    is_flag=True,
    help="Process all domains",
)
@click.option(
    "--clean",
    is_flag=True,
    help="Clean output directories before generation",
)
@click.option(
    "--no-build",
    is_flag=True,
    help="Skip build validation",
)
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Verbose logging",
)
@click.option(
    "--log-level",
    type=click.Choice(["debug", "info", "warn", "error"]),
    default="info",
    help="Log level",
)
def pipeline(
    config: Path,
    domain: tuple[str, ...],
    all_domains: bool,
    clean: bool,
    no_build: bool,
    verbose: bool,
    log_level: str,
):
    """Run complete code generation pipeline"""
    # Find config file (handles multiple locations)
    config_path = find_config_file(config)

    # Same as generate command
    generate.callback(
        config=config_path,
        domain=domain,
        all_domains=all_domains,
        clean=clean,
        no_build=no_build,
        verbose=verbose,
        log_level=log_level,
    )


@cli.command()
@click.option(
    "--config",
    "-c",
    type=click.Path(path_type=Path),
    default=Path(".codegen/.cuur-coregen.json"),
    help="Configuration file path (default: .codegen/.cuur-coregen.json)",
)
@click.option(
    "--domain",
    "-d",
    multiple=True,
    help="Domain(s) to extract (can be specified multiple times)",
)
@click.option(
    "--all",
    "all_domains",
    is_flag=True,
    help="Extract all domains",
)
@click.option(
    "--types",
    "extract_types",
    is_flag=True,
    default=True,
    help="Extract TypeScript types (default: true)",
)
@click.option(
    "--schemas",
    "extract_schemas",
    is_flag=True,
    default=True,
    help="Extract Zod schemas (default: true)",
)
@click.option(
    "--no-types",
    is_flag=True,
    help="Skip TypeScript types extraction",
)
@click.option(
    "--no-schemas",
    is_flag=True,
    help="Skip Zod schemas extraction",
)
@click.option(
    "--verbose",
    "-v",
    is_flag=True,
    help="Verbose logging",
)
@click.option(
    "--log-level",
    type=click.Choice(["debug", "info", "warn", "error"]),
    default="info",
    help="Log level",
)
def extract(
    config: Path,
    domain: tuple[str, ...],
    all_domains: bool,
    extract_types: bool,
    extract_schemas: bool,
    no_types: bool,
    no_schemas: bool,
    verbose: bool,
    log_level: str,
):
    """Extract SDK types and schemas from OpenAPI JSON files"""
    try:
        # Find config file (handles multiple locations)
        config_path = find_config_file(config)

        # Load configuration
        if config_path.exists():
            cfg = Config.from_file(config_path)
        else:
            click.echo(f"Configuration file not found: {config_path}", err=True)
            click.echo("Tried locations:", err=True)
            click.echo(f"  - {config_path}", err=True)
            click.echo(f"  - {Path.cwd() / '.cuur-coregen.json'}", err=True)
            click.echo(f"  - {Path.cwd() / 'packages' / 'codegen' / '.cuur-coregen.json'}", err=True)
            click.echo("", err=True)
            click.echo("Using default configuration...", err=True)
            # Find project root to ensure paths are correct regardless of working directory
            project_root = find_project_root(Path.cwd())
            cfg = Config.default(project_root)

        # Override log level and verbose
        cfg.log_level = LogLevel(log_level)
        cfg.verbose = verbose

        # Configure SDK layer for extraction only
        cfg.layers.sdk.enabled = True
        cfg.layers.sdk.generate_types = extract_types and not no_types
        cfg.layers.sdk.generate_schemas = extract_schemas and not no_schemas
        cfg.layers.sdk.generate_clients = False

        # Disable core layer (extraction only)
        cfg.layers.core.handlers.enabled = False
        cfg.layers.core.types.enabled = False
        cfg.layers.core.schemas_file.enabled = False
        cfg.layers.core.converters.enabled = False

        # Determine domains
        if all_domains:
            domains = [d.name for d in cfg.domains if d.enabled]
        elif domain:
            domains = list(domain)
        else:
            click.echo("Error: Must specify --domain or --all", err=True)
            return

        if not domains:
            click.echo("Error: No domains to extract", err=True)
            return

        # Create pipeline
        logger = create_logger(level=LogLevel(log_level), verbose=verbose)
        pipeline = Pipeline(cfg, logger)

        # Create options (skip build validation for extraction)
        options = PipelineOptions(
            clean=False,
            validate=False,
            skip_build=True,
        )

        # Execute pipeline
        result = pipeline.execute(domains, options)

        # Exit with appropriate code
        exit(0 if result.success else 1)

    except Exception as e:
        click.echo(f"Error: {str(e)}", err=True)
        exit(1)


@cli.command()
@click.option(
    "--output",
    "-o",
    type=click.Path(path_type=Path),
    default=Path(".codegen/.cuur-coregen.json"),
    help="Output configuration file path",
)
def init(output: Path):
    """
    Initialize configuration file.

    Creates a new .cuur-coregen.json configuration file.
    Default location: .codegen/.cuur-coregen.json

    Example:
      cuur-coregen init
      cuur-coregen init --output custom-config.json
    """
    if output.exists():
        if not click.confirm(f"Configuration file already exists: {output}. Overwrite?"):
            return

    # Find project root to ensure paths are correct regardless of working directory
    project_root = find_project_root(Path.cwd())
    config = Config.default(project_root)

    # Convert to dict for JSON serialization
    config_dict = config.model_dump(mode="json")

    # Write to file
    with open(output, "w") as f:
        json.dump(config_dict, f, indent=2, default=str)

    click.echo(f"Configuration file created: {output}")


if __name__ == "__main__":
    cli()
