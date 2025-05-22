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
  
  // Check if node_modules directory exists and contains the required packages
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
    
    try {
      // Use --no-workspace to install dependencies locally in the pushscript directory
      execSync('pnpm install --no-workspace node-fetch dotenv', { 
        cwd: pushscriptDir,
        stdio: 'inherit'
      });
      console.log('Dependencies installed successfully.');
    } catch (error) {
      console.error('Failed to install dependencies:', error.message);
      console.log('Trying alternative installation method...');
      
      try {
        // Fall back to npm if pnpm fails
        execSync('npm install node-fetch dotenv', {
          cwd: pushscriptDir,
          stdio: 'inherit'
        });
        console.log('Dependencies installed successfully with npm.');
      } catch (npmError) {
        console.error('Failed to install dependencies with npm:', npmError.message);
        process.exit(1);
      }
    }
  } else {
    console.log('PushScript dependencies already installed.');
  }
}

module.exports = {
  ensurePackageJsonExists,
  checkAndInstallDependencies
}; 