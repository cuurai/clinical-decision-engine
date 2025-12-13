# ServicesGen Configuration Files

This directory contains configuration files for the ServicesGen code generator.

## Configuration Files

### Raw Domains Configuration
**File**: `.raw-domains.yaml`

Simple list of technical service domains (raw domains).

**Format**:
```yaml
domains:
  - auth
  - blockchain
  - exchange
```

**Used by**: Services, Adapters, Tests generators

### Orchestrator Domains Configuration
**File**: `.orchestrator-domains.yaml`

Simple mapping of orchestrator domains to raw domains.

**Format**:
```yaml
orchestratorDomains:
  - name: accounts-funding
    rawDomains: [accounts, fiat-banking]

  - name: analytics-dashboard
    rawDomains: [business-intelligence]
```

**Used by**: Orchestrator generators (aggregators, routes, clients)

## Maintenance

### Adding/Removing Raw Domains
Simply add or remove domain names from the `domains` list:
```yaml
domains:
  - auth
  - blockchain
  - new-domain  # Add here
```

### Adding/Removing Orchestrator Domains
Add or remove entries and map to raw domains:
```yaml
orchestratorDomains:
  - name: new-orchestrator
    rawDomains: [auth, exchange]
```

### Advanced Configuration (Optional)

Both config files support advanced object format if needed:

**Raw Domains** (optional fields):
```yaml
domains:
  - name: auth
    enabled: true
    description: "Authentication service"
    specPath: "custom-auth.yaml"
```

**Orchestrator Domains** (optional fields):
```yaml
orchestratorDomains:
  - name: accounts-funding
    displayName: "Accounts & Funding"
    description: "Business scenario description"
    rawDomains:
      - name: accounts
        operations: ["getAccount", "createAccount"]
        required: true
    aggregators:
      - name: FundingOverview
        description: "Combines account and funding data"
        rawDomainCalls:
          - domain: accounts
            operation: getAccount
```

## File Discovery

The generator automatically discovers config files in this order:
1. `.servicesgen/config/` (this directory) - **Preferred location**
2. Legacy platform locations (for backward compatibility)

## Documentation

For detailed structure and usage:
- Raw domains: See `src/cuur_codegen/core/raw_domains_config.py`
- Orchestrator domains: See `src/cuur_codegen/generators/orchestrators/config_reader.py`
