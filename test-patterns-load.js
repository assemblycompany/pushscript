// Test pattern loading
import { SECRET_PATTERNS } from './src/security/secret-patterns.js';

console.log('Loaded patterns:', Object.keys(SECRET_PATTERNS));
console.log('OpenAI pattern:', SECRET_PATTERNS.openai_api_key);

const testSecret = "sk-1234567890abcdef1234567890abcdef1234567890abcdef";
const result = testSecret.match(SECRET_PATTERNS.openai_api_key.pattern);
console.log('Test result:', result); 