---
title: get_model_details
description: Look up pricing, context window, and capabilities for any LLM model.
---

Look up pricing, context window, and capabilities for an LLM model. Uses fuzzy matching so you don't need the exact model key — `"sonnet 4.5"` works just as well as `"claude-sonnet-4-5-20250514"`.

## Input

| Parameter | Type | Required | Description |
|---|---|---|---|
| `model_name` | string | Yes | Model name to look up (e.g. `claude-sonnet-4-5`, `gpt-4o`, `gemini-2.0-flash`) |

## Example

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

Context Window:
  Max Input:  200K
  Max Output: 8K

Capabilities: vision, function_calling, parallel_function_calling
```

## Tiered pricing

Some models (e.g. Claude Opus, Sonnet) have higher per-token rates above 200K tokens. When tiered pricing data is available, the response includes an additional section:

**Request:**

```json
{
  "model_name": "claude-opus-4"
}
```

**Response:**

```
Model: claude-opus-4
Provider: anthropic
Mode: chat

Pricing (per 1M tokens):
  Input:  $15.00
  Output: $75.00

Tiered Pricing (above 200K tokens, per 1M):
  Input:  $30.00
  Output: $150.00

Context Window:
  Max Input:  200K
  Max Output: 32K

Capabilities: vision, function_calling
```

Models without tiered pricing will not show this section.

## Notes

- Fuzzy matching uses [Fuse.js](https://www.fusejs.io/) with a 0.4 threshold
- Exact and case-insensitive matches are tried first before falling back to fuzzy search
- If no match is found, the tool returns an error message suggesting you check the model name
