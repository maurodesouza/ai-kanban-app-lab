---
name: epic-read
description: Read a GitHub Epic and all its child Issues and return a structured summary. Sub-skill of epic-implementer.
---

# User Input

```text
$ARGUMENTS
```

The input must contain a GitHub Epic (number or URL).

# Objective

Read and understand the Epic. This skill only reads. It does not plan, write code, or create branches.

# 1. Read the Epic

Read:

* Epic title
* Epic description
* Objective
* Scope
* Out of Scope
* Architectural Context
* Acceptance Criteria
* Risks
* Work Items
* Dependencies and Execution Order
* Delivery Strategy
* Definition of Done
* Stop Conditions
* Linked discussions

The Epic structure is defined by `tech-lead`. When a section is missing, read the content wherever it is and report the missing section.

# 2. Read the Child Issues

Read every child Issue. For each one, capture:

* Number and title
* Outcome and Scope
* Acceptance criteria
* Declared dependencies on other Issues
* Implementation Context
* Architecture Map
* Current state (open / closed)

# 3. Check Clarity

If the Epic requirements are fundamentally unclear or contradictory, return `BLOCKED` with the exact questions that need answers.

Do not guess the intent of an unclear requirement.

# 4. Dependent Epics

If the Delivery Strategy declares `Depends on Epic #<n>`, check that Epic's pull request.

If it is not merged, return `BLOCKED` saying which Epic must be delivered first.

# 5. Final Output

Return:

* Status: `READY` or `BLOCKED`
* Epic number, title and objective
* Scope and Out of Scope
* Epic acceptance criteria
* Architectural Context, Risks and Stop Conditions
* Issues list (number, title, acceptance criteria, dependencies, Architecture Map, state)
* Declared execution order, if any
* Open questions (when `BLOCKED`)

Stop after returning the summary.
