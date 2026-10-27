---
name: epic-commit-progressively
description: Create small, atomic, semantic commits for the current Epic progress. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain the worktree path, the Issue being worked on and the commit convention from `epic-repository-rules`.

# Objective

Commit the current changes as small, atomic and semantic commits.

# 1. Group Changes

Group the uncommitted changes by intent, for example:

* action declarations + Handle for one domain
* store for one domain
* component changes
* tests

Each commit must build on its own whenever possible.

# 2. Message

Follow the commit convention from repository rules.

Reference the Issue number when the convention allows it.

# 3. Rules

* Do not commit unrelated changes.
* Do not commit generated files, secrets or local config unless the repository tracks them.
* Do not amend or rewrite commits already pushed.

# 4. Final Output

Return:

* Commits created (hash + message)

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
