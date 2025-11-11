/**
 * Dependency management functions for PushScript
 * Detects conflicts and issues in package dependencies
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logWarning, logInfo, colorize } from '../utils/formatting.js';
import fetch from 'node-fetch';
import { getProviderConfig } from '../providers.js';

/**
 * Analyzes dependency conflicts using LLM to generate intelligent advice
 * @param {Array} conflicts Array of conflict messages
 * @param {string} conflictType Type of conflict detected
 * @returns {Promise<Object|null>} Object with analysis or null if analysis failed
 */
export async function analyzeDependencyConflictsWithLLM(conflicts, conflictType) {
  const { name, config, apiKey, model } = getProviderConfig();
  
  if (!apiKey) {
    return null; // No API key, can't use LLM
  }
  
  try {
    logInfo(`Analyzing dependency conflicts using ${name}...`);
    
    // Prepare a sample of conflicts (to avoid token limits)
    const conflictSample = conflicts.length > 5 ? 
      conflicts.slice(0, 5).concat([`...and ${conflicts.length - 5} more similar issues`]) : 
      conflicts;
    
    // Create a prompt for the LLM
    const prompt = `You are an expert dependency manager for JavaScript/Node.js applications.
Please analyze these dependency conflicts and provide specific advice on how to fix them.

Conflict type: ${conflictType}

Conflict messages:
${conflictSample.join('\n')}

Provide a concise explanation of what's causing these conflicts and a step-by-step resolution strategy.`;

    // For Gemini, use structured JSON output via responseSchema
    if (name === 'gemini') {
      // Use the model from config, defaulting to gemini-2.0-flash if not specified
      const geminiModel = model || config.defaultModel || 'gemini-2.0-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent`;
      
      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0,
          topP: 0.95,
          topK: 40,
          // Use responseSchema to force JSON output
          responseSchema: {
            type: "object",
            properties: {
              explanation: {
                type: "string",
                description: "A concise explanation of what's causing these conflicts (1-2 sentences)"
              },
              strategy: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Step-by-step resolution strategy (max 3 steps)",
                maxItems: 3
              }
            },
            required: ["explanation", "strategy"]
          },
          responseMimeType: "application/json"
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: config.headerTemplate(apiKey),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`${name} API error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      
      // Parse JSON response directly from Gemini
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const jsonText = data.candidates[0].content.parts[0].text;
        try {
          const parsed = JSON.parse(jsonText);
          return {
            explanation: parsed.explanation || 'Dependency conflicts detected that need resolution.',
            strategy: Array.isArray(parsed.strategy) && parsed.strategy.length > 0 
              ? parsed.strategy 
              : ['Run npm install to resolve dependency conflicts']
          };
        } catch (parseError) {
          logWarning(`Failed to parse JSON response: ${parseError.message}`);
          // Fall through to text parsing
        }
      }
    }
    
    // Fallback for non-Gemini providers or if JSON parsing fails
    const response = await fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        ...config.headerTemplate(apiKey)
      },
      body: JSON.stringify(config.requestBuilder(prompt, model, 250))
    });

    if (!response.ok) {
      throw new Error(`${name} API error: ${response.statusText} (${response.status})`);
    }

    const data = await response.json();
    const analysis = config.responseHandler(data);
    
    // Parse text response as fallback
    let explanation = '';
    let strategy = [];
    
    // Try to extract explanation and strategy from text
    const explanationMatch = analysis.match(/EXPLANATION:\s*(.+?)(?:\n|RESOLUTION|$)/is);
    if (explanationMatch) {
      explanation = explanationMatch[1].trim();
    }
    
    const strategyMatch = analysis.match(/RESOLUTION STRATEGY:\s*([\s\S]+?)(?:\n\n|\n[A-Z]+:|$)/i);
    if (strategyMatch) {
      const strategyText = strategyMatch[1];
      const strategyItems = strategyText.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/g);
      if (strategyItems) {
        strategy = strategyItems.map(item => item.replace(/^\d+\.\s*/, '').trim()).filter(s => s);
      }
    }
    
    // Last resort parsing
    if (!explanation || strategy.length === 0) {
      let cleanedAnalysis = analysis.replace(/^(feat|fix|chore|docs|style|refactor|perf|test|hotfix)(\([^)]+\))?:\s*.+?\n/gi, '');
      cleanedAnalysis = cleanedAnalysis.replace(/```/g, '').replace(/`/g, '').trim();
      
      const strategyMarker = cleanedAnalysis.match(/(?:Resolution\s+Strategy|RESOLUTION\s+STRATEGY):\s*/i);
      if (strategyMarker) {
        const parts = cleanedAnalysis.split(/(?:Resolution\s+Strategy|RESOLUTION\s+STRATEGY):\s*/i);
        explanation = parts[0].trim();
        const strategyText = parts[1] || '';
        const strategyItems = strategyText.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n\n|$)/g);
        if (strategyItems) {
          strategy = strategyItems.map(item => item.replace(/^\d+\.\s*/, '').trim()).filter(s => s);
        }
      } else {
        const sections = cleanedAnalysis.split(/\n(?=\d+\.\s*)/);
        explanation = sections[0]?.trim() || cleanedAnalysis.split('\n')[0]?.trim() || '';
        strategy = sections.slice(1).map(s => s.replace(/^\d+\.\s*/, '').trim()).filter(s => s);
      }
    }
    
    // Clean up explanation
    explanation = explanation.replace(/^(feat|fix|chore|docs|style|refactor|perf|test|hotfix)(\([^)]+\))?:\s*/i, '').trim();
    
    if (!explanation || explanation.length < 10) {
      const firstLine = analysis.split('\n')[0]?.trim() || '';
      explanation = firstLine.replace(/^(feat|fix|chore|docs|style|refactor|perf|test|hotfix)(\([^)]+\))?:\s*/i, '').trim();
    }
    
    return {
      explanation: explanation || 'Dependency conflicts detected that need resolution.',
      strategy: strategy.length > 0 ? strategy : ['Run npm install to resolve dependency conflicts']
    };
  } catch (error) {
    logWarning(`Error analyzing conflicts with LLM: ${error.message}`);
    return null;
  }
}

/**
 * Detects and reports dependency conflicts in package.json files
 * @param {Array} changedFiles Array of file paths that were changed
 * @returns {Object|null} Object with conflict information or null if no conflicts
 */
export async function detectDependencyConflicts(changedFiles) {
  // Look for dependency files that have changed
  const dependencyFiles = changedFiles.filter(file => {
    return file.endsWith('package.json') || 
           file.endsWith('package-lock.json') ||
           file.endsWith('yarn.lock') ||
           file.endsWith('pnpm-lock.yaml');
  });
  
  if (dependencyFiles.length === 0) {
    return null;
  }
  
  logInfo('Checking for dependency conflicts...');
  
  // Determine package manager
  let packageManager = 'npm';
  if (fs.existsSync('pnpm-lock.yaml')) {
    packageManager = 'pnpm';
  } else if (fs.existsSync('yarn.lock')) {
    packageManager = 'yarn';
  }
  
  try {
    // Method 1: Check for npm/pnpm/yarn ls errors
    let lsCommand;
    if (packageManager === 'pnpm') {
      lsCommand = 'pnpm ls --json 2>/dev/null || true';
    } else if (packageManager === 'yarn') {
      lsCommand = 'yarn list --json 2>/dev/null || true';
    } else {
      lsCommand = 'npm ls --json 2>/dev/null || true';
    }
    
    const lsOutput = execSync(lsCommand).toString();
    let lsData;
    
    try {
      lsData = JSON.parse(lsOutput);
      
      // Look for problems property - this contains dependency errors
      if (lsData.problems && lsData.problems.length > 0) {
        return {
          type: 'npm_dependency_conflict',
          problems: lsData.problems,
          file: dependencyFiles[0]
        };
      }
      
      // Look for invalid dependencies recursively through the tree
      const findInvalidDeps = (obj) => {
        if (!obj || typeof obj !== 'object') return [];
        
        let results = [];
        
        if (obj.invalid && obj.invalid === true) {
          results.push(obj.name + '@' + obj.version);
        }
        
        if (obj.problems) {
          results = results.concat(obj.problems);
        }
        
        if (obj.dependencies) {
          Object.keys(obj.dependencies).forEach(depName => {
            results = results.concat(findInvalidDeps(obj.dependencies[depName]));
          });
        }
        
        return results;
      };
      
      const invalidDeps = findInvalidDeps(lsData);
      if (invalidDeps.length > 0) {
        return {
          type: 'invalid_dependencies',
          problems: invalidDeps,
          file: dependencyFiles[0]
        };
      }
    } catch (e) {
      logWarning(`Warning: Could not parse ${packageManager} ls output: ${e.message}`);
      // Continue to next method if parsing fails
    }
    
    // Method 2: Check for peer dependency warnings using dry run
    // This is especially good at catching peer dependency conflicts
    let checkCommand;
    if (packageManager === 'pnpm') {
      checkCommand = 'pnpm install --dry-run --json 2>/dev/null || true';
    } else if (packageManager === 'yarn') {
      checkCommand = 'yarn install --dry-run --json 2>/dev/null || true';
    } else {
      checkCommand = 'npm install --dry-run --json 2>/dev/null || true';
    }
    
    try {
      const checkOutput = execSync(checkCommand).toString();
      let checkData;
      
      try {
        checkData = JSON.parse(checkOutput);
        
        if (checkData.warnings && checkData.warnings.length > 0) {
          const peerDepsWarnings = checkData.warnings.filter(w => 
            w.code === 'ERESOLVE' || 
            (typeof w === 'string' && (
              w.includes('peer dep missing') || 
              w.includes('conflict')
            )) ||
            (w.message && (
              w.message.includes('peer dep missing') || 
              w.message.includes('conflict')
            ))
          );
          
          if (peerDepsWarnings.length > 0) {
            return {
              type: 'peer_dependency_conflict',
              problems: peerDepsWarnings.map(w => typeof w === 'string' ? w : w.message || JSON.stringify(w)),
              file: dependencyFiles[0]
            };
          }
        }
      } catch (e) {
        // If we can't parse the JSON, try to extract errors from text
        const errorRegex = /(ERESOLVE|peer dep missing|conflict|invalid|required|unmet)/gi;
        const lines = checkOutput.split('\n');
        const errorLines = lines.filter(line => errorRegex.test(line));
        
        if (errorLines.length > 0) {
          return {
            type: 'dependency_warning',
            problems: errorLines,
            file: dependencyFiles[0]
          };
        }
      }
    } catch (error) {
      logWarning(`Warning: Error running ${packageManager} install --dry-run: ${error.message}`);
      // Continue to next method
    }
    
    // Method 3: Check for version conflicts within package.json files
    // This is especially good at catching inconsistencies across dependency types
    for (const file of dependencyFiles.filter(f => f.endsWith('package.json'))) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const packageData = JSON.parse(content);
        
        if (!packageData.dependencies && !packageData.devDependencies) continue;
        
        // Create a map to track package versions across all dependency types
        const versionMap = new Map();
        
        // Helper to add dependencies to the version map and detect conflicts
        const addToVersionMap = (deps, type) => {
          if (!deps) return;
          
          Object.entries(deps).forEach(([pkg, version]) => {
            // Remove version prefix characters to compare actual versions
            const cleanVersion = version.replace(/[\^~>=<]/g, '');
            
            if (!versionMap.has(pkg)) {
              versionMap.set(pkg, [{ type, version: cleanVersion }]);
            } else {
              const existingVersions = versionMap.get(pkg);
              const hasConflict = existingVersions.some(v => v.version !== cleanVersion);
              
              if (hasConflict) {
                existingVersions.push({ type, version: cleanVersion });
                versionMap.set(pkg, existingVersions);
              }
            }
          });
        };
        
        // Check all dependency types
        addToVersionMap(packageData.dependencies, 'dependencies');
        addToVersionMap(packageData.devDependencies, 'devDependencies');
        addToVersionMap(packageData.peerDependencies, 'peerDependencies');
        addToVersionMap(packageData.optionalDependencies, 'optionalDependencies');
        
        // Find packages with multiple versions
        const conflicts = [];
        
        versionMap.forEach((versions, pkg) => {
          if (versions.length > 1) {
            conflicts.push({
              package: pkg,
              versions: versions.map(v => `${v.type}: ${v.version}`).join(', ')
            });
          }
        });
        
        if (conflicts.length > 0) {
          return {
            type: 'version_conflict',
            problems: conflicts.map(c => `${c.package} has multiple versions: ${c.versions}`),
            file
          };
        }
      } catch (e) {
        logWarning(`Warning: Could not parse ${file}: ${e.message}`);
        continue;
      }
    }
    
    // Method 4: Check for duplication in node_modules (if it exists)
    // This can detect runtime duplications that might cause issues
    try {
      if (fs.existsSync('node_modules')) {
        const dupeCheckCommand = `${packageManager === 'pnpm' ? 'pnpm' : 'npm'} dedupe --dry-run 2>&1 || true`;
        const dupeOutput = execSync(dupeCheckCommand).toString();
        
        // Look for duplicates in the output
        if (dupeOutput.includes('duplicate') || dupeOutput.includes('deduped')) {
          const dupeRegex = /([a-zA-Z0-9@/-]+)@(\d+\.\d+\.\d+)/g;
          const matches = [...dupeOutput.matchAll(dupeRegex)];
          
          if (matches.length > 0) {
            const dupes = matches.map(m => `${m[1]}@${m[2]}`);
            return {
              type: 'duplicate_packages',
              problems: dupes.length > 0 ? dupes : ['Detected duplicate packages that could be deduped'],
              file: 'node_modules'
            };
          }
        }
      }
    } catch (error) {
      // Dedupe check is non-critical, so just log a warning and continue
      logWarning(`Warning: Error checking for duplicates: ${error.message}`);
    }
    
    // No conflicts found
    return null;
  } catch (error) {
    logWarning(`Error checking for dependency conflicts: ${error.message}`);
    return null;
  }
} 