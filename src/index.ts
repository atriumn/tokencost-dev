#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getModels } from "./pricing.js";
import { executeTool, tools } from "./tools.js";

const server = new Server(
  {
    name: "tokencost-dev",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  return executeTool(name, args);
});

async function main() {
  // Pre-warm the cache in background
  getModels().catch(() => {
    // Non-fatal — tools will retry on first call
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("tokencost MCP server started");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
