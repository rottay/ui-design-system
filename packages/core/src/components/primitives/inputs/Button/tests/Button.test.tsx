/**
 * Button Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockButton = ({
      children,
      size,
      variant,
      disabled,
      loading,
      danger,
      block,
      shape,
      icon,
      onClick,
      htmlType = 'button',
      ...props
    }: any) => (
      <button
        data-testid="button"
        data-size={size}
        data-variant={variant}
        data-shape={shape}
        data-loading={loading}
        data-danger={danger}
        data-block={block}
        disabled={disabled || loading}
        type={htmlType}
        onClick={onClick}
        {...props}
      >
        {loading && <span data-testid="loading-spinner">Loading...</span>}
        {icon && <span data-testid="button-icon">{icon}</span>}
        {children}
      </button>
    );
    MockButton.displayName = 'Button';
    return MockButton;
  },
}));

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not trigger click when disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<Button size={size}>Test</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', size);
  });

  it.each(['primary', 'secondary', 'outline', 'ghost', 'link', 'danger', 'default', 'text', 'dashed'] as const)(
    'renders variant %s',
    (variant) => {
      render(<Button variant={variant}>Test</Button>);
      expect(screen.getByTestId('button')).toHaveAttribute('data-variant', variant);
    }
  );

  it.each(['default', 'round', 'circle'] as const)('renders shape %s', (shape) => {
    render(<Button shape={shape}>Test</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-shape', shape);
  });

  it('renders loading state', () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByTestId('button')).toBeDisabled();
  });

  it('renders danger variant', () => {
    render(<Button danger>Delete</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-danger', 'true');
  });

  it('renders block button', () => {
    render(<Button block>Full Width</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-block', 'true');
  });

  it('renders with icon', () => {
    render(<Button icon={<span>★</span>}>With Icon</Button>);
    expect(screen.getByTestId('button-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByTestId('button')).toHaveClass('custom-class');
  });

  it('sets correct htmlType', () => {
    render(<Button htmlType="submit">Submit</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('type', 'submit');
  });

  it('sets default htmlType to button', () => {
    render(<Button>Default</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('type', 'button');
  });
});

describe('Button.Group', () => {
  it('renders multiple buttons', () => {
    render(
      <Button.Group>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </Button.Group>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});

describe('Button.Icon', () => {
  it('renders icon button', () => {
    render(<Button.Icon icon={<span>★</span>} aria-label="Star" />);
    expect(screen.getByRole('button', { name: 'Star' })).toBeInTheDocument();
    expect(screen.getByText('★')).toBeInTheDocument();
  });
});

describe('Button engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Button engine={engine}>Test</Button>);
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });
});

describe('Button tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Button>Test</Button>);
    expect(screen.getByTestId('button')).toBeInTheDocument();
  });
});

describe('Button engine x tenant matrix', () => {
  const engines = ['classic', 'modern', 'rustic'] as const;
  const tenants = ['rottay', 'bithire', 'default'] as const;

  engines.forEach((engine) => {
    tenants.forEach((tenant) => {
      it(`renders with ${engine} engine and ${tenant} tenant`, () => {
        document.documentElement.setAttribute('data-tenant', tenant);
        render(<Button engine={engine}>Matrix Test</Button>);
        expect(screen.getByTestId('button')).toBeInTheDocument();
        expect(screen.getByText('Matrix Test')).toBeInTheDocument();
      });
    });
  });
});

describe('Button engine-specific behavior', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('%s engine handles click events', (engine) => {
    const handleClick = vi.fn();
    render(<Button engine={engine} onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it.each(['classic', 'modern', 'rustic'] as const)('%s engine respects disabled state', (engine) => {
    const handleClick = vi.fn();
    render(<Button engine={engine} onClick={handleClick} disabled>Disabled</Button>);
    fireEvent.click(screen.getByTestId('button'));
    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByTestId('button')).toBeDisabled();
  });

  it.each(['classic', 'modern', 'rustic'] as const)('%s engine applies size prop', (engine) => {
    render(<Button engine={engine} size="lg">Large</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-size', 'lg');
  });

  it.each(['classic', 'modern', 'rustic'] as const)('%s engine applies variant prop', (engine) => {
    render(<Button engine={engine} variant="primary">Primary</Button>);
    expect(screen.getByTestId('button')).toHaveAttribute('data-variant', 'primary');
  });
});
