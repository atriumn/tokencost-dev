---
title: Examples
description: Real-world usage examples showing how to use tokencost for model comparison, discovery, and cost estimation.
---

Here's what it looks like in practice — natural language questions, instant pricing answers:

![tokencost demo](/tokencost-dev.gif)

Below are detailed examples of the three most common workflows.

## Cost comparison

**Prompt:**

> "I'm choosing between Claude Sonnet and GPT-5.2 for a summarization pipeline. Compare their pricing and context windows."

**Tool called:** `compare_models`

**Output:**

```
Top 5 most cost-effective models matching your criteria:

1. gpt-5.2
   Provider: openai | Mode: chat
   Input: $2.00/1M | Output: $8.00/1M
   Context: 1,047K in / 64K out
   Capabilities: function_calling, vision, parallel_function_calling

2. claude-sonnet-4-5
   Provider: anthropic | Mode: chat
   Input: $3.00/1M | Output: $15.00/1M
   Context: 200K in / 8K out
   Capabilities: function_calling, vision, parallel_function_calling
```

**Takeaway:** GPT-5.2 is cheaper per token and has a much larger context window. Claude Sonnet 4.5 costs ~50% more on input and nearly 2x on output, but may be preferred for quality on specific tasks. For a high-volume summarization pipeline, the pricing difference adds up.

---

## Discovery

**Prompt:**

> "What's the biggest context window I can get for under $1/1M input tokens?"

**Tool called:** `compare_models`

**Output:**

```
Top 5 most cost-effective models matching your criteria:

1. gemini/gemini-2.5-flash
   Provider: gemini | Mode: chat
   Input: $0.15/1M | Output: $0.60/1M
   Context: 1,048K in / 65K out
   Capabilities: function_calling, vision, parallel_function_calling

2. gemini/gemini-2.0-flash
   Provider: gemini | Mode: chat
   Input: $0.10/1M | Output: $0.40/1M
   Context: 1,048K in / 8K out
   Capabilities: function_calling, vision, parallel_function_calling

3. deepseek/deepseek-chat
   Provider: deepseek | Mode: chat
   Input: $0.14/1M | Output: $0.28/1M
   Context: 64K in / 8K out
   Capabilities: function_calling, parallel_function_calling

4. gemini/gemini-2.0-flash-lite
   Provider: gemini | Mode: chat
   Input: $0.04/1M | Output: $0.15/1M
   Context: 1,048K in / 8K out
   Capabilities: function_calling, vision, parallel_function_calling

5. mistral/mistral-small-latest
   Provider: mistral | Mode: chat
   Input: $0.10/1M | Output: $0.30/1M
   Context: 32K in / 32K out
   Capabilities: function_calling, parallel_function_calling
```

**Takeaway:** Gemini models dominate the budget-friendly, large-context space — offering 1M+ token windows at fractions of a cent. If you need a massive context window on a tight budget, Gemini 2.5 Flash gives you the best balance of capability and cost.

---

## Batch planning

**Prompt:**

> "How much would it cost to run Claude Opus vs Sonnet for a batch of 10K requests, averaging 2K input and 500 output tokens each?"

**Tools called:** `calculate_estimate` (twice — once per model)

**Claude Opus 4.6:**

```
Model: claude-opus-4-6
Provider: anthropic

Token counts:
  Input:  20,000,000 tokens
  Output: 5,000,000 tokens

Estimated cost:
  Input:  $300.00
  Output: $150.00
  Total:  $450.00

Rate per 1M tokens:
  Input:  $15.00
  Output: $30.00
```

**Claude Sonnet 4.6:**

```
Model: claude-sonnet-4-6
Provider: anthropic

Token counts:
  Input:  20,000,000 tokens
  Output: 5,000,000 tokens

Estimated cost:
  Input:  $60.00
  Output: $75.00
  Total:  $135.00

Rate per 1M tokens:
  Input:  $3.00
  Output: $15.00
```

**Takeaway:** Sonnet is 3.3x cheaper for this workload ($135 vs $450). Unless the task specifically requires Opus-level reasoning, Sonnet saves $315 per 10K-request batch — making it the clear choice for high-volume pipelines.
