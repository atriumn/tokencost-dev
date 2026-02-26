import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, "..", ".cache");
const CACHE_FILE = join(CACHE_DIR, "prices.json");
const SOURCE_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export const TIERED_PRICING_THRESHOLD = 200_000;

export interface ModelEntry {
  key: string;
  input_cost_per_token: number;
  output_cost_per_token: number;
  input_cost_per_million: number;
  output_cost_per_million: number;
  input_cost_per_token_above_200k: number | null;
  output_cost_per_token_above_200k: number | null;
  input_cost_per_million_above_200k: number | null;
  output_cost_per_million_above_200k: number | null;
  cache_read_input_token_cost: number | null;
  cache_read_input_token_cost_per_million: number | null;
  max_input_tokens: number | null;
  max_output_tokens: number | null;
  max_tokens: number | null;
  litellm_provider: string;
  mode: string;
  supports_vision: boolean;
  supports_function_calling: boolean;
  supports_parallel_function_calling: boolean;
}

interface CacheData {
  timestamp: number;
  models: Record<string, ModelEntry>;
}

let cache: CacheData | null = null;

function normalize(key: string, raw: Record<string, unknown>): ModelEntry | null {
  const inputCost = Number(raw.input_cost_per_token) || 0;
  const outputCost = Number(raw.output_cost_per_token) || 0;

  const tieredInput =
    typeof raw.input_cost_per_token_above_200k_tokens === "number"
      ? raw.input_cost_per_token_above_200k_tokens
      : null;
  const tieredOutput =
    typeof raw.output_cost_per_token_above_200k_tokens === "number"
      ? raw.output_cost_per_token_above_200k_tokens
      : null;

  const cacheReadCost =
    typeof raw.cache_read_input_token_cost === "number" ? raw.cache_read_input_token_cost : null;

  return {
    key,
    input_cost_per_token: inputCost,
    output_cost_per_token: outputCost,
    input_cost_per_million: inputCost * 1_000_000,
    output_cost_per_million: outputCost * 1_000_000,
    input_cost_per_token_above_200k: tieredInput,
    output_cost_per_token_above_200k: tieredOutput,
    input_cost_per_million_above_200k: tieredInput != null ? tieredInput * 1_000_000 : null,
    output_cost_per_million_above_200k: tieredOutput != null ? tieredOutput * 1_000_000 : null,
    cache_read_input_token_cost: cacheReadCost,
    cache_read_input_token_cost_per_million:
      cacheReadCost != null ? cacheReadCost * 1_000_000 : null,
    max_input_tokens: typeof raw.max_input_tokens === "number" ? raw.max_input_tokens : null,
    max_output_tokens: typeof raw.max_output_tokens === "number" ? raw.max_output_tokens : null,
    max_tokens: typeof raw.max_tokens === "number" ? raw.max_tokens : null,
    litellm_provider: typeof raw.litellm_provider === "string" ? raw.litellm_provider : "unknown",
    mode: typeof raw.mode === "string" ? raw.mode : "chat",
    supports_vision: raw.supports_vision === true,
    supports_function_calling: raw.supports_function_calling === true,
    supports_parallel_function_calling: raw.supports_parallel_function_calling === true,
  };
}

function parseRawData(raw: Record<string, unknown>): Record<string, ModelEntry> {
  const models: Record<string, ModelEntry> = {};

  for (const [key, value] of Object.entries(raw)) {
    // Skip metadata key
    if (key === "sample_spec") continue;
    if (typeof value !== "object" || value === null) continue;

    const entry = normalize(key, value as Record<string, unknown>);
    if (entry) {
      models[key] = entry;
    }
  }

  return models;
}

function loadDiskCache(): CacheData | null {
  try {
    if (!existsSync(CACHE_FILE)) return null;
    const data = JSON.parse(readFileSync(CACHE_FILE, "utf-8")) as CacheData;
    if (data.timestamp && data.models) return data;
    return null;
  } catch {
    return null;
  }
}

function saveDiskCache(data: CacheData): void {
  try {
    if (!existsSync(CACHE_DIR)) {
      mkdirSync(CACHE_DIR, { recursive: true });
    }
    writeFileSync(CACHE_FILE, JSON.stringify(data));
  } catch {
    // Disk cache write failure is non-fatal
  }
}

async function fetchFromSource(): Promise<Record<string, ModelEntry>> {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch pricing data: ${response.status}`);
  }
  const raw = (await response.json()) as Record<string, unknown>;
  return parseRawData(raw);
}

export async function refreshPrices(): Promise<{
  count: number;
  timestamp: string;
}> {
  const models = await fetchFromSource();
  const timestamp = Date.now();
  cache = { timestamp, models };
  saveDiskCache(cache);
  return {
    count: Object.keys(models).length,
    timestamp: new Date(timestamp).toISOString(),
  };
}

export async function getModels(): Promise<Record<string, ModelEntry>> {
  // If cache is fresh, return it
  if (cache && Date.now() - cache.timestamp < TTL_MS) {
    return cache.models;
  }

  // Try disk cache
  if (!cache) {
    const disk = loadDiskCache();
    if (disk) {
      cache = disk;
      // If disk cache is still fresh, use it
      if (Date.now() - disk.timestamp < TTL_MS) {
        return cache.models;
      }
    }
  }

  // Fetch fresh data
  try {
    await refreshPrices();
  } catch {
    // If fetch fails and we have stale cache, use it
    if (cache) {
      return cache.models;
    }
    throw new Error("No pricing data available — fetch failed and no cache exists");
  }

  if (!cache) {
    throw new Error("No pricing data available — refresh succeeded but cache is empty");
  }
  return cache.models;
}

export function getModelCount(): number {
  return cache ? Object.keys(cache.models).length : 0;
}
