/**
 * PushScript Configuration Loader
 * Loads optional .pushscript config files and merges with defaults
 * Supports multiple formats: JSON, YAML, and package.json field
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Default configuration that matches current hardcoded behavior
 */
const DEFAULT_CONFIG = {
  commit_style: `As a senior developer, create a concise git commit message for these changes.
Focus on the key changes and their purpose. Keep it brief but informative.

Follow conventional commits format:
type(scope): concise summary

Where type is one of: feat, fix, docs, style, refactor, perf, test, chore
Keep the first line under 80 characters.`,

  patterns: [
    {
      path: "components/**",
      scope: "ui",
      type_hint: "feat"
    },
    {
      path: "features/**", 
      scope: "feature",
      type_hint: "feat"
    }
  ],

  validation: {
    max_length: 80,
    require_conventional: true,
    allowed_types: ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore"]
  }
};

/**
 * Finds and loads .pushscript config file in project hierarchy
 * Priority order: .pushscript.json > .pushscript.yml > .pushscript.yaml > package.json
 * @returns {Object|null} Parsed config object or null if not found
 */
function loadConfigFile() {
  let currentDir = process.cwd();
  
  // Search up the directory tree (max 10 levels for safety)
  for (let i = 0; i < 10; i++) {
    // Try standalone config files first (in priority order)
    const configFiles = [
      { path: path.join(currentDir, '.pushscript.json'), type: 'json' },
      { path: path.join(currentDir, '.pushscript.yml'), type: 'yaml' },
      { path: path.join(currentDir, '.pushscript.yaml'), type: 'yaml' }
    ];

    for (const { path: configPath, type } of configFiles) {
      if (fs.existsSync(configPath)) {
        try {
          const content = fs.readFileSync(configPath, 'utf8');
          const config = type === 'json' ? JSON.parse(content) : yaml.load(content);
          
          if (process.env.PUSHSCRIPT_DEBUG) {
            console.log(`Loaded custom config from: ${configPath}`);
          }
          
          return config;
        } catch (error) {
          console.warn(`Warning: Failed to parse ${configPath}: ${error.message}`);
          // Continue to next config file
        }
      }
    }

    // Try package.json pushscript field
    const packagePath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const packageContent = fs.readFileSync(packagePath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        if (packageJson.pushscript) {
          if (process.env.PUSHSCRIPT_DEBUG) {
            console.log(`Loaded custom config from: ${packagePath} (pushscript field)`);
          }
          return packageJson.pushscript;
        }
      } catch (error) {
        console.warn(`Warning: Failed to parse ${packagePath}: ${error.message}`);
      }
    }
    
    // Move up one directory
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break; // Reached filesystem root
    currentDir = parentDir;
  }
  
  return null;
}

/**
 * Deep merges user config with defaults
 * @param {Object} userConfig User configuration
 * @returns {Object} Merged configuration
 */
function mergeConfig(userConfig) {
  const merged = { ...DEFAULT_CONFIG };
  
  // Override commit style if provided
  if (userConfig.commit_style) {
    merged.commit_style = userConfig.commit_style;
  }
  
  // Merge patterns (user patterns take precedence, defaults are fallback)
  if (userConfig.patterns && Array.isArray(userConfig.patterns)) {
    merged.patterns = [...userConfig.patterns, ...DEFAULT_CONFIG.patterns];
  }
  
  // Merge validation rules
  if (userConfig.validation) {
    merged.validation = { ...DEFAULT_CONFIG.validation, ...userConfig.validation };
  }
  
  // Add any additional user config properties
  Object.keys(userConfig).forEach(key => {
    if (!merged.hasOwnProperty(key)) {
      merged[key] = userConfig[key];
    }
  });
  
  return merged;
}

/**
 * Loads and returns the complete configuration
 * @returns {Object} Complete configuration (defaults + user overrides)
 */
export function loadPushscriptConfig() {
  const userConfig = loadConfigFile();
  
  if (!userConfig) {
    // No config file found, return defaults
    return DEFAULT_CONFIG;
  }
  
  try {
    return mergeConfig(userConfig);
  } catch (error) {
    console.warn(`Warning: Error merging config, using defaults: ${error.message}`);
    return DEFAULT_CONFIG;
  }
}

/**
 * Gets the effective commit style prompt
 * @returns {string} Commit style prompt to use
 */
export function getCommitStyle() {
  const config = loadPushscriptConfig();
  return config.commit_style;
}

/**
 * Gets pattern-based rules for file analysis
 * @returns {Array} Array of pattern rules
 */
export function getPatternRules() {
  const config = loadPushscriptConfig();
  return config.patterns || [];
}

/**
 * Gets validation rules
 * @returns {Object} Validation configuration
 */
export function getValidationRules() {
  const config = loadPushscriptConfig();
  return config.validation;
} 