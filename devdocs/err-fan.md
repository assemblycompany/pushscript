2.1 Command‑line reference

Run pushscript --help anytime to see all flags. Common examples:

Use‑case

Command

Custom commit message

pushscript "feat: add search API"

Commit only (no push)

pushscript commit

Specify remote branch

pushscript "refactor: cleanup" staging

Push to main quickly

pushscript --main

Dry‑run (no network calls)

pushscript --dry

All flags work identically when invoked via npm run push.