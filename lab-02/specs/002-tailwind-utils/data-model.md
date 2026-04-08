# Data Model: Tailwind Utils Centralization

**Created**: 2025-04-08  
**Purpose**: Define data structures and entities for styling utilities

## Key Entities

### Tailwind Utils Package

**Description**: Centralized collection of styling helper functions  
**Location**: `src/utils/tailwind/index.ts`  
**Purpose**: Provide consistent styling utilities across the application

### Functions

#### cn Function

**Type**: `(...inputs: ClassValue[]) => string`  
**Purpose**: Intelligent class name merging with TailwindCSS conflicts resolution  
**Dependencies**: clsx, tailwind-merge  
**Configuration**: Custom spacing tokens (xs, sm, md, lg, xl)

#### twx Function  

**Type**: Component creation utility with composition  
**Purpose**: Create styled components with TailwindCSS classes  
**Dependencies**: react-twc, cn function  
**Configuration**: Uses cn for class composition

#### getThemeToken Function

**Type**: Theme token accessor with formatting options  
**Purpose**: Retrieve CSS custom properties values from DOM  
**Dependencies**: Browser getComputedStyle API  
**Options**: 
- `fallbackReturn`: Default value when token not found
- `formatToNumber`: Convert px/rem values to numbers

## Data Flow

1. **Import**: Components import utilities from `src/utils/tailwind/index.ts`
2. **Usage**: Functions used for class merging, component creation, token access
3. **Output**: Consistent styling across application components

## Validation Rules

- All functions must be exported from index.ts
- TypeScript types must be properly defined
- No additional functions beyond specification requirements
- Must follow component styling strategy rules

## State Management

No persistent state required. All functions are stateless utilities.
