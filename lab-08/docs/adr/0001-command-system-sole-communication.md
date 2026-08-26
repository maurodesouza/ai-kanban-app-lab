# Command system as the sole cross-component communication channel

All cross-component communication flows through the command bus (`actions.domain.action(payload)`). Components never mutate shared state directly and never call each other; they dispatch commands, and Handles own the side-effecting logic that mutates the mobX store. Ephemeral local UI state (hover, drag-in-progress, raw input values before submit, dropdown open/close) stays as local React state and does not go through the bus.

We chose this over prop drilling, direct store mutation from components, and ad-hoc event emitters because it keeps intent explicit, centralizes the mutation surface in auditable Handles, and matches the `setup-command-system` architecture already mandated for the project. The cost is more boilerplate per action; the benefit is a single, typed seam for every state change.
