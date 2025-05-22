# PushScript Setup Guide

This guide provides instructions on how to set up and use PushScript in your project.

## Installation

1. Make sure PushScript files are in your `scripts/pushscript/` directory
2. Add the required dependencies to your `package.json`:

```json
"dependencies": {
  "node-fetch": "^3.3.2",
  "dotenv": "^16.4.5"
}
```

3. Add the following scripts to your `package.json`:

```json
"scripts": {
  "push": "node scripts/pushscript/pushscript.js",
"commit": "node scripts/pushscript/pushscript.js commit",
"pushscript": "node scripts/pushscript/pushscript.js"
}
```

4. Make sure your `package.json` includes `"type": "module"` for ES module support:

```json
{
  "name": "your-project",
  "version": "1.0.0",
  "type": "module",
  ...
}
```

5. Install the dependencies:

```bash
pnpm install
```

6. Set up the Git pre-commit hook:

```bash
# Create the pre-commit hook file
mkdir -p .git/hooks
cat > .git/hooks/pre-commit << 'EOL'
#!/bin/sh
# Pre-commit hook to check for large JSON files and other security issues

# Get the project root directory
PROJECT_ROOT=$(git rev-parse --show-toplevel)

# Run the JSON size limiter check
echo "Running JSON size limiter check..."
node "$PROJECT_ROOT/scripts/pushscript/test-json-limiter.js"

# If the check fails, abort the commit
if [ $? -ne 0 ]; then
  echo "JSON size limiter check failed. Aborting commit."
  exit 1
fi

# Continue with the commit
exit 0
EOL

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "Git pre-commit hook installed successfully"
```

This hook provides an additional layer of protection by running the JSON size limiter check on every commit, even when using standard Git commands instead of PushScript CLI.

## Configuration

1. Create a `.env.local` or `.env`  file in your project root (if it doesn't already exist):

```
# Provider to use (groq, openai, anthropic, gemini)
PUSHSCRIPT_LLM_PROVIDER=groq

# API key for your preferred provider
GROQ_API_KEY=your-key-here
# OPENAI_API_KEY=your-key-here
# ANTHROPIC_API_KEY=your-key-here
# GEMINI_API_KEY=your-key-here

# Optional: Model selection
# GROQ_PUSHSCRIPT_MODEL=llama-3.3-70b-versatile
# OPENAI_PUSHSCRIPT_MODEL=gpt-4o
# ANTHROPIC_PUSHSCRIPT_MODEL=claude-3.7-sonnet
# GEMINI_PUSHSCRIPT_MODEL=gemini-2.0-pro
```

2. Make sure `.env*` files are in your `.gitignore`:

```
# env files
.env*
```

## Usage

Use the following shortcuts to interact with PushScript:

- `pnpm push` - Commit changes with an AI-generated message and push to the remote repository
- `pnpm commit` - Just commit changes with an AI-generated message (no push)
- `pnpm pushscript` - Access PushScript's general CLI

### Command Options

- Specify a commit message: `pnpm push "your commit message"`
- Specify a branch: `pnpm push "commit message" branch-name`
- Push to main branch: `pnpm push --main` or `pnpm push main`
- Push to dev branch: `pnpm push --dev` or `pnpm push dev`

## Troubleshooting

If you encounter errors:

1. Verify that your `.env.local` file is properly configured
2. Check that you've installed all dependencies: `pnpm install`
3. Make sure `"type": "module"` is present in your `package.json`
4. Check that your API key is valid and has sufficient credits

For more detailed information, refer to the README.md in the pushscript directory.