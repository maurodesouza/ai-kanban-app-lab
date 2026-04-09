# Data Model: Base UI Components

**Created**: 2025-04-08  
**Purpose**: Component interfaces, types, and data structures

## Component Interfaces

### Clickable Component Types

```typescript
// Base clickable props
interface ClickableBaseProps {
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Button specific props
interface ButtonProps extends ClickableBaseProps {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Link specific props
interface LinkProps extends ClickableBaseProps {
  href: string;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
}

// External link props
interface ExternalLinkProps extends LinkProps {
  external?: boolean;
}
```

### Text Component Types

```typescript
// Base text props
interface TextBaseProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'danger';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
  className?: string;
}

// Heading props
interface HeadingProps extends TextBaseProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  as?: `h${1 | 2 | 3 | 4 | 5 | 6}`;
}

// Paragraph props
interface ParagraphProps extends TextBaseProps {
  as?: 'p';
}

// Link text props
interface TextLinkProps extends TextBaseProps {
  href: string;
  external?: boolean;
}

// Small text props
interface SmallProps extends Omit<TextBaseProps, 'size'> {
  as?: 'small';
}

// Label props
interface LabelProps extends TextBaseProps {
  htmlFor?: string;
  as?: 'label';
}

// Error text props
interface ErrorProps extends Omit<TextBaseProps, 'tone'> {
  as?: 'span';
}

// Strong text props
interface StrongProps extends TextBaseProps {
  as?: 'strong';
}

// Highlight text props
interface HighlightProps extends TextBaseProps {
  as?: 'mark';
}

// Clickable text props
interface TextClickableProps extends TextBaseProps {
  onClick?: () => void;
  as?: 'button';
}
```

### Field Component Types

```typescript
// Base field props
interface FieldBaseProps {
  id?: string;
  name: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Input field props
interface InputProps extends FieldBaseProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// Textarea props
interface TextareaProps extends FieldBaseProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  rows?: number;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// Date field props
interface DateProps extends FieldBaseProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}
```

### Dialog Component Types

```typescript
// Dialog props (wrapping shadcn/ui)
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

// Dialog content props
interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

// Dialog header props
interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

// Dialog title props
interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

// Dialog description props
interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

// Dialog trigger props
interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

## Component Composition Structure

### Clickable Export Structure
```typescript
export const Clickable = {
  Button: ButtonComponent,
  Link: LinkComponent,
  ExternalLink: ExternalLinkComponent,
};
```

### Text Export Structure
```typescript
export const Text = {
  Heading: HeadingComponent,
  Paragraph: ParagraphComponent,
  Link: TextLinkComponent,
  Small: SmallComponent,
  Label: LabelComponent,
  Error: ErrorComponent,
  Strong: StrongComponent,
  Highlight: HighlightComponent,
  Clickable: TextClickableComponent,
};
```

### Field Export Structure
```typescript
export const Field = {
  Input: InputComponent,
  Textarea: TextareaComponent,
  Date: DateComponent,
};
```

### Dialog Export Structure
```typescript
export const Dialog = {
  Root: DialogRootComponent,
  Content: DialogContentComponent,
  Header: DialogHeaderComponent,
  Title: DialogTitleComponent,
  Description: DialogDescriptionComponent,
  Trigger: DialogTriggerComponent,
};
```

## Validation Rules

### Clickable Validation
- Button requires onClick handler if type is 'button'
- Link requires href prop
- ExternalLink automatically adds rel="noopener noreferrer"

### Text Validation
- Heading requires level prop (1-6)
- Label requires htmlFor when associated with form element
- TextLink requires href prop

### Field Validation
- All fields require name prop
- Label prop is required for accessibility
- Error message only shown when error prop is provided

### Dialog Validation
- DialogTitle is required for accessibility
- Dialog must have proper focus management
- Escape key handling is built-in

## State Management

### Component States
- Clickable: default, hover, focus, active, disabled, loading
- Text: static (no state)
- Field: default, focus, error, disabled
- Dialog: open, closed

### State Transitions
- Clickable: default -> hover -> active -> default
- Field: default -> focus -> default (or error)
- Dialog: closed -> open -> closed
