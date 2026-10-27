---
name: epic-merge
description: Verify the gates of an Epic pull request (checks, conflicts, mergeability) and merge it unless merge is disabled. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain the pull request number, the worktree path, the merge conventions from `epic-repository-rules` and whether merge is disabled (`no-merge`).

# Objective

Make sure the pull request is merge-ready and, unless `no-merge` is set, merge it.

The gates in sections 1-3 always run. Only section 4 depends on `no-merge`.

# 1. Checks

1. Wait for all CI checks to finish (`gh pr checks <pr> --watch`).
2. If every check passes, continue.
3. If a check fails:
   1. Read the failure logs.
   2. Fix the cause in the Epic worktree, following `command-bus-architecture`.
   3. Run the local validation again (tests, lint, typecheck, build).
   4. Commit with `epic-commit-progressively` and push.
   5. Wait for the checks again.
4. After 3 failed fix attempts on the same check, stop and report `BLOCKED`.

If the repository has no CI checks, rely on the local final validation and report that no remote checks exist.

# 2. Conflicts

Check mergeability (`gh pr view <pr> --json mergeable,mergeStateStatus`).

If the branch is behind or conflicts with the base branch:

1. Update the Epic branch with the base branch, following repository rules (rebase or merge).
2. Resolve conflicts preserving the intent of both sides.
3. Run the local validation again.
4. Push and go back to section 1.

If a conflict cannot be resolved without changing Epic scope or someone else's work semantics, stop and report `BLOCKED`.

# 3. Other Gates

Verify:

* Required reviews / approvals.
* Branch protection rules.
* Draft status.
* Unresolved required conversations.

Never bypass a gate. Never use admin overrides (`--admin`) or force pushes to the base branch.

If a gate requires a human (e.g. a required approval), stop and report `WAITING_FOR_HUMAN` with what is missing.

# 4. Merge

If `no-merge` is set:

* Do not merge.
* Report `READY_TO_MERGE` when all gates pass.

Otherwise, when all gates pass:

1. Merge using the merge method from repository rules. If none exists, use a merge commit (`gh pr merge <pr> --merge`) so the progressive commits are preserved. Do not delete branches here; `epic-cleanup` does it.
2. Confirm the pull request state is `MERGED`.
3. Confirm the Epic Issues were closed; close any that were not.

# 5. Final Output

Return:

* Decision: `MERGED`, `READY_TO_MERGE` (no-merge), `WAITING_FOR_HUMAN` or `BLOCKED`
* Checks status
* Conflicts found and how they were resolved
* Fix commits pushed
* Merge commit (when merged)
* What is missing (when not merged)

Stop after reporting.
