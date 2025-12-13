"""
Plugin System - Extensible plugin architecture for generators and builders
"""

from typing import Dict, Type, Optional, List, Protocol, Any
from pathlib import Path
import importlib
import inspect

from cuur_codegen.core.generator import BaseGenerator
from cuur_codegen.core.logger import Logger
from cuur_codegen.base.builder import Builder


class PluginMetadata:
    """Metadata for a plugin"""

    def __init__(
        self,
        name: str,
        version: str,
        description: str,
        plugin_type: str,
        entry_point: str,
    ):
        self.name = name
        self.version = version
        self.description = description
        self.plugin_type = plugin_type  # "generator" or "builder"
        self.entry_point = entry_point  # Module path or class name


class PluginLoader:
    """Loads and manages plugins"""

    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger
        self._loaded_plugins: Dict[str, Any] = {}

    def load_plugin(self, plugin_path: str, plugin_type: str) -> Optional[Any]:
        """
        Load a plugin from a module path.

        Args:
            plugin_path: Module path (e.g., "cuur_codegen.generators.services.service.ServiceGenerator")
            plugin_type: Type of plugin ("generator" or "builder")

        Returns:
            Plugin class or None if loading failed
        """
        if plugin_path in self._loaded_plugins:
            return self._loaded_plugins[plugin_path]

        try:
            # Split module path and class name
            if "." in plugin_path:
                module_path, class_name = plugin_path.rsplit(".", 1)
            else:
                raise ValueError(f"Invalid plugin path: {plugin_path}")

            # Import module
            module = importlib.import_module(module_path)

            # Get class
            plugin_class = getattr(module, class_name, None)
            if plugin_class is None:
                raise AttributeError(f"Class '{class_name}' not found in module '{module_path}'")

            # Validate plugin type
            if plugin_type == "generator":
                if not issubclass(plugin_class, BaseGenerator):
                    raise TypeError(f"Plugin '{plugin_path}' is not a BaseGenerator")
            elif plugin_type == "builder":
                if not inspect.isclass(plugin_class):
                    raise TypeError(f"Plugin '{plugin_path}' is not a class")

            self._loaded_plugins[plugin_path] = plugin_class
            return plugin_class

        except Exception as e:
            if self.logger:
                self.logger.error(f"Failed to load plugin '{plugin_path}': {e}")
            return None

    def load_plugins_from_config(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Load plugins from configuration dictionary.

        Args:
            config: Configuration dict with plugin definitions

        Returns:
            Dictionary of plugin_type -> plugin_class
        """
        plugins = {}
        plugin_configs = config.get("plugins", {})

        for plugin_type, plugin_defs in plugin_configs.items():
            if isinstance(plugin_defs, dict):
                for plugin_name, plugin_path in plugin_defs.items():
                    plugin_class = self.load_plugin(plugin_path, plugin_type)
                    if plugin_class:
                        plugins[f"{plugin_type}.{plugin_name}"] = plugin_class

        return plugins


class PluginRegistry:
    """Registry for plugins with metadata"""

    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger
        self.loader = PluginLoader(logger)
        self._plugins: Dict[str, PluginMetadata] = {}
        self._instances: Dict[str, Any] = {}

    def register_plugin(
        self,
        plugin_id: str,
        plugin_class: Type[Any],
        metadata: Optional[PluginMetadata] = None,
    ) -> None:
        """
        Register a plugin.

        Args:
            plugin_id: Unique identifier for the plugin
            plugin_class: Plugin class
            metadata: Optional metadata
        """
        if metadata is None:
            # Try to extract metadata from class
            metadata = PluginMetadata(
                name=getattr(plugin_class, "__name__", plugin_id),
                version=getattr(plugin_class, "version", "1.0.0"),
                description=getattr(plugin_class, "__doc__", "").split("\n")[0] if plugin_class.__doc__ else "",
                plugin_type="generator" if issubclass(plugin_class, BaseGenerator) else "builder",
                entry_point=f"{plugin_class.__module__}.{plugin_class.__name__}",
            )

        self._plugins[plugin_id] = metadata

    def get_plugin(self, plugin_id: str, instantiate: bool = True) -> Optional[Any]:
        """
        Get a plugin instance.

        Args:
            plugin_id: Plugin identifier
            instantiate: Whether to instantiate if not already instantiated

        Returns:
            Plugin instance or None
        """
        if plugin_id in self._instances:
            return self._instances[plugin_id]

        metadata = self._plugins.get(plugin_id)
        if not metadata:
            return None

        # Load plugin class
        plugin_class = self.loader.load_plugin(metadata.entry_point, metadata.plugin_type)
        if not plugin_class:
            return None

        # Instantiate if requested
        if instantiate:
            if issubclass(plugin_class, BaseGenerator):
                instance = plugin_class(self.logger)
            else:
                instance = plugin_class()
            self._instances[plugin_id] = instance
            return instance

        return plugin_class

    def list_plugins(self, plugin_type: Optional[str] = None) -> List[PluginMetadata]:
        """
        List all registered plugins.

        Args:
            plugin_type: Optional filter by plugin type

        Returns:
            List of plugin metadata
        """
        plugins = list(self._plugins.values())
        if plugin_type:
            plugins = [p for p in plugins if p.plugin_type == plugin_type]
        return plugins
