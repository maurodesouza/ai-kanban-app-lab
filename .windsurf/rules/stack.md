---
trigger: model_decision
description: Tech stack rules for the project
---
### Tech Stack Rules

You must strictly use the following stack when generating or modifying code:

- Next.js (App Router)
- TypeScript (strict mode)
- TailwindCSS (styling)
- shadcn/ui (UI components)
- Prisma (database ORM)
- Zod (validation and schemas)

Do not introduce alternative libraries unless explicitly requested.

---

### Usage Rules

#### Next.js
- Use App Router (/app directory)
- Prefer Server Components by default
- Use "use client" only when necessary

#### TypeScript
- Use strict typing
- Avoid `any`
- Prefer interfaces for object shapes

#### TailwindCSS
- Use Tailwind for all styling
- Do not create custom CSS files unless ضروری

#### shadcn/ui
- Use as the base for UI components
- Extend components instead of rebuilding from scratch

#### Prisma
- Use Prisma for all database access
- Do not write raw SQL unless necessary
- Keep queries inside a data-access layer (not in components)

#### Zod
- Use Zod for all validation
- Validate:
  - forms
  - API inputs
  - external data

---

### Integration Rules

- Forms → Zod + (React Hook Form if needed)
- API → validate input with Zod before processing
- Database → Prisma + validated data only

---

### General Constraints

- Do not mix multiple libraries for the same purpose
- Prefer consistency over alternatives