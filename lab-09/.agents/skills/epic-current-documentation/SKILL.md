---
name: epic-current-documentation
description: Verify current official documentation before using, installing or integrating any external tool or dependency. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input names the tool, library, framework, SDK, API or dependency to verify.

# Objective

Make sure the implementation targets the currently supported version and APIs.

# 1. Verify

1. Check whether a documentation MCP is available.
2. Use the MCP to retrieve the latest official documentation.
3. Verify the currently recommended version and supported APIs.
4. Verify whether the chosen feature or API is deprecated.
5. Prefer currently supported and recommended approaches.
6. Do not rely solely on model knowledge or existing code when official documentation is available through MCP.

This applies especially to frameworks, libraries, SDKs, APIs, CLI tools, build tools, testing frameworks, database tools, cloud services and external integrations.

# 2. Pinned Versions

If the project is intentionally pinned to an older version, respect that constraint and verify the documentation for that specific version when available.

Never intentionally install or implement against an outdated or deprecated version when a supported version is available and compatible with the project.

# 3. Final Output

Return:

* Tool and version to use
* Recommended APIs / usage for this case
* Deprecated APIs to avoid
* Documentation sources consulted
* `UNVERIFIED` when no documentation source was available

Stop after returning the result.
