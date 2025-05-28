#!/usr/bin/env node
/**
 * PushScript - Enhanced Git workflow automation
 * Command Line Interface entry point
 */

import path from 'path';
import { commit, push } from './index.js';
import { displayHelp } from './utils/formatting.js';
import { runAutoPackageSetup } from './setup/auto-package.js';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let message = null;
  let branch = null;
  let command = null;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      displayHelp();
    } else if (arg === 'setup') {
      command = 'setup';
    } else if (arg === '--main') {
      branch = 'main';
    } else if (arg === '--dev') {
      branch = 'dev';
    } else if (arg === 'main') {
      // Direct "push main" syntax support
      branch = 'main';
    } else if (arg === 'dev') {
      // Direct "push dev" syntax support
      branch = 'dev';
    } else if (!message) {
      // If no message has been set, assume this arg is the message
      message = arg;
    } else if (!branch) {
      // If message is set but branch isn't, assume this arg is the branch
      branch = arg;
    }
  }
  
  return { message, branch, command };
}

// Execute the appropriate command based on script name
async function main() {
  // Determine which command to run based on the script name
  const scriptName = path.basename(process.argv[1]);
  const commandName = path.basename(scriptName, '.js');
  
  const { message, branch, command } = parseArgs();
  
  try {
    if (command === 'setup') {
      await runAutoPackageSetup();
    } else if (commandName === 'commit') {
      await commit(message);
    } else {
      await push(message, branch);
    }
  } catch (error) {
    console.error('\x1b[31mError:\x1b[0m', error);
    process.exit(1);
  }
}

// Only run if this is the main module (not imported)
if (import.meta.url.startsWith('file:')) {
  main();
}

// Export for testing or programmatic usage
export { parseArgs, main }; 