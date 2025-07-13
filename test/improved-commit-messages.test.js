/**
 * Test file to verify improved commit message generation
 * Tests that the fixes produce more detailed commit messages
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { getCommitStyle, getValidationRules, loadPushscriptConfig } from '../src/utils/pushscript-config.js';
import { GeminiDiffOptimizer } from '../src/token-utils.js';

test('Improved Commit Message Generation', async (t) => {
  await t.test('should have improved commit style with more detail', () => {
    const commitStyle = getCommitStyle();
    
    // Check that the new style encourages more detail
    assert.ok(commitStyle.includes('detailed'), 'Should encourage detailed messages');
    assert.ok(commitStyle.includes('informative'), 'Should encourage informative messages');
    assert.ok(commitStyle.includes('Examples'), 'Should include examples');
    assert.ok(commitStyle.includes('additional details'), 'Should allow additional details');
    
    console.log('✅ Commit style now encourages detailed messages');
  });

  await t.test('should have AI configuration settings', () => {
    const config = loadPushscriptConfig();
    
    assert.ok(config.ai, 'Should have AI configuration');
    assert.ok(config.ai.max_tokens >= 300, 'Should have increased max tokens');
    assert.ok(config.ai.allow_multiline === true, 'Should allow multiline messages');
    assert.ok(config.ai.prefer_detailed === true, 'Should prefer detailed messages');
    
    console.log('✅ AI configuration properly set:', JSON.stringify(config.ai, null, 2));
  });

  await t.test('should preserve more context in diff optimization', () => {
    const mockDiff = `diff --git a/src/components/Button.jsx b/src/components/Button.jsx
index abc123..def456 100644
--- a/src/components/Button.jsx
+++ b/src/components/Button.jsx
@@ -1,5 +1,6 @@
 import React from 'react';
 
+// Add new prop for button variant
 export function Button({ children, variant = 'primary', ...props }) {
   return (
     <button 
@@ -7,6 +8,7 @@ export function Button({ children, variant = 'primary', ...props }) {
       {...props}
     >
       {children}
+      {variant === 'loading' && <span>Loading...</span>}
     </button>
   );
 }`;

    const optimizer = new GeminiDiffOptimizer();
    const optimizedDiff = optimizer.optimizeDiff(mockDiff);
    
    // The diff should not be optimized for this small example
    assert.strictEqual(optimizedDiff.optimized, false, 'Small diff should not be optimized');
    assert.ok(optimizedDiff.content.includes('Loading...'), 'Should preserve important context');
    
    console.log('✅ Diff optimization preserves important context');
  });

  await t.test('should have reasonable token limits', () => {
    const config = loadPushscriptConfig();
    const maxTokens = config.ai.max_tokens;
    
    // Check that token limits are reasonable
    assert.ok(maxTokens >= 300, 'Should have at least 300 tokens for detailed messages');
    assert.ok(maxTokens <= 500, 'Should not exceed 500 tokens for safety');
    
    console.log('✅ Token limits are reasonable:', maxTokens);
  });
}); 