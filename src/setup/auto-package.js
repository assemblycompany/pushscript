#!/usr/bin/env node
/**
 * Auto-Package Setup for PushScript
 * Intelligently adds shortcuts to user's package.json after installation
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SETUP_MARKER_FILE = '.pushscript-setup';
const SCRIPTS_TO_ADD = {
  'push': 'pushscript',
  'commit': 'pushscript commit',
  'pushscript': 'pushscript'
};

/**
 * Creates a readline interface for user prompting
 */
function createPrompt() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Prompts user for permission to modify package.json
 */
async function askUserPermission() {
  const rl = createPrompt();
  
  return new Promise((resolve) => {
    console.log('\n🚀 PushScript Setup');
    console.log('Would you like to add convenient shortcuts to your package.json?');
    console.log('This will add:');
    Object.entries(SCRIPTS_TO_ADD).forEach(([name, command]) => {
      console.log(`  • "npm run ${name}" → "${command}"`);
    });
    
    rl.question('\nAdd these shortcuts? (Y/n): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== 'n');
    });
  });
}

/**
 * Finds the user's project root (not pushscript's own directory)
 */
function findProjectRoot() {
  let currentDir = process.cwd();
  
  // If we're in node_modules, go up to find the actual project
  if (currentDir.includes('node_modules')) {
    const parts = currentDir.split(path.sep);
    const nodeModulesIndex = parts.lastIndexOf('node_modules');
    if (nodeModulesIndex > 0) {
      currentDir = parts.slice(0, nodeModulesIndex).join(path.sep);
    }
  }
  
  return currentDir;
}

/**
 * Checks if this is a CI environment where we shouldn't prompt
 */
function isCIEnvironment() {
  return !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.CIRCLECI
  );
}

/**
 * Checks if setup has already been run or declined
 */
function hasSetupBeenRun(projectRoot) {
  return fs.existsSync(path.join(projectRoot, SETUP_MARKER_FILE));
}

/**
 * Creates a marker file to remember that setup was shown
 */
function createSetupMarker(projectRoot) {
  const markerPath = path.join(projectRoot, SETUP_MARKER_FILE);
  const markerContent = {
    timestamp: new Date().toISOString(),
    setupShown: true,
    version: '0.1.0'
  };
  
  fs.writeFileSync(markerPath, JSON.stringify(markerContent, null, 2));
}

/**
 * Safely updates package.json with new scripts
 */
function updatePackageJson(projectRoot) {
  const packagePath = path.join(projectRoot, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log('⚠️  No package.json found in project root');
    return false;
  }
  
  try {
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    // Initialize scripts if it doesn't exist
    packageJson.scripts = packageJson.scripts || {};
    
    let scriptsAdded = [];
    let scriptsSkipped = [];
    
    // Add scripts, but don't overwrite existing ones
    Object.entries(SCRIPTS_TO_ADD).forEach(([scriptName, command]) => {
      if (!packageJson.scripts[scriptName]) {
        packageJson.scripts[scriptName] = command;
        scriptsAdded.push(scriptName);
      } else if (packageJson.scripts[scriptName] === command) {
        // Already has the correct script
        scriptsSkipped.push(`${scriptName} (already exists)`);
      } else {
        // Has a different script with the same name
        scriptsSkipped.push(`${scriptName} (custom script exists)`);
      }
    });
    
    if (scriptsAdded.length > 0) {
      // Write the updated package.json
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
      
      console.log('✅ Successfully added scripts to package.json:');
      scriptsAdded.forEach(script => {
        console.log(`   • npm run ${script}`);
      });
    }
    
    if (scriptsSkipped.length > 0) {
      console.log('ℹ️  Skipped scripts:');
      scriptsSkipped.forEach(script => {
        console.log(`   • ${script}`);
      });
    }
    
    return scriptsAdded.length > 0;
  } catch (error) {
    console.error('❌ Error updating package.json:', error.message);
    return false;
  }
}

/**
 * Main setup function
 */
async function runAutoPackageSetup() {
  try {
    // Skip if running in test environment
    if (process.env.NODE_ENV === 'test' || process.argv.includes('--test')) {
      return;
    }
    
    const projectRoot = findProjectRoot();
    
    // Skip if in CI environment
    if (isCIEnvironment()) {
      console.log('🤖 CI environment detected, skipping interactive setup');
      console.log('💡 Run "npx pushscript setup" manually to add shortcuts');
      return;
    }
    
    // Skip if already shown (regardless of previous choice)
    if (hasSetupBeenRun(projectRoot)) {
      return; // Silent exit if already shown before
    }
    
    // Ask user for permission
    const userAccepted = await askUserPermission();
    
    // Always create marker file - we've shown the setup once
    createSetupMarker(projectRoot);
    
    if (userAccepted) {
      const success = updatePackageJson(projectRoot);
      
      if (success) {
        console.log('\n🎉 Setup complete! You can now use:');
        console.log('   npm run push     # Commit and push with AI message');
        console.log('   npm run commit   # Commit only with AI message');
        console.log('   npm run pushscript # Access CLI directly');
      }
    } else {
      console.log('\n👍 No problem! You can manually add these to your package.json anytime:');
      console.log('');
      console.log('   "scripts": {');
      Object.entries(SCRIPTS_TO_ADD).forEach(([name, command]) => {
        console.log(`     "${name}": "${command}",`);
      });
      console.log('   }');
      console.log('');
      console.log('💡 Or run "npx pushscript setup" later to add them automatically');
    }
    
    console.log('\n📖 Don\'t forget to add your AI provider API key to .env or .env.local');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
    // Don't exit with error code - setup failure shouldn't break installation
  }
}

// Export for testing and CLI usage
export { runAutoPackageSetup, updatePackageJson, findProjectRoot };

// Run if called directly
if (import.meta.url.startsWith('file:')) {
  runAutoPackageSetup();
} 