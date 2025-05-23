betatable@Mac pushscript-v01 % npm publish --dry-run

> pushscript@0.1.0 prepublishOnly
> npm run test


> pushscript@0.1.0 test
> node --test test/

Attempting to load .env.local...
.env.local file exists

Environment Variables:
PUSHSCRIPT_LLM_PROVIDER: gemini
GEMINI_API_KEY: EXISTS (starting with: AIzaSyDwbs...)
GEMINI_PUSHSCRIPT_MODEL: gemini-2.0-flash
PUSHSCRIPT_LLM_API_KEY: NOT SET

Provider-specific key lookup:
Looking for GEMINI_API_KEY: FOUND

Final API key resolution:
Resolved API key: SUCCESS
✔ /Users/betatable/Desktop/beastmode/pushscript-v01/test/env.test.js (41.437583ms)
[2025-05-23T04:06:19.935Z] [PushScript-Config] Looking for environment files in these locations (in order of priority):
[2025-05-23T04:06:19.937Z] [PushScript-Config] Loading environment variables from: /Users/betatable/Desktop/beastmode/pushscript-v01/.env.local
Testing JSON size limiter functionality
Current JSON size limit: 250KB
Auto-gitignore: Enabled
No large JSON files found in staged changes
✔ /Users/betatable/Desktop/beastmode/pushscript-v01/test/json-limiter.test.js (60.183167ms)
ℹ tests 2
ℹ suites 0
ℹ pass 2
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 64.295167
+ pushscript@0.1.0
betatable@Mac pushscript-v01 % 