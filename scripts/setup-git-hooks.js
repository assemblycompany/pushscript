#!/usr/bin/env node
/**
 * Setup git hooks for PushScript development
 * Automatically excludes devdocs from main branch commits
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const hookScript = `#!/bin/sh
# PushScript pre-commit hook
# Automatically exclude devdocs from main branch commits

current_branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "HEAD")

if [ "$current_branch" = "main" ]; then
    # Check if devdocs is staged
    if git diff --cached --name-only | grep -q "^devdocs/"; then
        echo "📁 Excluding devdocs from main branch commit"
        git reset devdocs/ 2>/dev/null || true
    fi
fi
`;

try {
    // Create .git/hooks directory if it doesn't exist
    const hooksDir = '.git/hooks';
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Write the pre-commit hook
    const hookPath = path.join(hooksDir, 'pre-commit');
    fs.writeFileSync(hookPath, hookScript);
    
    // Make it executable
    execSync(`chmod +x ${hookPath}`);
    
    console.log('✅ Git hooks setup complete!');
    console.log('📁 devdocs will be automatically excluded from main branch commits');
    console.log('🚀 Dev branch commits will include everything');
    
} catch (error) {
    console.error('❌ Failed to setup git hooks:', error.message);
    process.exit(1);
} 