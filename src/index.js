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
import { getProviderConfig, buildApiRequest } from './providers.js';
import { checkSensitiveFiles, checkDependencyVulnerabilities, promptUser, runSecurityChecks } from './security/security.js';
import { detectDependencyConflicts, analyzeDependencyConflictsWithLLM } from './dependency/dependency.js';
import { getGitStatus, categorizeChanges, generateSimpleCommitMessage, getCurrentBranch, confirmPush } from './git/git.js';
import { colorize, logInfo, logSuccess, logWarning, logError, logTitle, logList, displayHelp } from './utils/formatting.js';
// Import new Gemini token manager
import { GeminiDiffOptimizer, createGeminiManager } from './token-utils.js';
import { handleLargeJsonFiles } from './security/json-size-limiter.js';

// Setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import config settings and log them
console.log('PushScript configuration:');
console.log(`- Selected provider: ${config.provider}`);
console.log(`- API key present: ${config.apiKey ? 'Yes' : 'No'}`);
console.log(`- Model: ${config.model}`);

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
      logInfo(`Optimizing diff for ${name} API request (tokens: ${optimizedDiff.estimatedTokens}/${optimizedDiff.limit})`);
      if (optimizedDiff.iterations > 0) {
        logInfo(`Applied ${optimizedDiff.iterations} optimization strategies to reduce size`);
      }
    }

    // Create the prompt with the optimized diff
    const prompt = `As a senior developer, create a concise git commit message for these changes.
Focus on the key changes and their purpose. Keep it brief but informative.

Changes Overview:
${changesDescription}

${optimizedDiff.optimized ? 'Optimized Changes:' : 'Git Diff:'}
\`\`\`
${optimizedDiff.content}
\`\`\`

Follow conventional commits format:
type(scope): concise summary

Where type is one of: feat, fix, docs, style, refactor, perf, test, chore
Keep the first line under 80 characters.`;

    try {
      logInfo(`Generating commit message using ${name}${model ? '/' + model : ' (default model)'}...`);
      
      // Use the gemini manager for request parameters if available
      let maxTokens = 150;
      if (isGemini) {
        const geminiManager = createGeminiManager();
        
        // Check rate limits first
        const rateCheck = geminiManager.checkRateLimit(optimizedDiff.estimatedTokens);
        if (!rateCheck.allowed) {
          logWarning(`Rate limit would be exceeded (${rateCheck.reason}). Waiting ${Math.ceil(rateCheck.waitTime / 1000)}s would resolve this.`);
          // Continue anyway but log the warning
        }
        
        // Get optimal output tokens for the model
        maxTokens = 100; // Lower for gemini to reduce likelihood of issues
      }
      
      // Use the buildApiRequest helper to create the request
      const { request, endpoint } = await buildApiRequest(providerDetails, prompt, maxTokens);
      
      // Send the API request
      const response = await fetch(endpoint, request);
      
      // Handle errors with detailed information
      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorJson = await response.json();
          errorDetails = JSON.stringify(errorJson, null, 2);
        } catch (e) {
          try {
            errorDetails = await response.text();
          } catch (e2) {
            errorDetails = `Status: ${response.status} ${response.statusText}`;
          }
        }
        
        console.error('Full request details:');
        console.error('URL:', endpoint);
        console.error('Headers:', JSON.stringify(request.headers, null, 2));
        console.error('Body:', JSON.stringify(request.body, null, 2));
        console.error('\nFull error response:');
        console.error(errorDetails);
        
        throw new Error(`API request failed: ${errorDetails}`);
      }

      const data = await response.json();
      const config = providerDetails.config;
      const message = config.responseHandler(data);
      
      // Record a successful request if using Gemini
      if (isGemini) {
        const geminiManager = createGeminiManager();
        geminiManager.recordRequest();
      }
      
      // Validate the message format - allowing for more detailed messages
      const firstLine = message.split('\n')[0];
      if (!/^(feat|fix|docs|style|refactor|perf|test|chore)(\([a-z-]+\))?: .+/.test(firstLine)) {
        logWarning('AI generated message first line does not match conventional format, falling back to standard generation');
        return generateSimpleCommitMessage(changes);
      }

      if (firstLine.length > 80) {
        logWarning('AI generated message first line exceeds 80 characters, falling back to standard generation');
        return generateSimpleCommitMessage(changes);
      }

      logSuccess(`AI Generated Commit Message:`);
      message.split('\n').forEach(line => console.log(colorize(line, 'white')));
      
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
    logInfo('Staging changes...');
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
    
    // Check for vulnerabilities 
    const vulnerabilities = await checkDependencyVulnerabilities();
    if (vulnerabilities) {
      logError(`Found ${vulnerabilities.count} high or critical severity vulnerabilities:`);
      vulnerabilities.details.forEach(vuln => {
        console.log(`  ${colorize('•', 'yellow')} ${colorize(`${vuln.package}: ${vuln.title} (${vuln.severity})`, 'yellow')}`);
        if (vuln.url) {
          console.log(`    More info: ${vuln.url}`);
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
    logInfo('Creating commit...');
    try {
      const messageLines = finalCommitMessage.split('\n');
      const messageArgs = messageLines.map(line => `-m "${line}"`).join(' ');
      execSync(`git commit ${messageArgs}`);
      logSuccess('Successfully created commit!');
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
      logInfo(`No branch specified, defaulting to: ${branch}`);
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
    logInfo(`Pushing to ${branch}...`);
    try {
      execSync(`git push origin ${branch}`);
      logSuccess('Successfully pushed to GitHub!');
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