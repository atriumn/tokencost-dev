---
title: FAQ
description: Frequently asked questions about tokencost — data freshness, accuracy, troubleshooting, and more.
---

## Where does the pricing data come from?

All data is sourced from the [LiteLLM community registry](https://github.com/BerriAI/litellm), an open-source, community-maintained dataset of LLM pricing and capabilities. It covers 300+ models across all major providers.

## How fresh is the data?

The server caches pricing data in memory for **24 hours**. On first use (or after the cache expires), it fetches the latest data from LiteLLM's registry. You can force a refresh at any time by asking your assistant to refresh pricing data, which calls the `refresh_prices` tool.

There's also a disk cache at `.cache/prices.json` that serves as a fallback if the network fetch fails.

## What if a model isn't found?

tokencost uses **fuzzy matching** — you don't need the exact model ID. For example, "claude sonnet" will match `claude-sonnet-4-5`, and "gpt4o" will match `gpt-4o`.

If the model genuinely isn't in the registry, the tool will return an error saying the model wasn't found. This usually means either:
- The model is very new and hasn't been added to LiteLLM yet
- The model name is significantly different from what you typed

Try `refresh_prices` first to pull the latest data, then retry.

## Can I use this offline?

Partially. If the server has previously fetched pricing data and the disk cache exists (`.cache/prices.json`), it will use that cached data when offline. The cache persists across server restarts.

If you've never run the server before and have no cache, the initial fetch will fail without network access.

## Is my data sent anywhere?

No. The only network request the server makes is fetching the public LiteLLM pricing registry from GitHub. Your queries, prompts, and usage data never leave your machine.

## How accurate is the pricing?

Pricing accuracy depends on the LiteLLM community registry. It's generally reliable and well-maintained, but:
- Prices may lag behind provider announcements by a few hours to days
- Some niche or regional models may have incomplete data
- Batch, cached, and fine-tuned pricing tiers may not be reflected

For production cost planning, verify critical numbers against the provider's official pricing page.

## Does it support cached/batch token pricing?

The registry includes cached token rates for models that support prompt caching. The `calculate_estimate` tool accepts a `cached_tokens` parameter to calculate the discount. Batch API pricing is not currently tracked separately.

## What MCP clients are supported?

Any client that supports the MCP stdio transport works with tokencost. See [Getting Started](/getting-started/) for setup instructions for Claude Code, Claude Desktop, VS Code, Cursor, Windsurf, and generic MCP clients.

## The server won't start — what do I check?

1. **Node.js version** — Run `node -v` and ensure you have 18+
2. **npx cache** — Try `npx -y tokencost-dev` directly in your terminal to see if it starts
3. **Network** — The first run needs network access to fetch pricing data
4. **Permissions** — Ensure your MCP client has permission to spawn local processes

If the server starts but tools aren't appearing, check your MCP client's logs for connection errors.
