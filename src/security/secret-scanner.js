/**
 * Secret Scanner for PushScript
 * Main integration module - uses clean separation of patterns and detection logic
 */

import { scanFilesForSecrets, displaySecretScanResults, getDetectionConfig } from './secret-detector.js';
import { SECRET_PATTERNS, getPatternStats } from './secret-patterns.js';

/**
 * Check for hardcoded secrets in staged files
 * @param {Array} stagedFiles - Array of staged file objects
 * @returns {Promise<boolean>} True if secrets found, false otherwise
 */
async function checkHardcodedSecrets(stagedFiles) {
  if (!stagedFiles || stagedFiles.length === 0) {
    console.log('📁 No staged files to scan');
    return false;
  }

  console.log('\n🔍 Scanning for hardcoded secrets...');
  console.log(`📋 Scanning ${stagedFiles.length} staged files`);
  
  // Get detection stats
  const config = getDetectionConfig();
  const stats = getPatternStats();
  console.log(`📊 Using ${config.patterns} patterns across ${config.categories} categories`);
  
  // Scan files for secrets
  const results = scanFilesForSecrets(stagedFiles);
  
  // Display results
  displaySecretScanResults(results, true);
  
  // Check if any critical or high severity secrets found
  const criticalSecrets = results.filter(r => r.severity === 'critical');
  const highSecrets = results.filter(r => r.severity === 'high');
  
  if (criticalSecrets.length > 0 || highSecrets.length > 0) {
    console.log('\n🚨 CRITICAL: High severity secrets detected!');
    console.log('   Please review and remove before committing.');
    return true;
  }
  
  if (results.length > 0) {
    console.log('\n⚠️  Medium/low severity secrets detected.');
    console.log('   Review and consider using environment variables.');
    return false; // Don't block commit for medium/low
  }
  
  console.log('\n✅ No concerning secrets detected');
  return false;
}

/**
 * Get secret detection configuration
 * @returns {Object} Configuration object
 */
function getSecretDetectionConfig() {
  return {
    ...getDetectionConfig(),
    patternStats: getPatternStats()
  };
}

/**
 * Get active patterns (for debugging/info)
 * @returns {Object} Active patterns
 */
function getActivePatterns() {
  return SECRET_PATTERNS;
}

/**
 * Test secret detection with sample data
 * @param {string} testContent - Test content to scan
 * @returns {Array} Detection results
 */
function testSecretDetection(testContent) {
  const testFile = {
    path: 'test-file.js',
    content: testContent
  };
  
  return scanFilesForSecrets([testFile]);
}

// Export main functions
export {
  checkHardcodedSecrets,
  getSecretDetectionConfig,
  getActivePatterns,
  testSecretDetection
};

 