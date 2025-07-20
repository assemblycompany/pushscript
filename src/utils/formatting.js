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

/**
 * Display a section header with clear formatting
 * @param {string} title Section title
 * @param {string} description Optional description
 */
export function displaySection(title, description = null) {
  console.log(`\n${colorize('─'.repeat(60), 'cyan')}`);
  console.log(`${colorize('📋', 'cyan')} ${colorize(title, 'cyan')}`);
  if (description) {
    console.log(`${colorize('   ', 'cyan')} ${colorize(description, 'dim')}`);
  }
  console.log(`${colorize('─'.repeat(60), 'cyan')}`);
}

/**
 * Display configuration information in a structured format
 * @param {Object} config Configuration object
 */
export function displayConfig(config) {
  displaySection('PushScript Configuration', 'Current settings and provider information');
  
  const configItems = [
    { label: 'Provider', value: config.provider, icon: '🤖' },
    { label: 'API Key', value: config.apiKey ? 'Present' : 'Missing', icon: '🔑' },
    { label: 'Model', value: config.model, icon: '🧠' }
  ];
  
  configItems.forEach(item => {
    const statusColor = item.label === 'API Key' && item.value === 'Present' ? 'green' : 
                       item.label === 'API Key' && item.value === 'Missing' ? 'yellow' : 'white';
    console.log(`  ${colorize(item.icon, 'cyan')} ${colorize(item.label + ':', 'white')} ${colorize(item.value, statusColor)}`);
  });
}

/**
 * Display a step in the process with clear formatting
 * @param {string} step Step description
 * @param {string} status Status (info, success, warning, error)
 * @param {string} details Optional additional details
 */
export function displayStep(step, status = 'info', details = null) {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  const colors = {
    info: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };
  
  const icon = icons[status];
  const color = colors[status];
  
  console.log(`  ${colorize(icon, color)} ${colorize(step, color)}`);
  if (details) {
    console.log(`    ${colorize('└─', 'dim')} ${colorize(details, 'dim')}`);
  }
}

/**
 * Display a summary box with clear formatting
 * @param {string} title Summary title
 * @param {Array} items Array of items to display
 * @param {string} type Type of summary (info, success, warning, error)
 */
export function displaySummary(title, items, type = 'info') {
  const colors = {
    info: 'cyan',
    success: 'green',
    warning: 'yellow',
    error: 'red'
  };
  
  const color = colors[type];
  
  console.log(`\n${colorize('┌─ ' + title + ' ─'.padEnd(58, '─') + '┐', color)}`);
  items.forEach(item => {
    console.log(`${colorize('│', color)} ${colorize(item, 'white')}${' '.repeat(56 - item.length)}${colorize('│', color)}`);
  });
  console.log(`${colorize('└─'.padEnd(58, '─') + '┘', color)}`);
}

/**
 * Display commit message in a structured format
 * @param {string} message Commit message
 * @param {string} type Type of message (ai, manual, simple)
 */
export function displayCommitMessage(message, type = 'ai') {
  const typeLabels = {
    ai: 'AI Generated',
    manual: 'Manual',
    simple: 'Simple'
  };
  
  const typeColors = {
    ai: 'green',
    manual: 'blue',
    simple: 'yellow'
  };
  
  displaySection('Commit Message', `${typeLabels[type]} commit message`);
  
  const lines = message.split('\n');
  lines.forEach((line, index) => {
    if (index === 0) {
      // First line (title) gets special formatting
      console.log(`  ${colorize('📝', typeColors[type])} ${colorize(line, 'white')}`);
    } else if (line.trim()) {
      // Body lines get indentation
      console.log(`  ${colorize('  ', 'dim')} ${colorize(line, 'dim')}`);
    }
  });
}

/**
 * Display file changes in a structured format
 * @param {Array} changes Array of change objects
 */
export function displayFileChanges(changes) {
  displaySection('File Changes', 'Modified, added, and deleted files');
  
  const categories = {
    modified: changes.filter(c => c.status === 'M'),
    added: changes.filter(c => c.status === 'A'),
    deleted: changes.filter(c => c.status === 'D')
  };
  
  if (categories.modified.length > 0) {
    console.log(`  ${colorize('📝', 'blue')} ${colorize('Modified Files:', 'blue')} ${colorize(categories.modified.length, 'white')}`);
    categories.modified.forEach(change => {
      console.log(`    ${colorize('└─', 'dim')} ${colorize(change.file, 'white')}`);
    });
  }
  
  if (categories.added.length > 0) {
    console.log(`  ${colorize('➕', 'green')} ${colorize('Added Files:', 'green')} ${colorize(categories.added.length, 'white')}`);
    categories.added.forEach(change => {
      console.log(`    ${colorize('└─', 'dim')} ${colorize(change.file, 'white')}`);
    });
  }
  
  if (categories.deleted.length > 0) {
    console.log(`  ${colorize('🗑️', 'red')} ${colorize('Deleted Files:', 'red')} ${colorize(categories.deleted.length, 'white')}`);
    categories.deleted.forEach(change => {
      console.log(`    ${colorize('└─', 'dim')} ${colorize(change.file, 'white')}`);
    });
  }
}

/**
 * Display final push summary in a structured format
 * @param {string} commitMessage Commit message
 * @param {string} branch Target branch
 * @param {Array} changes File changes
 */
export function displayPushSummary(commitMessage, branch, changes) {
  displaySection('Ready to Push', 'Summary of changes to be pushed');
  
  // Display commit message
  console.log(`  ${colorize('📝', 'cyan')} ${colorize('Commit Message:', 'cyan')}`);
  const messageLines = commitMessage.split('\n');
  messageLines.forEach((line, index) => {
    if (index === 0) {
      console.log(`    ${colorize('└─', 'dim')} ${colorize(line, 'white')}`);
    } else if (line.trim()) {
      console.log(`    ${colorize('  ', 'dim')} ${colorize(line, 'dim')}`);
    }
  });
  
  // Display file changes summary
  console.log(`\n  ${colorize('📁', 'cyan')} ${colorize('Files Changed:', 'cyan')}`);
  console.log(`    ${colorize('└─', 'dim')} ${colorize(`${changes.length} files modified`, 'white')}`);
  
  // Display target branch
  console.log(`\n  ${colorize('🌿', 'cyan')} ${colorize('Target Branch:', 'cyan')}`);
  console.log(`    ${colorize('└─', 'dim')} ${colorize(branch, 'white')}`);
} 