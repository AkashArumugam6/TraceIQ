# Contributing to TraceIQ Frontend

Thank you for your interest in contributing to TraceIQ! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of React, Next.js, and TypeScript

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/traceiq-frontend.git
   cd traceiq-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Start the backend server** (in a separate terminal)
   ```bash
   cd ../backend
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

#### TypeScript
- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` type - use specific types instead
- Use strict mode settings

#### React/Next.js
- Use functional components with hooks
- Prefer `const` over `let` when possible
- Use proper dependency arrays in useEffect
- Follow Next.js App Router conventions

#### Styling
- Use Tailwind CSS for all styling
- Follow the established design system
- Use semantic class names
- Maintain consistent spacing and colors

#### Component Structure
```tsx
// 1. Imports (external, internal, types)
import React from 'react'
import { Card } from './ui/Card'
import { ComponentProps } from '@/types'

// 2. Interface definitions
interface MyComponentProps {
  title: string
  onAction: () => void
}

// 3. Component definition
export function MyComponent({ title, onAction }: MyComponentProps) {
  // 4. Hooks
  const [state, setState] = useState(false)
  
  // 5. Event handlers
  const handleClick = () => {
    onAction()
  }
  
  // 6. Render
  return (
    <Card>
      <h2>{title}</h2>
      <button onClick={handleClick}>Action</button>
    </Card>
  )
}
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `AnomalyDetailsModal.tsx`)
- **Pages**: lowercase with hyphens (e.g., `anomalies/page.tsx`)
- **Utilities**: camelCase (e.g., `formatTimestamp.ts`)
- **Types**: PascalCase (e.g., `Anomaly.ts`)

### Directory Structure

```
components/
├── ui/                    # Base UI components
├── [FeatureName].tsx      # Feature-specific components
└── index.ts              # Re-exports

lib/
├── graphql/              # GraphQL operations
├── utils/                # Utility functions
└── apollo-client.ts      # Apollo configuration

types/
└── index.ts              # Type definitions
```

## 🎨 Design System

### Color Usage
```tsx
// Severity colors
const severityColors = {
  CRITICAL: 'text-red-600 bg-red-100',
  HIGH: 'text-orange-600 bg-orange-100',
  MEDIUM: 'text-yellow-600 bg-yellow-100',
  LOW: 'text-green-600 bg-green-100'
}

// Status colors
const statusColors = {
  OPEN: 'bg-red-100 text-red-800',
  INVESTIGATING: 'bg-yellow-100 text-yellow-800',
  FALSE_POSITIVE: 'bg-gray-100 text-gray-800',
  RESOLVED: 'bg-green-100 text-green-800'
}
```

### Component Patterns

#### Card Component
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>
```

#### Button Variants
```tsx
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
```

#### Loading States
```tsx
{loading ? (
  <LoadingSkeleton className="h-32 w-full" />
) : (
  <ActualContent />
)}
```

## 🧪 Testing

### Writing Tests

#### Component Tests
```tsx
import { render, screen } from '@testing-library/react'
import { AnomalyCard } from './AnomalyCard'

describe('AnomalyCard', () => {
  it('renders anomaly information correctly', () => {
    const anomaly = {
      id: '1',
      severity: 'HIGH',
      reason: 'Suspicious activity detected'
    }
    
    render(<AnomalyCard anomaly={anomaly} />)
    
    expect(screen.getByText('Suspicious activity detected')).toBeInTheDocument()
    expect(screen.getByText('HIGH')).toBeInTheDocument()
  })
})
```

#### Integration Tests
```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { AnomaliesTable } from './AnomaliesTable'

describe('AnomaliesTable', () => {
  it('loads and displays anomalies', async () => {
    const mocks = [
      {
        request: {
          query: GET_ANOMALIES,
          variables: { limit: 15, offset: 0 }
        },
        result: {
          data: {
            anomalies: {
              anomalies: [mockAnomaly]
            }
          }
        }
      }
    ]
    
    render(
      <MockedProvider mocks={mocks}>
        <AnomaliesTable />
      </MockedProvider>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Suspicious activity')).toBeInTheDocument()
    })
  })
})
```

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📝 Pull Request Process

### Before Submitting

1. **Check your code**
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

2. **Test your changes**
   - Test on different screen sizes
   - Test with different data states
   - Test accessibility with keyboard navigation

3. **Update documentation**
   - Update README if needed
   - Add JSDoc comments for new functions
   - Update type definitions

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

### Review Process

1. **Automated Checks**
   - Linting passes
   - Type checking passes
   - Tests pass
   - Build succeeds

2. **Manual Review**
   - Code quality and style
   - Functionality and edge cases
   - Performance implications
   - Accessibility compliance

3. **Approval**
   - At least one approval required
   - All conversations resolved
   - CI checks passing

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues
2. Test with latest version
3. Clear browser cache
4. Check browser console for errors

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

## Additional Context
Any other context about the problem
```

## ✨ Feature Requests

### Before Requesting

1. Check existing feature requests
2. Consider if it fits the project scope
3. Think about implementation complexity

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Any other context or screenshots
```

## 🎯 Good First Issues

Look for issues labeled with:
- `good first issue`
- `help wanted`
- `beginner friendly`

These are typically:
- Small bug fixes
- Documentation improvements
- Simple UI enhancements
- Test additions

## 📚 Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react)

### Tools
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Testing Library](https://testing-library.com/docs)
- [Storybook](https://storybook.js.org/docs)

## 🤝 Community

- **Discord**: Join our community server
- **GitHub Discussions**: Ask questions and share ideas
- **Code Reviews**: Help review other contributors' PRs
- **Documentation**: Help improve our docs

## 📄 License

By contributing to TraceIQ, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TraceIQ! 🎉
