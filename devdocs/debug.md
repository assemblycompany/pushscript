# PushScript – Full Open‑Source Release (Apache‑2.0)

## 0. Purpose

Open‑source **everything that exists today** under Apache‑2.0, publish the CLI on the public npm registry, and lay the groundwork for richer cloud add‑ons later.

---

## 1. Licence & Repository

* **Licence:** `Apache-2.0` (add `LICENSE` file via GitHub template).
* **Trademark notice:** Add `TRADEMARKS.md` – brand name/logo remain proprietary; forks may not use them.
* **CONTRIBUTING.md:** simple PR rules, code‑style, DCO sign‑off.

---

## 2. Final `package.json` skeleton

```json
{
  "name": "pushscript",            
  "version": "0.1.0",              
  "description": "AI‑powered Git workflow helper – conventional commits, vuln scans.",
  "license": "Apache-2.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/pushscript.git"
  },
  "homepage": "https://github.com/your-org/pushscript#readme",
  "bugs": {
    "url": "https://github.com/your-org/pushscript/issues"
  },
  "keywords": ["git","cli","ai","conventional-commits"],
  "type": "module",
  "main": "./cli.js",
  "bin": {
    "pushscript": "./cli.js"
  },
  "files": [
    "cli.js",
    "src/",
    "README.md",
    "LICENSE"
  ],
  "engines": { "node": ">=18" },
  "scripts": {
    "test": "node test/run-all.js",
    "lint": "eslint .",
    "prepublishOnly": "npm run lint && npm test"
  },
  "dependencies": {
    "dotenv": "^16.5.0",
    "node-fetch": "^3.3.2"
  },
  "optionalDependencies": {
    "openai": "^4.23.0",
    "@anthropic-ai/sdk": "^0.12.0",
    "@google/generative-ai": "^1.0.0",
    "groq-sdk": "^0.1.1"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

---

## 3. README outline (update after publish)

1. **Shield badges** – npm version, downloads, licence.
2. **Zero‑install snippet**

   ```bash
   npx pushscript@latest
   ```
3. **Features** (bullets from current README).
4. **Quick Start** – 3‑step env‑var guide.
5. **Provider matrix** – table already written.
6. **Roadmap** – call‑out: *Python support & GitHub‑App ➡️ v0.2*
7. **Community plugins** section – guidelines + list.
8. **Contributing** link.

---

## 4. Publish sequence checklist

| Step                 | Command / Action                                |
| -------------------- | ----------------------------------------------- |
| Tag release          | `git tag v0.1.0 && git push --tags`             |
| npm login            | `npm login` (once)                              |
| Dry run              | `npm pack --dry-run` – confirm size & files     |
| Publish              | `npm publish --access public`                   |
| GitHub release       | Draft *v0.1.0* with changelog, link to npm      |
| Update README badges | Use shields.io for npm version & downloads      |
| Tweet / HN post      | Use viral thread template from previous roadmap |

---

## 5. Future premium path (placeholder)

* Cloud dashboard, multi‑provider retries, enterprise SBOM.
* Keep premium code private; CLI checks for `PUSHSCRIPT_API_KEY`.

---

### Done‑for‑now

Once this doc’s steps are complete, PushScript is fully open‑sourced and installable by anyone with a single command, setting the stage to iterate rapidly on community feedback.
