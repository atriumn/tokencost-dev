# Tariff

LLM Pricing Oracle — an MCP server that pulls real pricing data from the [LiteLLM community registry](https://github.com/BerriAI/litellm) and exposes it as tools any MCP client can query.

No API keys. No accounts. No configuration files.

## Install

**Claude Code:**

```bash
claude mcp add tariff -- npx -y @atriumn/tariff
```

**Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "tariff": {
      "command": "npx",
      "args": ["-y", "@atriumn/tariff"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `get_model_details` | Look up pricing, context window, and capabilities for a model |
| `calculate_estimate` | Estimate cost for a given token count |
| `compare_models` | Filter and compare models by provider, context window, or mode |
| `refresh_prices` | Force re-fetch pricing data from the registry |

## Example

> "How much does Claude Sonnet 4.5 cost per million tokens?"

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

## How it works

1. On first use, the server fetches pricing data from the LiteLLM community registry
2. Data is cached in-memory for 24 hours (with a disk fallback)
3. Your AI assistant calls tools via the MCP protocol
4. Results are returned as formatted text

No data leaves your machine — the only network request is fetching the public pricing registry.

## Docs

Full documentation at [tokencost.dev](https://tokencost.dev)

## License

MIT
