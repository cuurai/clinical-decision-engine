"""
Path Resolver - Configurable path resolution system

Provides flexible path resolution with:
- Multiple resolution strategies
- Fallback paths
- Path validation
- Cross-platform support
"""

from pathlib import Path
from typing import Optional, List, Callable, Dict, Any
from enum import Enum

from cuur_codegen.core.errors import FileSystemError
from cuur_codegen.core.logger import Logger


class PathResolutionStrategy(str, Enum):
    """Path resolution strategies"""

    STRICT = "strict"  # Fail if path doesn't exist
    FALLBACK = "fallback"  # Try fallback paths if primary doesn't exist
    CREATE = "create"  # Create path if it doesn't exist
    RELATIVE = "relative"  # Resolve relative to a base path


class PathResolver:
    """Configurable path resolver with multiple strategies"""

    def __init__(
        self,
        base_path: Optional[Path] = None,
        strategy: PathResolutionStrategy = PathResolutionStrategy.FALLBACK,
        fallback_paths: Optional[List[Path]] = None,
        logger: Optional[Logger] = None,
    ):
        """
        Initialize path resolver.

        Args:
            base_path: Base path for relative resolution
            strategy: Resolution strategy
            fallback_paths: Optional list of fallback paths
            logger: Optional logger instance
        """
        self.base_path = base_path or Path.cwd()
        self.strategy = strategy
        self.fallback_paths = fallback_paths or []
        self.logger = logger
        self._cache: Dict[str, Path] = {}

    def resolve(
        self,
        path: Path | str,
        must_exist: bool = False,
        create_if_missing: bool = False,
    ) -> Path:
        """
        Resolve a path using the configured strategy.

        Args:
            path: Path to resolve (can be relative or absolute)
            must_exist: Whether path must exist (default: False)
            create_if_missing: Whether to create path if missing (default: False)

        Returns:
            Resolved Path object

        Raises:
            FileSystemError: If path resolution fails
        """
        # Convert to Path if string
        if isinstance(path, str):
            path = Path(path)

        # Check cache
        cache_key = str(path)
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Resolve based on strategy
        resolved = self._resolve_path(path, must_exist, create_if_missing)
        self._cache[cache_key] = resolved
        return resolved

    def _resolve_path(
        self,
        path: Path,
        must_exist: bool,
        create_if_missing: bool,
    ) -> Path:
        """Internal path resolution logic"""
        # If absolute, use as-is
        if path.is_absolute():
            resolved = path
        else:
            # Resolve relative to base path
            resolved = self.base_path / path

        # Resolve to absolute path
        resolved = resolved.resolve()

        # Check existence
        if must_exist and not resolved.exists():
            # Try fallback paths if strategy allows
            if self.strategy == PathResolutionStrategy.FALLBACK:
                for fallback in self.fallback_paths:
                    fallback_resolved = fallback / path if not path.is_absolute() else path
                    fallback_resolved = fallback_resolved.resolve()
                    if fallback_resolved.exists():
                        if self.logger:
                            self.logger.debug(f"Using fallback path: {fallback_resolved}")
                        return fallback_resolved

            # Create if requested
            if create_if_missing or self.strategy == PathResolutionStrategy.CREATE:
                resolved.parent.mkdir(parents=True, exist_ok=True)
                if resolved.is_file():
                    resolved.touch()
                return resolved

            # Fail if strict strategy
            if self.strategy == PathResolutionStrategy.STRICT:
                raise FileSystemError(
                    f"Path does not exist: {resolved}",
                    file_path=resolved,
                    operation="resolve",
                )

        return resolved

    def resolve_relative(self, from_path: Path, to_path: Path) -> Path:
        """
        Resolve relative path from one location to another.

        Args:
            from_path: Source path
            to_path: Target path

        Returns:
            Relative Path object
        """
        from_abs = from_path.resolve() if not from_path.is_absolute() else from_path
        to_abs = to_path.resolve() if not to_path.is_absolute() else to_path

        try:
            return Path(to_abs).relative_to(from_abs.parent)
        except ValueError:
            # Paths are not relative, return absolute
            return to_abs

    def add_fallback(self, path: Path) -> None:
        """Add a fallback path"""
        self.fallback_paths.append(path.resolve())

    def clear_cache(self) -> None:
        """Clear path resolution cache"""
        self._cache.clear()


class ConfigurablePathResolver:
    """Path resolver configured from Config object"""

    def __init__(self, config: Any, logger: Optional[Logger] = None):
        """
        Initialize configurable path resolver.

        Args:
            config: Config object with paths configuration
            logger: Optional logger instance
        """
        self.config = config
        self.logger = logger

        # Create resolver with fallback strategy
        fallback_paths = []
        if hasattr(config, "paths"):
            project_root = config.paths.project_root
            # Add common fallback locations
            fallback_paths.extend([
                project_root.parent,  # Parent directory
                project_root.parent / "packages" / "core" / "src",  # Core package
            ])

        self.resolver = PathResolver(
            base_path=config.paths.project_root if hasattr(config, "paths") else Path.cwd(),
            strategy=PathResolutionStrategy.FALLBACK,
            fallback_paths=fallback_paths,
            logger=logger,
        )

    def resolve_output_path(
        self,
        layer: str,
        domain_name: str,
        generator_type: str,
        resource: Optional[str] = None,
    ) -> Path:
        """
        Resolve output path for a generator.

        Args:
            layer: Layer name (e.g., "services", "adapters")
            domain_name: Domain name
            generator_type: Generator type
            resource: Optional resource name

        Returns:
            Resolved output path
        """
        if not hasattr(self.config, "folder_structure"):
            raise FileSystemError("Config does not have folder_structure")

        folder_structure = self.config.folder_structure
        project_root = self.config.paths.project_root

        return folder_structure.get_layer_output_path(
            project_root=project_root,
            layer=layer,
            domain_name=domain_name,
            generator_type=generator_type,
            resource=resource,
        )

    def resolve_core_package_path(self) -> Path:
        """
        Resolve path to core package with fallback.

        Returns:
            Path to core package
        """
        project_root = self.config.paths.project_root

        # Try primary location
        core_path = project_root / "packages" / "core" / "src"
        if core_path.exists():
            return core_path

        # Try fallback location
        fallback_path = project_root.parent / "packages" / "core" / "src"
        if fallback_path.exists():
            if self.logger:
                self.logger.debug(f"Using fallback core package path: {fallback_path}")
            return fallback_path

        # Return primary even if it doesn't exist (will be created)
        return core_path
