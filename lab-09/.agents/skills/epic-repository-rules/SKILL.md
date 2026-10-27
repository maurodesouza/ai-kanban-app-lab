---
name: epic-repository-rules
description: Collect the repository conventions (branch, commit, PR, code style, architecture rules). Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

# Objective

Find every project convention that must be respected during the Epic.

This skill only reads. It does not modify files.

# 1. Look for Rules

Look in:

* .agents/
* .devin/
* .github/
* .cursor/
* .windsurf/
* .claude/
* .codex/
* AGENTS.md
* CLAUDE.md
* CONTRIBUTING.md
* README.md

Also check parent directories up to the git root, since rules may live there.

# 2. Extract Conventions

Extract, when present:

* Branch naming
* Commit message format
* Pull request template and requirements
* Code style and naming
* Architecture rules
* Testing rules
* Forbidden patterns

# 3. Precedence

Repository rules always override workflow defaults.

When two repository rules conflict, apply the more specific one (closer to the code being changed) and report the conflict in the output. Do not stop for it.

The application architecture is defined by `command-bus-architecture` and `fragiola-ui`. When a repository rule contradicts them, follow the architecture skills and report the conflict.

# 4. Final Output

Return:

* Each convention with its source file path
* Defaults that apply because no rule exists (mark them as `default`)
* Conflicts found

Stop after returning the conventions.
