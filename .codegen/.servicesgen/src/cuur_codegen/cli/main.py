"""
CLI entry point using Click

This is a proper tier-1 CLI implementation:
- Uses standard Python entry points (configured in pyproject.toml)
- Installed via: pip install -e .
- CLI command: cuur-codegen
"""

from pathlib import Path
from typing import Optional
import click
import json

from cuur_codegen.core.config import Config, LogLevel
from cuur_codegen.core.logger import create_logger
from cuur_codegen.pipeline.pipeline import Pipeline, PipelineOptions


def find_config_file(default_path: Path) -> Path:
    """
    Find config file by checking multiple locations:
    1. Default path relative to current directory
    2. If in platform/, check .cuur-codegen.json in current dir
    3. If in project root, check platform/.cuur-codegen.json
    4. Walk up directories to find project root
    """
    # Check if default path exists
    if default_path.exists():
        return default_path

    # Check if we're in platform/ and config is in current dir
    cwd = Path.cwd()
    local_config = cwd / ".cuur-codegen.json"
    if local_config.exists():
        return local_config

    # Check if we're in project root
    root_config = cwd / "platform" / ".cuur-codegen.json"
    if root_config.exists():
        return root_config

    # Walk up directories to find project root (has platform/ directory)
    current = cwd
    for _ in range(5):  # Limit to 5 levels up
        test_path = current / "platform" / ".cuur-codegen.json"
        if test_path.exists():
            return test_path
        parent = current.parent
        if parent == current:  # Reached filesystem root
            break
        current = parent

    # Return default path (will show error if doesn't exist)
    return default_path


@click.group()
@click.version_option(version="1.0.0", prog_name="cuur-codegen")
def cli():
    """
    Quub CodeGen - Services, Adapters, and Tests code generator

    Configuration file location:
      Default: .cuur-codegen.json (in current directory or platform/)

    The config file can be located in:
    - Current directory: .cuur-codegen.json
    - platform/ directory: platform/.cuur-codegen.json
    - Project root: platform/.cuur-codegen.json

    All paths in the config are relative to the config file's location.

    To initialize a new config file:
      cuur-codegen init

    To use a custom config file:
      cuur-codegen generate --config /path/to/config.json
    """
    pass


def _process_layer_selection(layer: tuple[str, ...], config: Config) -> list[str]:
    """Process layer selection from CLI"""
    if not layer:
        # No layer specified - use config defaults
        return []

    if "all" in layer:
        return ["adapters", "services", "tests", "orchestrators"]

    # Validate and return selected layers (servicesgen only supports these)
    valid_layers = []
    for l in layer:
        if l in ["adapters", "services", "tests", "orchestrators"]:
            if l not in valid_layers:  # Avoid duplicates
                valid_layers.append(l)

    return valid_layers


@cli.command()
@click.option(
    "--config",
    "-c",
    type=click.Path(path_type=Path),
    default=Path(".cuur-codegen.json"),
    help="Configuration file path (default: .cuur-codegen.json)",
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
    "--layer",
    "-l",
    multiple=True,
    type=click.Choice(["adapters", "services", "tests", "orchestrators", "all"]),
    help="Layer(s) to generate: adapters (includes Prisma schema generation), services, tests, orchestrators, or all",
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
def generate(
    config: Path,
    domain: tuple[str, ...],
    all_domains: bool,
    layer: tuple[str, ...],
    clean: bool,
    no_build: bool,
    verbose: bool,
    log_level: str,
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
            click.echo(f"  - {Path.cwd() / '.cuur-codegen.json'}", err=True)
            click.echo(f"  - {Path.cwd() / 'platform' / '.cuur-codegen.json'}", err=True)
            click.echo("", err=True)
            click.echo("Using default configuration...", err=True)
            cfg = Config.default(Path.cwd())

        # Override log level and verbose
        cfg.log_level = LogLevel(log_level)
        cfg.verbose = verbose

        # Process layer selection FIRST (needed to determine domain expansion)
        layers_to_generate = _process_layer_selection(layer, cfg)
        is_orchestrator_layer = "orchestrators" in layers_to_generate

        # Determine domains
        if all_domains:
            if is_orchestrator_layer:
                # For orchestrator layer, pass ["all"] and let pipeline load orchestrator domains
                domains = ["all"]
            elif "tests" in layers_to_generate:
                # For tests layer, pass ["all"] and let pipeline resolve orchestrator domains
                # (tests layer only generates tests for orchestrator flows, not core domain handlers)
                domains = ["all"]
            else:
                # For core domains, expand to all enabled domains
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
            layers=layers_to_generate,
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
    default=Path(".cuur-codegen.json"),
    help="Configuration file path (default: .cuur-codegen.json)",
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
    "--layer",
    "-l",
    multiple=True,
    type=click.Choice(["adapters", "services", "tests", "orchestrators", "all"]),
    help="Layer(s) to generate: adapters (includes Prisma schema generation), services, tests, orchestrators, or all",
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
    layer: tuple[str, ...],
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
        layer=layer,
        clean=clean,
        no_build=no_build,
        verbose=verbose,
        log_level=log_level,
    )


@cli.command()
@click.option(
    "--output",
    "-o",
    type=click.Path(path_type=Path),
    default=Path(".cuur-codegen.json"),
    help="Output configuration file path",
)
def init(output: Path):
    """
    Initialize configuration file.

    Creates a new .cuur-codegen.json configuration file.
    Default location: .cuur-codegen.json

    Example:
      cuur-codegen init
      cuur-codegen init --output custom-config.json
    """
    if output.exists():
        if not click.confirm(f"Configuration file already exists: {output}. Overwrite?"):
            return

    config = Config.default(Path.cwd())

    # Convert to dict for JSON serialization
    config_dict = config.model_dump(mode="json")

    # Write to file
    with open(output, "w") as f:
        json.dump(config_dict, f, indent=2, default=str)

    click.echo(f"Configuration file created: {output}")


if __name__ == "__main__":
    cli()
