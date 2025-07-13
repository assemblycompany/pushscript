/**
 * Test file to analyze commit message generation issues
 * Helps identify why AI-generated messages are becoming one-liners
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import { getGitStatus, categorizeChanges } from '../src/git/git.js';
import { getCommitStyle, getValidationRules } from '../src/utils/pushscript-config.js';
import { GeminiDiffOptimizer } from '../src/token-utils.js';

test('Commit Message Analysis', async (t) => {
  await t.test('should analyze the current commit message generation process', () => {
    // Mock some changes to analyze the process
    const mockChanges = [
      { status: 'M', file: 'src/components/Button.jsx' },
      { status: 'A', file: 'src/utils/helpers.js' },
      { status: 'M', file: 'package.json' }
    ];

    // Test categorization
    const categories = categorizeChanges(mockChanges);
    console.log('Categorized changes:', JSON.stringify(categories, null, 2));

    // Test commit style
    const commitStyle = getCommitStyle();
    console.log('Commit style prompt:', commitStyle);

    // Test validation rules
    const validationRules = getValidationRules();
    console.log('Validation rules:', JSON.stringify(validationRules, null, 2));

    // Test diff optimization
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
    
    console.log('Original diff length:', mockDiff.length);
    console.log('Optimized diff length:', optimizedDiff.content.length);
    console.log('Estimated tokens:', optimizedDiff.estimatedTokens);
    console.log('Was optimized:', optimizedDiff.optimized);
    console.log('Optimized diff preview:', optimizedDiff.content.substring(0, 200) + '...');

    // Test the full prompt construction
    const changesDescription = [
      `Modified files: ${categories.modified.join(', ')}`,
      `Added files: ${categories.added.join(', ')}`,
      `Deleted files: ${categories.deleted.join(', ')}`,
      `Components affected: ${Array.from(categories.components).join(', ')}`,
      `Features affected: ${Array.from(categories.features).join(', ')}`
    ].filter(line => !line.endsWith(': ')).join('\n');

    const prompt = `${commitStyle}

Changes Overview:
${changesDescription}

${optimizedDiff.optimized ? 'Optimized Changes:' : 'Git Diff:'}
\`\`\`
${optimizedDiff.content}
\`\`\`

Follow conventional commits format:
type(scope): concise summary

Where type is one of: feat, fix, docs, style, refactor, perf, test, chore
Keep the first line under 80 characters.`;

    console.log('Full prompt length:', prompt.length);
    console.log('Full prompt preview:', prompt.substring(0, 500) + '...');

    // Analyze potential issues
    const issues = [];
    
    if (optimizedDiff.optimized) {
      issues.push('Diff is being optimized/truncated, which may reduce context');
    }
    
    if (optimizedDiff.estimatedTokens > 8000) {
      issues.push('High token count may cause truncation');
    }
    
    if (prompt.length > 10000) {
      issues.push('Very long prompt may cause issues');
    }
    
    if (categories.modified.length === 0 && categories.added.length === 0) {
      issues.push('No meaningful changes detected');
    }

    console.log('Potential issues identified:', issues);
    
    // Basic assertions
    assert.ok(categories.modified.length > 0 || categories.added.length > 0, 'Should have some changes');
    assert.ok(commitStyle.length > 0, 'Should have a commit style');
    assert.ok(validationRules.max_length > 0, 'Should have validation rules');
  });
}); 