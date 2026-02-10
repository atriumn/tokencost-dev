---
title: refresh_prices
description: Force a re-fetch of pricing data from the LiteLLM registry.
---

Force a re-fetch of pricing data from the LiteLLM registry. Use this if you suspect the cached data is stale or if new models have been added to the registry.

## Input

No parameters — just call the tool.

## Example

**Response:**

```
Pricing data refreshed successfully.
Models loaded: 342
Timestamp: 2025-06-15T12:00:00.000Z
```

## Notes

- Pricing data is automatically cached for 24 hours, so you rarely need this
- The cache is pre-warmed on server startup
- If the fetch fails, the server falls back to the last known good data from disk cache
