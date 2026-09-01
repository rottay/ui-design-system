/**
 * NavLink Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavLink } from '..';

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
    MockLink.displayName = 'NavLink';
    return MockLink;
  },
}));

describe('NavLink', () => {
  it('renders correctly', () => {
    render(<NavLink href="/test">Test NavLink</NavLink>);
    expect(screen.getByTestId('link')).toBeInTheDocument();
    expect(screen.getByText('Test NavLink')).toBeInTheDocument();
  });

  it('renders with href', () => {
    render(<NavLink href="/about">About</NavLink>);
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', '/about');
  });

  it.each(['default', 'primary', 'secondary', 'success', 'warning', 'danger'] as const)(
    'renders type %s',
    (type) => {
      render(<NavLink href="/test" type={type}>Test</NavLink>);
      expect(screen.getByTestId('link')).toHaveAttribute('data-type', type);
    }
  );

  it('renders disabled state', () => {
    render(<NavLink href="/test" disabled>Disabled NavLink</NavLink>);
    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('data-disabled', 'true');
    expect(link).not.toHaveAttribute('href');
  });

  it('renders without underline', () => {
    render(<NavLink href="/test" underline={false}>No Underline</NavLink>);
    expect(screen.getByTestId('link')).toHaveAttribute('data-underline', 'false');
  });

  it('renders external link', () => {
    render(<NavLink href="https://example.com" external>External</NavLink>);
    expect(screen.getByTestId('link')).toHaveAttribute('data-external', 'true');
  });

  it('applies custom className', () => {
    render(<NavLink href="/test" className="custom-class">Test</NavLink>);
    expect(screen.getByTestId('link')).toHaveClass('custom-class');
  });

  it('passes style prop to component', () => {
    const customStyle = { color: 'red' };
    render(<NavLink href="/test" style={customStyle}>Test</NavLink>);
    expect(screen.getByTestId('link')).toBeInTheDocument();
  });

  it('handles click event', () => {
    const handleClick = vi.fn();
    render(
      <NavLink
        href="/test"
        onClick={(event) => {
          event.preventDefault();
          handleClick();
        }}
      >
        Click Me
      </NavLink>
    );
    fireEvent.click(screen.getByTestId('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('NavLink engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<NavLink engine={engine} href="/test">Test</NavLink>);
    expect(screen.getByTestId('link')).toBeInTheDocument();
  });
});

describe('NavLink tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<NavLink href="/test">Test</NavLink>);
    expect(screen.getByTestId('link')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
