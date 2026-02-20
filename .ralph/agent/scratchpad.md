# Issue #12: Normalize provider prefixes in fuzzy matching

## Objective
Strip known provider prefixes from model names before fuzzy matching so users can pass model names like `azure/gpt-4o`, `bedrock/anthropic.claude-3`, etc., and they'll still match correctly.

## Implementation Plan

### 1. Update search.ts
- Add `stripProviderPrefix()` function that removes known prefixes:
  - `azure/`, `bedrock/`, `vertex_ai/`, `vertex_ai_beta/`, `openrouter/`, `together_ai/`, `fireworks_ai/`
- Call this in both `fuzzyMatch()` and `fuzzyMatchMultiple()` before matching

### 2. Add tests to search.test.ts
- Test cases for each prefix being stripped correctly
- Test that matching still works after prefix stripping

### 3. Verify through tools.ts
- `get_model_details` and `calculate_estimate` both use `fuzzyMatch()`, so they'll automatically benefit from the change

## Progress
- [x] Implement stripProviderPrefix in search.ts
- [x] Add tests to search.test.ts
- [x] Run tests and verify (ALL 84 TESTS PASS including 10 new prefix tests)
- [x] Commit changes (2 commits)
- [x] Verify build passes
- [x] Final review passed (PASS)

## Implementation Summary

### Changes Made:
1. Added `stripProviderPrefix()` function to handle 7 known provider prefixes
2. Integrated prefix stripping in `fuzzyMatch()` - affects both `get_model_details` and `calculate_estimate`
3. Integrated prefix stripping in `fuzzyMatchMultiple()`
4. Added 10 comprehensive tests covering all prefixes and case-insensitivity
5. Fixed prefix ordering to handle overlapping prefixes (vertex_ai/vertex_ai_beta)

### Commits:
- `2593254` - feat: normalize provider prefixes in fuzzy matching
- `488e33e` - fix: order KNOWN_PREFIXES by length to avoid partial matches

### Verification:
- ✓ 84 tests pass (including 10 new tests)
- ✓ Build passes
- ✓ Review passed (all blocking issues resolved)
