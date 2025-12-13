"""
Configuration Loader - Centralized configuration loading with validation and caching
"""

from pathlib import Path
from typing import Optional
import json

from cuur_codegen.core.config import Config
from cuur_codegen.core.config_validator import ConfigValidator
from cuur_codegen.core.errors import ConfigurationError
from cuur_codegen.core.logger import Logger, create_logger


class ConfigLoader:
    """Centralized configuration loader with validation and caching"""

    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger or create_logger()
        self.validator = ConfigValidator(self.logger)
        self._cache: dict[str, Config] = {}

    def load_config(self, config_path: Optional[Path] = None) -> Config:
        """
        Load configuration from file with validation.

        Args:
            config_path: Optional path to config file. If None, searches for config.

        Returns:
            Validated Config object

        Raises:
            ConfigurationError: If configuration is invalid or not found
        """
        # Find config file if not provided
        if config_path is None:
            config_path = self.find_config_file()

        if config_path is None:
            raise ConfigurationError(
                "Configuration file not found. "
                "Please create .quub-codegen.json or run 'quub-codegen init'"
            )

        # Check cache
        cache_key = str(config_path.resolve())
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Load and validate
        self.logger.debug(f"Loading configuration from: {config_path}")
        config = self.validator.validate_config_file(config_path)

        # Cache the result
        self._cache[cache_key] = config

        return config

    @staticmethod
    def find_config_file() -> Optional[Path]:
        """
        Find configuration file in standard locations.

        Returns:
            Path to config file or None if not found
        """
        # Search locations in order of preference
        search_paths = [
            Path(".quub-codegen.json"),  # Current directory
            Path("platform/.quub-codegen.json"),  # Platform directory
        ]

        # Also search parent directories (up to 5 levels)
        current = Path.cwd()
        for _ in range(5):
            search_paths.append(current / ".quub-codegen.json")
            search_paths.append(current / "platform" / ".quub-codegen.json")
            if current.parent == current:  # Reached root
                break
            current = current.parent

        for path in search_paths:
            if path.exists():
                return path.resolve()

        return None

    def clear_cache(self) -> None:
        """Clear configuration cache"""
        self._cache.clear()
