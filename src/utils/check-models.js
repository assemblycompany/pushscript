import { listGeminiModels } from './providers.js';
import dotenv from 'dotenv';
import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env.local');
console.log('Loading env from:', envPath);
console.log('File exists:', existsSync(envPath));

// Load environment variables from .env.local
const result = dotenv.config({ path: envPath });
console.log('Dotenv result:', result);

// Get the API key from environment variables
const apiKey = process.env.GEMINI_API_KEY || process.env.PUSHSCRIPT_LLM_API_KEY;
console.log('Environment variables:');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');
console.log('PUSHSCRIPT_LLM_API_KEY:', process.env.PUSHSCRIPT_LLM_API_KEY ? 'Set' : 'Not set');

if (!apiKey) {
  console.error('No Gemini API key found in environment variables');
  process.exit(1);
}

// List the models
console.log('\nChecking available Gemini models...');
listGeminiModels(apiKey).then(models => {
  if (models.length === 0) {
    console.log('No models found or error occurred');
  } else {
    console.log('\nAvailable models:');
    models.forEach(model => {
      console.log(`- ${model.name}`);
      if (model.supportedGenerationMethods) {
        console.log('  Supported methods:', model.supportedGenerationMethods.join(', '));
      }
    });
  }
}).catch(error => {
  console.error('Error:', error);
});
