# tokencost — LLM Pricing Oracle MCP Server

## Overview
Lightweight MCP server that pulls real LLM pricing data from LiteLLM's community-maintained registry and exposes it as tools any MCP-compatible client can query.

## Architecture
- TypeScript, ESM (`"type": "module"`)
- `@modelcontextprotocol/sdk` with stdio transport
- Data source: LiteLLM `model_prices_and_context_window.json`
- Fuzzy model name matching via `fuse.js`

## File Structure
- `src/index.ts` — Server setup, stdio transport, handler wiring
- `src/tools.ts` — Tool definitions (inputSchema) + executeTool dispatch
- `src/pricing.ts` — Fetch, cache, normalize LiteLLM data
- `src/search.ts` — Fuzzy model name matching

## Tools Exposed
1. `get_model_details` — Look up pricing/capabilities for a model
2. `calculate_estimate` — Estimate cost for a given token count
3. `compare_models` — Filter and compare models by provider/context/mode
4. `refresh_prices` — Force re-fetch pricing data

## Build & Run
```bash
npm run build
npm start
```

## Cache
- In-memory with 24h TTL
- Disk fallback at `.cache/prices.json`
- Background refresh on startup
