#!/usr/bin/env node

/**
 * Test retry logic for API failures
 * Simulates 503 errors to verify exponential backoff works
 */

import { retryApiRequest } from '../src/providers.js';

console.log('🧪 Testing API Retry Logic');
console.log('===========================');

// Test 1: Successful request (no retries needed)
console.log('\n1. Testing successful request...');
try {
  const result = await retryApiRequest(async () => {
    console.log('  Making successful API call...');
    return { success: true, data: 'test response' };
  });
  console.log('  ✅ Success:', result);
} catch (error) {
  console.log('  ❌ Unexpected error:', error.message);
}

// Test 2: Retryable error (503) that succeeds on retry
console.log('\n2. Testing retryable error with eventual success...');
let attempt = 0;
try {
  const result = await retryApiRequest(async () => {
    attempt++;
    console.log(`  Attempt ${attempt}...`);
    if (attempt < 3) {
      throw new Error('503 Service Unavailable: The model is overloaded. Please try again later.');
    }
    return { success: true, data: 'succeeded on retry' };
  }, 2, 100); // Max 2 retries, 100ms base delay
  console.log('  ✅ Success after retries:', result);
} catch (error) {
  console.log('  ❌ Failed after retries:', error.message);
}

// Test 3: Non-retryable error (should fail immediately)
console.log('\n3. Testing non-retryable error...');
try {
  const result = await retryApiRequest(async () => {
    console.log('  Making request with non-retryable error...');
    throw new Error('401 Unauthorized: Invalid API key');
  }, 2, 100);
  console.log('  ❌ Unexpected success:', result);
} catch (error) {
  console.log('  ✅ Expected failure:', error.message);
}

// Test 4: Max retries exceeded
console.log('\n4. Testing max retries exceeded...');
let maxAttempt = 0;
try {
  const result = await retryApiRequest(async () => {
    maxAttempt++;
    console.log(`  Attempt ${maxAttempt}...`);
    throw new Error('503 Service Unavailable: The model is overloaded. Please try again later.');
  }, 2, 50); // Max 2 retries, 50ms base delay
  console.log('  ❌ Unexpected success:', result);
} catch (error) {
  console.log('  ✅ Expected failure after max retries:', error.message);
  console.log(`  📊 Total attempts made: ${maxAttempt}`);
}

console.log('\n🎯 Retry logic test completed!');
console.log('The fixes should help prevent 503 errors in production by:');
console.log('  - Automatically retrying temporary failures');
console.log('  - Using exponential backoff to avoid overwhelming the API');
console.log('  - Enforcing rate limits before making requests');
console.log('  - Providing better error messages and logging'); 