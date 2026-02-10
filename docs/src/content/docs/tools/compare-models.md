---
title: compare_models
description: Filter and compare models by provider, context window, or mode.
---

Filter and compare models by provider, minimum context window, or mode. Returns the top 5 most cost-effective matches sorted by input token price.

## Input

All parameters are optional — use any combination to filter.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `provider` | string | No | Filter by provider (e.g. `anthropic`, `openai`, `google`, `amazon`) |
| `min_context` | number | No | Minimum context window size in tokens |
| `mode` | string | No | Filter by mode (e.g. `chat`, `embedding`, `completion`, `image_generation`) |

## Example

**Request:**

```json
{
  "provider": "openai",
  "mode": "chat"
}
```

**Response:**

```
Top 2 most cost-effective models (provider: openai) (mode: chat):

1. gpt-4o-mini
   Provider: openai | Mode: chat
   Input: $0.15/1M | Output: $0.60/1M
   Context: 128K in / 16K out

2. gpt-4o
   Provider: openai | Mode: chat
   Input: $5.00/1M | Output: $15.00/1M
   Context: 128K in / 16K out

(2 models matched total)
```

## Notes

- Results are sorted by input cost (cheapest first)
- Up to 5 results are returned; the total match count is shown at the bottom
- Provider names match the `litellm_provider` field in the registry (e.g. `anthropic`, `openai`, `google`, `amazon`, `azure`)
- Calling with no filters returns the 5 cheapest chat models across all providers
