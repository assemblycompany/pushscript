import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try to load from .env.local
console.log('Attempting to load .env.local...');
if (fs.existsSync('.env.local')) {
  console.log('.env.local file exists');
  dotenv.config({ path: '.env.local' });
} else {
  console.log('.env.local file NOT found');
}

// Check environment variables
console.log('\nEnvironment Variables:');
console.log('PUSHSCRIPT_LLM_PROVIDER:', process.env.PUSHSCRIPT_LLM_PROVIDER);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'EXISTS (starting with: ' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : 'NOT SET');
console.log('GEMINI_PUSHSCRIPT_MODEL:', process.env.GEMINI_PUSHSCRIPT_MODEL);
console.log('PUSHSCRIPT_LLM_API_KEY:', process.env.PUSHSCRIPT_LLM_API_KEY ? 'EXISTS' : 'NOT SET');

// Check how PushScript would resolve the API key
const providerKey = process.env[`${process.env.PUSHSCRIPT_LLM_PROVIDER.toUpperCase()}_API_KEY`];
console.log('\nProvider-specific key lookup:');
console.log(`Looking for ${process.env.PUSHSCRIPT_LLM_PROVIDER.toUpperCase()}_API_KEY:`, providerKey ? 'FOUND' : 'NOT FOUND');

// Final resolution as PushScript would do it
const resolvedKey = process.env.PUSHSCRIPT_LLM_API_KEY || providerKey;
console.log('\nFinal API key resolution:');
console.log('Resolved API key:', resolvedKey ? 'SUCCESS' : 'FAILED'); 