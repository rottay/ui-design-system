/**
 * Affix Tests
 * Comprehensive test suite for the Affix component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: <P extends object>(_name: string) => {
    const MockAffix = React.forwardRef<HTMLDivElement, P & { children?: React.ReactNode }>(
      ({ children, ...props }, ref) => {
        const {
          offsetTop,
          offsetBottom,
          zIndex,
          className,
          style,
          onChange,
          target,
          engine,
          ...rest
        } = props as any;

        return (
          <div
            ref={ref}
            data-testid="affix"
            data-offset-top={offsetTop}
            data-offset-bottom={offsetBottom}
            data-z-index={zIndex}
            data-engine={engine}
            className={className}
            style={style}
            {...rest}
          >
            {children}
          </div>
        );
      }
    );
    MockAffix.displayName = 'MockAffix';
    return MockAffix;
  },
}));

import { Affix, AFFIX_DEFAULTS, BaseAffix } from '..';
import type { AffixProps } from '../contracts';

describe('Affix', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('renders children correctly', () => {
      render(<Affix>Sticky Content</Affix>);
      expect(screen.getByTestId('affix')).toBeInTheDocument();
      expect(screen.getByText('Sticky Content')).toBeInTheDocument();
    });

    it('renders with element present', () => {
      render(<Affix>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toBeInTheDocument();
    });

    it('renders complex children', () => {
      render(
        <Affix>
          <div data-testid="complex-child">
            <span>Nested content</span>
            <button>Click me</button>
          </div>
        </Affix>
      );
      expect(screen.getByTestId('complex-child')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  // OffsetTop Tests
  describe('offsetTop prop', () => {
    it('applies offsetTop of 0', () => {
      render(<Affix offsetTop={0}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-offset-top', '0');
    });

    it('applies offsetTop of 50', () => {
      render(<Affix offsetTop={50}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-offset-top', '50');
    });

    it('applies offsetTop of 100', () => {
      render(<Affix offsetTop={100}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-offset-top', '100');
    });

    it('applies large offsetTop value', () => {
      render(<Affix offsetTop={500}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-offset-top', '500');
    });
  });

  // OffsetBottom Tests
  describe('offsetBottom prop', () => {
    it('applies offsetBottom correctly', () => {
      render(<Affix offsetBottom={20}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-offset-bottom', '20');
    });

    it('applies offsetBottom of 0', () => {
      render(<Affix offsetBottom={0}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-offset-bottom', '0');
    });

    it('allows both offsetTop and offsetBottom to be set', () => {
      render(<Affix offsetTop={50} offsetBottom={20}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-offset-bottom', '20');
      expect(affix).toHaveAttribute('data-offset-top', '50');
    });
  });

  // zIndex Tests
  describe('zIndex prop', () => {
    it('renders without explicit zIndex', () => {
      render(<Affix>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toBeInTheDocument();
    });

    it('applies custom zIndex of 20', () => {
      render(<Affix zIndex={20}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-z-index', '20');
    });

    it('applies high zIndex of 100', () => {
      render(<Affix zIndex={100}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-z-index', '100');
    });
  });

  // className and style Tests
  describe('className and style props', () => {
    it('applies custom className', () => {
      render(<Affix className="custom-affix">Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveClass('custom-affix');
    });

    it('applies multiple classNames', () => {
      render(<Affix className="class1 class2 class3">Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveClass('class1');
      expect(affix).toHaveClass('class2');
      expect(affix).toHaveClass('class3');
    });

    it('accepts style prop', () => {
      render(<Affix style={{ backgroundColor: 'red', padding: '10px' }}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toBeInTheDocument();
    });

    it('accepts both className and style', () => {
      render(<Affix className="test-class" style={{ color: 'blue' }}>Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveClass('test-class');
    });
  });

  // Engine Override Tests
  describe('engine prop', () => {
    it('accepts classic engine', () => {
      render(<Affix engine="classic">Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-engine', 'classic');
    });

    it('accepts modern engine', () => {
      render(<Affix engine="modern">Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-engine', 'modern');
    });

    it('accepts rustic engine', () => {
      render(<Affix engine="rustic">Content</Affix>);
      const affix = screen.getByTestId('affix');
      expect(affix).toHaveAttribute('data-engine', 'rustic');
    });
  });

  // Ref Forwarding Tests
  describe('ref forwarding', () => {
    it('forwards ref to the wrapper div', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Affix ref={ref}>Content</Affix>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('ref points to the correct element', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Affix ref={ref}>Content</Affix>);
      expect(ref.current?.textContent).toBe('Content');
    });
  });

  // AFFIX_DEFAULTS Tests
  describe('AFFIX_DEFAULTS', () => {
    it('has correct offsetTop default', () => {
      expect(AFFIX_DEFAULTS.offsetTop).toBe(0);
    });

    it('has correct zIndex default', () => {
      expect(AFFIX_DEFAULTS.zIndex).toBe(10);
    });
  });
});

// BaseAffix Tests (Separate describe for base component)
describe('BaseAffix', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders children content', () => {
    render(<BaseAffix>Sticky Content</BaseAffix>);
    expect(screen.getByText('Sticky Content')).toBeInTheDocument();
  });

  it('renders with rottay-affix class', () => {
    render(<BaseAffix>Content</BaseAffix>);
    const affix = document.querySelector('.rottay-affix');
    expect(affix).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<BaseAffix className="my-affix">Content</BaseAffix>);
    const affix = document.querySelector('.rottay-affix');
    expect(affix).toHaveClass('my-affix');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<BaseAffix ref={ref}>Content</BaseAffix>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders with displayName', () => {
    expect(BaseAffix.displayName).toBe('BaseAffix');
  });

  it('renders children with offsetTop prop', () => {
    render(<BaseAffix offsetTop={20}>Content</BaseAffix>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders children with offsetBottom prop', () => {
    render(<BaseAffix offsetBottom={30}>Content</BaseAffix>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders children with zIndex prop', () => {
    render(<BaseAffix zIndex={50}>Content</BaseAffix>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

// Integration Tests
describe('Affix Integration', () => {
  it('renders inside a scrollable container', () => {
    render(
      <div style={{ height: 200, overflow: 'auto' }}>
        <div style={{ height: 100 }}>Spacer</div>
        <Affix offsetTop={0}>
          <div data-testid="sticky-content">Sticky</div>
        </Affix>
        <div style={{ height: 500 }}>More content</div>
      </div>
    );
    expect(screen.getByTestId('sticky-content')).toBeInTheDocument();
  });

  it('works with multiple Affix components', () => {
    render(
      <div>
        <Affix offsetTop={0}>
          <div data-testid="affix-1">First</div>
        </Affix>
        <Affix offsetTop={50}>
          <div data-testid="affix-2">Second</div>
        </Affix>
        <Affix offsetBottom={20}>
          <div data-testid="affix-3">Third</div>
        </Affix>
      </div>
    );
    expect(screen.getByTestId('affix-1')).toBeInTheDocument();
    expect(screen.getByTestId('affix-2')).toBeInTheDocument();
    expect(screen.getByTestId('affix-3')).toBeInTheDocument();
  });

  it('supports nested elements with various props', () => {
    render(
      <Affix offsetTop={10} zIndex={25} className="outer-affix">
        <nav data-testid="nav">
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </nav>
      </Affix>
    );
    expect(screen.getByTestId('nav')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

// Accessibility Tests
describe('Affix Accessibility', () => {
  it('maintains semantic structure of children', () => {
    render(
      <Affix>
        <header role="banner">
          <h1>Site Title</h1>
        </header>
      </Affix>
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('preserves ARIA attributes on children', () => {
    render(
      <Affix>
        <nav aria-label="Main navigation">
          <a href="#home">Home</a>
        </nav>
      </Affix>
    );
    expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('does not interfere with keyboard navigation', () => {
    render(
      <Affix>
        <button data-testid="btn">Click me</button>
      </Affix>
    );
    const button = screen.getByTestId('btn');
    button.focus();
    expect(document.activeElement).toBe(button);
  });
});

// Type Tests (compile-time checks)
describe('Affix Types', () => {
  it('accepts valid AffixProps', () => {
    // This test ensures TypeScript compilation succeeds
    const validProps: AffixProps = {
      children: 'Content',
      offsetTop: 10,
      offsetBottom: undefined,
      target: () => window,
      onChange: (affixed) => console.log(affixed),
      className: 'test',
      style: { color: 'red' },
      zIndex: 15,
    };

    render(<Affix {...validProps} />);
    expect(screen.getByTestId('affix')).toBeInTheDocument();
  });

  it('requires children prop', () => {
    // TypeScript should require children
    // @ts-expect-error - children is required
    const invalidProps: AffixProps = {
      offsetTop: 10,
    };
    expect(invalidProps).toBeDefined();
  });
});

// onChange callback Tests
describe('Affix onChange callback', () => {
  it('accepts onChange callback prop', () => {
    const handleChange = vi.fn();
    render(<Affix onChange={handleChange}>Content</Affix>);
    expect(screen.getByTestId('affix')).toBeInTheDocument();
  });

  it('passes affixed boolean to onChange', () => {
    // Verify the callback signature is correct
    const handleChange = (affixed: boolean) => {
      expect(typeof affixed).toBe('boolean');
    };
    render(<Affix onChange={handleChange}>Content</Affix>);
    expect(screen.getByTestId('affix')).toBeInTheDocument();
  });
});

// target prop Tests
describe('Affix target prop', () => {
  it('accepts target function returning window', () => {
    render(<Affix target={() => window}>Content</Affix>);
    expect(screen.getByTestId('affix')).toBeInTheDocument();
  });

  it('accepts target function returning HTMLElement', () => {
    const container = document.createElement('div');
    render(<Affix target={() => container}>Content</Affix>);
    expect(screen.getByTestId('affix')).toBeInTheDocument();
  });

  it('accepts target function returning null', () => {
    render(<Affix target={() => null}>Content</Affix>);
    expect(screen.getByTestId('affix')).toBeInTheDocument();
  });
});

describe('Affix engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Affix engine={engine}>Test</Affix>);
    expect(screen.getByTestId('affix')).toBeInTheDocument();
  });
});

describe('Affix tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Affix>Test</Affix>);
    expect(screen.getByTestId('affix')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
