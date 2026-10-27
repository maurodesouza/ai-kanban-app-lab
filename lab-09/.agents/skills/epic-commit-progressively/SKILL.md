---
name: epic-commit-progressively
description: Create atomic commits (one coherent change each, balanced granularity) with emoji messages for the current Epic progress. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain the worktree path, the Issue being worked on and the commit convention from `epic-repository-rules`.

# Objective

Commit the current changes as **atomic commits**: each commit is one coherent unit of change, with balanced granularity.

# 1. Group Changes

One commit = one change that makes sense on its own: someone reading only that commit understands what changed and why.

* Group by intent, not by file type. A domain's actions, Handle, store and the components using them go together when they deliver one behavior.
* Tests go in the same commit as the code they cover.
* Each commit builds and keeps the tests passing.

Balance:

* **Too small** - a commit that cannot be understood or built alone (only types, only an import, one file of a feature split from the rest). Merge it into the change it belongs to.
* **Too big** - a commit that needs "and" to join unrelated changes (a feature and an unrelated refactor, two independent features). Split it.
* Usually one to a few commits per Issue. Do not create a commit per file or per small step.

# 2. Message

Follow the commit convention from repository rules.

If none exists, use:

```text
<emoji> <type>: <short description in imperative, lowercase>

- optional bullet explaining a relevant detail or why
```

* The emoji is free: pick one that represents the intent of this commit (e.g. ✨ new feature, 🐛 fix, ♻️ refactor, ✅ tests, 💄 style, 🔧 config). The examples are not a fixed list.
* `<type>` is a Conventional Commits type (`feat`, `fix`, `refactor`, `test`, `style`, `chore`, `docs`, `perf`).
* Reference the Issue number when the convention allows it.

# 3. Rules

* Do not commit unrelated changes.
* Do not commit generated files, secrets or local config unless the repository tracks them.
* Do not amend or rewrite commits already pushed.

# 4. Final Output

Return:

* Commits created (hash + message)

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
