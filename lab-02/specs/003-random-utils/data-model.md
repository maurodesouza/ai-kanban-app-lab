# Data Model: Random Utils

**Created**: 2025-04-08  
**Purpose**: Define data structures and entities for random utilities

## Key Entities

### random Object

**Description**: Exported object containing random generation methods  
**Location**: `src/utils/random/index.ts`  
**Purpose**: Provide centralized random ID generation functionality

### Methods

#### id(length?: number): string

**Type**: Method function with optional parameter  
**Purpose**: Generate random alphanumeric string ID  
**Parameters**:
- `length` (optional): Number of characters, defaults to 12
**Returns**: Random string containing only:
- Lowercase letters (a-z)
- Uppercase letters (A-Z)  
- Digits (0-9)
**Implementation**: Uses Math.random() for character selection

## Data Flow

1. **Import**: Components import random from `src/utils/random/index.ts`
2. **Usage**: Call random.id() or random.id(length)
3. **Output**: Random alphanumeric string ID

## Validation Rules

- Method must be exported as part of random object
- No class-based implementation allowed
- Length parameter must default to 12
- Output must contain only specified character set
- Implementation must be simple and direct

## State Management

No persistent state required. All functions are stateless utilities.
