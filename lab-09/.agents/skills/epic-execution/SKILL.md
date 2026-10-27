---
name: epic-execution
description: Implement a single Epic Issue following the Command Bus architecture, then test, review and commit it. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain one Issue, its architecture map from `epic-plan-execution`, the worktree path and the repository report.

# Objective

Implement exactly one Issue until its acceptance criteria are met.

Work only inside the Epic worktree.

# 1. Understand

1. Read the Issue and its acceptance criteria.
2. Read the reference files from the repository report.
3. Inspect the existing code that will change.

# 2. Implement

Follow `command-bus-architecture` for every change.

For each domain in the architecture map:

1. Declare the actions in `<domain>-actions.ts`.
2. Create or update the MobX store in `store/store.ts`: primitives, setters and every `$` derived value the UI needs (one `$<part>UI` per component).
3. Create or update the Handle with `command-handle-implementation`.
4. Mount the Handle where it belongs.
5. Build or update components with `fragiola-ui`. They only read `$` values, present them and dispatch through `actions`. No calculation or value selection in components.

Before using any external library API, run `epic-current-documentation`.

Match the surrounding code style and the reference files.

# 3. Validate

1. Call `test-writer` when tests are applicable.
2. Run lint, typecheck and the relevant tests.
3. Call `reviewer`, passing the validation results from step 2.
4. Address all critical, high and relevant medium findings, then re-run validation.
5. Do not continue with known blocking findings.

# 4. Close the Issue

1. Verify every acceptance criterion of the Issue.
2. Call `epic-commit-progressively`.
3. Mark the Issue as completed when supported.

# 5. Final Output

Return:

* Issue number
* Files changed
* Actions, Handles and stores created or changed
* Validation results
* Reviewer decision
* Commits created
* Acceptance criteria status

Stop after the Issue is complete. Do not start the next Issue.
