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
Top 5 most cost-effective models (provider: openai) (mode: chat):
1. gpt-5-nano
   Provider: openai | Mode: chat
   Input: $0.0500/1M | Output: $0.4000/1M
   Context: 272K in / 128K out
   Prompt caching: $0.005000/1M cached input

2. gpt-4.1-nano
   Provider: openai | Mode: chat
   Input: $0.1000/1M | Output: $0.4000/1M
   Context: 1.0M in / 33K out
   Prompt caching: $0.0250/1M cached input

3. gpt-6-luna
   Provider: openai | Mode: chat
   Input: $0.1000/1M | Output: $0.5000/1M
   Context: 922K in / 128K out
   Prompt caching: $0.0100/1M cached input

4. gpt-4o-mini
   Provider: openai | Mode: chat
   Input: $0.1500/1M | Output: $0.6000/1M
   Context: 128K in / 16K out
   Prompt caching: $0.0750/1M cached input

5. gpt-4o-mini-audio-preview-2024-12-17
   Provider: openai | Mode: chat
   Input: $0.1500/1M | Output: $0.6000/1M
   Context: 128K in / 16K out
(68 models matched total; 1 without pricing data excluded)
```

## Notes

- Results are sorted by input cost (cheapest first)
- Up to 5 results are returned; the total match count is shown at the bottom
- Provider names match the registry's `litellm_provider` field exactly or by family (`bedrock` covers `bedrock_converse`, `vertex_ai` covers `vertex_ai-language-models`). Resellers such as OpenRouter are their own provider — `openai` does not include `openrouter/openai/*`
- Friendly aliases: `google` → Gemini + Vertex AI, `amazon` / `aws` → Bedrock, `microsoft` → Azure
- Registry entries with no pricing data are excluded, and the footer reports how many
- Dated snapshots (e.g. `gpt-5-nano-2025-08-07`) are hidden when their undated alias has the same price
- Calling with no filters returns the 5 cheapest models across all providers and modes
