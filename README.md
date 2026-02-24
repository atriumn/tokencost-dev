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
<p align="center">Ask your AI assistant "how much does GPT-4o cost?" — get an instant, accurate answer.</p>

---

<p align="center">
  <img src="docs/src/assets/demo.gif" alt="tokencost demo in Claude Code" width="700" />
</p>

## Install in 30 seconds

**Claude Code:**

```bash
claude mcp add tokencost-dev -- npx -y tokencost-dev
```

Then ask: *"How much would 1M input tokens cost on claude-sonnet-4-5?"*

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

## Tools

### `get_model_details`
Look up pricing, context window, and capabilities for any model. Fuzzy matching means `"sonnet 4.5"` works just as well as `"claude-sonnet-4-5-20250514"`.

```
> "What are Claude Sonnet 4.5's pricing and capabilities?"

Model: claude-sonnet-4-5
Provider: anthropic | Mode: chat

Pricing (per 1M tokens):
  Input:  $3.00
  Output: $15.00

Context Window:
  Max Input:  200K
  Max Output: 8K

Capabilities: vision, function_calling, parallel_function_calling
```

### `calculate_estimate`
Estimate cost for a given number of input and output tokens.

```
> "How much will 1000 input + 500 output tokens cost on Claude Sonnet 4.5?"

Cost Estimate for claude-sonnet-4-5

  Input:  1K tokens × $3.00/1M  = $0.003000
  Output: 500 tokens × $15.00/1M = $0.007500
  ─────────────────────────────
  Total:  $0.0105
```

### `compare_models`
Find the most cost-effective models matching your requirements.

```
> "What are the cheapest OpenAI chat models?"

Top 2 most cost-effective models (provider: openai) (mode: chat):

1. gpt-4o-mini
   Provider: openai | Mode: chat
   Input: $0.15/1M | Output: $0.60/1M
   Context: 128K in / 16K out

2. gpt-4o
   Provider: openai | Mode: chat
   Input: $5.00/1M | Output: $15.00/1M
   Context: 128K in / 16K out
```

### `refresh_prices`
Force re-fetch pricing data from the LiteLLM registry (cache is refreshed automatically every 24h).

## Docs

Full documentation at [tokencost.dev](https://tokencost.dev)

## License

MIT
