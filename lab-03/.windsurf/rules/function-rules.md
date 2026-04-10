---
trigger: always_on
description: Function rules for TypeScript usage
---

# Function Rules

### Function Declaration

* Always use `function functionName() {}`
* Never use arrow functions by default
* Only use arrow functions if `this` binding is required (rare cases)

```ts
function doSomething() {}
```

---

### Arguments Structure

* If the function has **only one argument**, pass it directly

```ts
function getUser(id: string) {}
```

* If the function has **two or more arguments**, use an object (named parameters pattern)

```ts
type CreateUserArgs = {
  name: string;
  age: number;
};

function createUser(args: CreateUserArgs) {}
```

---

### Args + Config Separation

* When arguments have different responsibilities (e.g. data vs config), separate them:

```ts
function functionName(args = {}, config = {}) {}
```

* If there is **one main argument + config**, keep it explicit:

```ts
function functionName(id: string, config = {}) {}
```

* Keep `args` for core data and `config` for optional behavior/settings

---

### Typing Arguments

* Always type arguments using `type`
* Avoid inline complex types when possible (extract if needed)

```ts
type CreateUserArgs = {
  name: string;
  age: number;
};

function createUser(args: CreateUserArgs) {}
```

---

### Exports

* Always use **named exports**
* Never use `default export`

```ts
export function createUser() {}
```

---

### Generic / Utility Functions

* For functions inside `src/utils/`, always include **JSDoc documentation**
* Do not use JSDoc for component-scoped functions

```ts
/**
 * Creates a new user
 */
export function createUser(args: CreateUserArgs) {}
```

---

### Functions Inside Components

Order inside components must always be:

1. `useState`
2. Component functions
3. `useEffect`
4. JSX return

```ts
function Component() {
  const [state, setState] = useState();

  function handleClick() {}

  useEffect(() => {}, []);

  return <div />;
}
```

---

### useEffect Rules

* Never declare functions inside `useEffect`
* All functions must be declared **before** `useEffect`

```ts
function Component() {
  const [state, setState] = useState();

  function loadData() {}

  useEffect(() => {
    loadData();
  }, []);
}
```

---

### Summary

* Always `function`, never arrow (unless `this` is required)
* 1 arg → direct
* 2+ args → object (`args`)
* Separate `args` and `config` when needed
* Always named exports
* JSDoc only for `src/utils/`
* Inside components: state → functions → effects → JSX
* Never create functions inside `useEffect`
