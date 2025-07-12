# Gemini Shell Error Fix

## Problem Description

Users were experiencing shell errors when using PushScript with the Gemini provider:

```
/bin/sh: -c: line 0: unexpected EOF while looking for matching ``'
/bin/sh: -c: line 1: syntax error: unexpected end of file
```

## Root Cause Analysis

The issue was caused by Gemini's response format and how it was being processed:

1. **Gemini's Response Format**: Gemini returns a JSON object with the actual response text in `candidates[0].content.parts[0].text`

2. **Markdown in Response**: Gemini was adding markdown code blocks to its responses, even when asked for simple commit messages:
   ```
   feat(position): context-driven allocation, unsold lot awareness

   ```
   feat(position): implement context-driven allocation and unsold lot awareness
   ```

3. **Shell Interpretation**: When the commit message was passed to the shell via `git commit -m`, the backticks were interpreted as command substitution, causing the shell to look for matching backticks and fail.

4. **Incomplete Sanitization**: The original sanitization only removed backticks at the very beginning and end of the string, not in the middle.

## Solution Implemented

### 1. Enhanced Prompt Engineering

Updated the Gemini prompt to be more explicit about not using markdown formatting:

```javascript
text: `You are a senior software developer. Create a concise, conventional commit message that strictly follows the Conventional Commits format. 

IMPORTANT: Return ONLY the commit message text. Do NOT use markdown formatting, code blocks, backticks, or any other formatting. Return plain text only.

Format: <type>(<scope>): <description>
...
```

### 2. Comprehensive Response Sanitization

Enhanced the sanitization in `src/providers.js` to handle all edge cases:

```javascript
const sanitizedText = rawText
  .replace(/```[\s\S]*?```/g, '')  // Remove entire code blocks (including content)
  .replace(/```+/g, '')            // Remove any remaining backticks
  .replace(/\n\s*\n\s*\n/g, '\n')  // Normalize multiple newlines
  .replace(/\n\s*\n/g, '\n')       // Normalize double newlines to single
  .replace(/^\s+|\s+$/g, '')       // Trim whitespace from start and end
  .trim();                         // Final trim

// Additional validation for edge cases
if (sanitizedText.includes('`') || sanitizedText.includes('```')) {
  console.warn('Warning: Sanitized response still contains backticks, applying additional cleanup');
  return sanitizedText
    .replace(/`/g, '')             // Remove any remaining backticks
    .replace(/\n\s*\n/g, '\n')     // Normalize newlines again
    .trim();
}
```

### 3. Enhanced Shell Safety

Improved the commit message construction in `src/index.js` to be more robust:

```javascript
const escapedLine = line
  .replace(/"/g, '\\"')           // Escape quotes
  .replace(/`/g, "'")             // Replace backticks with single quotes
  .replace(/\$/g, '\\$')          // Escape dollar signs
  .replace(/\\/g, '\\\\')         // Escape backslashes
  .replace(/[^\x20-\x7E]/g, '')   // Remove non-printable characters
  .trim();                        // Remove leading/trailing whitespace
```

### 4. Debugging and Logging

Added comprehensive logging to help identify issues:

- Log raw responses when they contain problematic characters
- Log the actual git commit command being executed
- Warn when additional sanitization is needed

## Testing

Created comprehensive tests to verify the fix:

- `test/gemini-sanitization.test.js`: General sanitization tests
- `test/gemini-real-world.test.js`: Tests using the exact problematic response from the debug log

All tests pass and verify that the fix handles the real-world scenario correctly.

## Why This Happens

Gemini (and other LLMs) are trained on code and documentation, so they naturally tend to format responses as markdown when they detect code-related content. Even with explicit instructions, they may still add formatting. The solution is to:

1. **Be explicit in the prompt** about not using formatting
2. **Sanitize the response** to remove any formatting that slips through
3. **Escape properly** when passing to shell commands

## Impact

This fix resolves the shell error that was preventing users from committing with Gemini, while maintaining the quality of AI-generated commit messages. The solution is robust and handles edge cases that may occur with future Gemini API responses. 