# ServicesGen Documentation

**Last Updated**: December 2024

## Overview

ServicesGen is a code generation system that generates TypeScript code for Services, Adapters (including Prisma), Tests, and Orchestrators. It follows a modular, configuration-driven architecture with a plugin-based generator system.

## Quick Links

### Getting Started
- **[AI Agent Usage Guide](./AI_AGENT_USAGE.md)** - CLI usage and common commands
- **[Current State Summary](./CURRENT_STATE_SUMMARY.md)** - Quick reference for current architecture

### Architecture & Design
- **[Architecture Overview](./ARCHITECTURE.md)** - System architecture and design principles
- **[AI Agent Maintenance Guide](./AI_AGENT_MAINTENANCE.md)** - Generator architecture and maintenance
- **[Pipeline Layer Configuration](./PIPELINE_LAYER_CONFIGURATION.md)** - Layer configuration guide
- **[Layer Configuration](./LAYERS_CONFIG.md)** - Layer-specific settings

### Test Generation
- **[Test Generator Documentation](./TEST_GENERATOR.md)** - Comprehensive test generator guide
- **[Test Factory Architecture](./TEST_FACTORY_ARCHITECTURE.md)** - Layered factory architecture overview
- **[Orchestrator Factory Strategy](./ORCHESTRATOR_FACTORY_STRATEGY.md)** - Factory composition strategy (implemented)
- **[Schema-Driven Factories](./SCHEMA_DRIVEN_FACTORIES.md)** - Schema introspection details

### Code Standards
- **[Import Rules](./IMPORT_RULES.md)** - Import path conventions
- **[Naming Conventions](./NAMING_CONVENTIONS.md)** - Python and TypeScript naming standards
- **[File Naming Convention](./FILE_NAMING_CONVENTION.md)** - File naming patterns

### Historical & Reference
- **[Orchestrator Flow Enhancements](./ORCHESTRATOR_FLOW_ENHANCEMENTS.md)** - Business scenario enhancements
- **[Pipeline Refactoring Summary](./PIPELINE_REFACTORING_SUMMARY.md)** - Previous refactoring efforts
- **[Refactoring Summary](./REFACTORING_SUMMARY.md)** - General refactoring notes
- **[Migration Guide](./MIGRATION.md)** - Migration instructions

### Analysis & Recommendations
- **[API Modeling Root Causes](./API_MODELING_ROOT_CAUSES.md)** - API modeling analysis
- **[API Schema Issues Remaining](./API_SCHEMA_ISSUES_REMAINING.md)** - Known schema issues
- **[API Standardization Impact](./API_STANDARDIZATION_IMPACT.md)** - Standardization analysis
- **[Strategic Recommendation](./STRATEGIC_RECOMMENDATION.md)** - Strategic guidance
- **[Test Drift Analysis](./TEST_DRIFT_ANALYSIS.md)** - Test generation analysis

### Technical Details
- **[Generator Fixes Patterns](./GENERATOR_FIXES_PATTERNS.md)** - Common fix patterns
- **[Generator Fixes Summary](./GENERATOR_FIXES_SUMMARY.md)** - Fix history
- **[Import Audit](./IMPORT_AUDIT.md)** - Import path audit
- **[Repository Base Options](./REPOSITORY_BASE_OPTIONS.md)** - Repository configuration
- **[Data Passing Proposal](./DATA_PASSING_PROPOSAL.md)** - Data passing design

### Issue Tracking
- **[THU-27 API Schema Discrepancies](./THU-27-API_SCHEMA_DISCREPANCIES.md)** - Schema discrepancy tracking

## Key Concepts

### Domain Types

1. **Core Domains** (27 domains)
   - Technical service domains (e.g., `auth`, `identity`, `exchange`, `blockchain`)
   - Defined in `.servicesgen/config/.core-domains.yaml`
   - Generate: Services, Adapters, Entity Factories

2. **Orchestrator Domains** (30 domains)
   - Business-scenario-driven API aggregation layer
   - Defined in `.servicesgen/config/.orchestrator-domains.yaml`
   - Generate: Flows, Routes, Handler Response Factories, Flow Factories

### Layers

1. **Services Layer** (`--layer services`)
   - Generates Fastify-based microservices
   - Output: `platform/services/src/{domain}/`

2. **Adapters Layer** (`--layer adapters`)
   - Generates DAO repository implementations
   - Includes Prisma schema generation
   - Output: `platform/adapters/src/{domain}/`

3. **Tests Layer** (`--layer tests`)
   - **Core Domains**: Entity factories in `platform/tests/src/core/{domain}/`
   - **Orchestrator Domains**: Flow tests and factories in `platform/tests/src/orchestrators/{domain}/`

4. **Orchestrators Layer** (`--layer orchestrators`)
   - Generates orchestrator domain structure
   - Output: `platform/orchestrators/domains/src/{domain}/`

## Architecture Highlights

### Layered Factory Pattern

The test generator implements a three-layer factory architecture:

1. **Core Domain Entity Factories** - Single source of truth for entity generation
2. **Handler Response Factories** - Wrap entities in DataEnvelope structure
3. **Flow Factories** - Compose handler response factories

See [Test Factory Architecture](./TEST_FACTORY_ARCHITECTURE.md) for details.

### Schema-Driven Generation

- Uses Zod schema introspection as primary source
- Minimal YAML config for overrides only
- No hardcoded business logic

See [Schema-Driven Factories](./SCHEMA_DRIVEN_FACTORIES.md) for details.

### Path Resolution

- Handles `project_root` being `platform/` vs repo root
- Correct routing: core domains → `tests/src/core/`, orchestrator domains → `tests/src/orchestrators/`
- Import paths use `@cuur/factories` alias

## Common Commands

```bash
# Generate all tests (core + orchestrator)
cuur-codegen generate --all --layer tests --no-build --clean

# Generate core domain factories
cuur-codegen generate --domain identity --layer tests

# Generate orchestrator tests
cuur-codegen generate --domain onboarding-identity --layer tests

# Generate services and adapters
cuur-codegen generate --all --layer services --layer adapters --no-build
```

## Documentation Status

✅ **Up to Date**:
- AI Agent Usage Guide
- AI Agent Maintenance Guide
- Test Generator Documentation
- Test Factory Architecture
- Orchestrator Factory Strategy
- Current State Summary
- Schema-Driven Factories (includes advanced field generation patterns)

📝 **Needs Review**:
- Architecture Overview (updated terminology)
- Pipeline Layer Configuration (updated terminology)
- Layer Configuration (may need updates)

## Contributing

When updating documentation:

1. Use "core domains" terminology (not "raw domains")
2. Update paths to reflect current structure:
   - Core domains: `platform/tests/src/core/{domain}/`
   - Orchestrator domains: `platform/tests/src/orchestrators/{domain}/`
3. Reference current architecture (layered factories, schema-driven generation)
4. Update examples to use current import paths (`@cuur/factories/*`)

## Related Resources

- **Generator Code**: `.servicesgen/src/cuur_codegen/`
- **Configuration**: `.servicesgen/config/`
- **CLI**: `cuur-codegen` command
