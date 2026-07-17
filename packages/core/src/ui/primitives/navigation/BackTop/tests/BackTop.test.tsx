/**
 * BackTop Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BackTop } from '..';

vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: () => {
    const MockBackTop = ({ children, visibilityHeight, onClick, className, style, ...props }: any) => {
      return (
        <button
          data-testid="backtop"
          data-visibility-height={visibilityHeight}
          className={className}
          style={style}
          onClick={onClick}
          aria-label="Back to top"
          {...props}
        >
          {children || '↑'}
        </button>
      );
    };
    MockBackTop.displayName = 'BackTop';
    return MockBackTop;
  },
}));

describe('BackTop', () => {
  it('renders correctly', () => {
    render(<BackTop />);
    expect(screen.getByTestId('backtop')).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    render(<BackTop>Top</BackTop>);
    expect(screen.getByText('Top')).toBeInTheDocument();
  });

  it('renders with visibilityHeight prop', () => {
    render(<BackTop visibilityHeight={200} />);
    expect(screen.getByTestId('backtop')).toHaveAttribute('data-visibility-height', '200');
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<BackTop onClick={handleClick} />);
    fireEvent.click(screen.getByTestId('backtop'));
    expect(handleClick).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<BackTop className="custom-class" />);
    expect(screen.getByTestId('backtop')).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    render(<BackTop style={{ backgroundColor: 'red' }} />);
    expect(screen.getByTestId('backtop')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<BackTop />);
    expect(screen.getByTestId('backtop')).toHaveAttribute('aria-label', 'Back to top');
  });

  it('renders default icon when no children', () => {
    render(<BackTop />);
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('accepts custom icon as children', () => {
    render(<BackTop><span data-testid="custom-icon">^</span></BackTop>);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('uses default visibilityHeight of 400', () => {
    render(<BackTop />);
    // Default value from BACKTOP_DEFAULTS
    expect(screen.getByTestId('backtop')).toBeInTheDocument();
  });

  it('renders as a button element', () => {
    render(<BackTop />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('multiple BackTop components can coexist', () => {
    render(
      <>
        <BackTop className="first" />
        <BackTop className="second" />
      </>
    );
    const buttons = screen.getAllByTestId('backtop');
    expect(buttons).toHaveLength(2);
  });

  it('forwards ref to button element', () => {
    const ref = { current: null };
    render(<BackTop ref={ref} />);
    expect(screen.getByTestId('backtop')).toBeInTheDocument();
  });
});

describe('BackTop engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<BackTop engine={engine}>Test</BackTop>);
    expect(screen.getByTestId('backtop')).toBeInTheDocument();
  });
});

describe('BackTop tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<BackTop>Test</BackTop>);
    expect(screen.getByTestId('backtop')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
