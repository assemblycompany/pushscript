/**
 * JSON Size Limiter for PushScript
 * Detects and prevents committing large JSON files
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { logWarning, logError, logInfo } from './formatting.js';

// Default size limit: 250KB (in bytes)
const DEFAULT_SIZE_LIMIT = 250 * 1024;

// Patterns that should always be caught regardless of size
const ALWAYS_IGNORE_PATTERNS = [
  'debug-', 
  '-debug-',
  '.debug.'
];

/**
 * Get the configured JSON size limit
 * @returns {number} Size limit in bytes
 */
export function getJsonSizeLimit() {
  // Allow override via environment variable
  const envLimit = process.env.PUSHSCRIPT_JSON_SIZE_LIMIT;
  if (envLimit && !isNaN(parseInt(envLimit))) {
    return parseInt(envLimit);
  }
  return DEFAULT_SIZE_LIMIT;
}

/**
 * Check if a file should be ignored based on size or patterns
 * @param {string} filePath Path to the file
 * @returns {boolean} True if file exceeds size limit or matches ignore patterns
 */
function exceedsJsonSizeLimit(filePath) {
  if (!filePath.toLowerCase().endsWith('.json')) {
    return false;
  }

  // Always ignore files matching specific patterns
  const fileName = path.basename(filePath);
  if (ALWAYS_IGNORE_PATTERNS.some(pattern => fileName.includes(pattern))) {
    logInfo(`File ${fileName} matches debug pattern and will be ignored`);
    return true;
  }

  try {
    const stats = fs.statSync(filePath);
    const sizeLimit = getJsonSizeLimit();
    return stats.size > sizeLimit;
  } catch (error) {
    // If we can't check the file, assume it's fine
    return false;
  }
}

/**
 * Get list of staged JSON files that exceed size limit
 * @returns {Array} List of large JSON files
 */
export function checkLargeJsonFiles() {
  try {
    // Get all staged files
    const stagedFiles = execSync('git diff --cached --name-only')
      .toString()
      .trim()
      .split('\n')
      .filter(file => file);

    // Filter for JSON files that exceed size limit
    const largeJsonFiles = stagedFiles
      .filter(file => file.toLowerCase().endsWith('.json'))
      .filter(file => {
        try {
          return exceedsJsonSizeLimit(file);
        } catch (error) {
          return false;
        }
      });

    return largeJsonFiles;
  } catch (error) {
    logWarning(`Error checking for large JSON files: ${error.message}`);
    return [];
  }
}

/**
 * Add files to .gitignore
 * @param {Array} files List of files to add to .gitignore
 */
export function addToGitignore(files) {
  if (!files || files.length === 0) {
    return;
  }

  try {
    const gitignorePath = '.gitignore';
    let gitignoreContent = '';
    
    // Read existing .gitignore if it exists
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    // Prepare entries to add
    const entries = files.map(file => {
      // Use relative path and escape special characters
      return file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    });

    // Check if entries already exist in .gitignore
    const newEntries = entries.filter(entry => {
      const regex = new RegExp(`^${entry}$`, 'm');
      return !regex.test(gitignoreContent);
    });

    if (newEntries.length === 0) {
      return;
    }

    // Add new entries to .gitignore
    const updatedContent = gitignoreContent.endsWith('\n') || gitignoreContent === '' 
      ? gitignoreContent + newEntries.join('\n') + '\n'
      : gitignoreContent + '\n' + newEntries.join('\n') + '\n';

    fs.writeFileSync(gitignorePath, updatedContent);
    logInfo(`Added ${newEntries.length} large JSON files to .gitignore`);

    // Unstage the files
    if (newEntries.length > 0) {
      execSync(`git reset -- ${files.join(' ')}`);
    }
  } catch (error) {
    logWarning(`Error updating .gitignore: ${error.message}`);
  }
}

/**
 * Handle large JSON files in the commit process
 * @param {boolean} autoAddToGitignore Whether to automatically add large files to .gitignore
 * @returns {boolean} True if process should continue, false if it should abort
 */
export function handleLargeJsonFiles(autoAddToGitignore = false) {
  const largeFiles = checkLargeJsonFiles();
  
  if (largeFiles.length === 0) {
    return true;
  }

  const sizeLimit = getJsonSizeLimit();
  const sizeLimitMB = (sizeLimit / 1024 / 1024).toFixed(2);

  logWarning(`Found ${largeFiles.length} large JSON files exceeding the ${sizeLimitMB}MB limit:`);
  largeFiles.forEach(file => {
    const stats = fs.statSync(file);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    logWarning(`- ${file} (${sizeMB}MB)`);
  });

  if (autoAddToGitignore) {
    logInfo('Adding large JSON files to .gitignore and unstaging them...');
    addToGitignore(largeFiles);
    return true;
  } else {
    logError('Please remove these files from your commit:');
    logInfo('Options:');
    logInfo('1. Run: git reset -- <file> to unstage these files');
    logInfo('2. Add them to .gitignore');
    logInfo('3. Set PUSHSCRIPT_JSON_SIZE_LIMIT environment variable to increase the limit');
    return false;
  }
} 