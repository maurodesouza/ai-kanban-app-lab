# Quickstart: Random Utils

**Created**: 2025-04-08  
**Purpose**: Quick guide for using the random

## Usage

### Import the random

```typescript
import { random } from '@/utils/random';
```

### Generate Random IDs

```typescript
// Default length (12 characters)
const defaultId = random.id();
console.log(defaultId); // e.g., "aB3xY9pL2mQ7"

// Custom length
const customId = random.id(8);
console.log(customId); // e.g., "K4nM2pQ9"

// Longer ID
const longId = random.id(20);
console.log(longId); // e.g., "xY7pL2mQ9aB3kJ8nZ4p"
```

## Character Set

Generated IDs contain only:
- Lowercase letters: a-z
- Uppercase letters: A-Z
- Digits: 0-9

## File Structure

```
src/utils/random/
  index.ts          # random object
```

## Implementation Notes

- Uses Math.random() for character selection
- No external dependencies
- Simple, direct implementation
- Object export (not class-based)
- Optional length parameter defaults to 12

## Best Practices

- Use default length for standard IDs
- Specify length only when needed
- Import directly from utils/random
- Suitable for non-security use cases
