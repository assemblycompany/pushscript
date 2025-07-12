/**
 * Test file for Gemini response sanitization
 * Verifies that problematic responses with backticks and code blocks are properly handled
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { LLM_PROVIDERS } from '../src/providers.js';

test('Gemini Response Sanitization', async (t) => {
  const geminiHandler = LLM_PROVIDERS.gemini.responseHandler;

  await t.test('should remove code blocks and backticks from response', () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: `feat(position): context-driven allocation, unsold lot awareness

\`\`\`
feat(position): implement context-driven allocation and unsold lot awareness
\`\`\``
          }]
        }
      }]
    };

    const result = geminiHandler(mockResponse);
    
    // Should only contain the first line, with code blocks removed
    assert.strictEqual(result, 'feat(position): context-driven allocation, unsold lot awareness');
  });

  await t.test('should handle response with only backticks', () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: `feat(ui): add new component \`\`\` some code \`\`\``
          }]
        }
      }]
    };

    const result = geminiHandler(mockResponse);
    
    // Should remove all backticks and code content
    assert.strictEqual(result, 'feat(ui): add new component');
  });

  await t.test('should handle response with multiple code blocks', () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: `fix(auth): resolve login issue

\`\`\`
some code here
\`\`\`

docs(readme): update instructions

\`\`\`
more code
\`\`\``
          }]
        }
      }]
    };

    const result = geminiHandler(mockResponse);
    
    // Should only contain the commit messages, with code blocks removed
    assert.strictEqual(result, 'fix(auth): resolve login issue\ndocs(readme): update instructions');
  });

  await t.test('should handle response with no problematic characters', () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: 'feat(api): add new endpoint'
          }]
        }
      }]
    };

    const result = geminiHandler(mockResponse);
    
    // Should return the message unchanged
    assert.strictEqual(result, 'feat(api): add new endpoint');
  });

  await t.test('should normalize multiple newlines', () => {
    const mockResponse = {
      candidates: [{
        content: {
          parts: [{
            text: `feat(ui): add component


docs: update readme`
          }]
        }
      }]
    };

    const result = geminiHandler(mockResponse);
    
    // Should normalize multiple newlines to single newlines
    assert.strictEqual(result, 'feat(ui): add component\ndocs: update readme');
  });
}); 