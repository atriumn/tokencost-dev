---
title: get_model_details
description: Look up pricing, context window, and capabilities for any LLM model.
---

Look up pricing, context window, and capabilities for an LLM model. Uses fuzzy matching so you don't need the exact model key — `"opus 5.5"` works just as well as `"claude-opus-5-5"`.

## Input

| Parameter | Type | Required | Description |
|---|---|---|---|
| `model_name` | string | Yes | Model name to look up (e.g. `claude-opus-5-5`, `gpt-5.5`, `gemini-3.1-flash-lite`) |

## Example

**Request:**

```json
{
  "model_name": "claude-opus-5-5"
}
```

**Response:**

```
Model: claude-opus-5-5
Provider: anthropic
Mode: chat

Pricing (per 1M tokens):
  Input:  $4.00
  Output: $20.00

Prompt Caching:
  Cached input: $0.2000 / 1M tokens

Context Window:
  Max Input:  1.0M
  Max Output: 128K
  Max Tokens: 128K

Capabilities: vision, function_calling
```

## Tiered pricing

Some models (e.g. Claude Sonnet 4.5) have higher per-token rates above 200K tokens. When tiered pricing data is available, the response includes an additional section:

**Request:**

```json
{
  "model_name": "claude-sonnet-4-5"
}
```

**Response:**

```
Model: claude-sonnet-4-5
Provider: anthropic
Mode: chat

Pricing (per 1M tokens):
  Input:  $3.00
  Output: $15.00

Tiered Pricing (above 200K tokens, per 1M):
  Input:  $6.00
  Output: $22.50

Prompt Caching:
  Cached input: $0.3000 / 1M tokens

Context Window:
  Max Input:  1.0M
  Max Output: 64K
  Max Tokens: 64K

Capabilities: vision, function_calling
```

Models without tiered pricing will not show this section.

## Notes

- Fuzzy matching uses [Fuse.js](https://www.fusejs.io/) with a 0.4 threshold
- Exact and case-insensitive matches are tried first before falling back to fuzzy search
- If no match is found, the tool returns an error message suggesting you check the model name
