# Testing Guide

This guide covers the npm-based testing setup for the DFS Manager Portal.

## Overview

The project uses Jest as the testing framework with TypeScript support, providing a robust testing environment for React components, utilities, and services.

## Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output (shows individual test names)
npm run test:ui
```

## Test Structure

Tests are organized using the following conventions:

### File Naming
- `*.test.ts` - Unit tests for TypeScript files
- `*.test.tsx` - Component tests for React components
- `*.spec.ts` - Specification tests (alternative naming)
- `**/__tests__/**/*.ts` - Tests in dedicated test directories

### Directory Structure
```
src/
├── components/
│   └── Welcome.test.tsx         # Component tests
├── services/
│   └── __tests__/
│       └── UserService.test.ts  # Service tests
└── utils/
    ├── example.ts               # Example utilities
    └── example.test.ts          # Utility tests
```

## Example Tests

### Unit Tests
See `src/utils/example.test.ts` for examples of:
- Simple function testing
- Data transformation testing
- Edge case handling
- Error condition testing

### Component Tests
See `src/components/Welcome.test.tsx` for examples of:
- Rendering tests
- Props testing
- User interaction testing
- Accessibility testing

### Integration Tests
See `src/services/__tests__/UserService.test.ts` for examples of:
- Service workflow testing
- Data manipulation testing
- Business logic testing

## Configuration

### Jest Configuration
The Jest configuration is defined in `jest.config.mjs`:
- Uses TypeScript preset (`ts-jest`)
- Configured for React components (`jsdom` environment)
- Path mapping support for `@/*` imports
- CSS module mocking
- Coverage collection setup

### TypeScript Configuration
Testing-specific TypeScript configuration in `tsconfig.test.json`:
- Extends main application config
- Enables `esModuleInterop` for better compatibility
- Includes Jest and Testing Library types

## Testing Best Practices

### 1. Test Structure
Use the AAA pattern (Arrange, Act, Assert):
```typescript
it('should format currency correctly', () => {
  // Arrange
  const amount = 123.45;
  
  // Act
  const result = formatCurrency(amount);
  
  // Assert
  expect(result).toBe('$123.45');
});
```

### 2. Descriptive Test Names
Write test names that clearly describe what is being tested:
```typescript
// Good
it('should return empty array when input is empty')

// Bad
it('should work')
```

### 3. Test Edge Cases
Always test edge cases and error conditions:
```typescript
describe('unique function', () => {
  it('should handle empty array', () => {
    expect(unique([])).toEqual([]);
  });
  
  it('should handle array with duplicates', () => {
    expect(unique([1, 1, 2, 2])).toEqual([1, 2]);
  });
});
```

### 4. Mock External Dependencies
Use Jest mocks for external dependencies:
```typescript
jest.mock('../services/apiService');
```

### 5. Component Testing
For React components, test behavior not implementation:
```typescript
// Test what the user sees
expect(screen.getByText('Hello, World!')).toBeInTheDocument();

// Not internal state or props directly
```

## Continuous Integration

The project includes a CI workflow (`.github/workflows/ci.yml`) that:
1. Installs dependencies
2. Runs linting
3. Performs type checking
4. Executes all tests
5. Builds the application
6. Uploads coverage reports

## Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

View the HTML coverage report by opening `coverage/lcov-report/index.html` in your browser.

## Troubleshooting

### Common Issues

1. **Module resolution errors**: Ensure path mappings in `jest.config.mjs` match your `tsconfig.json`
2. **React import errors**: Use `import * as React from 'react'` for compatibility
3. **CSS module errors**: CSS imports are automatically mocked by `identity-obj-proxy`
4. **DOM API errors**: Global mocks are set up in `src/setupTests.ts`

### Adding New Tests

1. Create test files following naming conventions
2. Import necessary testing utilities
3. Write descriptive test suites and cases
4. Run tests frequently during development
5. Ensure good coverage of critical code paths

## Migration from Deno

The project has been migrated from Deno to npm-based testing:
- Removed Deno CI workflow
- Added Jest configuration and dependencies
- Created example tests demonstrating the setup
- Updated CI to use npm test commands

This provides better integration with the existing Node.js/npm ecosystem and more mature tooling for React component testing.