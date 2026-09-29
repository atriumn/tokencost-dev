<p align="center">
  <img src="docs/src/assets/tokencost-logo.png" width="120" />
</p>
<h1 align="center">tokencost</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/tokencost-dev"><img src="https://img.shields.io/npm/v/tokencost-dev" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/tokencost-dev"><img src="https://img.shields.io/npm/dm/tokencost-dev" alt="npm downloads" /></a>
  <a href="https://github.com/atriumn/tokencost-dev/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/atriumn/tokencost-dev/ci.yml?label=CI" alt="CI status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/npm/l/tokencost-dev" alt="license" /></a>
</p>
<p align="center">Ask your AI assistant "how much does GPT-5.5 cost?" — get an instant, accurate answer.</p>

---

<p align="center">
  <img src="tokencost-dev.gif" alt="tokencost demo in Claude Code" width="700" />
</p>

## Install in 30 seconds

**Claude Code:**

```bash
claude mcp add tokencost-dev -- npx -y tokencost-dev
```

Then ask: *"How much would 1M input tokens cost on Claude Sonnet 5.5?"*

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "tokencost-dev": {
      "command": "npx",
      "args": ["-y", "tokencost-dev"]
    }
  }
}
```

No API keys. No accounts. No configuration files. Pricing data is fetched from the [LiteLLM community registry](https://github.com/BerriAI/litellm) and cached locally for 24 hours.

## Why

Ask a model what another model costs and it answers from its training data, which was stale before it shipped. It will confidently quote retired prices, miss models released since its cutoff, and get context windows wrong. Web search helps but returns marketing pages, not numbers you can calculate with.

tokencost gives the assistant a tool instead of a memory. It reads the registry LiteLLM's proxy uses for its own cost tracking (4,400+ models across every major provider and reseller) and does the arithmetic: tiered pricing above 200K tokens, prompt-cache discounts, and like-for-like comparisons across providers.

**Under the hood:**
- **Fuzzy model resolution** — exact and case-insensitive matches first, then [Fuse.js](https://www.fusejs.io/), so `"opus 5.5"` resolves to `claude-opus-5-5`.
- **Resilient caching** — 24h in-memory cache, disk fallback for offline use, background refresh on startup.
- **Noise-aware comparison** — excludes registry entries with no pricing data, collapses dated snapshots into their aliases, and matches providers by family (`google` covers Gemini and Vertex AI).
- **Zero footprint** — one `npx` command, stdio transport, no network traffic beyond fetching the public registry.

## Tools

### `get_model_details`
Look up pricing, context window, and capabilities for any model. Fuzzy matching means `"opus 5.5"` works just as well as `"claude-opus-5-5"`.

```
> "What are Claude Opus 5.5's pricing and capabilities?"

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

### `calculate_estimate`
Estimate cost for a given number of input, output, and cached tokens.

```
> "1M input tokens, 800K of them cache hits, plus 100K output on Sonnet 5.5?"

Cost Estimate for claude-sonnet-5-5

  Cached input:   800K tokens × $0.2000/1M = $0.1600
  Input:  200K tokens × $2.00/1M = $0.4000
  Output: 100K tokens × $10.00/1M = $1.00
  ─────────────────────────────
  Total:  $1.56
```

### `compare_models`
Find the most cost-effective models matching your requirements.

```
> "What are the cheapest OpenAI chat models?"

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
   ...
(68 models matched total; 1 without pricing data excluded)
```

### `refresh_prices`
Force re-fetch pricing data from the LiteLLM registry (cache is refreshed automatically every 24h).

## Docs

Full documentation at [tokencost.dev](https://tokencost.dev)

## License

MIT
