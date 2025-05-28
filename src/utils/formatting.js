/**
 * Formatting utilities for PushScript
 * Handles console output formatting and coloring
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',
  
  // Regular colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Bright colors
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

/**
 * Format text with ANSI color codes
 * @param {string} text Text to format
 * @param {string} color Color to apply
 * @returns {string} Formatted text
 */
export function colorize(text, color) {
  const colorCode = colors[color] || '';
  return `${colorCode}${text}${colors.reset}`;
}

/**
 * Log an info message
 * @param {string} message Message to log
 */
export function logInfo(message) {
  console.log(colorize(message, 'blue'));
}

/**
 * Log a success message
 * @param {string} message Message to log
 */
export function logSuccess(message) {
  console.log(colorize(message, 'green'));
}

/**
 * Log a warning message
 * @param {string} message Message to log
 */
export function logWarning(message) {
  console.log(colorize(message, 'yellow'));
}

/**
 * Log an error message
 * @param {string} message Message to log
 */
export function logError(message) {
  console.error(colorize(message, 'red'));
}

/**
 * Log a title or section header
 * @param {string} title Title to log
 */
export function logTitle(title) {
  console.log(`\n${colorize(title, 'cyan')}`);
}

/**
 * Log a list of items
 * @param {Array<string>} items Items to log
 * @param {string} color Color to apply (optional)
 */
export function logList(items, color = 'white') {
  items.forEach(item => {
    console.log(`  • ${colorize(item, color)}`);
  });
}

/**
 * Display help information
 */
export function displayHelp() {
  console.log(`
${colorize('PushScript - AI-Powered Git Workflow Automation', 'cyan')}

${colorize('Usage:', 'green')}
  pushscript [message] [branch]
  pushscript commit [message]
  pushscript setup
  pushscript main
  pushscript dev

${colorize('Commands:', 'green')}
  setup            Add convenient npm scripts to your package.json
  commit           Commit only (no push) with AI-generated message

${colorize('Options:', 'green')}
  --help           Show this help message
  --main           Push to main branch
  --dev            Push to dev branch
  
${colorize('Environment Variables:', 'green')}
  PUSHSCRIPT_LLM_PROVIDER     LLM provider to use (groq, openai, anthropic, gemini)
  PUSHSCRIPT_LLM_API_KEY      API key for the selected provider
  PUSHSCRIPT_LLM_MODEL        Model to use with the selected provider

${colorize('Examples:', 'green')}
  pushscript setup             # Add npm scripts to package.json
  pushscript                   # Commit & push to main with AI-generated message
  pushscript commit            # Commit only with AI-generated message
  pushscript "fix bug"         # Commit with specified message & push to main
  pushscript main              # Commit & push to main branch 
  pushscript dev               # Commit & push to dev branch
  pushscript "new feature" dev # Commit with message & push to dev branch

${colorize('Add Shortcuts to package.json:', 'green')}
  Run "pushscript setup" or manually add these to your package.json:
  
  "scripts": {
    "push": "pushscript",
    "commit": "pushscript commit",
    "pushscript": "pushscript"
  }

${colorize('After adding shortcuts:', 'green')}
  npm run push                 # Same as pushscript
  npm run commit               # Same as pushscript commit
  npm run pushscript           # Same as pushscript
  `);
  process.exit(0);
} 