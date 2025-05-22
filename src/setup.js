#!/usr/bin/env node
/**
 * PushScript Setup Script
 * 
 * This script automates the setup process for PushScript by:
 * 1. Adding required dependencies to package.json
 * 2. Adding script shortcuts to package.json
 * 3. Adding "type": "module" to package.json if not present
 * 4. Creating a sample .env.local file if not present
 * 5. Installing dependencies
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current script's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');

// Package.json path
const packageJsonPath = path.join(projectRoot, 'package.json');

// Read package.json
console.log('Reading package.json...');
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}

// Update package.json
let packageJsonUpdated = false;

// Add type: module if not present
if (!packageJson.type || packageJson.type !== 'module') {
  packageJson.type = 'module';
  packageJsonUpdated = true;
  console.log('Added "type": "module" to package.json');
}

// Add dependencies if not present
const requiredDependencies = {
  'node-fetch': '^3.3.2',
  'dotenv': '^16.4.5'
};

packageJson.dependencies = packageJson.dependencies || {};
let dependenciesAdded = false;

for (const [name, version] of Object.entries(requiredDependencies)) {
  if (!packageJson.dependencies[name]) {
    packageJson.dependencies[name] = version;
    console.log(`Added ${name}@${version} to dependencies`);
    dependenciesAdded = true;
  }
}

if (dependenciesAdded) {
  packageJsonUpdated = true;
}

// Add scripts if not present
const requiredScripts = {
  'push': 'node scripts/pushscript/pushscript.js',
'commit': 'node scripts/pushscript/pushscript.js commit',
'pushscript': 'node scripts/pushscript/pushscript.js'
};

packageJson.scripts = packageJson.scripts || {};
let scriptsAdded = false;

for (const [name, command] of Object.entries(requiredScripts)) {
  if (!packageJson.scripts[name]) {
    packageJson.scripts[name] = command;
    console.log(`Added script: ${name}`);
    scriptsAdded = true;
  }
}

if (scriptsAdded) {
  packageJsonUpdated = true;
}

// Write updated package.json if changes were made
if (packageJsonUpdated) {
  console.log('Writing updated package.json...');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Create .env.local file if it doesn't exist
const envLocalPath = path.join(projectRoot, '.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.log('Creating sample .env.local file...');
  const sampleEnvContent = `# Provider to use (groq, openai, anthropic, gemini)
PUSHSCRIPT_LLM_PROVIDER=groq

# API key for your preferred provider
# GROQ_API_KEY=your-key-here
# OPENAI_API_KEY=your-key-here
# ANTHROPIC_API_KEY=your-key-here
# GEMINI_API_KEY=your-key-here

# Optional: Model selection
# GROQ_PUSHSCRIPT_MODEL=llama-3.3-70b-versatile
# OPENAI_PUSHSCRIPT_MODEL=gpt-4o
# ANTHROPIC_PUSHSCRIPT_MODEL=claude-3.7-sonnet
# GEMINI_PUSHSCRIPT_MODEL=gemini-2.0-pro
`;
  fs.writeFileSync(envLocalPath, sampleEnvContent);
}

// Check .gitignore file
const gitignorePath = path.join(projectRoot, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  console.log('Checking .gitignore file...');
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  if (!gitignoreContent.includes('.env') && !gitignoreContent.includes('.env*')) {
    console.log('Adding .env* to .gitignore...');
    fs.appendFileSync(gitignorePath, '\n# env files\n.env*\n');
  }
}

// Install dependencies
if (dependenciesAdded) {
  console.log('Installing dependencies...');
  try {
    // Detect package manager
    const useYarn = fs.existsSync(path.join(projectRoot, 'yarn.lock'));
    const usePnpm = fs.existsSync(path.join(projectRoot, 'pnpm-lock.yaml'));
    
    if (usePnpm) {
      execSync('pnpm install', { stdio: 'inherit', cwd: projectRoot });
    } else if (useYarn) {
      execSync('yarn install', { stdio: 'inherit', cwd: projectRoot });
    } else {
      execSync('npm install', { stdio: 'inherit', cwd: projectRoot });
    }
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    console.log('Please run the install command manually:');
    console.log('  pnpm install  (if using pnpm)');
    console.log('  yarn install  (if using yarn)');
    console.log('  npm install   (if using npm)');
  }
}

console.log('\nPushScript setup complete! 🚀');
console.log('\nUsage:');
console.log('  pnpm push     - Commit and push with AI-generated message');
console.log('  pnpm commit   - Commit only with AI-generated message');
console.log('  pnpm pushscript - Access the CLI directly');
console.log('\nPlease make sure to add your API key to .env.local');
console.log('See scripts/pushscript/SETUP.md for more details and troubleshooting.'); 