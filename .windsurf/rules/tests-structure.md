---
trigger: model_decision
description: Testing structure and rules
---

# **Testing Rule**

## **1. Unit Tests**

### File structure

- All unit tests must be placed **in the same directory as the file being tested**
- Test file name must always be:

  - `test.ts`
  - `test.tsx`

### Examples

```

src/components/atoms/component-name/
  index.tsx
  test.tsx

src/utils/my-utils/
  index.ts
  test.ts

```

---

### When to write unit tests

Write tests only for code with meaningful behavior:

- ✔ Logic (functions, calculations, validations)
- ✔ Actions (event handlers, side effects)
- ✔ Business rules
- ✔ Custom hooks

Do not write tests for:

- ✘ Purely presentational components without logic
- ✘ Trivial code (static rendering, simple prop passing)
- ✘ Styles or markup without behavior

---

### Best practices

- Tests must validate **behavior**, not implementation details
- Each test should clearly state what it guarantees
- Avoid unnecessary mocks

---

## **2. End-to-End Tests (Cypress)**

### Tooling

- Use **Cypress** for all end-to-end tests

---

### Folder structure

E2E tests must live in the client root:

```
CLIENT_ROOT_FOLDER/
  - e2e/
  - fixtures/
  - plugins/
  - support/
  - .eslintrc.json
  - tsconfig.json
```

---

### Guidelines

- Tests must simulate **real user behavior**
- Cover **critical flows**, not edge micro-cases

Focus on:

- ✔ Navigation
- ✔ Forms and submissions
- ✔ Integration between features

Avoid:

- ✘ Testing internal implementation
- ✘ Duplicating unit test coverage
- ✘ Over-testing minor UI details

---

### Best practices

- Prefer **real flows over mocks**
- Keep tests independent
- Use fixtures only when necessary
- Keep assertions minimal and meaningful

---

> Unit tests verify logic.  
> E2E tests verify that the system actually works.
