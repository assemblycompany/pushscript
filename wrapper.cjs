/**
 * PushScript CommonJS wrapper
 * 
 * This wrapper ensures the required dependencies are installed
 * before running the actual pushscript, avoiding module errors
 */

const fs = require('fs');
const path = require('path');
const { ensureGitignoreExists } = require('./gitignore-manager.cjs');
const { checkAndInstallDependencies } = require('./dependency-manager.cjs');
const { runCliScript } = require('./cli-runner.cjs');

// Main function to run pushscript
function runPushScript() {
  try {
    // First, ensure we have a proper .gitignore
    ensureGitignoreExists();
    
    // Only check and install dependencies if self-healing is enabled
    const selfHeal = process.env.PUSHSCRIPT_SELF_HEAL === 'true';
    
    if (selfHeal) {
      console.log('Self-healing mode enabled. Checking dependencies...');
      checkAndInstallDependencies();
    }
    
    // Get command line arguments
    const args = process.argv.slice(2);
    
    // Run the CLI script
    const success = runCliScript(args);
    
    // Exit with appropriate code
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('Error in PushScript wrapper:', error.message);
    process.exit(1);
  }
}

// Run the script
runPushScript(); 