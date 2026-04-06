---
trigger: model_decision
description: Enforce commit message convention
---

A commit message consists of a header, and optionally a body and footer.

The header is mandatory and must follow this format:

<emoji> <type>: <subject>

The body and footer are optional but highly encouraged.

Header rules:
- Must be the first line and cannot be empty
- Must contain a valid type with emoji:
    ⚡ chore: Changes that do not fix bugs or add features
    🧪 ci: Continuous integration changes
    📖 docs: Documentation changes
    ✨ feat: New features
    🐛 fix: Bug fixes
    🤖 test: Test-related changes
    🧼 lint: Linting or code style changes
- Type must be lowercase
- Subject must:
- Be lowercase
- Be 50 characters or less
- Not end with punctuation
- Avoid camelCase (use "my method" not "myMethod")

Body rules:
- Must start with a blank line after header
- Each line must be 72 characters or less
- Must be capitalized
- Should explain:
- Why the change is necessary
- How it solves the problem
- Any side effects

Footer rules:
- Must start with a blank line after body
- Each line must be 72 characters or less
- Use to reference issues or pull requests
- References must be in the last line (e.g., #3 #12)

General guidelines:
- Use present tense ("add" not "added")
- Use imperative mood ("fix bug" not "fixes bug")

Example:

✨ feat: add commit message style guide

Oftentimes a subject by itself is sufficient. When it's not, add a
blank line followed by one or more paragraphs wrapped to 72
characters.