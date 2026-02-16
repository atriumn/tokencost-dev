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

## Example

**Request:**

```json
{
  "model_name": "claude-sonnet-4-5",
  "input_tokens": 1000,
  "output_tokens": 500
}
```

**Response:**

```
Cost Estimate for claude-sonnet-4-5

  Input:  1K tokens × $3.00/1M = $0.003000
  Output: 500 tokens × $15.00/1M = $0.007500
  ─────────────────────────────
  Total:  $0.0105
```

## Tiered pricing

For models with tiered pricing (e.g. Claude Opus), the estimate automatically splits the cost at the 200K token threshold:

**Request:**

```json
{
  "model_name": "claude-opus-4",
  "input_tokens": 300000,
  "output_tokens": 50000
}
```

**Response:**

```
Cost Estimate for claude-opus-4

  Input (base):  200K tokens × $15.00/1M = $3.00
  Input (>200K): 100K tokens × $30.00/1M = $3.00
  Output: 50K tokens × $75.00/1M = $3.75
  ─────────────────────────────
  Total:  $9.75
```

When token counts are at or below 200K, the standard flat-rate format is used even for tiered models.

## Notes

- Token counts must be non-negative integers
- The model name is fuzzy matched, same as `get_model_details`
- Pricing is based on the per-token rates from the LiteLLM registry
- Models with tiered pricing automatically split costs at the 200K token boundary
