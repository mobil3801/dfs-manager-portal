import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';

// Example component for testing
const Welcome: React.FC<{ name?: string }> = ({ name = 'World' }) => {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Welcome to the DFS Manager Portal</p>
    </div>
  );
};

describe('Welcome Component', () => {
  it('should render with default name', () => {
    render(<Welcome />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    expect(screen.getByText('Welcome to the DFS Manager Portal')).toBeInTheDocument();
  });

  it('should render with custom name', () => {
    render(<Welcome name="John" />);
    expect(screen.getByText('Hello, John!')).toBeInTheDocument();
  });

  it('should have proper heading structure', () => {
    render(<Welcome name="React" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Hello, React!');
  });
});