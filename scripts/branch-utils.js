#!/usr/bin/env node
/**
 * Branch utilities for PushScript development
 * Handles devdocs exclusion for main branch commits
 * This file is NOT published to npm - development only
 */

import { execSync } from 'child_process';

/**
 * Excludes devdocs folder from git staging for main branch commits
 * Only used during development of PushScript itself
 */
export function excludeDevdocsForMain() {
  try {
    // Check if devdocs is currently staged
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    
    if (stagedFiles.includes('devdocs/')) {
      // Unstage devdocs folder
      execSync('git reset devdocs/', { stdio: 'ignore' });
      console.log('📁 Excluding devdocs from main branch commit (development mode)');
      return true;
    }
    
    return false;
  } catch (error) {
    // If any error occurs (devdocs doesn't exist, git issues, etc.), continue normally
    return false;
  }
}

/**
 * Check if we're in development mode for PushScript
 */
export function isDevelopmentMode() {
  return process.env.PUSHSCRIPT_EXCLUDE_DEVDOCS_FOR_MAIN === 'true';
} 