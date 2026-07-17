/**
 * Link Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Link } from '..';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('@/infrastructure/runtime/engines/presentation/component-factory', () => ({
  createEngineComponent: () => {
    const MockLink = ({ children, href, type, disabled, underline, external, ...props }: any) => (
      <a
        data-testid="link"
        data-type={type}
        data-disabled={disabled}
        data-underline={underline}
        data-external={external}
        href={disabled ? undefined : href}
        {...props}
      >
        {children}
      </a>
    );
    MockLink.displayName = 'Link';
    return MockLink;
  },
}));

describe('Link', () => {
  it('renders correctly', () => {
    render(<Link href="/test">Test Link</Link>);
    expect(screen.getByTestId('link')).toBeInTheDocument();
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('renders with href', () => {
    render(<Link href="/about">About</Link>);
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', '/about');
  });

  it.each(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const)(
    'renders type %s',
    (type) => {
      render(<Link href="/test" type={type}>Test</Link>);
      expect(screen.getByTestId('link')).toHaveAttribute('data-type', type);
    }
  );

  it('renders disabled state', () => {
    render(<Link href="/test" disabled>Disabled Link</Link>);
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('data-disabled', 'true');
    expect(link).not.toHaveAttribute('href');
  });

  it('renders without underline', () => {
    render(<Link href="/test" underline={false}>No Underline</Link>);
    expect(screen.getByTestId('link')).toHaveAttribute('data-underline', 'false');
  });

  it('renders external link', () => {
    render(<Link href="https://example.com" external>External</Link>);
    expect(screen.getByTestId('link')).toHaveAttribute('data-external', 'true');
  });

  it('applies custom className', () => {
    render(<Link href="/test" className="custom-class">Test</Link>);
    expect(screen.getByTestId('link')).toHaveClass('custom-class');
  });

  it('passes style prop to component', () => {
    const customStyle = { color: 'red' };
    render(<Link href="/test" style={customStyle}>Test</Link>);
    expect(screen.getByTestId('link')).toBeInTheDocument();
  });

  it('handles click event', () => {
    const handleClick = vi.fn();
    render(
      <Link
        href="/test"
        onClick={(event) => {
          event.preventDefault();
          handleClick();
        }}
      >
        Click Me
      </Link>
    );
    fireEvent.click(screen.getByTestId('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('Link engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Link engine={engine} href="/test">Test</Link>);
    expect(screen.getByTestId('link')).toBeInTheDocument();
  });
});

describe('Link tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Link href="/test">Test</Link>);
    expect(screen.getByTestId('link')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
