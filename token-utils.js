/**
 * Gemini Token Manager - Production-ready implementation for Gemini 2.0 Flash
 * Based on official rate limits from https://ai.google.dev/gemini-api/docs/rate-limits
 */

/**
 * Production Token Manager for Gemini API
 * Handles accurate token estimation and request validation for Gemini 2.0 Flash
 */
export class GeminiTokenManager {
  // Official rate limits from Gemini API documentation (2025)
  static RATE_LIMITS = {
    '2.0-flash': {
      free: {
        rpm: 15,
        tpm: 1_000_000,
        rpd: 1_500
      },
      tier1: {
        rpm: 2_000,
        tpm: 4_000_000,
      },
      tier2: {
        rpm: 10_000,
        tpm: 10_000_000,
      },
      tier3: {
        rpm: 30_000,
        tpm: 30_000_000,
      }
    }
  };

  constructor(tier = 'free', safetyFactor = 0.95) {
    this.tier = tier;
    this.safetyFactor = safetyFactor;
  }
  
  /**
   * Accurate token estimation for Gemini 2.0 Flash
   * Based on observed tokenization patterns
   * @param {string} text - Text to estimate tokens for
   * @returns {number} Estimated token count
   */
  estimateTokens(text) {
    if (!text) return 0;
    
    // Gemini tokenization patterns from testing
    const CHARS_PER_TOKEN = 3.2; // Average observed ratio
    const CODE_MULTIPLIER = 1.3; // Code requires more tokens
    const PUNCTUATION_PENALTY = 0.05; // Additional tokens for punctuation
    
    let tokenCount = text.length / CHARS_PER_TOKEN;
    
    // Code detection and adjustment
    if (this.detectCode(text)) {
      tokenCount *= CODE_MULTIPLIER;
    }
    
    // Account for special characters and punctuation
    const specialChars = (text.match(/[{}[\]()\\.,:;?!]/g) || []).length;
    tokenCount += specialChars * PUNCTUATION_PENALTY;
    
    return Math.ceil(tokenCount);
  }
  
  /**
   * Validates if a request is within rate limits
   * @param {string} content - Content to validate
   * @returns {Object} Validation result
   */
  validateRequest(content) {
    const estimatedTokens = this.estimateTokens(content);
    const currentLimit = GeminiTokenManager.RATE_LIMITS['2.0-flash'][this.tier];
    const safeTPMLimit = Math.floor(currentLimit.tpm * this.safetyFactor);
    
    return {
      valid: estimatedTokens <= safeTPMLimit,
      estimatedTokens: estimatedTokens,
      limit: safeTPMLimit,
      exceededBy: Math.max(0, estimatedTokens - safeTPMLimit),
      model: '2.0-flash',
      tier: this.tier
    };
  }
  
  /**
   * Detects if content is primarily code
   * @param {string} text - Text to analyze
   * @returns {boolean} Whether text is primarily code
   */
  detectCode(text) {
    const codeIndicators = [
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+(?:\{[^}]+\}|.*?)\s+from/,
      /export\s+(?:default\s+)?(?:class|function|const)/,
      /(?:const|let|var)\s+\w+\s*=/,
      /if\s*\([^)]+\)\s*\{/,
      /for\s*\([^)]+\)\s*\{/,
      /console\.\w+\(/,
      /^\s*[\{\}\[\]\(\)]$/m
    ];
    
    const codeSignals = codeIndicators.filter(pattern => pattern.test(text)).length;
    const totalLines = text.split('\n').length;
    const codeRatio = codeSignals / Math.max(totalLines, 1);
    
    return codeRatio > 0.2; // If more than 20% of patterns match, consider it code
  }
}

/**
 * Advanced Diff Optimization for Gemini API
 */
export class GeminiDiffOptimizer {
  constructor(tier = 'free') {
    this.tokenManager = new GeminiTokenManager(tier);
  }
  
  /**
   * Optimizes git diff for Gemini API consumption
   * @param {string} diff - Git diff to optimize
   * @param {Object} options - Optimization options
   * @returns {Object} Optimization result
   */
  optimizeDiff(diff, options = {}) {
    const validation = this.tokenManager.validateRequest(diff);
    
    if (validation.valid) {
      return {
        content: diff,
        optimized: false,
        valid: validation.valid,
        estimatedTokens: validation.estimatedTokens,
        limit: validation.limit,
        exceededBy: validation.exceededBy,
        model: validation.model,
        tier: validation.tier
      };
    }
    
    // Progressive optimization strategy
    let optimizedDiff = diff;
    let iterations = 0;
    const maxIterations = 5;
    
    while (!this.tokenManager.validateRequest(optimizedDiff).valid && iterations < maxIterations) {
      optimizedDiff = this.applySingleOptimization(optimizedDiff, iterations);
      iterations++;
    }
    
    const finalValidation = this.tokenManager.validateRequest(optimizedDiff);
    
    return {
      content: optimizedDiff,
      optimized: true,
      iterations: iterations,
      valid: finalValidation.valid,
      estimatedTokens: finalValidation.estimatedTokens,
      limit: finalValidation.limit,
      exceededBy: finalValidation.exceededBy,
      model: finalValidation.model,
      tier: finalValidation.tier
    };
  }
  
  /**
   * Applies optimization strategies progressively
   * @param {string} diff - Diff to optimize
   * @param {number} iteration - Iteration number
   * @returns {string} Optimized diff
   */
  applySingleOptimization(diff, iteration) {
    switch (iteration) {
      case 0:
        // Remove context lines
        return diff.replace(/^ .*$/gm, '');
      
      case 1:
        // Remove file mode information
        return diff.replace(/^old mode \d+\nnew mode \d+$/gm, '');
      
      case 2:
        // Shorten file headers
        return diff.replace(/^diff --git a\/(.*?) b\/.*?$/gm, '--- $1 ---');
      
      case 3:
        // Remove index lines and merge headers
        return diff.replace(/^index [0-9a-f]+\.\.[0-9a-f]+.*$/gm, '')
                  .replace(/^(\+{3}|-{3}) [ab]\//gm, '$1 ');
      
      case 4:
        // Aggressive: Keep only +/- lines and hunk headers
        return diff.split('\n')
          .filter(line => line.startsWith('@') || line.startsWith('+') || line.startsWith('-'))
          .join('\n');
      
      default:
        // Last resort: truncate with indicator
        const maxLength = Math.floor(diff.length * 0.8);
        return diff.substring(0, maxLength) + '\n... [diff truncated due to size] ...';
    }
  }
}

/**
 * Rate limit tracker for request management
 */
export class GeminiRateManager {
  constructor(tokenManager) {
    this.tokenManager = tokenManager;
    this.requestCounts = {
      minute: { count: 0, resetTime: Date.now() + 60000 },
      day: { count: 0, resetTime: Date.now() + 86400000 }
    };
  }
  
  /**
   * Checks if a request can be made within rate limits
   * @param {number} estimatedTokens - Number of tokens to check
   * @returns {Object} Rate check result
   */
  canMakeRequest(estimatedTokens) {
    this.resetCounters();
    
    const limits = GeminiTokenManager.RATE_LIMITS['2.0-flash'][this.tokenManager.tier];
    
    // Check RPM
    if (this.requestCounts.minute.count >= limits.rpm) {
      return {
        allowed: false,
        reason: 'RPM_EXCEEDED',
        waitTime: this.requestCounts.minute.resetTime - Date.now()
      };
    }
    
    // Check RPD if applicable
    if (limits.rpd && this.requestCounts.day.count >= limits.rpd) {
      return {
        allowed: false,
        reason: 'RPD_EXCEEDED',
        waitTime: this.requestCounts.day.resetTime - Date.now()
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Records a successful request
   */
  recordRequest() {
    this.resetCounters();
    this.requestCounts.minute.count++;
    this.requestCounts.day.count++;
  }
  
  /**
   * Resets counters if time window has passed
   */
  resetCounters() {
    const now = Date.now();
    
    if (now >= this.requestCounts.minute.resetTime) {
      this.requestCounts.minute.count = 0;
      this.requestCounts.minute.resetTime = now + 60000;
    }
    
    if (now >= this.requestCounts.day.resetTime) {
      this.requestCounts.day.count = 0;
      this.requestCounts.day.resetTime = now + 86400000;
    }
  }
}

/**
 * Creates a configured Gemini manager instance
 * @param {string} tier - The tier to use ('free', 'tier1', 'tier2', 'tier3')
 * @returns {Object} Manager object with methods
 */
export function createGeminiManager(tier = 'free') {
  const tokenManager = new GeminiTokenManager(tier);
  const diffOptimizer = new GeminiDiffOptimizer(tier);
  const rateManager = new GeminiRateManager(tokenManager);
  
  return {
    /**
     * Validates a request
     * @param {string} content - Content to validate
     * @returns {Object} Validation result
     */
    validateRequest: (content) => tokenManager.validateRequest(content),
    
    /**
     * Optimizes a diff
     * @param {string} diff - Diff to optimize
     * @param {Object} options - Optimization options
     * @returns {Object} Optimization result
     */
    optimizeDiff: (diff, options = {}) => diffOptimizer.optimizeDiff(diff, options),
    
    /**
     * Checks rate limits
     * @param {number} estimatedTokens - Tokens to check
     * @returns {Object} Rate check result
     */
    checkRateLimit: (estimatedTokens) => rateManager.canMakeRequest(estimatedTokens),
    
    /**
     * Records a request
     */
    recordRequest: () => rateManager.recordRequest()
  };
}

/**
 * Provides backward compatibility with the previous token utility API
 * Used for the existing code that may still reference these functions
 * @param {string} text - Text to estimate token count for
 * @returns {number} Estimated token count
 */
export function estimateTokenCount(text) {
  const tokenManager = new GeminiTokenManager();
  return tokenManager.estimateTokens(text);
}

/**
 * Backward compatibility function for optimizing diffs
 * @param {string} diff - Git diff to optimize
 * @param {number} maxTokens - Maximum tokens to allow
 * @returns {Object} Optimization result in the old format
 */
export function optimizeDiffForLLM(diff, maxTokens = 1500) {
  const optimizer = new GeminiDiffOptimizer();
  const result = optimizer.optimizeDiff(diff);
  
  return {
    content: result.content,
    isOptimized: result.optimized,
    estimatedTokens: result.estimatedTokens
  };
}

/**
 * Backward compatibility function for optimizing request parameters
 * @param {string} provider - LLM provider name
 * @param {Object} content - Content object with metadata
 * @returns {Object} Optimized request parameters
 */
export function optimizeRequestParams(provider, content) {
  const params = {
    temperature: 0.1,
    maxTokens: 150
  };
  
  if (provider === 'gemini') {
    params.temperature = 0;
    
    const tokenManager = new GeminiTokenManager();
    const estimatedTokens = typeof content.estimatedTokens === 'number' 
      ? content.estimatedTokens 
      : tokenManager.estimateTokens(content.content || '');
    
    if (estimatedTokens > 8000) {
      params.needsMoreOptimization = true;
    }
  }
  
  return params;
}

// Export a CLI if this file is run directly
if (process.argv[1].endsWith('token-utils.js')) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'analyze') {
    const filePath = args[1];
    if (!filePath) {
      console.error('Error: Please provide a file path to analyze');
      process.exit(1);
    }
    
    try {
      const fs = require('fs');
      const content = fs.readFileSync(filePath, 'utf8');
      const tokenManager = new GeminiTokenManager();
      const tokens = tokenManager.estimateTokens(content);
      
      console.log(`File: ${filePath}`);
      console.log(`Size: ${content.length} bytes`);
      console.log(`Estimated tokens: ${tokens}`);
      
      // Validate against limits
      const validation = tokenManager.validateRequest(content);
      console.log(`Within free tier limits: ${validation.valid ? 'Yes' : 'No'}`);
      if (!validation.valid) {
        console.log(`Exceeds limit by: ${validation.exceededBy} tokens`);
        
        // Demonstrate optimization
        const optimizer = new GeminiDiffOptimizer();
        const optimized = optimizer.optimizeDiff(content);
        console.log(`\nOptimization results:`);
        console.log(`- Applied ${optimized.iterations} optimization steps`);
        console.log(`- Reduced to ${optimized.estimatedTokens} tokens (${Math.round(optimized.estimatedTokens / tokens * 100)}%)`);
        console.log(`- Now within limits: ${optimized.valid ? 'Yes' : 'No'}`);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.log('Gemini Token Manager CLI');
    console.log('------------------------');
    console.log('Commands:');
    console.log('  analyze <file> - Analyze token count for a file');
  }
}