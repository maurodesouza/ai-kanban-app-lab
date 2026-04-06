---
trigger: model_decision
description: Enforce branch naming convention
---
Branch names must follow a strict convention based on the type of work.

Format:

<type>/<short-description>

Types:
- feat: New features
- fix: Bug fixes
- docs: Documentation changes
- test: Test-related changes
- chore: Maintenance tasks
- ci: Continuous integration changes
- lint: Code style or linting changes

Naming rules:
- Must be lowercase
- Words must be separated by hyphens (-)
- Must be concise and descriptive
- Avoid generic names like "update", "changes", or "misc"
- Do not use camelCase or spaces

Examples:
- feat/user-authentication
- fix/login-validation-error
- docs/api-usage
- test/user-service
- chore/update-dependencies

Restrictions:
- Never commit directly to main or default branches
- Every change must originate from a properly named branch
