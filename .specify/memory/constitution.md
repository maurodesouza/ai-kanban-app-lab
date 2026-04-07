<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0
Modified principles: All 5 principles replaced with new mobile-first todo app principles
Added sections: Product Rules, UX/UI Rules, Content Rules, Technical Rules, Absolute Prohibitions
Templates requiring updates: ✅ plan-template.md (Constitution Check), ✅ spec-template.md (requirements alignment), ✅ tasks-template.md (task categorization)
Follow-up TODOs: None
-->

# AI Todo App Constitution

## Core Principles

### I. Clarity Above Aesthetics
Every screen MUST have a single, evident primary action. Content MUST be comprehensible within 8 seconds. Visual design serves comprehension, not decoration. User confusion is a failure state.

### II. Mobile-First Mandatory (NON-NEGOTIABLE)
All interfaces MUST be designed first for mobile. Desktop is an adaptation, never the origin. Touch targets, gestures, and mobile constraints drive all design decisions. Responsive design expands from mobile baseline.

### III. Simplicity with Professional Standards
Solve problems with the minimum number of elements possible. Simple does not mean amateur - maintain professional polish through typography, spacing, and interaction quality. Every element must justify its existence.

### IV. Performance as Requirement, Not Improvement
Interface MUST respond immediately to user actions. Latency invalidates visual quality. Performance budgets are non-negotiable constraints, not optimization targets. 60fps interactions, 100ms response times.

### V. Accessibility Mandatory
Contrast, navigation, and semantics are required, not optional. Interface must be usable without extra effort. Screen readers, keyboard navigation, and cognitive accessibility are baseline requirements.

## Product Rules

Every feature MUST have a clear, justifiable objective. Features without defined impact MUST NOT exist. Functionality serves user goals, not technical curiosity.

## UX/UI Rules

First screen MUST convey immediate professionalism. Primary CTAs MUST be visible without effort. Trust built through evidence: consistent structure, clear hierarchy, predictable interactions. Mobile touch targets minimum 44px.

## Content Rules

Generic or placeholder content is PROHIBITED. Every text must have clear function: inform, guide, or convert. Microcopy must be precise and helpful. Error messages must guide resolution.

## Technical Rules

Code MUST follow clean code principles. Organization MUST enable evolution without rewrite. Dependencies MUST be minimal and justified. Performance budgets enforced at build time. Accessibility testing automated.

## Absolute Prohibitions

Interfaces that are beautiful but confusing or slow are FORBIDDEN. Complexity without necessity is FORBIDDEN. Technical decisions without justification are FORBIDDEN. "Gambiarras" (workarounds) as permanent solutions are FORBIDDEN.

## Governance

Constitution supersedes all other practices. Amendments require documentation, approval, and migration plan. All PRs/reviews must verify compliance. Complexity must be justified with user value. Use this constitution as runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2025-04-06 | **Last Amended**: 2025-04-06
