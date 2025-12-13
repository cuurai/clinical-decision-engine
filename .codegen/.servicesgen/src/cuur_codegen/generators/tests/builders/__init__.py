"""
Test generator builders
"""

from .repository_discovery import RepositoryDiscovery, RepositoryInfo
from .handler_discovery import HandlerDiscovery, HandlerInfo
from .factory_builder import FactoryBuilder
from .flow_discovery import FlowDiscovery, FlowInfo
from .test_constants import TestConstants, generate_test_constants
from .mock_repository_builder import MockRepositoryBuilder
from .mock_dependencies_builder import MockDependenciesBuilder
from .test_setup_builder import TestSetupBuilder
from .test_case_builders import TestCaseBuilders
from .handler_test_builder import HandlerTestBuilder
from .flow_test_builder import FlowTestBuilder
from .test_index_builder import TestIndexBuilder
from .package_json_builder import PackageJsonBuilder
from .package_json_constants import (
    SHARED_DEPENDENCIES,
    ORCHESTRATOR_DEPENDENCIES,
    SHARED_DEV_DEPENDENCIES,
    ORCHESTRATOR_DEV_DEPENDENCIES,
    TEST_SCRIPTS,
    get_dependencies,
    get_dev_dependencies,
)
# TestTsConfigBuilder removed - tsconfig.json not generated per-domain
# VitestConfigBuilder removed - vitest.config.ts not generated per-domain (use shared config)

__all__ = [
    "FactoryBuilder",
    "RepositoryDiscovery",
    "RepositoryInfo",
    "HandlerDiscovery",
    "HandlerInfo",
    "FlowDiscovery",
    "FlowInfo",
    "TestConstants",
    "generate_test_constants",
    "MockRepositoryBuilder",
    "MockDependenciesBuilder",
    "TestSetupBuilder",
    "TestCaseBuilders",
    "HandlerTestBuilder",
    "FlowTestBuilder",
    "TestIndexBuilder",
    "PackageJsonBuilder",
    "SHARED_DEPENDENCIES",
    "ORCHESTRATOR_DEPENDENCIES",
    "SHARED_DEV_DEPENDENCIES",
    "ORCHESTRATOR_DEV_DEPENDENCIES",
    "TEST_SCRIPTS",
    "get_dependencies",
    "get_dev_dependencies",
]
