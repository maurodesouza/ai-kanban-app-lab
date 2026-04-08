# Utils Interface Contract

**Created**: 2025-04-08  
**Purpose**: Define the public interface for Tailwind utils

## Export Interface

The utils package exports three main functions:

### cn(...inputs: ClassValue[]): string

**Description**: Merge class names intelligently with TailwindCSS conflict resolution  
**Parameters**: 
- `inputs`: Variable number of class values (strings, objects, arrays)  
**Returns**: Merged class name string  
**Example**: `cn("base-class", { "active": isActive }, "additional-class")`

### twx

**Description**: Component creation utility with TailwindCSS styling  
**Type**: React component creator with composition  
**Usage**: `const Button = twx.button"base-button-styles"`

### getThemeToken<TFallback>(token: string, options?): string | number | TFallback

**Description**: Access CSS custom properties from the DOM  
**Parameters**:
- `token`: CSS custom property name (e.g., "--spacing-md")
- `options`: Configuration object with optional fallback and formatting
**Returns**: Token value as string, number, or fallback  
**Options**:
- `fallbackReturn`: Default value when token not found
- `formatToNumber`: Convert px/rem values to numbers

## Import Contract

```typescript
import { cn, twx, getThemeToken } from '@/utils/tailwind';
```

## Usage Constraints

- Must be used within React component context for getThemeToken
- twx requires React environment
- cn can be used in any JavaScript/TypeScript context
