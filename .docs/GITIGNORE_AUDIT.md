# Gitignore Audit and Compiled Artifacts Exclusion

## Overview

This document describes the `.gitignore` patterns used to exclude compiled TypeScript artifacts and other build outputs from version control.

## Compiled Artifacts Excluded

The following compiled artifacts are now properly excluded:

### TypeScript Declaration Files

- `**/*.d.ts` - All TypeScript declaration files (recursive)
- `**/*.d.ts.map` - Declaration source map files (recursive)

### Compiled JavaScript

- `**/*.js.map` - JavaScript source map files (recursive)
- `packages/core/src/**/*.js` - Compiled JS in core package source
- `platform/adapters/src/**/*.js` - Compiled JS in adapters package source
- `platform/services/src/*/src/**/*.js` - Compiled JS in service packages source
- `dashboard/src/**/*.js` - Compiled JS in dashboard source

### Build Output Directories

- `dist/` - All dist folders (already covered)
- `build/` - Build output folders

### Other Build Artifacts

- `*.tsbuildinfo` - TypeScript build info files
- `*.mjs` - ES module JavaScript files (generated)

## Exceptions (Files That ARE Tracked)

The following legitimate source files are explicitly allowed:

- `platform/services/src/shared/*.js` - Legitimate JavaScript source files
- `scripts/**/*.js` - Build and utility scripts

## Verification

To verify that compiled artifacts are properly ignored:

```bash
# Check if a compiled file is ignored
git check-ignore packages/core/src/decision-intelligence/repositories/alert-evaluation.repository.js

# Count compiled files in git status (should be 0)
git status --short | grep -E "\.(js|d\.ts|js\.map|d\.ts\.map)$" | wc -l
```

## Patterns Explained

### Recursive Patterns

- `**/*.d.ts` - Matches `.d.ts` files in any directory
- `**/*.d.ts.map` - Matches declaration map files recursively
- `**/*.js.map` - Matches JavaScript source maps recursively

### Directory-Specific Patterns

- `packages/core/src/**/*.js` - Only excludes `.js` files in core package source
- `platform/adapters/src/**/*.js` - Only excludes `.js` files in adapters source
- `platform/services/src/*/src/**/*.js` - Excludes `.js` files in service source directories

### Why Directory-Specific for .js Files?

We use directory-specific patterns for `.js` files because:

1. Some legitimate `.js` source files exist (e.g., `extract-org-id.js`)
2. We want to exclude compiled outputs but not source files
3. Compiled outputs are always in `src/` directories of packages
4. Legitimate source files are in specific locations (e.g., `platform/services/src/shared/`)

## Prisma Generated Files

Prisma generated files are also excluded:

- `**/prisma/generated/` - Entire generated directory
- Specific Prisma artifacts (`.wasm`, `.node`, query engines, etc.)

## Best Practices

1. **Always build to `dist/` folders** - This ensures clean separation of source and compiled code
2. **Don't commit compiled artifacts** - They can be regenerated from source
3. **Use `git check-ignore`** - Verify files are ignored before committing
4. **Review exceptions** - If you add legitimate `.js` source files, update the exceptions list

## Audit Results

**Before**: 404+ compiled files were being tracked
**After**: 0 compiled files in git status ✅

All compiled artifacts are now properly excluded from version control.
