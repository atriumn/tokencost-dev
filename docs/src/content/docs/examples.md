---
title: Examples
description: Real-world usage examples showing how to use tokencost for model comparison, discovery, and cost estimation.
---

Here's what it looks like in practice — natural language questions, instant pricing answers:

![tokencost demo](/tokencost-dev.gif)

Below are detailed examples of the three most common workflows. All output is real, captured from the live registry.

## Cost comparison

**Prompt:**

> "I'm choosing between Claude Opus 5.5 and GPT-5.5 for an agent. Compare their pricing and context windows."

**Tool called:** `get_model_details` (twice — once per model)

**Output:**

```
Model: claude-opus-5-5
Provider: anthropic
Mode: chat

Pricing (per 1M tokens):
  Input:  $4.00
  Output: $20.00

Prompt Caching:
  Cached input: $0.2000 / 1M tokens

Context Window:
  Max Input:  1.0M
  Max Output: 128K
  Max Tokens: 128K

Capabilities: vision, function_calling
```

```
Model: gpt-5.5
Provider: openai
Mode: chat

Pricing (per 1M tokens):
  Input:  $5.00
  Output: $30.00

Prompt Caching:
  Cached input: $0.5000 / 1M tokens

Context Window:
  Max Input:  1.1M
  Max Output: 128K
  Max Tokens: 128K

Capabilities: vision, function_calling, parallel_function_calling
```

**Takeaway:** Opus 5.5 is 20% cheaper on input and a third cheaper on output, and its cached-input rate is less than half of GPT-5.5's — which matters for agents that resend long system prompts and tool definitions every turn. Context windows are effectively equal.

---

## Discovery

**Prompt:**

> "What's the cheapest Google model with at least a 1M-token context window?"

**Tool called:** `compare_models` with `provider: "google"`, `min_context: 1000000`, `mode: "chat"`

**Output:**

```
Top 5 most cost-effective models (provider: google) (min context: 1.0M) (mode: chat):
1. gemini-2.5-flash-lite
   Provider: vertex_ai-language-models | Mode: chat
   Input: $0.1000/1M | Output: $0.4000/1M
   Context: 1.0M in / 66K out
   Prompt caching: $0.0100/1M cached input

2. gemini-2.5-flash-lite-preview-09-2025
   Provider: vertex_ai-language-models | Mode: chat
   Input: $0.1000/1M | Output: $0.4000/1M
   Context: 1.0M in / 66K out
   Prompt caching: $0.0100/1M cached input

3. gemini/gemini-2.5-flash-lite
   Provider: gemini | Mode: chat
   Input: $0.1000/1M | Output: $0.4000/1M
   Context: 1.0M in / 66K out
   Prompt caching: $0.0100/1M cached input

4. gemini-3.1-flash-lite-preview
   Provider: vertex_ai-language-models | Mode: chat
   Input: $0.2500/1M | Output: $1.50/1M
   Context: 1.0M in / 66K out
   Prompt caching: $0.0250/1M cached input

5. gemini-3.1-flash-lite
   Provider: vertex_ai-language-models | Mode: chat
   Input: $0.2500/1M | Output: $1.50/1M
   Context: 1.0M in / 66K out
   Prompt caching: $0.0250/1M cached input
(80 models matched total; 4 without pricing data excluded)
```

**Takeaway:** `google` covers both the Gemini API and Vertex AI, which list the same models at the same price. Gemini 2.5 Flash-Lite gives you a 1M-token window for $0.10/1M input; stepping up to the 3.1 generation costs 2.5x on input.

---

## Batch planning

**Prompt:**

> "How much would it cost to run Claude Opus 5.5 vs Sonnet 5.5 for a batch of 10K requests, averaging 2K input and 500 output tokens each?"

**Tools called:** `calculate_estimate` (twice — once per model)

**Claude Opus 5.5:**

```
Cost Estimate for claude-opus-5-5

  Input:  20.0M tokens × $4.00/1M = $80.00
  Output: 5.0M tokens × $20.00/1M = $100.00
  ─────────────────────────────
  Total:  $180.00
```

**Claude Sonnet 5.5:**

```
Cost Estimate for claude-sonnet-5-5

  Input:  20.0M tokens × $2.00/1M = $40.00
  Output: 5.0M tokens × $10.00/1M = $50.00
  ─────────────────────────────
  Total:  $90.00
```

**Takeaway:** Sonnet is exactly half the price for this workload ($90 vs $180). Unless the task needs Opus-level reasoning, Sonnet saves $90 per 10K-request batch.
