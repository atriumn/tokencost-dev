import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ModelEntry } from "./pricing.js";

// Mock the pricing module
vi.mock("./pricing.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./pricing.js")>();
  return {
    ...actual,
    getModels: vi.fn(),
    refreshPrices: vi.fn(),
  };
});

import { getModels, refreshPrices } from "./pricing.js";
// Import after mock setup
import { calculateTieredCost, executeTool } from "./tools.js";

/** Helper to build a minimal ModelEntry */
function makeModel(overrides: Partial<ModelEntry> & { key: string }): ModelEntry {
  return {
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    input_cost_per_million: 3.0,
    output_cost_per_million: 15.0,
    input_cost_per_token_above_200k: null,
    output_cost_per_token_above_200k: null,
    input_cost_per_million_above_200k: null,
    output_cost_per_million_above_200k: null,
    cache_read_input_token_cost: null,
    cache_read_input_token_cost_per_million: null,
    max_input_tokens: 200000,
    max_output_tokens: 8192,
    max_tokens: null,
    litellm_provider: "anthropic",
    mode: "chat",
    supports_vision: true,
    supports_function_calling: true,
    supports_parallel_function_calling: false,
    ...overrides,
  };
}

const testModels: Record<string, ModelEntry> = {
  "claude-sonnet-4-5": makeModel({
    key: "claude-sonnet-4-5",
    litellm_provider: "anthropic",
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    input_cost_per_million: 3.0,
    output_cost_per_million: 15.0,
    max_input_tokens: 200000,
    max_output_tokens: 8192,
    supports_vision: true,
    supports_function_calling: true,
    supports_parallel_function_calling: true,
  }),
  "gpt-4o": makeModel({
    key: "gpt-4o",
    litellm_provider: "openai",
    input_cost_per_token: 0.000005,
    output_cost_per_token: 0.000015,
    input_cost_per_million: 5.0,
    output_cost_per_million: 15.0,
    max_input_tokens: 128000,
    max_output_tokens: 16384,
    supports_vision: true,
    supports_function_calling: true,
    supports_parallel_function_calling: true,
  }),
  "gpt-4o-mini": makeModel({
    key: "gpt-4o-mini",
    litellm_provider: "openai",
    input_cost_per_token: 0.00000015,
    output_cost_per_token: 0.0000006,
    input_cost_per_million: 0.15,
    output_cost_per_million: 0.6,
    max_input_tokens: 128000,
    max_output_tokens: 16384,
  }),
  "gemini-2.0-flash": makeModel({
    key: "gemini-2.0-flash",
    litellm_provider: "google",
    input_cost_per_token: 0.0000001,
    output_cost_per_token: 0.0000004,
    input_cost_per_million: 0.1,
    output_cost_per_million: 0.4,
    max_input_tokens: 1000000,
    max_output_tokens: 8192,
    mode: "chat",
    supports_vision: false,
    supports_function_calling: false,
    supports_parallel_function_calling: false,
  }),
  "claude-opus-4": makeModel({
    key: "claude-opus-4",
    litellm_provider: "anthropic",
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    input_cost_per_million: 15.0,
    output_cost_per_million: 75.0,
    input_cost_per_token_above_200k: 0.00003,
    output_cost_per_token_above_200k: 0.00015,
    input_cost_per_million_above_200k: 30.0,
    output_cost_per_million_above_200k: 150.0,
    max_input_tokens: 200000,
    max_output_tokens: 32000,
  }),
  "text-embedding-3-large": makeModel({
    key: "text-embedding-3-large",
    litellm_provider: "openai",
    input_cost_per_token: 0.00000013,
    output_cost_per_token: 0,
    input_cost_per_million: 0.13,
    output_cost_per_million: 0,
    max_input_tokens: 8191,
    max_output_tokens: null,
    mode: "embedding",
    supports_vision: false,
    supports_function_calling: false,
    supports_parallel_function_calling: false,
  }),
  "claude-3-5-sonnet-20241022": makeModel({
    key: "claude-3-5-sonnet-20241022",
    litellm_provider: "anthropic",
    input_cost_per_token: 0.000003,
    output_cost_per_token: 0.000015,
    input_cost_per_million: 3.0,
    output_cost_per_million: 15.0,
    cache_read_input_token_cost: 0.0000003,
    cache_read_input_token_cost_per_million: 0.3,
    max_input_tokens: 200000,
    max_output_tokens: 8192,
    supports_vision: true,
    supports_function_calling: true,
    supports_parallel_function_calling: true,
  }),
};

describe("executeTool", () => {
  beforeEach(() => {
    vi.mocked(getModels).mockResolvedValue(testModels);
    vi.mocked(refreshPrices).mockResolvedValue({
      count: 5,
      timestamp: "2025-01-15T12:00:00.000Z",
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("get_model_details", () => {
    it("returns formatted output for a valid model", async () => {
      const result = await executeTool("get_model_details", {
        model_name: "claude-sonnet-4-5",
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      expect(text).toContain("Model: claude-sonnet-4-5");
      expect(text).toContain("Provider: anthropic");
      expect(text).toContain("Mode: chat");
      expect(text).toContain("Pricing (per 1M tokens):");
      expect(text).toContain("$3.00");
      expect(text).toContain("$15.00");
      expect(text).toContain("200K");
      expect(text).toContain("vision");
      expect(text).toContain("function_calling");
    });

    it("returns helpful message for unknown model", async () => {
      const result = await executeTool("get_model_details", {
        model_name: "nonexistent-model-xyz-9999",
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      expect(text).toContain('No model found matching "nonexistent-model-xyz-9999"');
      expect(text).toContain("compare_models");
    });

    it("works with fuzzy matched model names", async () => {
      // "gpt 4o" should fuzzy-match "gpt-4o"
      const result = await executeTool("get_model_details", {
        model_name: "gpt-4o",
      });

      const text = result.content[0].text;
      expect(text).toContain("Model: gpt-4o");
      expect(text).toContain("Provider: openai");
    });

    it("shows 'none listed' when model has no capabilities", async () => {
      const result = await executeTool("get_model_details", {
        model_name: "gemini-2.0-flash",
      });

      const text = result.content[0].text;
      expect(text).toContain("Capabilities: none listed");
    });
  });

  describe("calculate_estimate", () => {
    it("computes correct costs for given token counts", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "claude-sonnet-4-5",
        input_tokens: 1000,
        output_tokens: 500,
      });

      expect(result.content).toHaveLength(1);
      const text = result.content[0].text;
      expect(text).toContain("Cost Estimate for claude-sonnet-4-5");

      // input: 1000 * 0.000003 = 0.003
      // output: 500 * 0.000015 = 0.0075
      // total: 0.0105
      expect(text).toContain("$0.003000");
      expect(text).toContain("$0.007500");
      expect(text).toContain("$0.0105");
    });

    it("handles zero tokens", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "gpt-4o",
        input_tokens: 0,
        output_tokens: 0,
      });

      const text = result.content[0].text;
      expect(text).toContain("Cost Estimate for gpt-4o");
      expect(text).toContain("$0.00000000");
    });

    it("handles large token counts", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "gpt-4o-mini",
        input_tokens: 1000000,
        output_tokens: 1000000,
      });

      const text = result.content[0].text;
      // input: 1M * 0.00000015 = 0.15
      // output: 1M * 0.0000006 = 0.6
      expect(text).toContain("Cost Estimate for gpt-4o-mini");
    });

    it("returns error for unknown model", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "nonexistent-model-xyz-9999",
        input_tokens: 1000,
        output_tokens: 500,
      });

      const text = result.content[0].text;
      expect(text).toContain('No model found matching "nonexistent-model-xyz-9999"');
    });
  });

  describe("compare_models", () => {
    it("filters by provider", async () => {
      const result = await executeTool("compare_models", {
        provider: "openai",
      });

      const text = result.content[0].text;
      expect(text).toContain("provider: openai");
      // Should include openai models
      expect(text).toContain("gpt-4o");
      // Should not include anthropic or google models
      expect(text).not.toContain("claude-sonnet-4-5");
    });

    it("filters by min_context", async () => {
      const result = await executeTool("compare_models", {
        min_context: 200000,
      });

      const text = result.content[0].text;
      // Only models with max_input_tokens >= 200000 should appear
      // claude-sonnet-4-5 (200000) and gemini-2.0-flash (1000000) qualify
      expect(text).toContain("claude-sonnet-4-5");
      expect(text).toContain("gemini-2.0-flash");
      // gpt-4o (128000) should NOT appear
      expect(text).not.toContain("gpt-4o-mini");
    });

    it("filters by mode", async () => {
      const result = await executeTool("compare_models", {
        mode: "embedding",
      });

      const text = result.content[0].text;
      expect(text).toContain("text-embedding-3-large");
      expect(text).toContain("mode: embedding");
      expect(text).not.toContain("gpt-4o-mini");
    });

    it("sorts by cost-effectiveness (lowest input cost first)", async () => {
      const result = await executeTool("compare_models", {
        provider: "openai",
        mode: "chat",
      });

      const text = result.content[0].text;
      // gpt-4o-mini (0.00000015) should come before gpt-4o (0.000005)
      const miniIndex = text.indexOf("gpt-4o-mini");
      const gpt4oIndex = text.indexOf("gpt-4o\n");
      // gpt-4o-mini should appear first
      expect(miniIndex).toBeLessThan(gpt4oIndex);
    });

    it("returns message when no models match", async () => {
      const result = await executeTool("compare_models", {
        provider: "nonexistent-provider-xyz",
      });

      const text = result.content[0].text;
      expect(text).toContain("No models match the given criteria");
    });

    it("limits to 5 results and shows total count", async () => {
      const result = await executeTool("compare_models", {});

      const text = result.content[0].text;
      expect(text).toContain("models matched total");
    });

    it("supports combined filters", async () => {
      const result = await executeTool("compare_models", {
        provider: "openai",
        min_context: 100000,
        mode: "chat",
      });

      const text = result.content[0].text;
      // gpt-4o and gpt-4o-mini have 128000 context and are openai chat
      expect(text).toContain("gpt-4o");
      // embedding model should be excluded by mode filter
      expect(text).not.toContain("text-embedding");
    });
  });

  describe("refresh_prices", () => {
    it("returns count and timestamp", async () => {
      const result = await executeTool("refresh_prices", {});

      const text = result.content[0].text;
      expect(text).toContain("Pricing data refreshed successfully");
      expect(text).toContain("Models loaded: 5");
      expect(text).toContain("Timestamp: 2025-01-15T12:00:00.000Z");
    });

    it("calls refreshPrices from pricing module", async () => {
      await executeTool("refresh_prices", {});
      expect(refreshPrices).toHaveBeenCalledTimes(1);
    });
  });

  describe("error handling", () => {
    it("returns error for unknown tool name", async () => {
      const result = await executeTool("nonexistent_tool", {});

      const text = result.content[0].text;
      expect(text).toContain("Unknown tool: nonexistent_tool");
    });

    it("returns error for invalid get_model_details args (missing model_name)", async () => {
      const result = await executeTool("get_model_details", {});

      const text = result.content[0].text;
      expect(text).toContain("Error:");
    });

    it("returns error for invalid get_model_details args (empty model_name)", async () => {
      const result = await executeTool("get_model_details", {
        model_name: "",
      });

      const text = result.content[0].text;
      expect(text).toContain("Error:");
    });

    it("returns error for invalid calculate_estimate args (missing fields)", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "gpt-4o",
      });

      const text = result.content[0].text;
      expect(text).toContain("Error:");
    });

    it("returns error for negative token counts", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "gpt-4o",
        input_tokens: -100,
        output_tokens: 500,
      });

      const text = result.content[0].text;
      expect(text).toContain("Error:");
    });

    it("handles getModels throwing an error", async () => {
      vi.mocked(getModels).mockRejectedValueOnce(new Error("No pricing data available"));

      const result = await executeTool("get_model_details", {
        model_name: "gpt-4o",
      });

      const text = result.content[0].text;
      expect(text).toContain("Error:");
      expect(text).toContain("No pricing data available");
    });

    it("handles refreshPrices throwing an error", async () => {
      vi.mocked(refreshPrices).mockRejectedValueOnce(new Error("Network failure"));

      const result = await executeTool("refresh_prices", {});

      const text = result.content[0].text;
      expect(text).toContain("Error:");
      expect(text).toContain("Network failure");
    });
  });

  describe("tiered pricing", () => {
    it("calculates tiered cost when tokens exceed 200K", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "claude-opus-4",
        input_tokens: 300000,
        output_tokens: 250000,
      });

      const text = result.content[0].text;
      expect(text).toContain("Cost Estimate for claude-opus-4");
      // Input: 200K × $15/1M = $3.00, 100K × $30/1M = $3.00
      expect(text).toContain("Input (base):");
      expect(text).toContain("Input (>200K):");
      expect(text).toContain("Output (base):");
      expect(text).toContain("Output (>200K):");
      // Total: input $3+$3=6, output $15+$7.50=22.50 → $28.50
      expect(text).toContain("$28.50");
    });

    it("uses flat rate when tokens are below threshold on a tiered model", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "claude-opus-4",
        input_tokens: 100000,
        output_tokens: 50000,
      });

      const text = result.content[0].text;
      // Should use flat format, not tiered
      expect(text).not.toContain("(base):");
      expect(text).not.toContain("(>200K):");
      expect(text).toContain("Input:");
      expect(text).toContain("Output:");
    });

    it("uses flat rate for non-tiered model even above 200K tokens", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "gpt-4o",
        input_tokens: 300000,
        output_tokens: 300000,
      });

      const text = result.content[0].text;
      expect(text).not.toContain("(base):");
      expect(text).not.toContain("(>200K):");
    });

    it("uses flat rate at exact boundary (200K tokens)", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "claude-opus-4",
        input_tokens: 200000,
        output_tokens: 200000,
      });

      const text = result.content[0].text;
      // Exactly at threshold → flat rate, no tiering
      expect(text).not.toContain("(base):");
      expect(text).not.toContain("(>200K):");
    });

    it("shows tiered pricing section in get_model_details for tiered models", async () => {
      const result = await executeTool("get_model_details", {
        model_name: "claude-opus-4",
      });

      const text = result.content[0].text;
      expect(text).toContain("Tiered Pricing");
      expect(text).toContain("$30.00");
      expect(text).toContain("$150.00");
    });

    it("omits tiered pricing section in get_model_details for non-tiered models", async () => {
      const result = await executeTool("get_model_details", {
        model_name: "gpt-4o",
      });

      const text = result.content[0].text;
      expect(text).not.toContain("Tiered Pricing");
    });
  });

  describe("prompt caching", () => {
    it("shows cached pricing in get_model_details when available", async () => {
      const result = await executeTool("get_model_details", {
        model_name: "claude-3-5-sonnet-20241022",
      });

      const text = result.content[0].text;
      expect(text).toContain("Prompt Caching:");
      expect(text).toContain("Cached input:");
      expect(text).toContain("$0.3000");
    });

    it("omits cached pricing section when not available", async () => {
      const result = await executeTool("get_model_details", {
        model_name: "gpt-4o",
      });

      const text = result.content[0].text;
      expect(text).not.toContain("Prompt Caching:");
    });

    it("calculates blended cost with cached_tokens in calculate_estimate", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "claude-3-5-sonnet-20241022",
        input_tokens: 1000,
        output_tokens: 500,
        cached_tokens: 800,
      });

      const text = result.content[0].text;
      expect(text).toContain("Cached input:");
      // cached: 800 * 0.0000003 = 0.00024
      // uncached input: 200 * 0.000003 = 0.0006
      // output: 500 * 0.000015 = 0.0075
      // total: 0.0000024 + ... wait
      // cached: 800 tokens × 0.0000003/token = 0.00024
      // uncached: 200 tokens × 0.000003/token = 0.0006
      // output: 500 tokens × 0.000015/token = 0.0075
      // total: 0.00024 + 0.0006 + 0.0075 = 0.00834
      expect(text).toContain("$0.008340");
    });

    it("ignores cached_tokens when model does not support caching", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "gpt-4o",
        input_tokens: 1000,
        output_tokens: 500,
        cached_tokens: 800,
      });

      const text = result.content[0].text;
      expect(text).not.toContain("Cached input:");
      // Full 1000 input tokens at standard rate
      // input: 1000 * 0.000005 = 0.005
      // output: 500 * 0.000015 = 0.0075
      // total: 0.0125
      expect(text).toContain("$0.0125");
    });

    it("caps cached_tokens at input_tokens", async () => {
      const result = await executeTool("calculate_estimate", {
        model_name: "claude-3-5-sonnet-20241022",
        input_tokens: 500,
        output_tokens: 200,
        cached_tokens: 1000,
      });

      const text = result.content[0].text;
      expect(text).toContain("Cached input:");
      // cached is capped to 500
      // cached: 500 * 0.0000003 = 0.00015
      // uncached: 0 * 0.000003 = 0
      // output: 200 * 0.000015 = 0.003
      // total: 0.00315
      expect(text).toContain("$0.003150");
    });

    it("shows prompt caching indicator in compare_models", async () => {
      const result = await executeTool("compare_models", {
        provider: "anthropic",
      });

      const text = result.content[0].text;
      expect(text).toContain("claude-3-5-sonnet-20241022");
      expect(text).toContain("Prompt caching:");
    });

    it("does not show prompt caching for non-caching models in compare_models", async () => {
      const result = await executeTool("compare_models", {
        provider: "openai",
        mode: "embedding",
      });

      const text = result.content[0].text;
      expect(text).not.toContain("Prompt caching:");
    });
  });
});

describe("calculateTieredCost", () => {
  const tieredModel = testModels["claude-opus-4"];
  const flatModel = testModels["gpt-4o"];

  it("splits cost at threshold when tokens exceed 200K", () => {
    const result = calculateTieredCost(tieredModel, 300000, 250000);

    expect(result.tieredInput).toBe(true);
    expect(result.tieredOutput).toBe(true);
    // Input: 200K × 0.000015 = 3.00, 100K × 0.00003 = 3.00
    expect(result.inputBaseCost).toBeCloseTo(3.0, 5);
    expect(result.inputTieredCost).toBeCloseTo(3.0, 5);
    expect(result.inputCost).toBeCloseTo(6.0, 5);
    // Output: 200K × 0.000075 = 15.00, 50K × 0.00015 = 7.50
    expect(result.outputBaseCost).toBeCloseTo(15.0, 5);
    expect(result.outputTieredCost).toBeCloseTo(7.5, 5);
    expect(result.outputCost).toBeCloseTo(22.5, 5);
    expect(result.totalCost).toBeCloseTo(28.5, 5);
  });

  it("uses flat rate when tokens are at or below threshold", () => {
    const result = calculateTieredCost(tieredModel, 200000, 100000);

    expect(result.tieredInput).toBe(false);
    expect(result.tieredOutput).toBe(false);
    expect(result.inputTieredCost).toBe(0);
    expect(result.outputTieredCost).toBe(0);
    expect(result.inputCost).toBeCloseTo(3.0, 5);
    expect(result.outputCost).toBeCloseTo(7.5, 5);
  });

  it("uses flat rate for non-tiered model regardless of token count", () => {
    const result = calculateTieredCost(flatModel, 500000, 500000);

    expect(result.tieredInput).toBe(false);
    expect(result.tieredOutput).toBe(false);
    expect(result.inputTieredCost).toBe(0);
    expect(result.outputTieredCost).toBe(0);
  });
});
