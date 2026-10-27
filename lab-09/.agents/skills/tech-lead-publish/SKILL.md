---
name: tech-lead-publish
description: Publish a final Epic and its Issues to GitHub, linked and labeled, keeping dependency and execution information. Sub-skill of tech-lead.
---

# User Input

```text
$ARGUMENTS
```

The input must contain the final Epic and Issues in the structure defined by `tech-lead`, plus the issue conventions from `epic-repository-rules`.

# Objective

Create the Epic and its Issues on GitHub exactly as planned.

This skill does not plan. It does not change scope, split or merge Issues.

# 1. Preconditions

1. Confirm GitHub access (`gh auth status`) and the target repository.
2. If access is unavailable, return `BLOCKED` with the Epic and Issues as Markdown so they can be created manually.

# 2. Labels

Use the repository labels and issue templates when they exist.

If no convention exists, use `epic` for the Epic and the type (`feature`, `refactor`, `bug`, `chore`) for each Issue. Create a missing label only when the repository has no equivalent.

# 3. Create the Issues

Create each Issue in execution order, using the Issue body structure from `tech-lead`.

Dependencies reference Issues already created, so write the real numbers (`#<n>`), never placeholders.

# 4. Create the Epic

Create the Epic using the Epic body structure from `tech-lead`, with the real Issue numbers in Work Items and in Dependencies and Execution Order.

Link the Issues to the Epic as sub-issues when supported; the Work Items checklist is always kept as well.

# 5. Multiple Epics

When the plan has more than one Epic, publish them in dependency order (sections 3 and 4 for each one), and write the real Epic numbers in each `Depends on Epic #<n>`.

# 6. Verify

Confirm that:

* Every planned Issue exists, with no duplicates.
* No `#<issue>` placeholder remains in any body.
* The Epic lists every Issue and the execution order matches the plan.

If something was created wrong, edit it. Do not create a duplicate.

# 7. Final Output

Return:

* Epic number(s) and URL(s), in execution order
* Issues (number, title, URL) in execution order
* Labels applied
* Status: `PUBLISHED` or `BLOCKED`

Stop after publishing.
