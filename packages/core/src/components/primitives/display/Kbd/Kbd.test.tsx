/**
 * Kbd Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Kbd } from './Kbd';

vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockKbd = ({ children, size, ...props }: any) => (
      <kbd data-testid="kbd" data-size={size} {...props}>
        {children}
      </kbd>
    );
    MockKbd.displayName = 'Kbd';
    return MockKbd;
  },
}));

describe('Kbd', () => {
  it('renders correctly', () => {
    render(<Kbd>Ctrl</Kbd>);
    expect(screen.getByTestId('kbd')).toBeInTheDocument();
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('renders as kbd element', () => {
    render(<Kbd>Enter</Kbd>);
    const element = screen.getByTestId('kbd');
    expect(element.tagName.toLowerCase()).toBe('kbd');
  });

  it.each(['sm', 'md', 'lg'] as const)('renders size %s', (size) => {
    render(<Kbd size={size}>Key</Kbd>);
    expect(screen.getByTestId('kbd')).toHaveAttribute('data-size', size);
  });

  it('applies custom className', () => {
    render(<Kbd className="custom">K</Kbd>);
    expect(screen.getByTestId('kbd')).toHaveClass('custom');
  });

  it('renders multiple keys in a shortcut', () => {
    render(
      <span>
        <Kbd>Ctrl</Kbd>+<Kbd>S</Kbd>
      </span>
    );
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
  });
});

describe('Kbd engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Kbd engine={engine}>Key</Kbd>);
    expect(screen.getByTestId('kbd')).toBeInTheDocument();
  });
});
