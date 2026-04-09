# Quick Start Guide: Base UI Components

**Created**: 2025-04-08  
**Purpose**: Getting started with the base component library

## Installation

The base components are part of the main application. No additional installation required.

## Basic Usage

### Clickable Components

```typescript
import { Clickable } from '@/components/atoms/clickable';

// Basic button
<Clickable.Button onClick={() => console.log('clicked')}>
  Click me
</Clickable.Button>

// Button with variants
<Clickable.Button 
  variant="solid" 
  size="lg" 
  tone="brand"
  onClick={handleAction}
>
  Primary Action
</Clickable.Button>

// Disabled button
<Clickable.Button disabled>
  Disabled
</Clickable.Button>

// Internal link
<Clickable.Link href="/about">
  About Page
</Clickable.Link>

// External link
<Clickable.ExternalLink href="https://example.com">
  External Site
</Clickable.ExternalLink>
```

### Text Components

```typescript
import { Text } from '@/components/atoms/text';

// Headings
<Text.Heading level={1}>Main Title</Text.Heading>
<Text.Heading level={2} size="lg" tone="brand">
  Subtitle
</Text.Heading>

// Paragraphs
<Text.Paragraph>
  Regular paragraph text with consistent styling.
</Text.Paragraph>

// Text with tones
<Text.Paragraph tone="success">
  Success message
</Text.Paragraph>

// Labels
<Text.Label htmlFor="email">Email Address</Text.Label>

// Error messages
<Text.Error>This field is required</Text.Error>

// Small text
<Text.Small>Helper text</Text.Small>

// Strong and highlight
<Text.Strong>Important text</Text.Strong>
<Text.Highlight>Highlighted text</Text.Highlight>

// Clickable text
<Text.Clickable onClick={handleClick}>
  Clickable text
</Text.Clickable>
```

### Field Components

```typescript
import { Field } from '@/components/atoms/field';

// Basic input
<Field.Input 
  name="firstName"
  label="First Name"
  placeholder="Enter your first name"
  onChange={(value) => setValue('firstName', value)}
/>

// Input with validation
<Field.Input 
  name="email"
  label="Email Address"
  type="email"
  error="Invalid email format"
  required
  onChange={(value) => setValue('email', value)}
/>

// Textarea
<Field.Textarea 
  name="message"
  label="Message"
  placeholder="Enter your message"
  rows={4}
  onChange={(value) => setValue('message', value)}
/>

// Date field
<Field.Date 
  name="birthdate"
  label="Birth Date"
  onChange={(value) => setValue('birthdate', value)}
/>
```

### Dialog Components

```typescript
import { Dialog } from '@/components/atoms/dialog';
import { Clickable } from '@/components/atoms/clickable';

// Basic dialog
<Dialog.Root>
  <Dialog.Trigger asChild>
    <Clickable.Button>Open Dialog</Clickable.Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Dialog Title</Dialog.Title>
      <Dialog.Description>
        Dialog description text
      </Dialog.Description>
    </Dialog.Header>
    <div>
      Dialog content goes here
    </div>
  </Dialog.Content>
</Dialog.Root>

// Controlled dialog
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger asChild>
    <Clickable.Button>Open Controlled Dialog</Clickable.Button>
  </Dialog.Trigger>
  <Dialog.Content showCloseButton>
    <Dialog.Header>
      <Dialog.Title>Controlled Dialog</Dialog.Title>
    </Dialog.Header>
    <div>
      This dialog is controlled by state
    </div>
  </Dialog.Content>
</Dialog.Root>
```

## Styling and Themes

### Using Palette Tones

All components support the project's token-based styling system:

```typescript
// Brand colors
<Clickable.Button tone="brand">Brand Button</Clickable.Button>
<Text.Paragraph tone="brand">Brand text</Text.Paragraph>

// Success colors
<Clickable.Button tone="success">Success Button</Clickable.Button>
<Text.Paragraph tone="success">Success message</Text.Paragraph>

// Warning colors
<Clickable.Button tone="warning">Warning Button</Clickable.Button>
<Text.Paragraph tone="warning">Warning message</Text.Paragraph>

// Danger colors
<Clickable.Button tone="danger">Danger Button</Clickable.Button>
<Text.Paragraph tone="danger">Error message</Text.Paragraph>
```

### Using Base Classes

Components automatically use appropriate base classes from the token system:

```typescript
// These automatically use base-1, base-2, etc.
<Field.Input label="Input in primary surface" />
<Text.Paragraph>Text in primary surface</Text.Paragraph>
```

## Accessibility Features

### Keyboard Navigation

All components support keyboard navigation:

- **Clickable**: Tab to focus, Enter/Space to activate
- **Field**: Tab to focus, type to input
- **Dialog**: Escape to close, Tab to navigate inside

### Screen Reader Support

Components include proper ARIA attributes:

```typescript
// Automatic ARIA labels
<Field.Input 
  name="email"
  label="Email Address"
  required
/>
// Generates: <input aria-label="Email Address" aria-required="true" />

// Dialog accessibility
<Dialog.Root>
  <Dialog.Content>
    <Dialog.Title>Required for screen readers</Dialog.Title>
    <Dialog.Description>Optional description</Dialog.Description>
  </Dialog.Content>
</Dialog.Root>
```

## Common Patterns

### Form Layout

```typescript
<form onSubmit={handleSubmit}>
  <Field.Input 
    name="name"
    label="Full Name"
    required
    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
  />
  
  <Field.Input 
    name="email"
    label="Email"
    type="email"
    error={errors.email}
    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
  />
  
  <Field.Textarea 
    name="message"
    label="Message"
    onChange={(value) => setFormData(prev => ({ ...prev, message: value }))}
  />
  
  <Clickable.Button type="submit" tone="brand">
    Submit Form
  </Clickable.Button>
</form>
```

### Confirmation Dialog

```typescript
<Dialog.Root open={showConfirm} onOpenChange={setShowConfirm}>
  <Dialog.Trigger asChild>
    <Clickable.Button tone="danger">Delete Item</Clickable.Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Confirm Deletion</Dialog.Title>
      <Dialog.Description>
        Are you sure you want to delete this item? This action cannot be undone.
      </Dialog.Description>
    </Dialog.Header>
    <div className="flex gap-md justify-end">
      <Clickable.Button 
        variant="outline" 
        onClick={() => setShowConfirm(false)}
      >
        Cancel
      </Clickable.Button>
      <Clickable.Button 
        tone="danger"
        onClick={handleDelete}
      >
        Delete
      </Clickable.Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
```

## Best Practices

### Component Composition

- Use the exported component objects, not individual imports
- Follow the component composition rules for consistent API
- Leverage the token system for styling consistency

### Form Integration

- Use React Hook Form for complex form validation
- Provide proper labels for all form fields
- Show error messages clearly and accessibly

### Accessibility

- Always include Dialog.Title for dialogs
- Use semantic HTML elements provided by components
- Test keyboard navigation and screen reader support

## Troubleshooting

### Common Issues

1. **Styles not applying**: Ensure token system is properly set up
2. **Dialog not closing**: Check onOpenChange prop
3. **Form validation not working**: Ensure proper name props
4. **Accessibility issues**: Verify ARIA attributes and semantic HTML

### Getting Help

- Check component source code for implementation details
- Review the token styling system documentation
- Test with screen readers and keyboard navigation
