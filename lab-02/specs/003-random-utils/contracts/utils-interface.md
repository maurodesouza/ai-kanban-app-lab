# Random Utils Interface Contract

**Created**: 2025-04-08  
**Purpose**: Define the public interface for random

## Export Interface

The utils package exports a random object with one method:

### random.id(length?: number): string

**Description**: Generate random alphanumeric string ID  
**Parameters**:
- `length` (optional): Number of characters, defaults to 12
**Returns**: Random string containing only alphanumeric characters
**Character Set**: 
- Lowercase letters: a-z
- Uppercase letters: A-Z
- Digits: 0-9

## Import Contract

```typescript
import { random } from '@/utils/random';
```

## Usage Contract

```typescript
// Default length (12 characters)
const id1 = random.id();

// Custom length
const id2 = random.id(16);
```

## Implementation Constraints

- Must be exported as object, not class
- Method must be simple and direct
- No external dependencies
- No abstractions or additional layers
- Must use Math.random() for generation
