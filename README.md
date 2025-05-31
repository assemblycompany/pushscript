# PushScript™ – User Guide

Everything you need to install, configure, and get the most out of PushScript.

---

## 1 · What is PushScript?

A drop‑in CLI that turns every Git commit into a Conventional Commit, scans for dependency problems, and blocks accidental secrets – all powered by your favourite LLM (Gemini by default; OpenAI, Groq, Anthropic also supported).

---

## 2 · Quick start (30 s)

```bash
# 1. Install Node ≥ 18
# macOS
brew install node

# 2. Run PushScript once via npx
export GEMINI_API_KEY="AIza…"       # get a free Gemini key
npx pushscript@latest                # generates a commit + push helper
```

> First time on a freshly‑cloned repo? Skip `npm install` and just run:
> `PUSHSCRIPT_SELF_HEAL=true npx pushscript@latest`

---

## 2.1 · Global installation (optional)

For permanent installation across all projects:

```bash
# npm users
npm install -g pushscript@latest

# pnpm users  
pnpm add -g pushscript@latest

# Then use anywhere
pushscript --help
```

---

## 2.2 · Auto-setup for team projects

Add convenient npm scripts to any project automatically:

```bash
pushscript setup
```

This will interactively ask to add these shortcuts to your `package.json`:

```json
{
  "scripts": {
    "push": "pushscript",           // commit + push with AI message
    "commit": "pushscript commit",  // commit only with AI message  
    "pushscript": "pushscript"      // direct CLI access
  }
}
```

**Features:**
- 🤖 **CI-aware** - Skips prompts in automated environments
- 🛡️ **Safe** - Won't overwrite existing scripts
- ⚡ **One-time** - Remembers your choice with `.pushscript-setup` marker
- 👥 **Team-friendly** - Each team member can choose their preference

After setup, teammates can use: `npm run push`, `npm run commit`, etc.

---

## 3 · Project‑level integration

```json
// package.json
"scripts": {
  "push":   "pushscript",          // commit + push
  "commit": "pushscript commit"     // commit only
}
```

Teammates can now run `npm run push`.
If your project uses **pnpm**, the equivalent commands are `pnpm push` and `pnpm commit`.

---

## 4 · Configuration

Create **.env.local** (or .env) in the repo root:

```bash
PUSHSCRIPT_LLM_PROVIDER=gemini  # default; see below for others
GEMINI_API_KEY=AIza...          # your key
GEMINI_PUSHSCRIPT_MODEL=gemini-2.0-flash  # optional

# Advanced
# PUSHSCRIPT_JSON_SIZE_LIMIT=256000
# PUSHSCRIPT_AUTO_GITIGNORE_JSON=true
# PUSHSCRIPT_SELF_HEAL=true
```

### 4.1 Other providers

| Provider env | API key env         | Default model             |
| ------------ | ------------------- | ------------------------- |
| `groq`       | `GROQ_API_KEY`      | `llama-3.3-70b-versatile` |
| `openai`     | `OPENAI_API_KEY`    | `gpt-4o`                  |
| `anthropic`  | `ANTHROPIC_API_KEY` | `claude-3.7-sonnet`       |

Just flip `PUSHSCRIPT_LLM_PROVIDER` and add the key—PushScript picks the model automatically.

### 4.2 · Configuration files (advanced)

PushScript supports custom configuration files to override defaults. Create one of these files in your project root:

**Supported formats (priority order):**
- `.pushscript.json`
- `.pushscript.yml` 
- `.pushscript.yaml`
- `package.json` (in `pushscript` field)

**Example `.pushscript.json`:**
```json
{
  "commit_style": "As a fintech expert, create concise commit messages focusing on business impact and technical precision.",
  "patterns": [
    {
      "path": "api/**",
      "scope": "api",
      "type_hint": "feat"
    },
    {
      "path": "frontend/**", 
      "scope": "ui",
      "type_hint": "feat"
    }
  ],
  "validation": {
    "max_length": 72,
    "require_conventional": true,
    "allowed_types": ["feat", "fix", "docs", "refactor", "perf", "test", "chore", "hotfix"]
  }
}
```

**Example `package.json` field:**
```json
{
  "name": "my-app",
  "pushscript": {
    "commit_style": "Custom AI prompt...",
    "validation": {
      "max_length": 100
    }
  }
}
```

**Features:**
- 🔍 **Hierarchical search** - Searches up directory tree to find config
- 🧩 **Smart merging** - Partial configs merge with sensible defaults  
- 🎯 **Pattern-based** - Different rules for different file paths
- ⚡ **Hot reload** - Changes take effect immediately

---

## 5 · CLI reference

Run `pushscript --help` or `npx pushscript --help` to see all flags.

| Use‑case                        | Command                       |
| ------------------------------- | ----------------------------- |
| Generate & push with AI message | `pushscript`                  |
| Custom message, same branch     | `pushscript "fix: edge case"` |
| Commit only                     | `pushscript commit`           |
| Push to main                    | `pushscript --main`           |
| Push to a branch name           | `pushscript "feat: ui" dev`   |
| **Add npm scripts to project**  | `pushscript setup`            |
| Dry‑run (no network)            | `pushscript --dry`            |

Environment variables summary:

| Variable                         | Meaning                                   |
| -------------------------------- | ----------------------------------------- |
| `PUSHSCRIPT_LLM_PROVIDER`        | gemini (default), openai, groq, anthropic |
| `PUSHSCRIPT_LLM_MODEL`           | Model to use (required for most providers) |
| `PUSHSCRIPT_JSON_SIZE_LIMIT`     | Max bytes before JSON blocked             |
| `PUSHSCRIPT_AUTO_GITIGNORE_JSON` | `true` auto‑ignores large JSON            |
| `PUSHSCRIPT_SELF_HEAL`           | `true` installs missing deps on first run |

---

## 6 · Advanced features

<details>
<summary>JSON file exclusion</summary>
• Flags any staged `*.json` larger than limit (default 250 kB).  
• Pattern‑based ignore for filenames containing `debug`.  
• Auto‑adds to `.gitignore` when `PUSHSCRIPT_AUTO_GITIGNORE_JSON=true`.
</details>

<details>
<summary>Self‑healing mode</summary>
If you skip `npm install`, set `PUSHSCRIPT_SELF_HEAL=true`. The wrapper will install `dotenv`, `node-fetch`, and optional AI SDKs using pnpm → npm → yarn fallback.
</details>

---

## 7 · Troubleshooting

| Symptom                            | Fix                                                                   |
| ---------------------------------- | --------------------------------------------------------------------- |
| **`MODEL_NOT_FOUND`**              | Run `node src/utils/check-models.js` to list models for your API key. |
| **Missing module error**           | `npm install` or `PUSHSCRIPT_SELF_HEAL=true`.                         |
| **`Cannot find module auto-package.js`** | Update: `npm update -g pushscript` / `pnpm update -g pushscript` OR reinstall: `npm install -g pushscript@latest` / `pnpm add -g pushscript@latest` |
| **Network timeout**                | Check VPN/firewall; PushScript needs outbound HTTPS.                  |

---

## 8 · Roadmap

* **v0.2** – Enhanced JS/TS CLI with bug fixes *(current)*
* **v0.3** – Python dependency scan
* **v0.4** – GitHub App with org dashboard
* **v0.5** – VS Code extension
  Star ⭐ the repo to follow releases.

---

## 9 · Contributing

Good first issues are tagged **good first issue**. Follow Conventional Commits (`feat:`, `fix:`…) and keep CI green. Full details in [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 10 · License & trademark

MIT License © 2025 PushScript Team. PushScript™ and the logo are trademarks; forks must supply their own branding.