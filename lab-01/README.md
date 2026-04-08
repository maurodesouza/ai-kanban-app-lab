# Kanban Todo App - Complete Documentation

## Overview

A fully accessible, performant Kanban board application built with Next.js, React, and TypeScript. This application demonstrates modern web development best practices including accessibility, performance optimization, comprehensive testing, and responsive design.

## Features

### Core Functionality
- **Task Management**: Create, edit, delete, and organize tasks
- **Drag & Drop**: Intuitive drag-and-drop between columns and within columns
- **Filtering**: Real-time task filtering by title and description
- **Keyboard Navigation**: Complete keyboard accessibility with shortcuts
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### Accessibility Features
- **WCAG 2.1 AA Compliant**: Full compliance with Web Content Accessibility Guidelines
- **Screen Reader Support**: Optimized for assistive technologies
- **Keyboard Navigation**: All functionality accessible via keyboard
- **Focus Management**: Proper focus trapping and visual indicators
- **ARIA Labels**: Comprehensive ARIA attributes and landmarks
- **Color Contrast**: Meets 4.5:1 contrast ratio requirements

### Performance Features
- **Core Web Vitals**: Optimized LCP, FID, and CLS metrics
- **Bundle Optimization**: Code splitting and lazy loading
- **Performance Monitoring**: Real-time performance tracking
- **Budget Enforcement**: Automated performance budget validation
- **Memory Management**: Efficient memory usage tracking

### Testing Coverage
- **Unit Tests**: 65+ component and hook tests with Vitest
- **Integration Tests**: User workflow testing
- **E2E Tests**: Comprehensive Cypress test suite
- **Accessibility Testing**: Automated WCAG compliance checks
- **Performance Testing**: Automated performance budget validation

## Technology Stack

### Frontend
- **Framework**: Next.js 16.2.2
- **Language**: TypeScript 6.0.2
- **Styling**: Tailwind CSS 4.2.2
- **UI Components**: Custom component library with Tailwind Variants
- **Drag & Drop**: @dnd-kit for accessible drag operations
- **State Management**: Zustand for simple state management

### Development Tools
- **Testing**: Vitest + React Testing Library + Cypress
- **Linting**: ESLint 9.17.0
- **Formatting**: Prettier 3.4.2
- **Type Checking**: TypeScript strict mode
- **Performance**: Custom performance monitoring hooks

### Accessibility
- **WCAG Compliance**: Automated testing and monitoring
- **Screen Reader**: Optimized for NVDA, JAWS, VoiceOver
- **Keyboard**: Full keyboard navigation and shortcuts
- **Focus Management**: Custom focus trapping and restoration

## Project Structure

```
src/
|-- app/                    # Next.js App Router
|   |-- layout.tsx         # Root layout
|   |-- page.tsx           # Main application page
|-- components/            # React components
|   |-- atoms/             # Basic UI elements
|   |-- molecules/         # Composite components
|   |-- organisms/         # Complex components
|   |-- templates/         # Page templates
|   |-- pages/             # Page components
|-- hooks/                 # Custom React hooks
|   |-- use-keyboard-shortcuts.ts
|   |-- use-keyboard-drag-drop.ts
|   |-- use-performance-monitoring.ts
|   |-- use-accessibility-audit.ts
|   |-- use-accessibility-testing.ts
|-- stores/                # State management
|   |-- kanban.ts          # Kanban store
|-- events/                # Event system
|   |-- handles/           # Event handlers
|   |-- index.ts           # Event exports
|-- types/                 # TypeScript types
|   |-- events.ts          # Event types
|   |-- kanban.ts          # Kanban types
|-- test/                  # Test configuration
|   |-- setup.ts           # Vitest setup
|-- __tests__/             # Test files
|   |-- components/        # Component tests
|   |-- hooks/             # Hook tests
|   |-- integration/       # Integration tests
cypress/                   # E2E tests
|-- e2e/                   # Test files
|-- support/               # Cypress support
|-- config.ts              # Cypress config
scripts/                   # Build and utility scripts
|-- performance-budget.js  # Performance budget enforcement
specs/                     # Project specifications
|-- 001-kanban-todo-app/   # Feature specifications
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-todo-app-lab
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
npm run format       # Format code with Prettier
npm run check        # Run all quality checks

# Testing
npm run test         # Run unit tests
npm run test:integration  # Run integration tests
npm run test:e2e     # Run E2E tests (Cypress)
npm run test:coverage # Run tests with coverage

# Performance
npm run performance:check  # Check performance budget
npm run performance:ci     # CI performance validation
```

### Component Development

#### Component Structure
Follow the established component patterns:

```typescript
// Component file: components/atoms/Button/Button.tsx
import { twx } from 'twx';

const Button = twx.button`/* styles */;

export const Clickable = {
  Button,
  // Other clickable components
};
```

#### Accessibility Guidelines
- Use semantic HTML elements
- Add proper ARIA labels and roles
- Implement keyboard navigation
- Ensure color contrast compliance
- Test with screen readers

#### Performance Guidelines
- Use React.memo for expensive components
- Implement proper loading states
- Optimize bundle size with code splitting
- Monitor Core Web Vitals
- Respect performance budgets

## Testing

### Unit Tests
- Location: `src/__tests__/components/` and `src/__tests__/hooks/`
- Framework: Vitest + React Testing Library
- Coverage: Aim for 80%+ coverage

### Integration Tests
- Location: `src/__tests__/integration/`
- Focus: User workflows and component interactions
- Framework: Vitest + React Testing Library

### E2E Tests
- Location: `cypress/e2e/`
- Framework: Cypress
- Coverage: All user stories and critical paths

### Accessibility Testing
- Automated WCAG compliance checks
- Screen reader testing
- Keyboard navigation testing
- Color contrast validation

## Performance

### Performance Budget
- Bundle Size: 250KB max
- LCP: 2.5s max
- FID: 100ms max
- CLS: 0.1 max
- Custom metrics: Drag <100ms, Filter <16ms

### Monitoring
- Real-time performance dashboard (development)
- Automated budget enforcement (CI/CD)
- Core Web Vitals tracking
- Memory usage monitoring

### Optimization
- Code splitting with dynamic imports
- Image optimization
- Font optimization
- CSS optimization
- Tree shaking

## Accessibility

### WCAG 2.1 Compliance
- **Level A**: Essential accessibility (100% compliant)
- **Level AA**: Standard support (100% compliant)
- **Level AAA**: Enhanced support (partial)

### Features
- Semantic HTML structure
- ARIA labels and landmarks
- Keyboard navigation and shortcuts
- Focus management
- Screen reader optimization
- Color contrast compliance
- Touch target optimization

### Testing
- Automated accessibility audits
- Manual screen reader testing
- Keyboard-only navigation testing
- Color contrast validation

## Deployment

### Build Process
```bash
npm run build
```

### Environment Variables
Create `.env.local` for local development:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm run start
```

3. Run performance checks:
```bash
npm run performance:ci
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Monitoring and Maintenance

### Performance Monitoring
- Real-time performance dashboard
- Core Web Vitals tracking
- Bundle size monitoring
- Memory usage tracking

### Accessibility Monitoring
- Automated WCAG compliance checks
- Screen reader testing
- Keyboard navigation testing
- User feedback collection

### Error Handling
- Comprehensive error boundaries
- Graceful degradation
- User-friendly error messages
- Error reporting and logging

## Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with tests
3. Run quality checks: `npm run check`
4. Run tests: `npm run test`
5. Check performance: `npm run performance:check`
6. Submit pull request

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component composition patterns
- Accessibility first approach

### Testing Standards
- Unit tests for all components
- Integration tests for workflows
- E2E tests for user stories
- Accessibility testing
- Performance testing

## Troubleshooting

### Common Issues

#### Performance Issues
- Check bundle size: `npm run performance:check`
- Monitor Core Web Vitals
- Optimize images and assets
- Review component rendering

#### Accessibility Issues
- Run accessibility audit: Check dashboard in development
- Validate ARIA attributes
- Test keyboard navigation
- Check color contrast

#### Build Issues
- Clear Next.js cache: `rm -rf .next`
- Clear node modules: `rm -rf node_modules package-lock.json`
- Reinstall dependencies: `npm install`
- Check TypeScript errors: `npm run type-check`

### Getting Help
- Review this documentation
- Check component examples
- Run tests for guidance
- Monitor performance dashboard
- Check accessibility audit results

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with modern web standards and best practices
- Accessibility guidelines from WCAG 2.1
- Performance insights from Web.dev
- Testing patterns from Testing Library
- Component patterns from Tailwind CSS