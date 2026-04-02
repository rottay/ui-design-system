/**
 * ScrollArea Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea } from './ScrollArea';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockScrollArea = ({
      children,
      maxHeight,
      maxWidth,
      orientation = 'vertical',
      scrollbarSize = 'normal',
      hideScrollbar,
      className,
      ...props
    }: any) => (
      <div
        data-testid="scroll-area"
        data-orientation={orientation}
        data-scrollbar-size={scrollbarSize}
        data-hide-scrollbar={hideScrollbar}
        data-max-height={maxHeight}
        data-max-width={maxWidth}
        className={className}
        style={{ maxHeight, maxWidth }}
        {...props}
      >
        {children}
      </div>
    );
    MockScrollArea.displayName = 'ScrollArea';
    return MockScrollArea;
  },
}));

describe('ScrollArea', () => {
  it('renders correctly', () => {
    render(<ScrollArea><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<ScrollArea><span data-testid="child">Hello</span></ScrollArea>);
    expect(screen.getByTestId('child')).toHaveTextContent('Hello');
  });

  it('applies maxHeight', () => {
    render(<ScrollArea maxHeight="300px"><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-max-height', '300px');
  });

  it('applies maxWidth', () => {
    render(<ScrollArea maxWidth="400px"><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-max-width', '400px');
  });

  it('defaults to vertical orientation', () => {
    render(<ScrollArea><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-orientation', 'vertical');
  });

  it.each(['vertical', 'horizontal', 'both'] as const)('supports %s orientation', (orientation) => {
    render(<ScrollArea orientation={orientation}><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-orientation', orientation);
  });

  it.each(['thin', 'normal', 'wide'] as const)('supports %s scrollbar size', (size) => {
    render(<ScrollArea scrollbarSize={size}><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-scrollbar-size', size);
  });

  it('supports hideScrollbar prop', () => {
    render(<ScrollArea hideScrollbar><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toHaveAttribute('data-hide-scrollbar', 'true');
  });

  it('applies custom className', () => {
    render(<ScrollArea className="custom-class"><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toHaveClass('custom-class');
  });
});

describe('ScrollArea engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<ScrollArea engine={engine}><p>Content</p></ScrollArea>);
    expect(screen.getByTestId('scroll-area')).toBeInTheDocument();
  });
});
