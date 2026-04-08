# Quickstart: Tailwind Utils Centralization

**Created**: 2025-04-08  
**Purpose**: Quick guide for using the centralized Tailwind utilities

## Installation

Install the required dependencies:

```bash
npm install clsx react-twc tailwind-merge tailwind-variants
```

## Usage

### Import the utilities

```typescript
import { cn, twx, getThemeToken } from '@/utils/tailwind';
```

### Class Merging with cn

```typescript
// Basic usage
const className = cn("base-class", "additional-class");

// Conditional classes
const className = cn("button", {
  "button-primary": isPrimary,
  "button-disabled": isDisabled
});

// Arrays and objects
const className = cn([
  "flex",
  "items-center",
  { "bg-blue-500": isActive }
]);
```

### Component Creation with twx

```typescript
// Create styled components
const Button = twx.button`
  px-4 py-2 rounded-md font-medium
  transition-colors duration-200
`;

const Container = twx.div`
  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
`;

// Use in components
const MyComponent = () => {
  return <Button onClick={handleClick}>Click me</Button>;
};
```

### Theme Token Access with getThemeToken

```typescript
// Get raw CSS token value
const spacing = getThemeToken('--spacing-md'); // "1rem"

// Get numeric value
const spacingPx = getThemeToken('--spacing-md', { 
  formatToNumber: true 
}); // 16

// With fallback
const unknownToken = getThemeToken('--unknown-token', {
  fallbackReturn: '0px'
}); // "0px"
```

## Component Styling Strategy Integration

The utilities support the component styling strategy:

- Use `cn` for conditional styling and class merging
- Use `twx` for static, reusable components  
- Use `getThemeToken` for accessing design system tokens

## File Structure

```
src/utils/tailwind/
  index.ts          # Main utilities file
```

## Best Practices

- Import utilities from the centralized location
- Use `cn` for dynamic/conditional styling
- Use `twx` for component definitions
- Access theme tokens through `getThemeToken` for consistency
