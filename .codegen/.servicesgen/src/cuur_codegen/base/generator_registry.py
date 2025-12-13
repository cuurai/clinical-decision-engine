"""
Generator Registry - Plugin architecture for generators

Enhanced with:
- Plugin support via PluginRegistry
- Configuration-based registration
- Metadata tracking
- Lazy loading
"""

from typing import Dict, Type, Optional, List, Any
from cuur_codegen.core.generator import BaseGenerator
from cuur_codegen.core.logger import Logger
from cuur_codegen.base.plugin_system import PluginRegistry, PluginMetadata


class GeneratorRegistry:
    """Registry for generators - enables plugin architecture with enhanced features"""

    def __init__(self, logger: Optional[Logger] = None):
        """
        Initialize the generator registry.

        Args:
            logger: Optional logger instance
        """
        self.logger = logger
        self._generators: Dict[str, BaseGenerator] = {}
        self._generator_classes: Dict[str, Type[BaseGenerator]] = {}
        self._metadata: Dict[str, PluginMetadata] = {}
        self._plugin_registry = PluginRegistry(logger)

    def register(
        self,
        generator_type: str,
        generator_class: Type[BaseGenerator],
        instantiate: bool = True,
        metadata: Optional[PluginMetadata] = None,
    ) -> None:
        """
        Register a generator class.

        Args:
            generator_type: Unique identifier for the generator (e.g., "service", "adapter", "test")
            generator_class: Generator class (must inherit from BaseGenerator)
            instantiate: Whether to instantiate immediately (default: True)
            metadata: Optional plugin metadata
        """
        # Validate generator class
        if not issubclass(generator_class, BaseGenerator):
            raise TypeError(f"Generator class must inherit from BaseGenerator: {generator_class}")

        self._generator_classes[generator_type] = generator_class

        # Create metadata if not provided
        if metadata is None:
            metadata = PluginMetadata(
                name=getattr(generator_class, "name", generator_type),
                version=getattr(generator_class, "version", "1.0.0"),
                description=getattr(generator_class, "__doc__", "").split("\n")[0] if generator_class.__doc__ else "",
                plugin_type="generator",
                entry_point=f"{generator_class.__module__}.{generator_class.__name__}",
            )
        self._metadata[generator_type] = metadata

        # Register in plugin registry
        self._plugin_registry.register_plugin(generator_type, generator_class, metadata)

        # Instantiate if requested
        if instantiate:
            self._generators[generator_type] = generator_class(self.logger)

    def register_from_config(self, config: Dict[str, Any]) -> None:
        """
        Register generators from configuration.

        Args:
            config: Configuration dictionary with generator definitions
        """
        generators_config = config.get("generators", {})
        for generator_type, generator_path in generators_config.items():
            plugin_class = self._plugin_registry.loader.load_plugin(generator_path, "generator")
            if plugin_class:
                self.register(generator_type, plugin_class, instantiate=False)

    def get(self, generator_type: str, lazy: bool = True) -> Optional[BaseGenerator]:
        """
        Get a generator instance.

        Args:
            generator_type: Generator type identifier
            lazy: Whether to lazy-load if not instantiated (default: True)

        Returns:
            Generator instance or None if not found
        """
        # Return existing instance if available
        if generator_type in self._generators:
            return self._generators[generator_type]

        # Lazy instantiation if enabled
        if lazy:
            generator_class = self._generator_classes.get(generator_type)
            if generator_class:
                self._generators[generator_type] = generator_class(self.logger)
                return self._generators[generator_type]

        return None

    def get_all(self, lazy: bool = True) -> Dict[str, BaseGenerator]:
        """
        Get all registered generator instances.

        Args:
            lazy: Whether to lazy-load uninstantiated generators

        Returns:
            Dictionary of generator_type -> generator_instance
        """
        if lazy:
            # Ensure all registered classes are instantiated
            for generator_type, generator_class in self._generator_classes.items():
                if generator_type not in self._generators:
                    self._generators[generator_type] = generator_class(self.logger)

        return self._generators.copy()

    def get_types(self) -> List[str]:
        """
        Get list of all registered generator types.

        Returns:
            List of generator type identifiers
        """
        return list(self._generator_classes.keys())

    def is_registered(self, generator_type: str) -> bool:
        """
        Check if a generator type is registered.

        Args:
            generator_type: Generator type identifier

        Returns:
            True if registered, False otherwise
        """
        return generator_type in self._generator_classes

    def get_metadata(self, generator_type: str) -> Optional[PluginMetadata]:
        """
        Get metadata for a generator.

        Args:
            generator_type: Generator type identifier

        Returns:
            PluginMetadata or None if not found
        """
        return self._metadata.get(generator_type)

    def list_generators(self) -> List[PluginMetadata]:
        """
        List all registered generators with metadata.

        Returns:
            List of generator metadata
        """
        return list(self._metadata.values())
