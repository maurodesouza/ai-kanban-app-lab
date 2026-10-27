---
name: epic-implementer
description: Implement a GitHub Epic, open the pull request, verify its gates and auto-merge it (use the no-merge flag to skip the merge).
---

# User Input

```text
$ARGUMENTS
```

The input must contain a GitHub Epic.

# Flags

* `no-merge` (also accepted: `--no-merge`, `no merge`): create the pull request and verify all gates, but do not merge.

Without the flag, the pull request is merged automatically once every gate passes.

# Objective

Act as an autonomous Epic Implementer.

Your responsibility is to implement the complete Epic from start to finish, open the pull request, verify its gates and merge it (unless `no-merge` is set).

The Epic is the primary unit of execution.

Individual Issues are implementation work items, not human approval checkpoints.

Do not stop after completing an individual Issue.

# How This Skill Works

This skill is an orchestrator. It does not do the work itself.

Each step is delegated to a micro-skill with a single responsibility. Call the micro-skill, use its output as input for the next step, and follow its result.

Do not re-implement inside this skill what a micro-skill is responsible for.

Shared skills (`command-bus-architecture`, `fragiola-ui`, `command-handle-implementation`, `test-writer`, `reviewer`) are loaded once. While their instructions are still in context, follow them without loading them again for every Issue.

# Architecture

All code produced for the Epic must follow `command-bus-architecture`:

* Everything is an event through the Command Bus (V2).
* MobX stores hold all state and all derived values (`computed`, always prefixed with `$`).
* Handles hold all execution logic.
* Components only read prepared `$` values, present them and dispatch actions. No calculation or derived logic in components.
* Every interface is built with Fragiola UI (`fragiola-ui`).

# 1. Read the Epic

Call `epic-read` with the Epic.

If it returns `BLOCKED`, stop and present the reason to the user (open questions or an Epic it depends on that is not merged).

# 2. Discover the Repository

Call `epic-discover-repository`.

# 3. Repository Rules

Call `epic-repository-rules`.

Repository rules always override workflow defaults.

# 4. Current Documentation

Call `epic-current-documentation` whenever any step is about to use, install, upgrade, configure or integrate an external tool or dependency.

# 5. Plan Execution

Call `epic-plan-execution` with the outputs of steps 1-3.

`epic-plan-execution` uses `epic-handle-dependent-work` to order the Issues.

# 6. Epic Worktree

Call `epic-worktree`.

All following steps run inside the Epic worktree.

# 7. Prerequisites

If the plan lists prerequisites:

* Command Bus not installed: call `setup-command-system`.
* MobX not installed: install it using the version verified by `epic-current-documentation`.
* Fragiola UI not set up: configure the `@fragiola` registry with `fragiola-ui`.

Then call `epic-commit-progressively`.

# 8. Execute the Epic

For each Issue, in the order returned by the plan, call `epic-execution`.

`epic-execution` implements, tests (`test-writer`), reviews (`reviewer`) and commits (`epic-commit-progressively`) one Issue.

Continue automatically to the next Issue.

Do NOT wait for human approval between Issues.

Do NOT open a pull request for individual Issues.

Do NOT stop merely because an Issue is complete.

If the work reveals a new dependency between Issues, call `epic-handle-dependent-work` again and continue with the updated order.

# 9. Stop Conditions

Continue autonomously unless one of the following occurs:

* Requirements are fundamentally ambiguous.
* The Epic scope must materially change.
* A significant architectural decision not covered by the Epic or by `command-bus-architecture` is required.
* A destructive migration is required.
* Security boundaries must change.
* A new external dependency or service is required (the Command Bus, MobX and Fragiola UI are pre-approved).
* Significant infrastructure changes are required.
* Data loss is possible.
* Validation repeatedly fails without a clear resolution.
* The implementation contradicts the Epic objectives.

When a stop condition occurs, stop and clearly explain the decision required from the user.

Do not stop for minor implementation decisions that can be safely resolved within the existing scope.

# 10. Final Validation

After all Issues are implemented:

1. Verify every Epic acceptance criterion.
2. Verify every Issue acceptance criterion.
3. Run the complete relevant test suite.
4. Run lint.
5. Run type checking when applicable.
6. Run build when applicable.
7. Call `reviewer` for final Epic-level review.
8. Address all blocking findings.
9. Confirm the repository is merge-ready.

Do not open the pull request until the Epic passes final validation.

# 11. Open Pull Request

Call `epic-pull-request`.

# 12. Gates and Merge

Call `epic-merge` with the pull request and the `no-merge` flag.

* Default: verify all gates (checks, conflicts, mergeability) and merge when everything passes.
* `no-merge`: verify all gates the same way, but do not merge.

If `epic-merge` returns `BLOCKED` or `WAITING_FOR_HUMAN`, stop and explain what is required from the user.

# 13. Cleanup

When `epic-merge` returns `MERGED`, call `epic-cleanup` to delete the remote branch, the local branch and the Epic worktree.

With `no-merge`, skip this step: the branch and worktree stay for the pending pull request.

# 14. Final Output

Return:

* Epic number
* Issues implemented
* Worktree path
* Branch name
* Commits created
* Pull request URL
* Gates status (checks, conflicts)
* Merge status: `MERGED`, `READY_TO_MERGE` (no-merge), `WAITING_FOR_HUMAN` or `BLOCKED`
* Cleanup status: `CLEANED`, `SKIPPED` or `BLOCKED`
* Final validation status

Stop after the cleanup, or after the gates pass when `no-merge` is set.
