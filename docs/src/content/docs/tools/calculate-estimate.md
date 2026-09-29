---
title: calculate_estimate
description: Estimate the cost for a given number of input and output tokens on a specific model.
---

Estimate the cost for a given number of input and output tokens on a specific model. Useful for budgeting API calls or comparing the cost of different approaches.

## Input

| Parameter | Type | Required | Description |
|---|---|---|---|
| `model_name` | string | Yes | Model name (fuzzy matched) |
| `input_tokens` | number | Yes | Number of input tokens |
| `output_tokens` | number | Yes | Number of output tokens |
| `cached_tokens` | number | No | Input tokens served from the prompt cache (must be ≤ `input_tokens`); billed at the cached rate |

## Example

**Request:**

```json
{
  "model_name": "claude-opus-5",
  "input_tokens": 1000,
  "output_tokens": 500
}
```

**Response:**

```
Cost Estimate for claude-opus-5

  Input:  1K tokens × $5.00/1M = $0.005000
  Output: 500 tokens × $25.00/1M = $0.0125
  ─────────────────────────────
  Total:  $0.0175
```

## Prompt caching

Pass `cached_tokens` to price cache hits at the model's cached-input rate:

**Request:**

```json
{
  "model_name": "claude-sonnet-5-5",
  "input_tokens": 1000000,
  "output_tokens": 100000,
  "cached_tokens": 800000
}
```

**Response:**

```
Cost Estimate for claude-sonnet-5-5

  Cached input:   800K tokens × $0.2000/1M = $0.1600
  Input:  200K tokens × $2.00/1M = $0.4000
  Output: 100K tokens × $10.00/1M = $1.00
  ─────────────────────────────
  Total:  $1.56
```

## Tiered pricing

For models with tiered pricing (e.g. Claude Sonnet 4.5), the estimate automatically splits the cost at the 200K token threshold:

**Request:**

```json
{
  "model_name": "claude-sonnet-4-5",
  "input_tokens": 300000,
  "output_tokens": 2000
}
```

**Response:**

```
Cost Estimate for claude-sonnet-4-5

  Input (base):  200K tokens × $3.00/1M = $0.6000
  Input (>200K): 100K tokens × $6.00/1M = $0.6000
  Output: 2K tokens × $15.00/1M = $0.0300
  ─────────────────────────────
  Total:  $1.23
```

When token counts are at or below 200K, the standard flat-rate format is used even for tiered models.

## Notes

- Token counts must be non-negative integers
- The model name is fuzzy matched, same as `get_model_details`
- Pricing is based on the per-token rates from the LiteLLM registry
- Models with tiered pricing automatically split costs at the 200K token boundary
