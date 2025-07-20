/**
 * Secret Detector for PushScript
 * Pure detection logic - no pattern definitions
 * Clean separation: patterns (data) vs detection logic (behavior)
 */

import { SECRET_PATTERNS, getPatternStats } from './secret-patterns.js';

/**
 * Entropy calculation cache for performance
 */
const entropyCache = new Map();

/**
 * Calculate Shannon entropy of a string
 * @param {string} str - String to calculate entropy for
 * @returns {number} Entropy value (0-8 bits per character)
 */
function calculateShannonEntropy(str) {
  if (entropyCache.has(str)) {
    return entropyCache.get(str);
  }
  
  const len = str.length;
  if (len === 0) return 0;
  
  const freq = {};
  for (const char of str) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }
  
  entropyCache.set(str, entropy);
  return entropy;
}

/**
 * Check if a string has high entropy (random-looking)
 * @param {string} str - String to check
 * @param {number} threshold - Minimum entropy threshold (default: 4.0)
 * @returns {boolean} True if high entropy
 */
function hasHighEntropyValue(str, threshold = 4.0) {
  if (str.length < 8) return false; // Too short to be meaningful
  
  const entropy = calculateShannonEntropy(str);
  return entropy >= threshold;
}

/**
 * Check for negative entropy signals (test/example data)
 * @param {string} str - String to check
 * @param {string} context - Surrounding context
 * @returns {boolean} True if likely test/example data
 */
function hasNegativeEntropySignals(str, context = '') {
  const testPatterns = [
    /test/i,
    /example/i,
    /sample/i,
    /demo/i,
    /placeholder/i,
    /dummy/i,
    /fake/i,
    /mock/i,
    /stub/i,
    /123456/,
    /password/,
    /secret/,
    /key/,
    /token/,
    /api/,
    /sk_test/,
    /pk_test/,
    /test_key/,
    /example_key/,
    /sample_key/
  ];
  
  const combinedText = `${str} ${context}`.toLowerCase();
  
  return testPatterns.some(pattern => pattern.test(combinedText));
}

/**
 * Validate context around a detected secret
 * @param {string} secret - Detected secret
 * @param {string} context - Surrounding context
 * @param {Object} pattern - Pattern that matched
 * @returns {Object} Validation result with confidence
 */
function validateContext(secret, context, pattern) {
  let confidence = pattern.confidence || 'medium';
  let reason = 'Pattern match';
  
  // Check for entropy requirements
  if (pattern.requiresEntropy) {
    const entropy = calculateShannonEntropy(secret);
    const minEntropy = pattern.minEntropy || 4.0;
    
    if (entropy < minEntropy) {
      confidence = 'low';
      reason = `Low entropy (${entropy.toFixed(2)} < ${minEntropy})`;
    } else {
      confidence = 'high';
      reason = `High entropy (${entropy.toFixed(2)} >= ${minEntropy})`;
    }
  }
  
  // Check for negative signals (test/example data)
  if (hasNegativeEntropySignals(secret, context)) {
    confidence = 'low';
    reason = 'Likely test/example data';
  }
  
  // Check for context keywords
  if (pattern.contextKeywords && pattern.contextKeywords.length > 0) {
    const contextLower = context.toLowerCase();
    const hasContext = pattern.contextKeywords.some(keyword => 
      contextLower.includes(keyword.toLowerCase())
    );
    
    if (!hasContext) {
      confidence = 'low';
      reason = 'Missing context keywords';
    } else {
      confidence = 'high';
      reason = 'Context keywords found';
    }
  }
  
  // Check for nearby keywords
  if (pattern.nearbyKeywords && pattern.nearbyKeywords.length > 0) {
    const contextLower = context.toLowerCase();
    const hasNearby = pattern.nearbyKeywords.some(keyword => 
      contextLower.includes(keyword.toLowerCase())
    );
    
    if (!hasNearby) {
      confidence = 'low';
      reason = 'Missing nearby keywords';
    } else {
      confidence = 'high';
      reason = 'Nearby keywords found';
    }
  }
  
  // Check for variable name patterns
  if (pattern.variableNames && pattern.variableNames.length > 0) {
    const contextLower = context.toLowerCase();
    const hasVariable = pattern.variableNames.some(varName => 
      contextLower.includes(varName.toLowerCase())
    );
    
    if (!hasVariable) {
      confidence = 'low';
      reason = 'Missing variable name patterns';
    } else {
      confidence = 'high';
      reason = 'Variable name patterns found';
    }
  }
  
  // Require context for generic patterns
  if (pattern.requiresContext && !context.trim()) {
    confidence = 'low';
    reason = 'Generic pattern requires context';
  }
  
  return {
    confidence,
    reason,
    entropy: calculateShannonEntropy(secret),
    hasNegativeSignals: hasNegativeEntropySignals(secret, context)
  };
}

/**
 * Scan a single file for secrets
 * @param {string} filePath - Path to file
 * @param {string} content - File content
 * @returns {Array} Array of detected secrets
 */
function scanFileForSecrets(filePath, content) {
  const results = [];
  const lines = content.split('\n');
  
  Object.entries(SECRET_PATTERNS).forEach(([patternName, pattern]) => {
    console.log(`🔍 DEBUG: Testing pattern ${patternName} on ${filePath}`);
    const matches = content.matchAll(pattern.pattern);
    
    for (const match of matches) {
      const secret = match[0];
      const lineNumber = content.substring(0, match.index).split('\n').length;
      
      // Get context (surrounding lines)
      const startLine = Math.max(0, lineNumber - 3);
      const endLine = Math.min(lines.length - 1, lineNumber + 3);
      const context = lines.slice(startLine, endLine + 1).join('\n');
      
      // Validate context
      const validation = validateContext(secret, context, pattern);
      
      // Only include if confidence is not low
      if (validation.confidence !== 'low') {
        console.log(`🔍 DEBUG: Found secret with pattern ${patternName}: ${secret.substring(0, 20)}...`);
        results.push({
          pattern: patternName,
          secret: secret,
          description: pattern.description,
          severity: pattern.severity,
          confidence: validation.confidence,
          reason: validation.reason,
          entropy: validation.entropy,
          hasNegativeSignals: validation.hasNegativeSignals,
          file: filePath,
          line: lineNumber,
          context: context,
          provider: pattern.provider,
          category: pattern.category
        });
      } else {
        console.log(`🔍 DEBUG: Secret found but low confidence: ${patternName} - ${validation.reason}`);
      }
    }
  });
  
  return results;
}

/**
 * Scan multiple files for secrets
 * @param {Array} files - Array of {path, content} objects
 * @returns {Array} Array of all detected secrets
 */
function scanFilesForSecrets(files) {
  const allResults = [];
  
  files.forEach(file => {
    try {
      const results = scanFileForSecrets(file.path, file.content);
      allResults.push(...results);
    } catch (error) {
      console.warn(`Error scanning ${file.path}:`, error.message);
    }
  });
  
  return allResults;
}

/**
 * Group results by severity and confidence
 * @param {Array} results - Array of detection results
 * @returns {Object} Grouped results
 */
function groupResultsBySeverity(results) {
  const grouped = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };
  
  results.forEach(result => {
    if (grouped[result.severity]) {
      grouped[result.severity].push(result);
    }
  });
  
  return grouped;
}

/**
 * Display secret scan results in a clean format
 * @param {Array} results - Array of detection results
 * @param {boolean} verbose - Show detailed information
 */
function displaySecretScanResults(results, verbose = false) {
  if (results.length === 0) {
    console.log('✅ No secrets detected');
    return;
  }
  
  const grouped = groupResultsBySeverity(results);
  const stats = getPatternStats();
  
  console.log('\n🔍 Secret Scan Results:');
  console.log('='.repeat(50));
  
  // Summary
  console.log(`📊 Total Detections: ${results.length}`);
  console.log(`📋 Pattern Coverage: ${stats.total} patterns across ${stats.byCategory.length} categories`);
  
  // By severity
  Object.entries(grouped).forEach(([severity, items]) => {
    if (items.length > 0) {
      const icon = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : 'ℹ️';
      console.log(`${icon} ${severity.toUpperCase()}: ${items.length}`);
    }
  });
  
  console.log('\n');
  
  // Detailed results
  Object.entries(grouped).forEach(([severity, items]) => {
    if (items.length === 0) return;
    
    const icon = severity === 'critical' ? '🚨' : severity === 'high' ? '⚠️' : 'ℹ️';
    console.log(`${icon} ${severity.toUpperCase()} SECRETS:`);
    console.log('-'.repeat(30));
    
    items.forEach((result, index) => {
      console.log(`${index + 1}. ${result.description}`);
      console.log(`   File: ${result.file}:${result.line}`);
      console.log(`   Confidence: ${result.confidence} (${result.reason})`);
      
      if (verbose) {
        console.log(`   Entropy: ${result.entropy.toFixed(2)}`);
        console.log(`   Provider: ${result.provider || 'Unknown'}`);
        console.log(`   Category: ${result.category || 'Unknown'}`);
        if (result.hasNegativeSignals) {
          console.log(`   ⚠️  Potential test/example data`);
        }
        console.log(`   Context: ${result.context.substring(0, 100)}...`);
      }
      
      console.log('');
    });
  });
  
  // Recommendations
  console.log('💡 Recommendations:');
  console.log('- Review all critical and high severity detections');
  console.log('- Check for test/example data in low confidence results');
  console.log('- Use environment variables for production secrets');
  console.log('- Consider using a secrets management service');
}

/**
 * Get detection configuration
 * @returns {Object} Configuration object
 */
function getDetectionConfig() {
  return {
    patterns: Object.keys(SECRET_PATTERNS).length,
    categories: Object.keys(getPatternStats().byCategory).length,
    entropyThreshold: 4.0,
    contextLines: 3,
    cacheEnabled: true
  };
}

/**
 * Clear entropy cache
 */
function clearEntropyCache() {
  entropyCache.clear();
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
 */
function getCacheStats() {
  return {
    size: entropyCache.size,
    memoryUsage: process.memoryUsage().heapUsed
  };
}

// Export all functions
export {
  scanFileForSecrets,
  scanFilesForSecrets,
  displaySecretScanResults,
  validateContext,
  calculateShannonEntropy,
  hasHighEntropyValue,
  hasNegativeEntropySignals,
  groupResultsBySeverity,
  getDetectionConfig,
  clearEntropyCache,
  getCacheStats
}; 