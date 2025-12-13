# Proper CLI Installation Guide

## Tier-1 Grade CLI Implementation

The `cuur-coregen` CLI uses standard Python entry points configured in `pyproject.toml`:

```toml
[project.scripts]
cuur-coregen = "cuur_codegen.cli.main:cli"
```

This is a **proper, production-grade** CLI implementation following Python packaging best practices.

## Installation Methods

### Method 1: Global Editable Install (Development)

```bash
cd .codegen
pip install -e .
```

**Pros:**
- CLI available globally: `cuur-coregen`
- Editable - changes reflect immediately
- Simple setup

**Cons:**
- May conflict with other Python packages
- Requires system-wide Python access

### Method 2: Virtual Environment (Recommended)

```bash
cd .codegen
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -e .
```

**Pros:**
- Isolated environment
- No conflicts with other packages
- Best practice for Python development

**Cons:**
- Need to activate venv before use
- CLI only available when venv is active

### Method 3: Project-Level Wrapper (Alternative)

If you prefer not to install globally, you can use:

```bash
cd .codegen
PYTHONPATH=.codegen/src python3 -m cuur_codegen.cli.main generate --domain auth --layer core --bundle
```

Or create a project-level script (not recommended for production):

```bash
# In project root
cat > cuur-coregen << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
PYTHONPATH=.codegen/src python3 -m cuur_codegen.cli.main "$@"
EOF
chmod +x cuur-coregen
```

## Troubleshooting

### Old Package Being Loaded

If you see warnings about `.servicesgen` or old package paths, Python is loading an old installation.

**Solution:**
1. Uninstall old packages: `pip uninstall quub-codegen cuur-coregen`
2. Reinstall: `cd .codegen && pip install -e .`
3. Use a virtual environment (Method 2) to avoid conflicts
4. Or use PYTHONPATH method: `PYTHONPATH=.codegen/src python3 -m cuur_codegen.cli.main`

### CLI Not Found

If `cuur-coregen` command is not found:

1. Verify installation: `pip show cuur-coregen`
2. Check PATH: `which cuur-coregen`
3. Reinstall: `pip install -e . --force-reinstall`

## Verification

After installation, verify:

```bash
cuur-coregen --version
cuur-coregen --help
cuur-coregen generate --help
```

Expected output:
```
cuur-coregen, version 1.0.0
Usage: cuur-coregen [OPTIONS] COMMAND [ARGS]...
```

## Production Deployment

For production, use a proper Python package installation:

```bash
pip install cuur-coregen
# Or from git
pip install git+https://github.com/quub-fi/quub-exchange-core.git#subdirectory=packages/codegen
```
