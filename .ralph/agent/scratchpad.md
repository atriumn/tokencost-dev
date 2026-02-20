# Scratchpad — Issue #11: Support cached/prompt caching token pricing

## Objective
Implement prompt caching token pricing support across all tools.

## Status: COMPLETE

## Changes Made

### pricing.ts
- Added `cache_read_input_token_cost: number | null` to `ModelEntry` interface
- Added `cache_read_input_token_cost_per_million: number | null` to `ModelEntry` interface
- Normalized `cache_read_input_token_cost` from LiteLLM raw data in `normalize()`
- Computed `cache_read_input_token_cost_per_million = cost * 1_000_000`

### tools.ts
- `formatModelDetails`: Shows "Prompt Caching:" section with "Cached input: $X.XX / 1M tokens" when available
- `calculate_estimate` tool schema: Added optional `cached_tokens` parameter
- `calculateEstimateSchema`: Added `cached_tokens: z.number().nonnegative().optional()`
- `calculate_estimate` handler: Calculates blended cost (cached × cache_rate + uncached × input_rate), shows "Cached input:" line
- `compare_models`: Appends "Prompt caching: $X.XX/1M cached input" line for supporting models

### Tests
- `search.test.ts`: Added new fields to `makeModel()` helper
- `tools.test.ts`: Added new fields to `makeModel()` helper, added `claude-3-5-sonnet-20241022` test model with caching, added 6 new prompt caching tests
- `pricing.test.ts`: Added 2 tests for cache_read_input_token_cost extraction, updated missing-fields test to check null defaults

## Verification
- Build: PASS
- Tests: 74/74 PASS
