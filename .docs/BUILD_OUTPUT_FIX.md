# Build Output Directory Fix

## Problem

Compiled TypeScript artifacts (`.js`, `.d.ts`, `.d.ts.map`, `.js.map`) were being generated directly in `src/` directories alongside source `.ts` files, instead of being output to `dist/` folders.

**Before:**
```
packages/core/src/decision-intelligence/repositories/
  ├── alert-evaluation.repository.ts      (source)
  ├── alert-evaluation.repository.js       (❌ compiled - wrong location)
  ├── alert-evaluation.repository.d.ts     (❌ compiled - wrong location)
  └── alert-evaluation.repository.d.ts.map (❌ compiled - wrong location)
```

**After:**
```
packages/core/src/decision-intelligence/repositories/
  └── alert-evaluation.repository.ts      (source only ✅)

packages/core/dist/decision-intelligence/repositories/
  ├── alert-evaluation.repository.js       (✅ compiled - correct location)
  ├── alert-evaluation.repository.d.ts     (✅ compiled - correct location)
  └── alert-evaluation.repository.d.ts.map (✅ compiled - correct location)
```

## Root Cause

The TypeScript configuration was correct (`outDir: "./dist"`, `rootDir: "./src"`), but compiled files from previous builds remained in `src/` directories. These were likely generated before the tsconfig was properly configured or from a different build process.

## Solution

### 1. Cleaned All Compiled Files from Source Directories

Removed all compiled artifacts from `src/` directories:
- `packages/core/src/**/*.js` (202 files)
- `packages/core/src/**/*.d.ts` (202 files)
- `packages/core/src/**/*.d.ts.map` (202 files)
- `platform/adapters/src/**/*.js` (105 files)
- Similar cleanup for services

**Total cleaned**: 606+ compiled files

### 2. Verified Build Output

Rebuilt packages to confirm files are now generated in `dist/`:
- ✅ Core package: Files go to `packages/core/dist/`
- ✅ Adapters: Files go to `platform/adapters/dist/`
- ✅ Services: Files go to `platform/services/src/{service}/dist/`

### 3. Updated Clean Scripts

Enhanced `clean` scripts in `package.json` to also remove any compiled files that might accidentally end up in `src/`:

**Core package:**
```json
"clean": "rm -rf dist && find src -type f \\( -name \"*.js\" -o -name \"*.d.ts\" -o -name \"*.d.ts.map\" -o -name \"*.js.map\" \\) -not -path \"*/node_modules/*\" -delete"
```

**Adapters package:**
```json
"clean": "rm -rf dist && find src -type f \\( -name \"*.js\" -o -name \"*.d.ts\" -o -name \"*.d.ts.map\" -o -name \"*.js.map\" \\) -not -path \"*/node_modules/*\" -not -path \"*/prisma/generated/*\" -delete"
```

## Verification

### Check Build Output Location

```bash
# Verify core package
cd packages/core
npm run build
ls dist/decision-intelligence/repositories/alert-evaluation.repository.*
# Should show: .js, .d.ts, .d.ts.map files

# Verify no compiled files in src/
find src -name "*.js" -o -name "*.d.ts" | wc -l
# Should output: 0
```

### Check Git Status

```bash
# Should show 0 compiled files
git status --short | grep -E "\.(js|d\.ts|js\.map|d\.ts\.map)$" | wc -l
```

## Benefits

1. **Clean Separation**: Source files (`src/`) and compiled files (`dist/`) are now properly separated
2. **Git Ignore Works**: `.gitignore` patterns can reliably exclude `dist/` folders
3. **IDE Performance**: IDEs don't need to index compiled files mixed with source
4. **Build Clarity**: Clear distinction between source and output
5. **Easier Cleanup**: `npm run clean` removes all build artifacts

## Prevention

To prevent this issue in the future:

1. **Always use `npm run clean`** before rebuilding
2. **Verify tsconfig** has correct `outDir` and `rootDir` settings
3. **Check git status** after builds to ensure no compiled files in `src/`
4. **Use the updated clean scripts** that remove files from both `dist/` and `src/`

## Files Affected

- ✅ `packages/core/src/` - Cleaned (606 files removed)
- ✅ `platform/adapters/src/` - Cleaned (105+ files removed)
- ✅ `platform/services/src/*/src/` - Cleaned (0 files found)
- ✅ `packages/core/package.json` - Updated clean script
- ✅ `platform/adapters/package.json` - Updated clean script

All compiled artifacts now correctly output to `dist/` folders! ✅
