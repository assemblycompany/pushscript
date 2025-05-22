# PushScript Token Optimization

## Overview

This document explains how the token optimization system works in PushScript to ensure that we maintain the best performance when interacting with LLM APIs, particularly Gemini API.

## Problem

When dealing with large diffs, the API may fail or produce suboptimal results due to:

1. Exceeding token limits of the API
2. Having too much irrelevant information in the context
3. Hitting rate limits (RPM/TPM)

## Solution Architecture

We've implemented a token optimization system that:

1. Estimates token counts for text content
2. Intelligently optimizes git diffs for LLM processing
3. Configures request parameters for each provider to maximize efficacy

### Token Estimation

We use a heuristic approach to estimate token counts:

```javascript
export function estimateTokenCount(text) {
  if (!text) return 0;
  
  // Simple heuristic: average English word is ~1.3 tokens
  // Whitespace adds tokens, code has special tokens, etc.
  const words = text.split(/\s+/).length;
  const chars = text.length;
  
  // Formula based on GPT tokenization patterns (approximation)
  // For Gemini, this is a rough estimate - actual tokenization may vary
  return Math.ceil((words * 1.3) + (chars * 0.1));
}
```

### Diff Optimization

Rather than simply truncating diffs, we intelligently extract the most important parts:

1. Parse the diff to identify file changes
2. Retain file headers and change statistics
3. Keep only the most significant changed lines (additions/deletions) with minimal context
4. Format the result in a clear, structured way

### Gemini API Configuration

Based on Gemini's API documentation, we've optimized for:

- **Rate Limits**:
  - Free tier: 15 RPM, 1,000,000 TPM
  - Tier 1: 2,000 RPM, 4,000,000 TPM

- **Request Optimization**:
  - Set temperature to 0 for deterministic outputs
  - Configure safety settings appropriately
  - Set topP and topK parameters for better quality
  - Optimize maximum output tokens

## Gemini-Specific Considerations

For Gemini 2.0 Flash, we've made the following considerations:

1. The model can handle up to ~30,000 input tokens but works best with focused inputs
2. We target a maximum of 6,000 tokens for diff content to ensure quality
3. We've relaxed safety settings for code-related content
4. We've configured tokenization to optimize for code

## Usage

The optimization happens automatically when generating commit messages. The system:

1. Detects when a diff is too large
2. Applies the appropriate optimization strategy
3. Logs information about the optimization process
4. Configures the API request appropriately

## Further Improvements

Potential future improvements:

1. Implement a more accurate token counting algorithm specific to Gemini
2. Add adaptive strategies based on prior API success/failure
3. Implement fallback strategies for extremely large diffs
4. Cache optimization results to avoid recalculating for unchanged files

## References

- [Gemini API Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Gemini API Token Counting](https://ai.google.dev/gemini-api/docs/token-counting) 