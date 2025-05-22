{
  "name": "pushscript",
  "version": "1.0.0",
  "description": "AI-powered Git workflow automation with conventional commits, vulnerability scanning, and multi-provider LLM support",
  "type": "module",
  "main": "./cli.js",
  "bin": {
    "pushscript": "./pushscript.js"
  },
  "files": [
    "cli.js",
    "scripts/",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "git",
    "cli",
    "conventional-commits",
    "ai",
    "openai",
    "anthropic",
    "gemini",
    "groq",
    "workflow",
    "automation",
    "commit-messages"
  ],
  "license": "MIT",
  "author": "Rust Toshi <hi@pushscript.dev>",
  "repository": {
    "type": "git",
    "url": "https://github.com/caterpillarC15/pushscript.git"
  },
  "homepage": "https://github.com/caterpillarC15/pushscript#readme",
  "bugs": {
    "url": "https://github.com/caterpillarC15/pushscript/issues"
  },
  "scripts": {
    "test": "echo \"No tests yet\" && exit 0",
    "lint": "echo \"No linting configured yet\"",
    "prepublishOnly": "npm run test"
  },
  "dependencies": {
    "dotenv": "^16.5.0",
    "node-fetch": "^3.3.2"
  },
  "optionalDependencies": {
    "@google/generative-ai": "^1.0.0",
    "@anthropic-ai/sdk": "^0.12.0",
    "openai": "^4.23.0",
    "groq-sdk": "^0.1.1"
  },
  "publishConfig": {
    "access": "public"
  }
}