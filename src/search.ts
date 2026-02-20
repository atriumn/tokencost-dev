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

export function fuzzyMatch(
  query: string,
  models: Record<string, ModelEntry>,
): ModelEntry | null {
  // Strip provider prefix before matching
  const normalizedQuery = stripProviderPrefix(query);

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

export function fuzzyMatchMultiple(
  query: string,
  models: Record<string, ModelEntry>,
  limit = 5,
): ModelEntry[] {
  // Strip provider prefix before matching
  const normalizedQuery = stripProviderPrefix(query);

  const index = buildIndex(models);
  const results = index.search(normalizedQuery, { limit });
  return results.map((r) => models[r.item.key]);
}
