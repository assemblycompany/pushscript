/**
 * Configuration for pushscript
 * Centralizes environment variable loading and common configurations
 */
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define a function to find the project root
function findProjectRoot(startPath) {
  let currentPath = startPath;
  
  // Safety limit for directory traversal
  const maxLevels = 10;
  let level = 0;
  
  while (level < maxLevels) {
    // Check if pnpm-workspace.yaml exists at this level
    if (fs.existsSync(path.join(currentPath, 'pnpm-workspace.yaml'))) {
      return currentPath;
    }
    
    // Move up one directory
    const parentPath = path.dirname(currentPath);
    
    // If we can't go up anymore, we've reached the root of the filesystem
    if (parentPath === currentPath) {
      return null;
    }
    
    currentPath = parentPath;
    level++;
  }
  
  return null;
}

// Logger for config setup
const logConfig = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  
  switch (level) {
    case 'error':
      console.error(`[${timestamp}] [PushScript-Config] ERROR: ${message}`);
      break;
    case 'warn':
      console.warn(`[${timestamp}] [PushScript-Config] WARNING: ${message}`);
      break;
    default:
      console.log(`[${timestamp}] [PushScript-Config] ${message}`);
  }
};

// Start from the current working directory to find the project root
const projectRoot = findProjectRoot(process.cwd());

// Get the root directory of the project
const rootDir = process.cwd().split('/node_modules')[0]; // This ensures we get the true root even if called from within node_modules

// Define patterns to search for
const envFilePatterns = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  '.env.test'
];

// Always look in the root directory first, then fall back to other locations
const possibleEnvFiles = [
  // First priority: Files directly in the root directory
  ...envFilePatterns.map(pattern => path.join(rootDir, pattern)),
  
  // Second priority: Project root from findProjectRoot (if different from rootDir)
  ...(projectRoot && projectRoot !== rootDir 
    ? envFilePatterns.map(pattern => path.join(projectRoot, pattern)) 
    : []),
  
  // Third priority: Current working directory
  ...envFilePatterns.map(pattern => path.resolve(process.cwd(), pattern)),
  
  // Fourth priority: Parent directory of current working directory
  ...envFilePatterns.map(pattern => path.resolve(process.cwd(), '../', pattern)),
  
  // Fifth priority: Two directories up from current working directory
  ...envFilePatterns.map(pattern => path.resolve(process.cwd(), '../../', pattern)),
  
  // Sixth priority: Three directories up from current working directory
  ...envFilePatterns.map(pattern => path.resolve(process.cwd(), '../../../', pattern))
].filter(Boolean);

let envFileLoaded = false;

// Add debug info about where we're looking
logConfig(`Looking for environment files in these locations (in order of priority):`);

// Try each possible env file location
for (const envPath of possibleEnvFiles) {
  if (fs.existsSync(envPath)) {
    logConfig(`Loading environment variables from: ${envPath}`);
    dotenv.config({ path: envPath });
    envFileLoaded = true;
    break;
  }
}

if (!envFileLoaded) {
  logConfig('No environment files found, using system environment variables', 'error');
}

// Provider-specific API key environment variables
const PROVIDER_KEYS = {
  groq: 'GROQ_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY'
};

// Provider-specific model environment variables
const PROVIDER_MODELS = {
  groq: 'GROQ_PUSHSCRIPT_MODEL',
  openai: 'OPENAI_PUSHSCRIPT_MODEL',
  anthropic: 'ANTHROPIC_PUSHSCRIPT_MODEL',
  gemini: 'GEMINI_PUSHSCRIPT_MODEL'
};

// Default models for each provider
const DEFAULT_MODELS = {
  groq: 'llama-3.3-70b-versatile',
  openai: 'gpt-4o',
  anthropic: 'claude-3.7-sonnet',
  gemini: 'gemini-2.0-pro'
};

// Initialize environment variables with fallbacks
const ENV = {
  LLM_PROVIDER: process.env.PUSHSCRIPT_LLM_PROVIDER || 'groq',
  LLM_API_KEY: process.env.PUSHSCRIPT_LLM_API_KEY || null,
  LLM_MODEL: process.env.PUSHSCRIPT_LLM_MODEL || null,
  // JSON size limit in bytes (default: 250KB)
  JSON_SIZE_LIMIT: process.env.PUSHSCRIPT_JSON_SIZE_LIMIT ? 
    parseInt(process.env.PUSHSCRIPT_JSON_SIZE_LIMIT) : 
    250 * 1024,
  // Auto-gitignore large JSON files
  AUTO_GITIGNORE_JSON: process.env.PUSHSCRIPT_AUTO_GITIGNORE_JSON === 'true'
};

// Export configuration
export default {
  provider: ENV.LLM_PROVIDER,
  apiKey: ENV.LLM_API_KEY || process.env[PROVIDER_KEYS[ENV.LLM_PROVIDER]] || null,
  model: ENV.LLM_MODEL || process.env[PROVIDER_MODELS[ENV.LLM_PROVIDER]] || DEFAULT_MODELS[ENV.LLM_PROVIDER],
  providerKeys: PROVIDER_KEYS,
  providerModels: PROVIDER_MODELS,
  defaultModels: DEFAULT_MODELS,
  // JSON size limiting configuration
  jsonSizeLimit: ENV.JSON_SIZE_LIMIT,
  autoGitignoreJson: ENV.AUTO_GITIGNORE_JSON
}; 