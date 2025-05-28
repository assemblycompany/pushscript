import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';
import { getCommitStyle, getValidationRules } from '../src/utils/pushscript-config.js';

test('Config Integration', async (t) => {
  const testConfigPath = '.pushscript.json';
  
  // Clean up any existing test config
  if (fs.existsSync(testConfigPath)) {
    fs.unlinkSync(testConfigPath);
  }

  await t.test('should use default config when no custom config exists', () => {
    const commitStyle = getCommitStyle();
    const validationRules = getValidationRules();
    
    // Should return default values (updated to match actual defaults)
    const expectedCommitStyle = `As a senior developer, create a concise git commit message for these changes.
Focus on the key changes and their purpose. Keep it brief but informative.

Follow conventional commits format:
type(scope): concise summary

Where type is one of: feat, fix, docs, style, refactor, perf, test, chore
Keep the first line under 80 characters.`;
    
    assert.strictEqual(commitStyle, expectedCommitStyle);
    assert.strictEqual(validationRules.max_length, 80);
    assert.strictEqual(validationRules.require_conventional, true);
    assert.deepStrictEqual(validationRules.allowed_types, ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore']);
  });

  await t.test('should use custom config when available', () => {
    // Create a test config
    const testConfig = {
      commit_style: 'Custom fintech developer prompt',
      validation: {
        max_length: 60,
        require_conventional: false,
        allowed_types: ['feat', 'fix', 'hotfix']
      }
    };
    
    fs.writeFileSync(testConfigPath, JSON.stringify(testConfig, null, 2));
    
    // Test the config loading (note: this will use the file we just created)
    const commitStyle = getCommitStyle();
    const validationRules = getValidationRules();
    
    assert.strictEqual(commitStyle, 'Custom fintech developer prompt');
    assert.strictEqual(validationRules.max_length, 60);
    assert.strictEqual(validationRules.require_conventional, false);
    assert.deepStrictEqual(validationRules.allowed_types, ['feat', 'fix', 'hotfix']);
    
    // Clean up
    fs.unlinkSync(testConfigPath);
  });

  await t.test('should merge partial configs with defaults', () => {
    // Create a partial config
    const partialConfig = {
      validation: {
        max_length: 100
      }
    };
    
    fs.writeFileSync(testConfigPath, JSON.stringify(partialConfig, null, 2));
    
    const commitStyle = getCommitStyle();
    const validationRules = getValidationRules();
    
    // Should use default commit style but custom max_length
    const expectedCommitStyle = `As a senior developer, create a concise git commit message for these changes.
Focus on the key changes and their purpose. Keep it brief but informative.

Follow conventional commits format:
type(scope): concise summary

Where type is one of: feat, fix, docs, style, refactor, perf, test, chore
Keep the first line under 80 characters.`;
    
    assert.strictEqual(commitStyle, expectedCommitStyle);
    assert.strictEqual(validationRules.max_length, 100);
    assert.strictEqual(validationRules.require_conventional, true); // default
    
    // Clean up
    fs.unlinkSync(testConfigPath);
  });
}); 