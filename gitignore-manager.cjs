/**
 * GitIgnore Manager
 * 
 * Handles .gitignore file operations for PushScript
 */

const fs = require('fs');
const path = require('path');

/**
 * Creates a comprehensive .gitignore file if one doesn't exist
 * or updates an existing one to include pushscript dependencies
 */
function ensureGitignoreExists() {
  // Get project root (two levels up from this script)
  const projectRoot = path.resolve(__dirname, '../../');
  const gitignorePath = path.join(projectRoot, '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    console.log('No .gitignore found. Creating a comprehensive .gitignore file...');
    
    const gitignoreContent = `# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build
.swc/

# Production
dist
build

# Turbo
.turbo

# Environment
.env
.env.*
!.env.example
env.local
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Misc
.DS_Store
*.pem
Thumbs.db

# Vercel
.vercel

# Local Netlify folder
.netlify

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Cache
.cache/
**/.cache/
.temp/

# PushScript local dependencies
scripts/pushscript/node_modules/

# Editor directories and files
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`;
    
    try {
      fs.writeFileSync(gitignorePath, gitignoreContent);
      console.log('Created .gitignore file successfully.');
    } catch (error) {
      console.error('Error creating .gitignore file:', error.message);
    }
  } else {
    // Check if our pushscript node_modules are in the gitignore
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    if (!gitignoreContent.includes('scripts/pushscript/node_modules')) {
      console.log('Adding pushscript node_modules to .gitignore...');
      const updatedContent = gitignoreContent + '\n\n# PushScript local dependencies\nscripts/pushscript/node_modules/\n';
      try {
        fs.writeFileSync(gitignorePath, updatedContent);
        console.log('Updated .gitignore file successfully.');
      } catch (error) {
        console.error('Error updating .gitignore file:', error.message);
      }
    }
  }
}

module.exports = {
  ensureGitignoreExists
}; 