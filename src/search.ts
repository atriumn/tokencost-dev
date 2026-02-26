import Fuse from "fuse.js";
import type { ModelEntry } from "./pricing.js";

let fuse: Fuse<{ key: string }> | null = null;
let lastKeys: string[] = [];

const KNOWN_PREFIXES = [
  // Longer prefixes must come first to avoid partial matches
  "vertex_ai_beta/",
  "vertex_ai/",
  "together_ai/",
  "fireworks_ai/",
  "openrouter/",
  "bedrock/",
  "azure/",
];

export interface SearchResult {
  entry: ModelEntry | null;
  isFineTuned?: boolean;
}

/**
 * Extract base model from OpenAI fine-tuned model pattern.
 * e.g., "ft:gpt-4o:my-org:custom_suffix:id" -> "gpt-4o"
 * Returns the original string if not a fine-tuned pattern.
 */
function extractFineTunedBase(query: string): { base: string; isFineTuned: boolean } {
  if (query.toLowerCase().startsWith("ft:")) {
    const parts = query.split(":");
    if (parts.length >= 2) {
      return { base: parts[1], isFineTuned: true };
    }
  }
  return { base: query, isFineTuned: false };
}

/**
 * Strip known provider prefixes from a query string.
 * e.g., "azure/gpt-4o" -> "gpt-4o", "bedrock/anthropic.claude-3" -> "anthropic.claude-3"
 */
function stripProviderPrefix(query: string): string {
  const lowerQuery = query.toLowerCase();
  for (const prefix of KNOWN_PREFIXES) {
    if (lowerQuery.startsWith(prefix)) {
      return query.slice(prefix.length);
    }
  }
  return query;
}

function buildIndex(models: Record<string, ModelEntry>): Fuse<{ key: string }> {
  const keys = Object.keys(models);

  // Only rebuild if keys changed
  if (fuse && keys.length === lastKeys.length && keys[0] === lastKeys[0]) {
    return fuse;
  }

  lastKeys = keys;
  const items = keys.map((key) => ({ key }));
  fuse = new Fuse(items, {
    keys: ["key"],
    threshold: 0.4,
    includeScore: true,
  });

  return fuse;
}

export function fuzzyMatch(query: string, models: Record<string, ModelEntry>): ModelEntry | null {
  // Strip provider prefix first, then handle fine-tuned pattern
  const withoutProvider = stripProviderPrefix(query);
  const { base: normalizedQuery } = extractFineTunedBase(withoutProvider);

  // Try exact match first
  if (models[normalizedQuery]) {
    return models[normalizedQuery];
  }

  // Try case-insensitive exact match
  const lowerQuery = normalizedQuery.toLowerCase();
  for (const [key, entry] of Object.entries(models)) {
    if (key.toLowerCase() === lowerQuery) {
      return entry;
    }
  }

  // Fuzzy search
  const index = buildIndex(models);
  const results = index.search(normalizedQuery);

  if (results.length > 0) {
    return models[results[0].item.key];
  }

  return null;
}

export function fuzzyMatchWithMetadata(
  query: string,
  models: Record<string, ModelEntry>,
): SearchResult {
  const withoutProvider = stripProviderPrefix(query);
  const { isFineTuned } = extractFineTunedBase(withoutProvider);
  const entry = fuzzyMatch(query, models);
  return { entry, isFineTuned };
}

export function fuzzyMatchMultiple(
  query: string,
  models: Record<string, ModelEntry>,
  limit = 5,
): ModelEntry[] {
  // Strip provider prefix first, then handle fine-tuned pattern
  const withoutProvider = stripProviderPrefix(query);
  const { base } = extractFineTunedBase(withoutProvider);
  const normalizedQuery = base;

  const index = buildIndex(models);
  const results = index.search(normalizedQuery, { limit });
  return results.map((r) => models[r.item.key]);
}
