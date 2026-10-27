---
name: epic-worktree
description: Create the dedicated git worktree and branch for an Epic. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain the Epic number, a short description and the branch convention from `epic-repository-rules`.

# Objective

Create one worktree and one branch for the whole Epic.

# 1. Branch Name

Use the branch convention from repository rules.

If no convention exists, use:

```text
type/epic-short-description
```

# 2. Create the Worktree

Create it at `<git-root>/.worktrees/epic-<number>`, based on the up-to-date remote default branch:

```bash
git fetch origin
git worktree add -b <branch> <git-root>/.worktrees/epic-<number> origin/<default-branch>
```

If the worktree or branch already exists for this Epic, reuse it instead of creating a new one.

Make sure `.worktrees/` is not tracked by git.

# 3. Rules

* Do not create a branch per Issue.
* All Issues of the Epic are implemented in this branch.

# 4. Final Output

Return:

* Worktree absolute path
* Branch name
* Base commit

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
