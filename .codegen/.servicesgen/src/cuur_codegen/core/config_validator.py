"""
Configuration Validator - Validates configuration files and provides helpful error messages
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import ValidationError as PydanticValidationError

from cuur_codegen.core.config import Config, PathConfig, DomainConfig
from cuur_codegen.core.errors import ConfigurationError, ValidationError
from cuur_codegen.core.logger import Logger


class ConfigValidator:
    """Validates configuration files and provides helpful error messages"""

    def __init__(self, logger: Optional[Logger] = None):
        self.logger = logger

    def validate_config(self, config: Config) -> List[str]:
        """
        Validate a configuration object.

        Args:
            config: Configuration object to validate

        Returns:
            List of validation errors (empty if valid)
        """
        errors: List[str] = []

        # Validate paths
        errors.extend(self._validate_paths(config.paths))

        # Validate domains
        errors.extend(self._validate_domains(config.domains, config.paths))

        # Validate folder structure
        if config.folder_structure:
            errors.extend(self._validate_folder_structure(config.folder_structure, config.paths.project_root))

        return errors

    def _validate_paths(self, paths: PathConfig) -> List[str]:
        """Validate path configuration"""
        errors: List[str] = []

        # Check project root exists
        if not paths.project_root.exists():
            errors.append(f"Project root does not exist: {paths.project_root}")

        # Check OpenAPI directory exists
        if not paths.openapi_dir.exists():
            errors.append(f"OpenAPI directory does not exist: {paths.openapi_dir}")

        # Check bundled directory exists
        if not paths.bundled_dir.exists():
            errors.append(f"Bundled directory does not exist: {paths.bundled_dir}")

        return errors

    def _validate_domains(self, domains: List[DomainConfig], paths: PathConfig) -> List[str]:
        """Validate domain configurations"""
        errors: List[str] = []

        if not domains:
            errors.append("No domains configured")

        domain_names = set()
        for domain in domains:
            # Check for duplicate domain names
            if domain.name in domain_names:
                errors.append(f"Duplicate domain name: {domain.name}")
            domain_names.add(domain.name)

            # Check spec path exists if specified
            if domain.spec_path:
                spec_path = paths.openapi_dir / domain.spec_path
                if not spec_path.exists():
                    errors.append(f"Domain '{domain.name}': Spec file not found: {spec_path}")

            # Check bundled path exists if specified
            if domain.bundled_path:
                bundled_path = paths.bundled_dir / domain.bundled_path
                if not bundled_path.exists():
                    errors.append(f"Domain '{domain.name}': Bundled file not found: {bundled_path}")

        return errors

    def _validate_folder_structure(self, folder_structure: Any, project_root: Path) -> List[str]:
        """Validate folder structure configuration"""
        errors: List[str] = []

        # Check that base paths are valid
        for layer_name in ["services", "adapters", "tests", "orchestrators"]:
            layer_config = folder_structure.get_layer_config(layer_name)
            if layer_config:
                base_path = project_root / layer_config.base_path
                # Base path doesn't need to exist, but parent should
                if base_path.parent != project_root and not base_path.parent.exists():
                    errors.append(f"Layer '{layer_name}': Base path parent does not exist: {base_path.parent}")

        return errors

    @staticmethod
    def validate_config_file(config_path: Path) -> Config:
        """
        Load and validate a configuration file.

        Args:
            config_path: Path to configuration file

        Returns:
            Validated Config object

        Raises:
            ConfigurationError: If configuration is invalid
        """
        if not config_path.exists():
            raise ConfigurationError(f"Configuration file not found: {config_path}")

        try:
            config = Config.from_file(config_path)
        except PydanticValidationError as e:
            raise ConfigurationError(f"Invalid configuration file: {e}") from e
        except Exception as e:
            raise ConfigurationError(f"Failed to load configuration: {e}") from e

        # Validate the loaded config
        validator = ConfigValidator()
        errors = validator.validate_config(config)
        if errors:
            error_msg = "Configuration validation failed:\n" + "\n".join(f"  - {err}" for err in errors)
            raise ConfigurationError(error_msg)

        return config
