/**
 * Test file for real-world Gemini response sanitization
 * Uses the exact problematic response from the debug log
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { LLM_PROVIDERS } from '../src/providers.js';

test('Real-world Gemini Response Sanitization', async (t) => {
  const geminiHandler = LLM_PROVIDERS.gemini.responseHandler;

  await t.test('should handle the exact problematic response from debug log', () => {
    // This is the exact response from the debug log that was causing the shell error
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: "feat(position): context-driven allocation, unsold lot awareness\n\n```\nfeat(position): implement context-driven allocation and unsold lot awareness\n\n```"
          }]
        }
      }]
    };

    const result = geminiHandler(mockResponse);
    
    // Should preserve content but remove markdown formatting
    assert.strictEqual(result, 'feat(position): context-driven allocation, unsold lot awareness\nfeat(position): implement context-driven allocation and unsold lot awareness');
  });

  await t.test('should handle response with multiple problematic elements', () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: "fix(auth): resolve login issue\n\n```\ncode block with backticks\n```\n\nfeat(ui): add new component `inline code`"
          }]
        }
      }]
    };

    const result = geminiHandler(mockResponse);
    
    // Should preserve content but remove markdown formatting
    assert.strictEqual(result, 'fix(auth): resolve login issue\ncode block with backticks\nfeat(ui): add new component inline code');
  });

  await t.test('should handle empty response after sanitization', () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: "```\nOnly code block content\n```"
          }]
        }
      }]
    };

    const result = geminiHandler(mockResponse);
    
    // Should preserve content but remove markdown formatting
    assert.strictEqual(result, 'Only code block content');
  });
}); 