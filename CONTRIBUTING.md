# Contributing to PushScript 

PushScript turns *friction* into *flow* for developers. If you have ideas, polish, or curiosity to spare—welcome! We value clarity, kindness, and small, consistent steps forward.

> “Get lots of ideas, keep the good ones, throw the rest away.” – Paul Graham

---

## 1 · Quick start

```bash
# Fork & clone
$ git clone https://github.com/caterpillarC15/pushscript && cd pushscript

# Install deps (Node ≥ 18)
$ npm install   # or pnpm install

# Try the CLI in dev mode
$ node src/cli.js --help
```

*First PR?* Comment on an issue labelled **good first issue** or **help wanted** and we’ll guide you.

---

## 2 · Issue & PR etiquette

|  👍 Do                                                                                          |  🚫 Don’t                                                       |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Search existing issues and open a **new Issue** for bugs / features / docs.                     | File a PR with 1 k LOC and no context.                          |
| Use clear labels: *bug*, *feature*, *docs*, *good first issue*.                                 | Mix multiple unrelated fixes in one PR.                         |
| Write tests for new logic (`npm test`).                                                         | Break CI—green checks are table‑stakes.                         |
| Follow **Conventional Commits** (`feat:`, `fix:`, `docs:`…). PushScript will lint your message. | `git commit -m "misc stuff"`—PushScript will gently protest 😉. |
| Keep code ESM (`type: module`) unless editing a `.cjs` wrapper.                                 | Add new runtime deps without discussion.                        |
| Be kind, ask questions, assume good intent.                                                     | Assume tone—clarify instead.                                    |

---

## 3 · Project layout

```
pushscript/
├── src/            # Core CLI, providers, utils
├── pushscript.cjs  # Wrapper / bin entry
├── test/           # Jest tests (`npm test`)
├── docs/           # Design notes
└── ...
```

---

## 4 · Development workflow

1. **Branch** off `main`:  `git checkout -b feat/<your-feature>`
2. **Code & test**: run all tests `npm test` or a subset `npm test -- test/cli.test.js`.
3. **Lint**: `npm run lint --fix`.
4. **Commit** with Conventional Commit format (auto‑checked).
5. **Push & PR**. GitHub Actions runs **CI** (lint, tests, build).
6. **Review**: answer feedback; we squash‑merge once green.

### PR template checklist

* ✅ **Why it matters** – short problem/solution statement.
* ✅ **Linked Issue #** – traceability.
* ✅ **Screenshots / CLI output** (for UX changes).

---

## 5 · Code style snapshot

* Use **ES2022+** features (Node 18 +).
* Prefer async/await; avoid callback pyramids.
* Keep functions \~40 LOC max; compose helpers.
* Error handling: throw typed Errors, log via `src/logger.js`.
* Logging levels: `debug`, `info`, `warn`, `error`.

---

## 6 · High‑impact starter ideas

* Add **Python dependency & vuln scan** module.
* Build a **VS Code extension** that calls the CLI on commit.
* Create a **Rust ****`cargo-audit`**** plugin**.
* Design a **dark‑mode ASCII logo** Easter egg.

---

## 7 · Need help?

* **GitHub Discussions** – start a thread.
* **Issues** – label `question`.
  We’re friendly humans who drink too much coffee—ask away. ✌️

---

## 8 · Licence & trademark

Contributions are licensed under **MIT**. *PushScript™* and associated logos are trademarks; forks must use their own branding.
