import { describe, it, expect } from "vitest";
import { fuzzyMatch, fuzzyMatchMultiple } from "./search.js";
import type { ModelEntry } from "./pricing.js";

/** Helper to build a minimal ModelEntry for testing */
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

const sampleModels: Record<string, ModelEntry> = {
  "claude-sonnet-4-5": makeModel({
    key: "claude-sonnet-4-5",
    litellm_provider: "anthropic",
  }),
  "claude-opus-4": makeModel({
    key: "claude-opus-4",
    litellm_provider: "anthropic",
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    input_cost_per_million: 15.0,
    output_cost_per_million: 75.0,
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
  }),
};

describe("fuzzyMatch", () => {
  it("returns exact match when key matches exactly", () => {
    const result = fuzzyMatch("gpt-4o", sampleModels);
    expect(result).not.toBeNull();
    expect(result!.key).toBe("gpt-4o");
  });

  it("returns exact match for full model name", () => {
    const result = fuzzyMatch("claude-sonnet-4-5", sampleModels);
    expect(result).not.toBeNull();
    expect(result!.key).toBe("claude-sonnet-4-5");
  });

  it("handles case-insensitive exact match", () => {
    const result = fuzzyMatch("GPT-4O", sampleModels);
    expect(result).not.toBeNull();
    expect(result!.key).toBe("gpt-4o");
  });

  it("handles mixed case exact match", () => {
    const result = fuzzyMatch("Claude-Sonnet-4-5", sampleModels);
    expect(result).not.toBeNull();
    expect(result!.key).toBe("claude-sonnet-4-5");
  });

  it("fuzzy matches partial/close model names", () => {
    const result = fuzzyMatch("claude sonnet", sampleModels);
    expect(result).not.toBeNull();
    // Should match one of the claude models
    expect(result!.key).toContain("claude");
  });

  it("fuzzy matches with typos", () => {
    const result = fuzzyMatch("gpt-4o-mni", sampleModels);
    expect(result).not.toBeNull();
    expect(result!.key).toBe("gpt-4o-mini");
  });

  it("fuzzy matches gemini models", () => {
    const result = fuzzyMatch("gemini-2.0", sampleModels);
    expect(result).not.toBeNull();
    expect(result!.key).toContain("gemini");
  });

  it("returns null for garbage input", () => {
    const result = fuzzyMatch("xyzzyplugh_12345", sampleModels);
    expect(result).toBeNull();
  });

  it("returns null for empty string against populated models", () => {
    // Fuse.js returns empty for empty queries
    const result = fuzzyMatch("", sampleModels);
    expect(result).toBeNull();
  });

  it("returns null when models dict is empty", () => {
    const result = fuzzyMatch("gpt-4o", {});
    expect(result).toBeNull();
  });
});

describe("fuzzyMatchMultiple", () => {
  it("returns up to the default limit of 5 results", () => {
    const results = fuzzyMatchMultiple("claude", sampleModels);
    // We have 2 claude models, so should return at most 2 for "claude"
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("respects the limit parameter", () => {
    const results = fuzzyMatchMultiple("model", sampleModels, 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it("returns ModelEntry objects with correct structure", () => {
    const results = fuzzyMatchMultiple("gpt", sampleModels, 3);
    expect(results.length).toBeGreaterThanOrEqual(1);

    for (const entry of results) {
      expect(entry).toHaveProperty("key");
      expect(entry).toHaveProperty("input_cost_per_token");
      expect(entry).toHaveProperty("output_cost_per_token");
      expect(entry).toHaveProperty("litellm_provider");
    }
  });

  it("returns empty array for garbage query", () => {
    const results = fuzzyMatchMultiple("xyzzyplugh_12345", sampleModels);
    expect(results).toEqual([]);
  });

  it("returns empty array for empty models", () => {
    const results = fuzzyMatchMultiple("gpt-4o", {});
    expect(results).toEqual([]);
  });

  it("matches claude models with a general query", () => {
    const results = fuzzyMatchMultiple("claude", sampleModels, 10);
    const keys = results.map((r) => r.key);
    expect(keys).toContain("claude-sonnet-4-5");
    expect(keys).toContain("claude-opus-4");
  });
});
