betatable@Mac exposeapi % pnpm push --help

> exposeapi@0.1.0 push /Users/betatable/Desktop/beastmode/exposeapi
> node scripts/pushscript/cli.js --help

[2025-05-23T02:51:40.675Z] [PushScript-Config] Loading environment variables from: /Users/betatable/Desktop/beastmode/exposeapi/.env.local
PushScript configuration:
- Selected provider: gemini
- API key present: Yes
- Model: gemini-2.0-flash

PushScript - Git Push Helper

Usage:
  push [message] [branch]
  push main
  push dev

Options:
  --help           Show this help message
  --main           Push to main branch
  --dev            Push to dev branch
  
Environment Variables:
  PUSHSCRIPT_LLM_PROVIDER     LLM provider to use (groq, openai, anthropic, gemini)
  PUSHSCRIPT_LLM_API_KEY      API key for the selected provider
  PUSHSCRIPT_LLM_MODEL        Model to use with the selected provider

Examples:
  push                     # Commit & push to current branch with AI-generated message
  push "fix bug"           # Commit with specified message & push to current branch
  push main                # Commit & push to main branch 
  push dev                 # Commit & push to dev branch
  push "new feature" dev   # Commit with message & push to dev branch
  
betatable@Mac exposeapi % 