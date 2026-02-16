import { z } from "zod";
import {
  getModels,
  refreshPrices,
  TIERED_PRICING_THRESHOLD,
  type ModelEntry,
} from "./pricing.js";
import { fuzzyMatch } from "./search.js";

export const tools = [
  {
    name: "get_model_details",
    description:
      "Look up pricing, context window, and capabilities for an LLM model. Uses fuzzy matching so you don't need the exact model key.",
    inputSchema: {
      type: "object" as const,
      properties: {
        model_name: {
          type: "string",
          description:
            "Model name to look up (e.g. 'claude-sonnet-4-5', 'gpt-4o', 'gemini-2.0-flash')",
        },
      },
      required: ["model_name"],
    },
  },
  {
    name: "calculate_estimate",
    description:
      "Estimate the cost for a given number of input and output tokens on a specific model.",
    inputSchema: {
      type: "object" as const,
      properties: {
        model_name: {
          type: "string",
          description: "Model name (fuzzy matched)",
        },
        input_tokens: {
          type: "number",
          description: "Number of input tokens",
        },
        output_tokens: {
          type: "number",
          description: "Number of output tokens",
        },
      },
      required: ["model_name", "input_tokens", "output_tokens"],
    },
  },
  {
    name: "compare_models",
    description:
      "Filter and compare models by provider, minimum context window, or mode. Returns top 5 most cost-effective matches.",
    inputSchema: {
      type: "object" as const,
      properties: {
        provider: {
          type: "string",
          description:
            "Filter by provider (e.g. 'anthropic', 'openai', 'google', 'amazon')",
        },
        min_context: {
          type: "number",
          description: "Minimum context window size in tokens",
        },
        mode: {
          type: "string",
          description:
            "Filter by mode (e.g. 'chat', 'embedding', 'completion', 'image_generation')",
        },
      },
      required: [],
    },
  },
  {
    name: "refresh_prices",
    description:
      "Force a re-fetch of pricing data from the LiteLLM registry. Use this if you suspect the cached data is stale.",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// Zod schemas
const getModelDetailsSchema = z.object({
  model_name: z.string().min(1),
});

const calculateEstimateSchema = z.object({
  model_name: z.string().min(1),
  input_tokens: z.number().nonnegative(),
  output_tokens: z.number().nonnegative(),
});

const compareModelsSchema = z.object({
  provider: z.string().optional(),
  min_context: z.number().optional(),
  mode: z.string().optional(),
});

function formatCost(amount: number): string {
  if (amount < 0.0001) return `$${amount.toFixed(8)}`;
  if (amount < 0.01) return `$${amount.toFixed(6)}`;
  if (amount < 1) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(2)}`;
}

function formatTokenCount(n: number | null): string {
  if (n === null) return "unknown";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

interface TieredCostResult {
  inputCost: number;
  outputCost: number;
  totalCost: number;
  tieredInput: boolean;
  tieredOutput: boolean;
  inputBaseCost: number;
  inputTieredCost: number;
  outputBaseCost: number;
  outputTieredCost: number;
}

export function calculateTieredCost(
  model: ModelEntry,
  inputTokens: number,
  outputTokens: number,
): TieredCostResult {
  const threshold = TIERED_PRICING_THRESHOLD;

  let inputBaseCost: number;
  let inputTieredCost = 0;
  let tieredInput = false;

  if (
    model.input_cost_per_token_above_200k != null &&
    inputTokens > threshold
  ) {
    tieredInput = true;
    inputBaseCost = threshold * model.input_cost_per_token;
    inputTieredCost =
      (inputTokens - threshold) * model.input_cost_per_token_above_200k;
  } else {
    inputBaseCost = inputTokens * model.input_cost_per_token;
  }

  let outputBaseCost: number;
  let outputTieredCost = 0;
  let tieredOutput = false;

  if (
    model.output_cost_per_token_above_200k != null &&
    outputTokens > threshold
  ) {
    tieredOutput = true;
    outputBaseCost = threshold * model.output_cost_per_token;
    outputTieredCost =
      (outputTokens - threshold) * model.output_cost_per_token_above_200k;
  } else {
    outputBaseCost = outputTokens * model.output_cost_per_token;
  }

  const inputCost = inputBaseCost + inputTieredCost;
  const outputCost = outputBaseCost + outputTieredCost;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    tieredInput,
    tieredOutput,
    inputBaseCost,
    inputTieredCost,
    outputBaseCost,
    outputTieredCost,
  };
}

function formatModelDetails(model: ModelEntry): string {
  const capabilities: string[] = [];
  if (model.supports_vision) capabilities.push("vision");
  if (model.supports_function_calling) capabilities.push("function_calling");
  if (model.supports_parallel_function_calling)
    capabilities.push("parallel_function_calling");

  const hasTieredInput = model.input_cost_per_million_above_200k != null;
  const hasTieredOutput = model.output_cost_per_million_above_200k != null;
  const hasTiered = hasTieredInput || hasTieredOutput;

  const tieredLines: string[] = [];
  if (hasTiered) {
    tieredLines.push(``);
    tieredLines.push(
      `Tiered Pricing (above ${formatTokenCount(TIERED_PRICING_THRESHOLD)} tokens, per 1M):`,
    );
    if (hasTieredInput) {
      tieredLines.push(
        `  Input:  ${formatCost(model.input_cost_per_million_above_200k!)}`,
      );
    }
    if (hasTieredOutput) {
      tieredLines.push(
        `  Output: ${formatCost(model.output_cost_per_million_above_200k!)}`,
      );
    }
  }

  return [
    `Model: ${model.key}`,
    `Provider: ${model.litellm_provider}`,
    `Mode: ${model.mode}`,
    ``,
    `Pricing (per 1M tokens):`,
    `  Input:  ${formatCost(model.input_cost_per_million)}`,
    `  Output: ${formatCost(model.output_cost_per_million)}`,
    ...tieredLines,
    ``,
    `Context Window:`,
    `  Max Input:  ${formatTokenCount(model.max_input_tokens)}`,
    `  Max Output: ${formatTokenCount(model.max_output_tokens)}`,
    ...(model.max_tokens !== null
      ? [`  Max Tokens: ${formatTokenCount(model.max_tokens)}`]
      : []),
    ``,
    `Capabilities: ${capabilities.length > 0 ? capabilities.join(", ") : "none listed"}`,
  ].join("\n");
}

export async function executeTool(
  name: string,
  args: unknown,
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    switch (name) {
      case "get_model_details": {
        const { model_name } = getModelDetailsSchema.parse(args);
        const models = await getModels();
        const model = fuzzyMatch(model_name, models);

        if (!model) {
          return {
            content: [
              {
                type: "text",
                text: `No model found matching "${model_name}". Try a different name or use compare_models to browse available models.`,
              },
            ],
          };
        }

        return {
          content: [{ type: "text", text: formatModelDetails(model) }],
        };
      }

      case "calculate_estimate": {
        const { model_name, input_tokens, output_tokens } =
          calculateEstimateSchema.parse(args);
        const models = await getModels();
        const model = fuzzyMatch(model_name, models);

        if (!model) {
          return {
            content: [
              {
                type: "text",
                text: `No model found matching "${model_name}".`,
              },
            ],
          };
        }

        const result = calculateTieredCost(model, input_tokens, output_tokens);
        const lines: string[] = [`Cost Estimate for ${model.key}`, ``];

        if (result.tieredInput) {
          const baseTokens = TIERED_PRICING_THRESHOLD;
          const tieredTokens = input_tokens - baseTokens;
          lines.push(
            `  Input (base):  ${formatTokenCount(baseTokens)} tokens × ${formatCost(model.input_cost_per_million)}/1M = ${formatCost(result.inputBaseCost)}`,
          );
          lines.push(
            `  Input (>200K): ${formatTokenCount(tieredTokens)} tokens × ${formatCost(model.input_cost_per_million_above_200k!)}/1M = ${formatCost(result.inputTieredCost)}`,
          );
        } else {
          lines.push(
            `  Input:  ${formatTokenCount(input_tokens)} tokens × ${formatCost(model.input_cost_per_million)}/1M = ${formatCost(result.inputCost)}`,
          );
        }

        if (result.tieredOutput) {
          const baseTokens = TIERED_PRICING_THRESHOLD;
          const tieredTokens = output_tokens - baseTokens;
          lines.push(
            `  Output (base):  ${formatTokenCount(baseTokens)} tokens × ${formatCost(model.output_cost_per_million)}/1M = ${formatCost(result.outputBaseCost)}`,
          );
          lines.push(
            `  Output (>200K): ${formatTokenCount(tieredTokens)} tokens × ${formatCost(model.output_cost_per_million_above_200k!)}/1M = ${formatCost(result.outputTieredCost)}`,
          );
        } else {
          lines.push(
            `  Output: ${formatTokenCount(output_tokens)} tokens × ${formatCost(model.output_cost_per_million)}/1M = ${formatCost(result.outputCost)}`,
          );
        }

        lines.push(`  ─────────────────────────────`);
        lines.push(`  Total:  ${formatCost(result.totalCost)}`);

        return {
          content: [
            {
              type: "text",
              text: lines.join("\n"),
            },
          ],
        };
      }

      case "compare_models": {
        const { provider, min_context, mode } =
          compareModelsSchema.parse(args);
        const models = await getModels();

        let filtered = Object.values(models);

        if (provider) {
          const lowerProvider = provider.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.litellm_provider.toLowerCase().includes(lowerProvider) ||
              m.key.toLowerCase().includes(lowerProvider),
          );
        }

        if (min_context !== undefined) {
          filtered = filtered.filter(
            (m) =>
              m.max_input_tokens !== null &&
              m.max_input_tokens >= min_context,
          );
        }

        if (mode) {
          const lowerMode = mode.toLowerCase();
          filtered = filtered.filter(
            (m) => m.mode.toLowerCase() === lowerMode,
          );
        }

        if (filtered.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No models match the given criteria. Try broadening your filters.",
              },
            ],
          };
        }

        // Sort by input cost (most cost-effective first)
        filtered.sort(
          (a, b) => a.input_cost_per_token - b.input_cost_per_token,
        );
        const top = filtered.slice(0, 5);

        const header = `Top ${top.length} most cost-effective models${provider ? ` (provider: ${provider})` : ""}${min_context ? ` (min context: ${formatTokenCount(min_context)})` : ""}${mode ? ` (mode: ${mode})` : ""}:\n`;

        const rows = top.map(
          (m, i) =>
            `${i + 1}. ${m.key}\n` +
            `   Provider: ${m.litellm_provider} | Mode: ${m.mode}\n` +
            `   Input: ${formatCost(m.input_cost_per_million)}/1M | Output: ${formatCost(m.output_cost_per_million)}/1M\n` +
            `   Context: ${formatTokenCount(m.max_input_tokens)} in / ${formatTokenCount(m.max_output_tokens)} out`,
        );

        const total = `\n(${filtered.length} models matched total)`;

        return {
          content: [
            { type: "text", text: header + rows.join("\n\n") + total },
          ],
        };
      }

      case "refresh_prices": {
        const result = await refreshPrices();
        return {
          content: [
            {
              type: "text",
              text: `Pricing data refreshed successfully.\nModels loaded: ${result.count}\nTimestamp: ${result.timestamp}`,
            },
          ],
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
        };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
    };
  }
}
