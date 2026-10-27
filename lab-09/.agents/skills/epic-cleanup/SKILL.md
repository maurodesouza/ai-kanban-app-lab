---
name: epic-cleanup
description: After an Epic pull request is merged, delete the remote branch, the local branch and the Epic worktree, leaving local and remote clean. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain the pull request number, the Epic branch name and the worktree path.

# Objective

Remove every resource created for the Epic once its pull request is merged.

# 1. Precondition

Confirm the pull request state is `MERGED` (`gh pr view <pr> --json state`).

If it is not merged, do nothing and return `SKIPPED`. Never clean up an unmerged Epic.

# 2. Leave the Worktree

Run every following command from the main repository checkout, never from inside the Epic worktree.

Do not switch branches or pull in the main checkout: it may hold the user's own work. Only run `git fetch origin`.

# 3. Remove the Worktree

1. Confirm the worktree has no uncommitted or unpushed changes. If it has, stop and report `BLOCKED` instead of discarding work.
2. `git worktree remove <worktree-path>`
3. `git worktree prune`

The worktree must be removed before the local branch, because a branch checked out in a worktree cannot be deleted.

# 4. Delete the Local Branch

1. `git branch -d <branch>`
2. If it fails because the branch is not merged into the current `HEAD` (the main checkout may be on another branch, or the merge was a squash/rebase) and section 1 confirmed `MERGED`, use `git branch -D <branch>`.

# 5. Delete the Remote Branch

1. If the branch still exists on the remote, `git push origin --delete <branch>`.
2. `git fetch --prune`

A remote branch already deleted by GitHub is not an error.

# 6. Verify

Confirm that:

* `git worktree list` no longer shows the Epic worktree.
* `git branch --list <branch>` is empty.
* `git ls-remote --heads origin <branch>` is empty.
* The worktree directory no longer exists.

# 7. Final Output

Return:

* Decision: `CLEANED`, `SKIPPED` (not merged) or `BLOCKED`
* Worktree removed
* Local branch deleted
* Remote branch deleted

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
