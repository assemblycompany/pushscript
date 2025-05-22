# Gemini Token Manager

A production-ready implementation for optimizing Gemini API requests in PushScript.

## Overview

This module provides advanced token management and optimization for Gemini API requests, ensuring:

1. **Accurate token estimation** specifically calibrated for Gemini 2.0 Flash
2. **Progressive diff optimization** to handle large git diffs
3. **Rate limit tracking** to avoid API limits
4. **Backward compatibility** with existing code

## Rate Limits

The manager is based on Gemini API's official documentation:

| Tier   | RPM  | TPM       | RPD   |
|--------|------|-----------|-------|
| Free   | 15   | 1,000,000 | 1,500 |
| Tier 1 | 2,000| 4,000,000 | -     |
| Tier 2 | 10,000| 10,000,000 | -    |
| Tier 3 | 30,000| 30,000,000 | -    |

## Usage

### Direct Usage

```javascript
import { createGeminiManager } from './token-utils.js';

// Create a manager instance
const geminiManager = createGeminiManager('free'); // 'free'|'tier1'|'tier2'|'tier3'

// Validate a request
const validation = geminiManager.validateRequest(myContent);
if (!validation.valid) {
  console.log(`Content exceeds token limit by ${validation.exceededBy} tokens`);
}

// Optimize a git diff
const optimizedDiff = geminiManager.optimizeDiff(gitDiffContent);
console.log(`Optimized from ${gitDiffContent.length} chars to ${optimizedDiff.content.length} chars`);
console.log(`Applied ${optimizedDiff.iterations} optimization steps`);

// Check rate limits
const rateCheck = geminiManager.checkRateLimit(optimizedDiff.estimatedTokens);
if (!rateCheck.allowed) {
  console.log(`Rate limit would be exceeded (${rateCheck.reason})`);
  console.log(`Wait ${rateCheck.waitTime}ms before trying again`);
}

// Record a successful request
geminiManager.recordRequest();
```

### CLI Usage

The module includes a simple CLI for analyzing files:

```bash
node scripts/pushscript/token-utils.js analyze path/to/file.txt
```

This will output:
- File size
- Estimated token count
- Whether it's within free tier limits
- Optimization results if needed

## Classes

### GeminiTokenManager

Handles token estimation and validation against rate limits.

```javascript
const tokenManager = new GeminiTokenManager('free', 0.95);
const tokens = tokenManager.estimateTokens(text);
```

### GeminiDiffOptimizer

Optimizes git diffs using a progressive strategy:

1. Remove context lines
2. Remove file mode information
3. Shorten file headers
4. Remove index lines
5. Keep only added/removed lines
6. Truncate if still too large

```javascript
const optimizer = new GeminiDiffOptimizer();
const result = optimizer.optimizeDiff(gitDiff);
```

### GeminiRateManager

Tracks request counts to avoid hitting rate limits:

```javascript
const rateManager = new GeminiRateManager(tokenManager);
const canRequest = rateManager.canMakeRequest(estimatedTokens);
```

## Integration with PushScript

The token manager is fully integrated with PushScript:

1. **index.js** uses the manager to optimize git diffs before sending to Gemini API
2. **providers.js** configures optimal request parameters based on token analysis
3. Backward compatibility functions ensure existing code continues to work

## Optimization Strategies

The diff optimizer employs progressive strategies to reduce token usage:

1. **Context Removal**: Removes unchanged context lines
2. **Header Simplification**: Shortens file headers and removes mode information
3. **Index Removal**: Removes index lines that don't impact understanding
4. **Content Focusing**: Keeps only added/removed lines with minimal context
5. **Smart Truncation**: If needed, truncates the content intelligently

## Performance

The token manager is designed for high performance:
- Minimal dependencies
- Efficient regex-based operations
- Progressive optimization to avoid unnecessary processing
- Caching of token estimates when possible

## Backward Compatibility

For existing code, the following functions provide backward compatibility:

```javascript
import { estimateTokenCount, optimizeDiffForLLM, optimizeRequestParams } from './token-utils.js';

// These work the same as before but use the new implementation
const tokens = estimateTokenCount(text);
const optimizedDiff = optimizeDiffForLLM(diff);
const params = optimizeRequestParams('gemini', content);
``` 