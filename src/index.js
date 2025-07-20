/**
 * PushScript - Enhanced Git workflow automation
 * Main entry point for the pushscript module
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from './utils/config.js';

// Import module components
import { getProviderConfig, buildApiRequest, retryApiRequest } from './providers.js';
import { checkSensitiveFiles, checkDependencyVulnerabilities, promptUser, runSecurityChecks, runSecretScan } from './security/security.js';
import { detectDependencyConflicts, analyzeDependencyConflictsWithLLM } from './dependency/dependency.js';
import { getGitStatus, categorizeChanges, generateSimpleCommitMessage, getCurrentBranch, confirmPush } from './git/git.js';
import { colorize, logInfo, logSuccess, logWarning, logError, logTitle, logList, displayHelp, displayConfig, displayStep, displaySection, displayCommitMessage, displayFileChanges, displayPushSummary } from './utils/formatting.js';
import { displaySecretScanResults } from './security/secret-scanner.js';
// Import new Gemini token manager
import { GeminiDiffOptimizer, createGeminiManager } from './token-utils.js';
import { handleLargeJsonFiles } from './security/json-size-limiter.js';
// Import config system
import { getCommitStyle, getValidationRules, loadPushscriptConfig } from './utils/pushscript-config.js';

// Setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import config settings and log them
displayConfig(config);

/**
 * Get AI configuration settings
 * @returns {Object} AI configuration
 */
function getAIConfig() {
  try {
    const config = loadPushscriptConfig();
    return config.ai || { max_tokens: 300, allow_multiline: true, prefer_detailed: true };
  } catch (error) {
    return { max_tokens: 300, allow_multiline: true, prefer_detailed: true };
  }
}

/**
 * Generate a commit message using an AI provider
 * @param {Array} changes Array of changes from getGitStatus()
 * @returns {string} Generated commit message
 */
async function generateAICommitMessage(changes) {
  const providerDetails = getProviderConfig();
  const { name, apiKey, model } = providerDetails;
  
  if (!apiKey) {
    logWarning('No API key found, falling back to standard message generation');
    return generateSimpleCommitMessage(changes);
  }

  try {
    const categories = categorizeChanges(changes);
    
    // Create a detailed description of changes
    const changesDescription = [
      `Modified files: ${categories.modified.join(', ')}`,
      `Added files: ${categories.added.join(', ')}`,
      `Deleted files: ${categories.deleted.join(', ')}`,
      `Components affected: ${Array.from(categories.components).join(', ')}`,
      `Features affected: ${Array.from(categories.features).join(', ')}`
    ].filter(line => !line.endsWith(': ')).join('\n');

    // Get git diff and optimize it for LLM processing
    const rawDiff = execSync('git diff --staged').toString();
    
    // Initialize the Gemini token manager for the provider being used
    const isGemini = name === 'gemini';
    const diffOptimizer = isGemini ? 
      new GeminiDiffOptimizer() : 
      new GeminiDiffOptimizer('free'); // For non-Gemini, use more conservative limits
    
    // Optimize the diff content
    const optimizedDiff = diffOptimizer.optimizeDiff(rawDiff);
    
    if (optimizedDiff.optimized) {
      displayStep(
        `Optimizing diff for ${name} API request`, 
        'info', 
        `tokens: ${optimizedDiff.estimatedTokens}/${optimizedDiff.limit}`
      );
      if (optimizedDiff.iterations > 0) {
        displayStep(
          `Applied optimization strategies`, 
          'info', 
          `${optimizedDiff.iterations} strategies applied to reduce size`
        );
      }
    }

    // Create the prompt with the optimized diff
    const baseCommitStyle = getCommitStyle();
    const prompt = `${baseCommitStyle}

Changes Overview:
${changesDescription}

${optimizedDiff.optimized ? 'Optimized Changes:' : 'Git Diff:'}
\`\`\`
${optimizedDiff.content}
\`\`\``;

    try {
      displayStep(`Generating commit message using ${name}${model ? '/' + model : ' (default model)'}`, 'info');
      
      // Use the gemini manager for request parameters if available
      const aiConfig = getAIConfig();
      let maxTokens = aiConfig.max_tokens || 300;
      
      if (isGemini) {
        const geminiManager = createGeminiManager();
        
        // Check rate limits first
        const rateCheck = geminiManager.checkRateLimit(optimizedDiff.estimatedTokens);
        if (!rateCheck.allowed) {
          const waitTimeSeconds = Math.ceil(rateCheck.waitTime / 1000);
          logWarning(`Rate limit would be exceeded (${rateCheck.reason}). Waiting ${waitTimeSeconds}s to avoid 503 errors...`);
          
          // Actually wait for rate limits if it's a short wait (less than 10 seconds)
          if (waitTimeSeconds <= 10) {
            await new Promise(resolve => setTimeout(resolve, rateCheck.waitTime));
            logInfo('Rate limit wait completed, proceeding with request...');
          } else {
            logError(`Wait time too long (${waitTimeSeconds}s), falling back to simple commit message`);
            return generateSimpleCommitMessage(changes);
          }
        }
        
        // Use configured max tokens, but ensure it's reasonable
        maxTokens = Math.min(maxTokens, 500); // Cap at 500 tokens for safety
      }
      
      // Use the buildApiRequest helper to create the request
      const { request, endpoint } = await buildApiRequest(providerDetails, prompt, maxTokens);
      
      // Send the API request with retry logic for 503 errors
      const { response, data } = await retryApiRequest(async () => {
        const apiResponse = await fetch(endpoint, request);
        
        // Handle errors with detailed information
        if (!apiResponse.ok) {
          let errorDetails = '';
          try {
            const errorJson = await apiResponse.json();
            errorDetails = JSON.stringify(errorJson, null, 2);
          } catch (e) {
            try {
              errorDetails = await apiResponse.text();
            } catch (e2) {
              errorDetails = `Status: ${apiResponse.status} ${apiResponse.statusText}`;
            }
          }
          
          // Only log full details on the final failure (not retries)
          if (!errorDetails.includes('503') && !errorDetails.includes('overloaded')) {
            console.error('Full request details:');
            console.error('URL:', endpoint);
            console.error('Headers:', JSON.stringify(request.headers, null, 2));
            console.error('Body:', typeof request.body === 'string' ? request.body.substring(0, 500) + '...' : request.body);
            console.error('\nFull error response:');
            console.error(errorDetails);
          }
          
          throw new Error(`${errorDetails}`);
        }

        const responseData = await apiResponse.json();
        return { response: apiResponse, data: responseData };
      });
      const config = providerDetails.config;
      const message = config.responseHandler(data);
      
      // Record a successful request if using Gemini
      if (isGemini) {
        const geminiManager = createGeminiManager();
        geminiManager.recordRequest();
      }
      
      // Validate the message format - allowing for more detailed messages
      const firstLine = message.split('\n')[0];
      const validationRules = getValidationRules();
      
      // Check conventional commit format if required
      if (validationRules.require_conventional) {
        const conventionalRegex = new RegExp(`^(${validationRules.allowed_types.join('|')})(\\([a-z-]+\\))?: .+`);
        if (!conventionalRegex.test(firstLine)) {
        logWarning('AI generated message first line does not match conventional format, falling back to standard generation');
        return generateSimpleCommitMessage(changes);
        }
      }

      // Check length limit
      if (firstLine.length > validationRules.max_length) {
        logWarning(`AI generated message first line exceeds ${validationRules.max_length} characters, falling back to standard generation`);
        return generateSimpleCommitMessage(changes);
      }

      displayCommitMessage(message, 'ai');
      
      return message;

    } catch (error) {
      logError(`${name} API Error: ${error.message}`);
      return generateSimpleCommitMessage(changes);
    }

  } catch (error) {
    logWarning(`Error generating AI commit message, falling back to standard generation: ${error.message}`);
    return generateSimpleCommitMessage(changes);
  }
}

/**
 * Creates a Git commit with the specified message
 * @param {string} message Commit message (optional, will be generated if not provided)
 * @returns {string|null} The commit message used, or null if commit failed
 */
export async function commit(message) {
  try {
    // Run all security checks with config options
    const securityChecksPassed = runSecurityChecks({
      autoGitignore: config.autoGitignoreJson
    });
    
    if (!securityChecksPassed) {
      return null;
    }

    // Check for unstaged changes
    const initialStatus = execSync('git status --porcelain').toString().trim();
    if (!initialStatus) {
      logWarning('No changes to commit. Working tree clean.');
      return;
    }

    // Get list of changed files before staging
    const changedFiles = initialStatus.split('\n').map(line => line.slice(3));

    // Stage changes
    displayStep('Staging changes', 'info');
    execSync('git add .');

    // Check for large JSON files and handle them based on config
    const jsonCheckPassed = handleLargeJsonFiles(config.autoGitignoreJson);
    if (!jsonCheckPassed) {
      logError('Large JSON files detected. Please resolve before committing.');
      return null;
    }

    // Recheck sensitive files after staging
    checkSensitiveFiles();

    // Verify we have staged changes
    const changes = getGitStatus();
    if (changes.length === 0) {
      logWarning('No changes to commit after staging.');
      return;
    }
    
    // Check for dependency conflicts
    const conflictInfo = await detectDependencyConflicts(changedFiles);
    if (conflictInfo) {
      // Create a friendly name for the conflict type
      const conflictTypeNames = {
        'npm_dependency_conflict': 'NPM Dependency Conflict',
        'invalid_dependencies': 'Invalid Dependencies',
        'peer_dependency_conflict': 'Peer Dependency Conflict',
        'dependency_warning': 'Dependency Warning',
        'version_conflict': 'Version Conflict',
        'duplicate_packages': 'Duplicate Packages'
      };
      
      const conflictName = conflictTypeNames[conflictInfo.type] || 'Dependency Issue';
      
      logError(`${conflictName} detected in ${conflictInfo.file}:`);
      
      // Group problems by type for better readability if there are many
      if (conflictInfo.problems.length > 10) {
        const groupedByType = {};
        conflictInfo.problems.forEach(problem => {
          const type = problem.includes('peer') ? 'peer' : 
                      problem.includes('version') ? 'version' :
                      problem.includes('missing') ? 'missing' :
                      problem.includes('invalid') ? 'invalid' : 'other';
          
          groupedByType[type] = groupedByType[type] || [];
          groupedByType[type].push(problem);
        });
        
        Object.entries(groupedByType).forEach(([type, problems]) => {
          console.log(colorize(`  ${type} issues (${problems.length}):`, 'yellow'));
          problems.slice(0, 3).forEach(problem => {
            console.log(`    ${colorize('•', 'yellow')} ${colorize(problem, 'yellow')}`);
          });
          if (problems.length > 3) {
            console.log(`    ${colorize('•', 'yellow')} ${colorize(`...and ${problems.length - 3} more ${type} issues`, 'yellow')}`);
          }
        });
      } else {
        // Show all problems if there aren't too many
        conflictInfo.problems.forEach(problem => {
          console.log(`  ${colorize('•', 'yellow')} ${colorize(problem, 'yellow')}`);
        });
      }
      
      // For complex conflicts, try to get AI-powered advice
      const llmAnalysis = await analyzeDependencyConflictsWithLLM(
        conflictInfo.problems, 
        conflictInfo.type
      );
      
      if (llmAnalysis) {
        logTitle('AI Analysis');
        logInfo('Root Cause:');
        console.log(`  ${colorize(llmAnalysis.explanation, 'cyan')}`);
        
        logInfo('Resolution Strategy:');
        llmAnalysis.strategy.forEach((step, index) => {
          console.log(`  ${colorize(`${index + 1}.`, 'cyan')} ${colorize(step, 'white')}`);
        });
      } else {
        // Fall back to basic advice if LLM analysis failed
        // Determine package manager for advice
        let pkgManager = 'npm';
        if (fs.existsSync('pnpm-lock.yaml')) {
          pkgManager = 'pnpm';
        } else if (fs.existsSync('yarn.lock')) {
          pkgManager = 'yarn';
        }
        
        switch (conflictInfo.type) {
          case 'npm_dependency_conflict':
            logWarning('These conflicts may cause unexpected behavior or build failures.');
            logWarning(`Consider running \`${pkgManager} install\` to resolve the conflicts.`);
            break;
          case 'invalid_dependencies':
            logWarning('Some dependencies could not be resolved at their specified versions.');
            logWarning('Check your package.json for incompatible version ranges.');
            break;
          case 'peer_dependency_conflict':
            logWarning('Peer dependency requirements could not be satisfied.');
            logWarning('You may need to install compatible versions of related packages.');
            break;
          case 'version_conflict':
            logWarning('Multiple versions of the same package are specified in different dependency sections.');
            logWarning('Align the versions to avoid potential runtime issues.');
            break;
          case 'duplicate_packages':
            logWarning('Duplicate packages were detected in node_modules.');
            logWarning(`You might want to run \`${pkgManager} ${pkgManager === 'yarn' ? 'deduplicate' : 'dedupe'}\` to optimize your dependencies.`);
            break;
          default:
            logWarning('Consider resolving these conflicts before committing.');
        }
      }
      
      logWarning('You can continue anyway, but your build might fail.');
      
      // Ask if the user wants to continue anyway
      const shouldContinue = await promptUser('Continue with commit despite conflicts?');
      
      if (!shouldContinue) {
        logWarning('Commit cancelled. Resolve conflicts and try again.');
        return;
      }
    }
    
    // Check for hardcoded secrets
    console.log('🔍 DEBUG: About to scan for secrets...');
    displayStep('Scanning for hardcoded secrets', 'info');
    const secretScanResult = await runSecretScan();
    console.log('🔍 DEBUG: Secret scan result:', secretScanResult);
    if (secretScanResult) {
      console.log('🚨 CRITICAL: High severity secrets detected!');
      console.log('   Please review and remove before committing.');
      
      // Ask if the user wants to continue anyway
      const shouldContinue = await promptUser('Continue with commit despite hardcoded secrets?');
      
      if (!shouldContinue) {
        logWarning('Commit cancelled. All files unstaged.');
        logInfo('Please remove secrets and try again.');
        // Unstage all files
        execSync('git reset -- .');
        return;
      }
    }
    
    // Check for vulnerabilities 
    displayStep('Scanning for dependency vulnerabilities', 'info');
    const vulnerabilities = await checkDependencyVulnerabilities();
    if (vulnerabilities) {
      displayStep(`Found ${vulnerabilities.count} high or critical severity vulnerabilities`, 'error');
      vulnerabilities.details.forEach(vuln => {
        console.log(`    ${colorize('└─', 'dim')} ${colorize(`${vuln.package}: ${vuln.title} (${vuln.severity})`, 'yellow')}`);
        if (vuln.url) {
          console.log(`      ${colorize('└─', 'dim')} ${colorize(`More info: ${vuln.url}`, 'dim')}`);
        }
      });
      logWarning('You can continue, but consider addressing these security issues soon.');
    }

    // Generate commit message
    const commitMessage = message || await generateAICommitMessage(changes);
    
    // Append vulnerability information to the commit message if found
    let finalCommitMessage = commitMessage;
    if (vulnerabilities && vulnerabilities.count > 0) {
      finalCommitMessage += `\n\n[WARNING] Contains ${vulnerabilities.count} security vulnerabilities`;
    }
    
    // Validate commit message
    if (!finalCommitMessage || finalCommitMessage.trim() === '' || finalCommitMessage.trim() === 'chore: ') {
      logError('Error: Invalid or empty commit message');
      return;
    }

    // Create commit - using -m multiple times to support multi-line messages
    displayStep('Creating commit', 'info');
    try {
      const messageLines = finalCommitMessage.split('\n');
      // Properly escape quotes and remove any problematic characters in commit messages for shell safety
      const messageArgs = messageLines.map(line => {
        const escapedLine = line
          .replace(/"/g, '\\"')           // Escape quotes
          .replace(/`/g, "'")             // Replace backticks with single quotes
          .replace(/\$/g, '\\$')          // Escape dollar signs
          .replace(/\\/g, '\\\\')         // Escape backslashes
          .replace(/[^\x20-\x7E]/g, '')   // Remove non-printable characters
          .trim();                        // Remove leading/trailing whitespace
        return `-m "${escapedLine}"`;
      }).join(' ');
      
      // Log the command being executed for debugging
      console.log('Executing git commit command:', `git commit ${messageArgs}`);
      
      execSync(`git commit ${messageArgs}`);
      displayStep('Successfully created commit', 'success');
      return finalCommitMessage;
    } catch (error) {
      if (error.stdout && error.stdout.toString().includes('nothing to commit')) {
        logWarning('Nothing to commit. Working tree clean.');
        return;
      }
      throw error;
    }
  } catch (error) {
    logError('Error:');
    console.error({
      message: error.message,
      stdout: error.stdout?.toString(),
      stderr: error.stderr?.toString()
    });
    process.exit(1);
  }
}

/**
 * Push changes to remote repository
 * @param {string} message Commit message
 * @param {string} branch Branch to push to
 */
export async function push(message, branch) {
  try {
    // Default to main branch if none specified
    if (!branch) {
      branch = 'main';
      displayStep(`No branch specified, defaulting to: ${branch}`, 'info');
    }

    const commitMessage = await commit(message);
    if (!commitMessage) return; // If commit failed or nothing to commit

    // Check if we have changes to push
    try {
      const branchStatus = execSync('git status -b --porcelain=v2').toString();
      if (branchStatus.includes('# branch.ab +0 -0')) {
        logWarning('Commit created but branch is already up to date with remote.');
        logWarning('No need to push.');
        return;
      }
    } catch (error) {
      logWarning('Unable to check branch status, will attempt to push...');
    }

    // Now that we know we have changes to push, ask for confirmation
    const shouldProceed = await confirmPush(commitMessage, branch);
    
    if (!shouldProceed) {
      logWarning('Push cancelled by user');
      logWarning('Note: Commit was already created locally');
      return;
    }

    // Push to remote
    displayStep(`Pushing to ${branch}`, 'info');
    try {
      execSync(`git push origin ${branch}`);
      displayStep('Successfully pushed to GitHub', 'success');
    } catch (error) {
      if (error.stderr && error.stderr.toString().includes('non-fast-forward')) {
        logError('Error: Remote has new changes. Please pull first.');
      } else {
        logError('Push failed:');
        if (error.stdout) logError('Output: ' + error.stdout.toString());
        if (error.stderr) logError('Error: ' + error.stderr.toString());
      }
      throw new Error('Failed to push to remote');
    }
  } catch (error) {
    logError('Error: ' + error.message);
    process.exit(1);
  }
} 