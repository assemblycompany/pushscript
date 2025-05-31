/**
 * CLI Runner
 * 
 * Handles running the main CLI script in ESM mode
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Run the PushScript CLI with provided arguments
 * @param {string[]} args Command line arguments
 */
function runCliScript(args) {
  // Path to the CLI script
  const cliPath = path.join(__dirname, '../src/cli.js');
  
  // Verify the CLI script exists
  if (!fs.existsSync(cliPath)) {
    console.error(`Error: Could not find the PushScript CLI at ${cliPath}`);
    process.exit(1);
  }
  
  // Run the actual pushscript CLI using Node's ESM loader
  try {
    // Properly escape arguments to preserve shell quoting
    const escapedArgs = args.map(arg => {
      // If arg contains spaces or quotes, wrap in quotes and escape internal quotes
      if (arg.includes(' ') || arg.includes('"') || arg.includes("'")) {
        return `"${arg.replace(/"/g, '\\"')}"`;
      }
      return arg;
    }).join(' ');
    
    execSync(`node --experimental-specifier-resolution=node --experimental-modules ${cliPath} ${escapedArgs}`, {
      stdio: 'inherit'
    });
    return true;
  } catch (error) {
    // Show error message if not already displayed
    if (error.stdout || error.stderr) {
      console.error('Error running PushScript:');
      if (error.stdout) console.error(error.stdout.toString());
      if (error.stderr) console.error(error.stderr.toString());
    }
    return false;
  }
}

module.exports = {
  runCliScript
}; 