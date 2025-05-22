# PushScript

An enhanced Git workflow automation tool that simplifies commits and pushes with AI-powered commit message generation, dependency conflict detection, and security scanning.

## Features

- **Multi-Provider AI Commit Generation**: Supports multiple AI providers including Groq, OpenAI, Anthropic, and Gemini
- **Flexible Model Selection**: 
  - Uses provider's default model if no model specified (recommended)
  - Supports explicit model selection when needed
  - Works with just an API key for simplicity and future compatibility
- **AI-Powered Dependency Conflict Resolution**: 
  - Detects conflicts in package dependencies through multiple strategies
  - Uses AI to analyze complex dependency issues and provide tailored resolution advice
  - Performs recursive dependency tree validation
  - Identifies peer dependency conflicts via dry-run installation checks
  - Detects duplicate packages and version inconsistencies
- **Vulnerability Scanning**: Basic security scanning for known vulnerabilities in dependencies
- **Sensitive File Protection**: Prevents accidental commit of sensitive files like `.env`
- **Large JSON File Detection**: Prevents committing JSON test files exceeding 250KB (configurable)
- **Conventional Commits**: Ensures proper formatting following conventional commit standards
- **Interactive Confirmations**: User-friendly prompts for confirming actions
- **Color-Coded Output**: Improved readability with color-coded console messages

## Recommended Provider: Gemini

While PushScript supports multiple AI providers, **Gemini** is our recommended choice for the best balance of performance and cost:

- **Fast & Good Quality**: Gemini provides excellent commit message generation with minimal latency
- **Free Tier Available**: `gemini-2.0-flash` performs well and is free for most usage scenarios
- **Efficient Token Management**: Our built-in token optimization is tailored for Gemini's limits
- **Simple Setup**: Just needs an API key and works well with default configuration

To use Gemini, simply set `PUSHSCRIPT_LLM_PROVIDER=gemini` in your `.env.local` file.

## Installation

1. Make sure you have Node.js installed
2. Add these scripts to your `package.json`:

```json
"scripts": {
  "push": "node scripts/push-scripts.js",
  "commit": "node scripts/push-scripts.js commit",
  "pushscript": "node scripts/pushscript/pushscript.js"
}
```

## Configuration

Create a `.env.local` file (or `.env`) with your AI provider configuration:

```
# Provider to use - Gemini recommended for best balance of performance and cost
PUSHSCRIPT_LLM_PROVIDER=gemini

# API key for Gemini (our recommended provider)
GEMINI_API_KEY=AIza...your-key-here...

# Model selection for Gemini - gemini-2.0-flash is free and performs well
GEMINI_PUSHSCRIPT_MODEL=gemini-2.0-flash

# If you prefer a different provider, uncomment and configure:
# PUSHSCRIPT_LLM_PROVIDER=groq
# GROQ_API_KEY=your-key-here
# GROQ_PUSHSCRIPT_MODEL=llama-3.3-70b-versatile

# Or:
# PUSHSCRIPT_LLM_PROVIDER=openai
# OPENAI_API_KEY=your-key-here
# OPENAI_PUSHSCRIPT_MODEL=gpt-4o

# Or:
# PUSHSCRIPT_LLM_PROVIDER=anthropic
# ANTHROPIC_API_KEY=your-key-here
# ANTHROPIC_PUSHSCRIPT_MODEL=claude-3.7-sonnet

# JSON file size limit in bytes (default: 250KB)
# PUSHSCRIPT_JSON_SIZE_LIMIT=256000

# Automatically add large JSON files to .gitignore (default: false)
# PUSHSCRIPT_AUTO_GITIGNORE_JSON=true
```

## Provider Defaults and Requirements

| Provider | Default Model | Requirements | Notes |
|----------|---------------|-------------|-------|
| gemini | gemini-2.0-flash | Requires model name in URL path | **RECOMMENDED** - Fast, free for most usage, and excellent quality |
| groq | llama-3.3-70b-versatile | Requires `model` parameter in requests | Good performance but requires paid account |
| openai | gpt-4o | Requires `model` parameter in requests | Highest quality but highest cost |
| anthropic | claude-3.7-sonnet | Requires `model` parameter in requests | Good quality but higher cost |

**Note:** While most providers have an official default model, their APIs may still require explicitly setting the model parameter in the request. Our implementation handles this automatically by using the specified defaults when needed.

## JSON File Exclusions

PushScript helps prevent accidentally committing large JSON files which are often data dumps, debug outputs, or build artifacts.

### How It Works

1. **Size-Based Exclusion**:
   - By default, any JSON file larger than 250KB will be flagged
   - Size limit is configurable via `PUSHSCRIPT_JSON_SIZE_LIMIT` environment variable

2. **Pattern-Based Exclusion**:
   - Files with these patterns are automatically excluded regardless of size:
     - `debug-` in filename (e.g., `debug-output.json`)
     - `-debug-` in filename (e.g., `api-debug-response.json`)
     - `.debug.` in filename (e.g., `data.debug.json`)

3. **Pre-Commit Process**:
   - When committing, all staged JSON files are checked against these rules
   - Detected files are reported with their sizes

4. **Handling Options**:
   - **Manual**: By default, the commit is blocked and you're shown instructions to handle the files
   - **Automatic**: When `PUSHSCRIPT_AUTO_GITIGNORE_JSON=true`, these files are:
     - Automatically added to `.gitignore`
     - Unstaged from the current commit
     - Commit proceeds without the excluded files

5. **Git Pre-Commit Hook**:
   - PushScript installs a Git pre-commit hook for additional protection
   - The hook runs automatically before every commit, even when using standard Git commands
   - This ensures large JSON files are caught even when bypassing the PushScript CLI
   - Provides consistent protection across all workflows

### Configuration

```
# Set JSON size limit in bytes (default: 250KB)
PUSHSCRIPT_JSON_SIZE_LIMIT=256000

# Enable automatic gitignore management (default: false)
PUSHSCRIPT_AUTO_GITIGNORE_JSON=true

# Enable self-healing dependency installation (default: false)
# PUSHSCRIPT_SELF_HEAL=true
```

#### Self-Healing Mode

PushScript includes a self-healing mode that can automatically install missing dependencies:

- **Normal mode** (default): PushScript assumes dependencies are already installed via npm
- **Self-healing mode**: Automatically installs missing dependencies using available package managers

This is useful in scenarios where:
- You've cloned the repository directly from GitHub
- You're running PushScript without npm installation
- You're running in an environment with missing or broken dependencies

To enable self-healing mode, set:
```bash
export PUSHSCRIPT_SELF_HEAL=true
```

### Gemini Model Options

Gemini model availability changes frequently. Some current options include:
- `gemini-2.0-flash` (default, stable option with good performance)
- `gemini-2.0-flash-lite` (lightweight version)
- `gemini-2.0-flash-vision` (includes image processing capabilities)
- `gemini-2.5-pro-experimental-03-25` (experimental pro version)

If you encounter a "model not found" error, you can use the included utility script to list currently available models:

```bash
# Run the model listing utility
node scripts/list-gemini-models.js
```

This will show all available Gemini models and recommend the most appropriate one for your use case.