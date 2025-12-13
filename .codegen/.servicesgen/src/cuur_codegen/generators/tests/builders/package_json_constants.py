"""
Package.json Constants for Test Packages

Centralized dependency definitions for all test package.json files.
Update dependencies here to automatically update all test packages.
"""

# Shared dependencies for all test packages
SHARED_DEPENDENCIES = {
    "@cuur/core": "workspace:*",
    "@quub/factories": "workspace:*",
    "@prisma/client": "^6.0.1",
    "jsonwebtoken": "^9.0.2",
}

# Additional dependencies for orchestrator test domains
ORCHESTRATOR_DEPENDENCIES = {
    "pino": "^8.16.0",
    "pino-pretty": "^10.2.3",
    "zod": "^3.22.4",
}

# Shared dev dependencies for all test packages
SHARED_DEV_DEPENDENCIES = {
    "@types/node": "^20.0.0",
    "@types/jsonwebtoken": "^9.0.6",
    "@testcontainers/postgresql": "^11.0.0",
    "typescript": "^5.3.3",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^1.0.0",
}

# Additional dev dependencies for orchestrator test domains
ORCHESTRATOR_DEV_DEPENDENCIES = {
    "@types/pino-pretty": "^5.0.0",
}

# Test scripts (same for all packages)
TEST_SCRIPTS = {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
}


def get_dependencies(is_orchestrator_domain: bool = False) -> dict:
    """
    Get dependencies for a test package.

    Args:
        is_orchestrator_domain: Whether this is an orchestrator domain

    Returns:
        Dictionary of dependencies
    """
    deps = SHARED_DEPENDENCIES.copy()
    if is_orchestrator_domain:
        deps.update(ORCHESTRATOR_DEPENDENCIES)
    return deps


def get_dev_dependencies(is_orchestrator_domain: bool = False) -> dict:
    """
    Get dev dependencies for a test package.

    Args:
        is_orchestrator_domain: Whether this is an orchestrator domain

    Returns:
        Dictionary of dev dependencies
    """
    dev_deps = SHARED_DEV_DEPENDENCIES.copy()
    if is_orchestrator_domain:
        dev_deps.update(ORCHESTRATOR_DEV_DEPENDENCIES)
    return dev_deps

