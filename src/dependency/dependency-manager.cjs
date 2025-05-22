/**
 * Dependency Manager
 * 
 * Handles package.json and dependency installation for PushScript
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Checks if package.json exists and creates it if needed
 */
function ensurePackageJsonExists() {
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log('Creating package.json for PushScript...');
    
    const packageJson = {
      "name": "pushscript",
      "version": "1.0.0",
      "description": "Enhanced Git workflow automation tool",
      "type": "module",
      "private": true,
      "dependencies": {
        "node-fetch": "^3.3.2",
        "dotenv": "^16.4.5"
      }
    };
    
    try {
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Created package.json successfully.');
    } catch (error) {
      console.error('Error creating package.json:', error.message);
    }
  }
}

/**
 * Check if dependencies are installed and install if needed
 */
function checkAndInstallDependencies() {
  const pushscriptDir = __dirname;
  const nodeModulesDir = path.join(pushscriptDir, 'node_modules');
  
  // Ensure package.json exists first
  ensurePackageJsonExists();
  
  console.log('Checking PushScript dependencies...');
  
  // First: Try to require the packages (works if npm installed them globally or locally)
  try {
    require('node-fetch');
    require('dotenv');
    try {
      // Optional but recommended dependency
      require('@google/generative-ai');
    } catch (aiError) {
      // AI SDK missing isn't critical, will just use other providers
    }
    console.log('Dependencies already available in Node.js path.');
    return; // Exit early - everything works!
  } catch (error) {
    console.log('Some dependencies need to be installed locally...');
  }
  
  // If we get here, at least one dependency is missing, check which ones
  let needsInstall = false;
  
  if (!fs.existsSync(nodeModulesDir)) {
    console.log('PushScript node_modules directory not found.');
    needsInstall = true;
  } else {
    // Check for specific required packages
    const requiredPackages = ['node-fetch', 'dotenv'];
    for (const pkg of requiredPackages) {
      const pkgDir = path.join(nodeModulesDir, pkg);
      if (!fs.existsSync(pkgDir)) {
        console.log(`Required package '${pkg}' not found.`);
        needsInstall = true;
        break;
      }
    }
  }
  
  if (needsInstall) {
    console.log('Installing required packages for PushScript...');
    
    // Determine packages to install
    const requiredPackages = ['node-fetch', 'dotenv'];
    const optionalPackages = ['@google/generative-ai'];
    
    // Try installing with various package managers in sequence
    let success = false;
    
    // Define installation methods in order of preference
    const installMethods = [
      {
        name: 'pnpm',
        command: `pnpm install --no-workspace ${requiredPackages.join(' ')}`,
        check: () => {
          try {
            execSync('pnpm --version', { stdio: 'ignore' });
            return true;
          } catch (e) {
            return false;
          }
        }
      },
      {
        name: 'npm',
        command: `npm install ${requiredPackages.join(' ')}`,
        check: () => true // npm should always be available if Node.js is installed
      },
      {
        name: 'yarn',
        command: `yarn add ${requiredPackages.join(' ')}`,
        check: () => {
          try {
            execSync('yarn --version', { stdio: 'ignore' });
            return true;
          } catch (e) {
            return false;
          }
        }
      }
    ];
    
    // Try each installation method in sequence
    for (const method of installMethods) {
      if (!method.check()) continue;
      
      try {
        console.log(`Trying to install dependencies with ${method.name}...`);
        execSync(method.command, {
          cwd: pushscriptDir,
          stdio: 'inherit'
        });
        console.log(`Dependencies installed successfully with ${method.name}.`);
        
        // Try to install the optional AI SDK for Gemini (recommended)
        try {
          console.log(`Installing optional AI SDK with ${method.name}...`);
          const aiCommand = method.command.replace(requiredPackages.join(' '), optionalPackages.join(' '));
          execSync(aiCommand, {
            cwd: pushscriptDir,
            stdio: 'inherit'
          });
          console.log('AI SDK installed successfully.');
        } catch (aiError) {
          console.log('Note: Optional AI SDK could not be installed, but PushScript will still work.');
        }
        
        success = true;
        break;
      } catch (error) {
        console.error(`Failed to install dependencies with ${method.name}:`, error.message);
      }
    }
    
    if (!success) {
      console.error('All installation methods failed. Please install dependencies manually:');
      console.error(`npm install ${requiredPackages.join(' ')}`);
      process.exit(1);
    }
  } else {
    console.log('PushScript dependencies already installed.');
  }
}

module.exports = {
  ensurePackageJsonExists,
  checkAndInstallDependencies
}; 