# PushScript™

> **Zero‑friction AI commits & guardrails for every Git push.**

[![npm](https://img.shields.io/npm/v/pushscript?logo=npm)](https://www.npmjs.com/package/pushscript)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![CI](https://github.com/your-org/pushscript/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/pushscript/actions)

---

### Try it in 5 seconds

```bash
npx pushscript@latest    # generates a Conventional Commit and pushes in one go
```

*(Requires Node ≥ 18 and an AI API key—see below.)*

*Demo video coming soon—stay tuned!*

---

## Why PushScript?

*Code moves businesses. Commit friction slows teams.* PushScript removes that friction with one command.

| Done for you                        | How it helps                                                           |
| ----------------------------------- | ---------------------------------------------------------------------- |
| **AI‑perfect commit messages**      | Multi‑provider support: **Gemini** (default), OpenAI, Anthropic, Groq. |
| **Dependency conflict & CVE scan**  | Stops version hell and vulnerable packages before they hit `main`.     |
| **Sensitive‑file guard**            | Blocks commits with `.env`, large JSON dumps, or debug assets.         |
| **Conventional Commit enforcement** | Semantic‑version hygiene for changelogs & releases.                    |

---

## 1 · Zero‑install set‑up

1. **Install Node ≥ 18** (macOS: `brew install node` • Windows: [Node installer](https://nodejs.org)).
2. **Grab an AI key.** We default to Google Gemini because it has a generous free tier.

   ```bash
   export GEMINI_API_KEY="AIza...."
   export PUSHSCRIPT_LLM_PROVIDER=gemini   # omit if you stick with Gemini
   ```
3. **Run PushScript.**

   ```bash
   npx pushscript       # or  npm i -g pushscript && pushscript
   ```

   You’ll see a coloured diff preview and a suggested Conventional Commit. Hit **Y** to push.

<details>
<summary>Using OpenAI / Groq / Claude?</summary>
Set:
```bash
export PUSHSCRIPT_LLM_PROVIDER=openai   # or groq / anthropic
export OPENAI_API_KEY="sk-..."
```
PushScript picks sensible default models (`gpt‑4o`, `llama‑3.3‑70b‑versatile`, `claude‑3.7‑sonnet`).
</details>

---

## 2 · Project‑level integration

Add a script to `package.json`:

```json
"scripts": {
  "push": "node scripts/push-scripts.js",
  "commit": "node scripts/push-scripts.js commit"
}
```

Now teammates can just run `npm run push`.

---

## 3 · Advanced options

| Flag                                  | When to use it                                  | Example                                    |
| ------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `PUSHSCRIPT_JSON_SIZE_LIMIT`          | Custom max JSON size (bytes).                   | `export PUSHSCRIPT_JSON_SIZE_LIMIT=512000` |
| `PUSHSCRIPT_AUTO_GITIGNORE_JSON=true` | Auto‑add large JSON to `.gitignore`.            | –                                          |
| `PUSHSCRIPT_SELF_HEAL=true`           | You cloned source but didn’t run `npm install`. | –                                          |

<details>
<summary>How JSON exclusion works (click)</summary>
* Files > size limit or with `debug` in the name are caught pre‑commit.  
* In auto‑mode they’re unstaged and appended to `.gitignore`; manual mode asks you what to do.
</details>

---

## 4 · Troubleshooting

| Symptom                         | Fix                                                                         |
| ------------------------------- | --------------------------------------------------------------------------- |
| **`EAI_AGAIN` / network error** | Check VPN / firewall; PushScript needs outbound HTTPS to your AI provider.  |
| **`MODEL_NOT_FOUND`**           | Run `node src/utils/check-models.js` to list available models for your key. |
| **“Cannot find module dotenv”** | Run `npm install` or enable `PUSHSCRIPT_SELF_HEAL=true`.                    |

---

## 5 · Roadmap

* **0.1** – open‑core CLI *(today)*
* **0.2** – Python dep scan
* **0.3** – GitHub App + org dashboard
* **0.4** – VS Code extension

> Star ⭐ the repo to track releases.

---

## Contributing

Helpful contributions keep PushScript moving. See [CONTRIBUTING.md](CONTRIBUTING.md) for quick‑start < 5 minutes.

---

## License & trademark

MIT License © 2025 PushScript Team. *PushScript™* and logo are trademarks—please rename forks.
