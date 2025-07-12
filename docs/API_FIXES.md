# API Reliability Fixes for 503 Errors

## Problem Summary

Users were experiencing persistent 503 "model overloaded" errors when using PushScript with the Gemini API, especially when using the package in other projects. The errors looked like this:

```json
{
  "error": {
    "code": 503,
    "message": "The model is overloaded. Please try again later.",
    "status": "UNAVAILABLE"
  }
}
```

## Root Causes Identified

1. **No Retry Logic**: The code failed immediately on 503 errors without retrying
2. **Rate Limiting Not Enforced**: Rate limits were checked but not actually enforced
3. **API Key Formatting Issues**: Auto-fixing API keys could cause authentication problems
4. **Verbose Debug Logging**: Production logging could cause performance issues
5. **No Request Spacing**: Rapid successive requests overwhelmed the API

## Fixes Implemented

### 1. Automatic Retry Logic (`src/providers.js`)

```javascript
export async function retryApiRequest(requestFn, maxRetries = 3, baseDelay = 1000) {
  // Implements exponential backoff with jitter
  // Retries up to 3 times for 503, overloaded, UNAVAILABLE, and rate limit errors
  // Uses increasing delays: 1s, 2s, 4s + random jitter
}
```

**Benefits**:
- Automatically handles temporary API overload
- Exponential backoff prevents overwhelming the API
- Jitter reduces thundering herd problems
- Only retries retryable errors (503, rate limits)

### 2. Enhanced Rate Limiting (`src/index.js`)

```javascript
// Check rate limits first
const rateCheck = geminiManager.checkRateLimit(optimizedDiff.estimatedTokens);
if (!rateCheck.allowed) {
  const waitTimeSeconds = Math.ceil(rateCheck.waitTime / 1000);
  
  // Actually wait for rate limits if it's a short wait (less than 10 seconds)
  if (waitTimeSeconds <= 10) {
    await new Promise(resolve => setTimeout(resolve, rateCheck.waitTime));
    logInfo('Rate limit wait completed, proceeding with request...');
  } else {
    // Fall back to simple commit message for long waits
    return generateSimpleCommitMessage(changes);
  }
}
```

**Benefits**:
- Prevents hitting rate limits in the first place
- Automatically waits for short rate limit resets
- Falls back gracefully for long waits
- Reduces 503 errors caused by rate limiting

### 3. Improved API Key Validation (`src/providers.js`)

```javascript
headerTemplate: (apiKey) => {
  // Validate API key format for Google APIs
  if (!apiKey) {
    throw new Error('Gemini API key is required');
  }
  
  // Google API keys should start with "AIza" - warn if they don't but don't auto-fix
  if (!apiKey.startsWith('AIza')) {
    console.warn('Warning: Gemini API key should start with "AIza". Please verify your API key format.');
  }
  
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': apiKey  // Use API key as-is, no auto-fixing
  };
}
```

**Benefits**:
- Eliminates authentication issues from auto-fixing
- Provides clear warnings for malformed keys
- Respects user's API key exactly as provided
- Reduces 401/403 errors that could appear as 503s

### 4. Optimized Error Handling (`src/index.js`)

```javascript
// Only log full details on the final failure (not retries)
if (!errorDetails.includes('503') && !errorDetails.includes('overloaded')) {
  console.error('Full request details:');
  console.error('URL:', endpoint);
  console.error('Headers:', JSON.stringify(request.headers, null, 2));
  console.error('Body:', typeof request.body === 'string' ? request.body.substring(0, 500) + '...' : request.body);
  console.error('\nFull error response:');
  console.error(errorDetails);
}
```

**Benefits**:
- Reduces log spam during retries
- Truncates large request bodies to prevent memory issues
- Only shows detailed errors for non-retryable failures
- Improves performance in production environments

### 5. Removed Debug Logging (`src/providers.js`)

```javascript
// Removed this line that was causing issues:
// console.log('Raw Gemini API response:', JSON.stringify(data, null, 2));
```

**Benefits**:
- Eliminates potential memory issues with large responses
- Reduces console noise in production
- Improves performance
- Prevents JSON parsing issues

## Testing

Created comprehensive test suite (`test/api-retry.test.js`) to verify:
- Successful requests work without retries
- 503 errors are properly retried with exponential backoff
- Non-retryable errors fail immediately
- Max retry limits are respected
- Timing behavior is correct

## Usage Impact

### For Existing Users
- **No breaking changes**: All existing functionality works as before
- **Automatic improvement**: 503 errors now retry automatically
- **Better reliability**: Rate limiting prevents errors before they happen
- **Cleaner logs**: Less verbose output in production

### For New Users
- **More reliable**: Much less likely to encounter 503 errors
- **Better experience**: Automatic retry and rate limiting
- **Clear guidance**: Comprehensive troubleshooting documentation

## Performance Impact

- **Minimal overhead**: Retry logic only activates on failures
- **Improved throughput**: Rate limiting prevents wasted failed requests
- **Reduced latency**: Fewer failed requests mean fewer manual retries
- **Better resource usage**: Less memory consumption from debug logging

## Configuration Options

Users can customize retry behavior if needed:

```javascript
// In providers.js, the retryApiRequest function accepts:
retryApiRequest(requestFn, maxRetries = 3, baseDelay = 1000)

// For rate limiting, users can set environment variables:
PUSHSCRIPT_LLM_PROVIDER=groq  // Switch to more reliable provider
PUSHSCRIPT_JSON_SIZE_LIMIT=100000  // Reduce payload size
```

## Monitoring and Debugging

### New Logging
- `API request failed (attempt 1/4): 503...` - Shows retry attempts
- `Retrying in 2000ms...` - Shows backoff timing
- `Rate limit would be exceeded, waiting 5s...` - Shows rate limiting

### Troubleshooting Tools
- `docs/TROUBLESHOOTING.md` - Comprehensive guide
- `test/api-retry.test.js` - Verify retry logic works
- `src/utils/check-models.js` - Test API connectivity

## Future Improvements

1. **Adaptive Retry**: Learn from API patterns to optimize retry timing
2. **Circuit Breaker**: Temporarily disable API calls if failure rate is too high
3. **Metrics Collection**: Track success rates and performance
4. **Provider Fallback**: Automatically switch providers on persistent failures

## Migration Guide

### For Package Users
1. Update to the latest version
2. No code changes required
3. Existing configuration continues to work
4. Monitor logs for retry behavior

### For Contributors
1. Import `retryApiRequest` from `providers.js` for new API calls
2. Use rate limiting checks before making requests
3. Follow error handling patterns from `src/index.js`
4. Test retry behavior with `test/api-retry.test.js`

This comprehensive fix should eliminate the persistent 503 errors and provide a much more reliable experience when using PushScript with Gemini API or any other provider. 