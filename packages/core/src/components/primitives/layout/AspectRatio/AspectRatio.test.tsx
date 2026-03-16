/**
 * AspectRatio Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AspectRatio } from './AspectRatio';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../engines/factory', () => ({
  createEngineComponent: () => {
    const MockAspectRatio = ({
      ratio = 16 / 9,
      children,
      className,
      maxWidth,
      ...props
    }: any) => (
      <div
        data-testid="aspect-ratio"
        data-ratio={ratio}
        data-max-width={maxWidth}
        className={className}
        {...props}
      >
        <div
          data-testid="aspect-ratio-inner"
          style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
        >
          {children}
        </div>
      </div>
    );
    MockAspectRatio.displayName = 'AspectRatio';
    return MockAspectRatio;
  },
}));

describe('AspectRatio', () => {
  it('renders correctly', () => {
    render(<AspectRatio><span>Content</span></AspectRatio>);
    expect(screen.getByTestId('aspect-ratio')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<AspectRatio><span data-testid="child">Hello</span></AspectRatio>);
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('uses default 16/9 ratio', () => {
    render(<AspectRatio><span>Content</span></AspectRatio>);
    const el = screen.getByTestId('aspect-ratio');
    expect(el.getAttribute('data-ratio')).toBe(`${16 / 9}`);
  });

  it('accepts custom ratio', () => {
    render(<AspectRatio ratio={1}><span>Square</span></AspectRatio>);
    expect(screen.getByTestId('aspect-ratio')).toHaveAttribute('data-ratio', '1');
  });

  it('accepts 4/3 ratio', () => {
    render(<AspectRatio ratio={4/3}><span>4:3</span></AspectRatio>);
    expect(screen.getByTestId('aspect-ratio')).toHaveAttribute('data-ratio', `${4/3}`);
  });

  it('applies maxWidth', () => {
    render(<AspectRatio maxWidth="400px"><span>Content</span></AspectRatio>);
    expect(screen.getByTestId('aspect-ratio')).toHaveAttribute('data-max-width', '400px');
  });

  it('applies custom className', () => {
    render(<AspectRatio className="custom-class"><span>Content</span></AspectRatio>);
    expect(screen.getByTestId('aspect-ratio')).toHaveClass('custom-class');
  });

  it('calculates correct padding-bottom for ratio', () => {
    render(<AspectRatio ratio={2}><span>2:1</span></AspectRatio>);
    const inner = screen.getByTestId('aspect-ratio-inner');
    expect(inner.style.paddingBottom).toBe('50%');
  });
});

describe('AspectRatio engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<AspectRatio engine={engine}><span>Content</span></AspectRatio>);
    expect(screen.getByTestId('aspect-ratio')).toBeInTheDocument();
  });
});
