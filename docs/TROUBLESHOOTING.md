# PushScript Troubleshooting Guide

## Common Issues and Solutions

### 1. Gemini API 503 "Model Overloaded" Errors

**Problem**: Getting persistent 503 errors with message "The model is overloaded. Please try again later."

**Root Causes & Solutions**:

#### A. Rate Limiting Issues
- **Cause**: Hitting Gemini API rate limits (15 requests/minute for free tier)
- **Solution**: PushScript now automatically waits for rate limits and implements retry logic
- **Action**: Update to latest version with retry mechanisms

#### B. API Key Format Issues
- **Cause**: Incorrect API key format
- **Solution**: Ensure your Gemini API key starts with "AIza"
- **Action**: Verify your API key in Google Cloud Console

#### C. Rapid Successive Requests
- **Cause**: Making requests too quickly
- **Solution**: PushScript now includes exponential backoff
- **Action**: No action needed with updated version

#### D. Large Diff Content
- **Cause**: Sending too much content to the API
- **Solution**: PushScript automatically optimizes diff content
- **Action**: Large changes are now automatically handled

### 2. API Configuration Issues

#### Check Your Environment Variables
```bash
# For Gemini (recommended)
export GEMINI_API_KEY="AIza..." 
export PUSHSCRIPT_LLM_PROVIDER="gemini"

# Or use .env.local file
echo "GEMINI_API_KEY=AIza..." > .env.local
echo "PUSHSCRIPT_LLM_PROVIDER=gemini" >> .env.local
```

#### Verify API Key Format
```bash
# Your Gemini API key should look like this:
# AIzaSyD-bQcK7r8FxN2mLpYhJ3kWvXuZ9tE4qS8
```

### 3. Network and Connectivity Issues

#### Check API Endpoint Accessibility
```bash
# Test if you can reach the Gemini API
curl -H "x-goog-api-key: YOUR_API_KEY" \
  "https://generativelanguage.googleapis.com/v1beta/models"
```

#### Proxy/Firewall Issues
- Some corporate networks block Google APIs
- Try from a different network to isolate the issue
- Configure proxy settings if needed

### 4. Debugging Steps

#### Enable Debug Mode
```bash
# Run with verbose logging
DEBUG=1 npx pushscript
```

#### Check Model Availability
```bash
# Test your API key and see available models
node src/utils/check-models.js
```

#### Validate Configuration
```bash
# Check your current configuration
npx pushscript --config
```

### 5. Error-Specific Solutions

#### "Empty response received from Gemini API"
- **Cause**: API returned no data
- **Solution**: Check API key and network connectivity
- **Retry**: Usually resolves automatically with retry logic

#### "No candidates found in Gemini API response"
- **Cause**: Content blocked by safety filters
- **Solution**: Review your commit content for flagged terms
- **Fallback**: Use alternative provider temporarily

#### "API request failed with status 401"
- **Cause**: Invalid or expired API key
- **Solution**: Generate a new API key from Google Cloud Console
- **Check**: Ensure API key has proper permissions

#### "Rate limit exceeded"
- **Cause**: Too many requests in time window
- **Solution**: PushScript now automatically waits
- **Manual**: Wait 1 minute before retrying

### 6. Alternative Providers

If Gemini continues to have issues, switch to alternative providers:

```bash
# Switch to Groq (fast and reliable)
export PUSHSCRIPT_LLM_PROVIDER="groq"
export GROQ_API_KEY="gsk_..."

# Or OpenAI
export PUSHSCRIPT_LLM_PROVIDER="openai"
export OPENAI_API_KEY="sk-..."
```

### 7. Getting Help

If issues persist:

1. **Check the logs**: Look for specific error messages
2. **Test with minimal changes**: Try committing small changes first
3. **Switch providers**: Use Groq or OpenAI as alternatives
4. **File an issue**: Include error logs and configuration details

#### Information to Include in Bug Reports
- Full error message and stack trace
- Your provider configuration (without API keys)
- Size of changes being committed
- Operating system and Node.js version
- Whether it works with other providers

### 8. Performance Optimization

#### Reduce API Calls
- Use `--no-ai` flag for quick commits without AI generation
- Set up `.pushscriptrc` with preferred fallback behavior

#### Optimize for Large Projects
```json
{
  "commitStyle": "conventional",
  "provider": "groq",
  "fallbackToSimple": true,
  "maxRetries": 2
}
```

### 9. Advanced Troubleshooting

#### Network Debugging
```bash
# Check DNS resolution
nslookup generativelanguage.googleapis.com

# Test HTTPS connectivity
openssl s_client -connect generativelanguage.googleapis.com:443
```

#### API Response Analysis
Enable response logging temporarily:
```javascript
// In src/providers.js, temporarily uncomment debug logging
console.log('Raw API response:', JSON.stringify(data, null, 2));
```

Remember to remove debug logging after troubleshooting to avoid log spam. 