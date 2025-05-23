betatable@Mac pushscript-v01 % npm pushscript --help
Unknown command: "pushscript"


Did you mean one of these?
  npm run-script # Run arbitrary package scripts
  npm run pushscript # run the "pushscript" package script
  npm exec pushscript # run the "pushscript" command from either this or a remote npm package
To see a list of supported npm commands, run:
  npm help
betatable@Mac pushscript-v01 % pnpm push --help

> pushscript@0.1.0 push /Users/betatable/Desktop/beastmode/pushscript-v01
> node wrappers/pushscript.cjs --help

[2025-05-23T02:53:09.850Z] [PushScript-Config] Looking for environment files in these locations (in order of priority):
[2025-05-23T02:53:09.853Z] [PushScript-Config]   1. /Users/betatable/Desktop/beastmode/pushscript-v01/.env (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   2. /Users/betatable/Desktop/beastmode/pushscript-v01/.env.local (exists)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   3. /Users/betatable/Desktop/beastmode/pushscript-v01/.env.development (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   4. /Users/betatable/Desktop/beastmode/pushscript-v01/.env.production (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   5. /Users/betatable/Desktop/beastmode/pushscript-v01/.env.test (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   6. /Users/betatable/Desktop/beastmode/pushscript-v01/.env (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   7. /Users/betatable/Desktop/beastmode/pushscript-v01/.env.local (exists)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   8. /Users/betatable/Desktop/beastmode/pushscript-v01/.env.development (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   9. /Users/betatable/Desktop/beastmode/pushscript-v01/.env.production (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   10. /Users/betatable/Desktop/beastmode/pushscript-v01/.env.test (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   11. /Users/betatable/Desktop/beastmode/.env (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   12. /Users/betatable/Desktop/beastmode/.env.local (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   13. /Users/betatable/Desktop/beastmode/.env.development (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   14. /Users/betatable/Desktop/beastmode/.env.production (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   15. /Users/betatable/Desktop/beastmode/.env.test (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   16. /Users/betatable/Desktop/.env (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   17. /Users/betatable/Desktop/.env.local (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   18. /Users/betatable/Desktop/.env.development (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   19. /Users/betatable/Desktop/.env.production (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   20. /Users/betatable/Desktop/.env.test (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   21. /Users/betatable/.env (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   22. /Users/betatable/.env.local (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   23. /Users/betatable/.env.development (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   24. /Users/betatable/.env.production (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config]   25. /Users/betatable/.env.test (not found)
[2025-05-23T02:53:09.853Z] [PushScript-Config] Loading environment variables from: /Users/betatable/Desktop/beastmode/pushscript-v01/.env.local
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
  
betatable@Mac pushscript-v01 % 