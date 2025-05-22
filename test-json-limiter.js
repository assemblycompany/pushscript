#!/usr/bin/env node
/**
 * Test script for JSON size limiter functionality
 */

import { checkLargeJsonFiles, handleLargeJsonFiles } from './json-size-limiter.js';
import { logInfo, logSuccess, logWarning } from './formatting.js';
import config from './config.js';

async function main() {
  logInfo('Testing JSON size limiter functionality');
  logInfo(`Current JSON size limit: ${config.jsonSizeLimit / 1024}KB`);
  logInfo(`Auto-gitignore: ${config.autoGitignoreJson ? 'Enabled' : 'Disabled'}`);
  
  const largeFiles = checkLargeJsonFiles();
  
  if (largeFiles.length === 0) {
    logSuccess('No large JSON files found in staged changes');
  } else {
    logWarning(`Found ${largeFiles.length} large JSON files:`);
    largeFiles.forEach(file => logWarning(`- ${file}`));
    
    const result = handleLargeJsonFiles(config.autoGitignoreJson);
    if (result) {
      logSuccess('Large JSON files handled successfully');
    } else {
      logWarning('Failed to handle large JSON files');
    }
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
}); 