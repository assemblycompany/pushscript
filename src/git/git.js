/**
 * Git utility functions for PushScript
 * Handles git operations and status checking
 */

import { execSync } from 'child_process';
import readline from 'readline';

/**
 * Get the git status in a structured format
 * @returns {Array} Array of objects with status and file information
 */
export function getGitStatus() {
  const status = execSync('git status --porcelain').toString();
  return status
    .split('\n')
    .filter(line => line.length > 0)
    .map(line => ({
      status: line.slice(0, 2).trim(),
      file: line.slice(3)
    }));
}

/**
 * Categorize changes by type and affected areas
 * @param {Array} changes Array of change objects from getGitStatus
 * @returns {Object} Categorized changes
 */
export function categorizeChanges(changes) {
  const categories = {
    added: [],
    modified: [],
    deleted: [],
    renamed: [],
    components: new Set(),
    features: new Set()
  };

  changes.forEach(change => {
    // Extract component/feature name from path
    const pathParts = change.file.split('/');
    if (pathParts.includes('components')) {
      const componentIndex = pathParts.indexOf('components');
      if (pathParts[componentIndex + 1]) {
        categories.components.add(pathParts[componentIndex + 1]);
      }
    }
    if (pathParts.includes('features')) {
      const featureIndex = pathParts.indexOf('features');
      if (pathParts[featureIndex + 1]) {
        categories.features.add(pathParts[featureIndex + 1]);
      }
    }

    // Categorize by change type
    if (change.status.includes('A')) categories.added.push(change.file);
    else if (change.status.includes('M')) categories.modified.push(change.file);
    else if (change.status.includes('D')) categories.deleted.push(change.file);
    else if (change.status.includes('R')) categories.renamed.push(change.file);
  });

  return categories;
}

/**
 * Generate a simple commit message based on changes
 * @param {Array} changes Array of change objects
 * @returns {string} Generated commit message
 */
export function generateSimpleCommitMessage(changes) {
  const categories = categorizeChanges(changes);
  
  console.log(`\nChanges: ${changes.length} files (${categories.modified.length} modified, ${categories.added.length} added, ${categories.deleted.length} deleted)`);
  
  let type = 'chore';
  let scope = '';
  let description = '';

  // Determine if this is primarily modifications or additions
  const isMainlyModifications = categories.modified.length > categories.added.length;

  if (isMainlyModifications) {
    if (categories.modified.some(f => f.includes('style') || f.includes('css'))) {
      type = 'style';
      description = 'update styling';
    } else if (categories.components.size > 0) {
      type = 'fix';
      scope = 'ui';
      description = 'update components';
    } else {
      type = 'fix';
      description = 'update implementation';
    }
  } else if (categories.added.length > 0) {
    type = 'feat';
    if (categories.components.size === 1) {
      scope = 'ui';
      description = `add ${Array.from(categories.components)[0]}`;
    } else {
      description = 'add new features';
    }
  }

  const message = scope ? `${type}(${scope}): ${description}` : `${type}: ${description}`;
  console.log('Commit:', message);
  
  return message;
}

/**
 * Get the current git branch
 * @returns {string|null} Current branch name or null if not detected
 */
export async function getCurrentBranch() {
  try {
    const branch = execSync('git symbolic-ref --short HEAD').toString().trim();
    return branch;
  } catch (error) {
    console.warn('\x1b[33mWarning: Unable to detect current branch.\x1b[0m');
    return null;
  }
}

/**
 * Confirm push operation with the user
 * @param {string} commitMessage Commit message to be used
 * @param {string} branchName Branch to push to
 * @returns {Promise<boolean>} True if user confirms, false otherwise
 */
export async function confirmPush(commitMessage, branchName) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Show summary of what will happen
  console.log('\n\x1b[36mReady to push the following changes:\x1b[0m');
  console.log('\x1b[36mCommit Message:\x1b[0m');
  // Format commit message with proper indentation and line breaks
  commitMessage.split('\n').forEach(line => {
    console.log('\x1b[37m' + line + '\x1b[0m');
  });
  
  console.log('\n\x1b[36mFiles changed:\x1b[0m');
  console.log('\x1b[37m' + execSync('git diff --cached --stat').toString() + '\x1b[0m');

  console.log('\x1b[36mTarget branch:\x1b[0m', branchName);

  return new Promise((resolve) => {
    rl.question('\x1b[33mProceed with commit and push? (Y/n): \x1b[0m', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== 'n');
    });
  });
} 