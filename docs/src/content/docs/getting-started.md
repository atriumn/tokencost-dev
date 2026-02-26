---
title: Getting Started
description: Install and configure the tokencost MCP server in Claude Code, Claude Desktop, VS Code, Cursor, Windsurf, or any MCP client.
---

tokencost (`tokencost-dev`) is an MCP server that provides real-time LLM pricing data. It runs as a local process and communicates over stdio.

## Prerequisites

- **Node.js 18+** — [download](https://nodejs.org/)

That's it. No API keys, no accounts, no configuration files.

## Claude Code

The fastest way to get started:

```bash
claude mcp add tokencost-dev -- npx -y tokencost-dev
```

This registers the MCP server and it will be available in all future Claude Code sessions.

## Claude Desktop

Open **Claude > Settings > Developer > Edit Config** to open `claude_desktop_config.json`, then add:

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

Save the file and restart Claude Desktop.

:::note[Config file location]
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
:::

## VS Code (GitHub Copilot)

Create or edit `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "tokencost-dev": {
      "command": "npx",
      "args": ["-y", "tokencost-dev"]
    }
  }
}
```

VS Code will detect the file and make the tools available in Copilot chat (agent mode).

## Cursor

Add to your Cursor MCP config (`.cursor/mcp.json`):

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

## Windsurf

Open **Windsurf Settings > Cascade > MCP Servers**, or edit `~/.codeium/windsurf/mcp_config.json` directly:

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

## Other MCP clients

The server config is the same for any MCP client that supports stdio transport:

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

Consult your client's documentation for where to place this configuration.

## Your first query

Once installed, just ask your AI assistant a pricing question in natural language:

> "How much does Claude Sonnet 4.5 cost per million tokens?"

The assistant will call the `get_model_details` tool and return something like:

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

1. On first use, the server fetches pricing data from the [LiteLLM community registry](https://github.com/BerriAI/litellm)
2. Data is cached in-memory for 24 hours (with a disk fallback)
3. Your AI assistant calls one of the 4 tools via the MCP protocol
4. Results are returned as formatted text

No data leaves your machine — the only network request is fetching the public pricing registry.
