A simple, safe toggle:

| Setting                             | Behaviour                                                                                                                                                 | Intended audience                                                            |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| ***unset* / `false`** (npm default) | **Self-healing logic is skipped.** The CLI assumes `npm install` (or npx) has already put deps in `node_modules`.                                         | Normal npm / npx users and CI.                                               |
| **`PUSHSCRIPT_SELF_HEAL=true`**     | On first run, the dependency-manager creates/updates a local `package.json` (if missing) and installs required packages via `pnpm → npm → yarn` fallback. | People cloning the repo directly, or running the CLI from arbitrary folders. |

### How to wire it

```js
// cli.js  (early in bootstrap)
if (process.env.PUSHSCRIPT_SELF_HEAL === 'true') {
  import('./dependency-manager.js')
    .then(m => m.checkAndInstallDependencies())
    .catch(console.error);
}
```

### Docs snippet to add

````markdown
### Optional: Self-healing installer  
If you cloned PushScript from GitHub and didn’t run `npm install`, set:

```bash
export PUSHSCRIPT_SELF_HEAL=true   # one-time, then run the CLI
````

(This flag is **OFF by default** in the npm-published package.)

```

---

This keeps the published npm flow clean while still giving power users an escape hatch.
```
