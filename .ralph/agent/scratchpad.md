# Objective: Rename package from @atriumn/tariff to tokencost-dev

## Status: COMPLETED ✅

All tasks have been completed and committed.

## Changes Made

### 1. Root `package.json`
- [x] name: `@atriumn/tariff` → `tokencost-dev`
- [x] bin: `tariff` → `tokencost-dev`
- [x] repository.url: `github.com/atriumn/tariff.git` → `github.com/atriumn/tokencost-dev.git`

### 2. `docs/package.json`
- [x] name: `@atriumn/tariff-docs` → `@atriumn/tokencost-dev-docs`

### 3. `CLAUDE.md`
- [x] Title: "Tariff" → "tokencost"

### 4. `README.md`
- [x] Title and install instructions updated
- [x] Package name from `@atriumn/tariff` → `tokencost-dev`

### 5. `docs/astro.config.mjs`
- [x] title: "Tariff MCP" → "tokencost"
- [x] github href: `github.com/atriumn/tariff` → `github.com/atriumn/tokencost-dev`
- [x] logo alt text updated

### 6. `docs/src/content/docs/getting-started.md`
- [x] All references to @atriumn/tariff updated to tokencost-dev
- [x] Installation instructions updated

### 7. `src/index.ts`
- [x] server name: "tariff" → "tokencost-dev"
- [x] console message updated

## Commit
- Commit: 1c5a04f
- Message: "Rename package from @atriumn/tariff to tokencost-dev"

## Notes
- MCP tool names stay the same (get_model_details, etc.)
- CLI command: `npx tokencost-dev`
- All references to package name have been updated across the codebase
