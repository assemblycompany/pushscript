/**
 * Security-related functions for PushScript
 * Handles sensitive file detection and vulnerability scanning
 */

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';
import { handleLargeJsonFiles } from './json-size-limiter.js';

/**
 * Checks for sensitive files in staged changes
 * @returns {Array} List of detected sensitive files, empty if none found
 */
export function checkSensitiveFiles() {
  // List of sensitive files and patterns to check
  const sensitivePatterns = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    '.env.test',
    'credentials.json',
    'secrets.json',
    'id_rsa',
    'id_dsa',
    'key.pem',
    'cert.key',
    'firebase-adminsdk'
  ];
  
  // List of files that are exceptions (safe to commit)
  const exceptions = [
    '.env.local.example',
    '.env.example',
    '.env.sample',
    '.env.template'
  ];

  // Get the git status
  const status = execSync('git status --porcelain').toString();
  const stagedFiles = status
    .split('\n')
    .filter(line => line.length > 0)
    .map(line => line.slice(3));

  // Check each staged file against sensitive patterns, but exclude exceptions
  const sensitiveFiles = stagedFiles.filter(file => {
    // First check if the file is in the exceptions list
    if (exceptions.some(exception => file.endsWith(exception))) {
      return false;
    }
    // Otherwise check if it matches any sensitive pattern
    return sensitivePatterns.some(pattern => file.includes(pattern));
  });

  if (sensitiveFiles.length > 0) {
    console.error('\x1b[31mError: Attempting to commit sensitive files:\x1b[0m');
    sensitiveFiles.forEach(file => console.error(`- ${file}`));
    console.error('\nPlease remove these files from git:');
    console.error('1. Add them to .gitignore');
    console.error('2. Run: git rm --cached <file>');
    process.exit(1);
  }
  
  return sensitiveFiles;
}

/**
 * Runs all security checks before commit
 * @param {Object} options Options for security checks
 * @param {boolean} options.autoGitignore Whether to auto-add large JSON files to gitignore
 * @returns {boolean} True if all checks pass, false otherwise
 */
export function runSecurityChecks(options = {}) {
  // Check for sensitive files
  checkSensitiveFiles();
  
  // Check for large JSON files
  const jsonCheckResult = handleLargeJsonFiles(options.autoGitignore);
  if (!jsonCheckResult) {
    return false;
  }
  
  return true;
}

/**
 * Basic check for known vulnerabilities in dependencies using npm audit
 * @returns {Object|null} Vulnerability information or null if no vulnerabilities found
 */
export async function checkDependencyVulnerabilities() {
  try {
    console.log('\x1b[34mScanning for dependency vulnerabilities...\x1b[0m');
    
    // Run npm audit and capture the output
    const auditResult = execSync('npm audit --json 2>/dev/null || true').toString();
    
    // Parse the audit result JSON
    let vulnerabilities = [];
    try {
      const auditData = JSON.parse(auditResult);
      
      // If there are vulnerabilities, extract the high and critical ones
      if (auditData.vulnerabilities) {
        const highSeverity = auditData.vulnerabilities.high || 0;
        const criticalSeverity = auditData.vulnerabilities.critical || 0;
        
        // Get detailed vulnerability information
        if (highSeverity > 0 || criticalSeverity > 0) {
          // Extract the most severe vulnerabilities
          const vulnerabilityEntries = Object.entries(auditData.advisories || {});
          
          vulnerabilities = vulnerabilityEntries
            .filter(([_, advisory]) => advisory.severity === 'high' || advisory.severity === 'critical')
            .map(([_, advisory]) => ({
              package: advisory.module_name,
              severity: advisory.severity,
              title: advisory.title,
              url: advisory.url || null
            }))
            .slice(0, 5); // Limit to 5 vulnerabilities to avoid overwhelming output
        }
      }
    } catch (e) {
      // If we can't parse the JSON, just continue
    }
    
    if (vulnerabilities.length > 0) {
      return {
        count: vulnerabilities.length,
        details: vulnerabilities
      };
    }
    
    return null;
  } catch (error) {
    // Suppress errors from this function since it's not critical
    console.log('\x1b[33mError checking for vulnerabilities: ' + error.message + '\x1b[0m');
    return null;
  }
}

/**
 * Creates a readline interface for user prompting
 * @param {string} question The question to ask the user
 * @returns {Promise<boolean>} True if the user confirms, false otherwise
 */
export async function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`\x1b[33m${question} (y/N): \x1b[0m`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
} 