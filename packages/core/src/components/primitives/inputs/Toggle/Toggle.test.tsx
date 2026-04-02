/**
 * Toggle Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from './';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockToggle = ({
      checked,
      defaultChecked,
      disabled,
      loading,
      size,
      color,
      label,
      description,
      checkedLabel,
      uncheckedLabel,
      onChange,
      children,
      ...props
    }: any) => (
      <label
        data-testid="toggle"
        data-size={size}
        data-color={color}
        data-disabled={disabled}
        data-loading={loading}
        data-checked={checked}
        {...props}
      >
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled || loading}
          onChange={(e) => {
            if (!disabled && !loading) {
              onChange?.(e.target.checked, e);
            }
          }}
          aria-checked={checked}
          data-testid="toggle-input"
        />
        {checkedLabel && <span data-testid="checked-label">{checkedLabel}</span>}
        {uncheckedLabel && <span data-testid="unchecked-label">{uncheckedLabel}</span>}
        {(label || children) && <span data-testid="toggle-label">{label || children}</span>}
        {description && <span data-testid="toggle-description">{description}</span>}
        {loading && <span data-testid="toggle-loading">Loading...</span>}
      </label>
    );
    MockToggle.displayName = 'Toggle';
    return MockToggle;
  },
}));

describe('Toggle', () => {
  it('renders correctly', () => {
    render(<Toggle />);
    expect(screen.getByTestId('toggle')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders with label text', () => {
    render(<Toggle label="Enable notifications" />);
    expect(screen.getByTestId('toggle-label')).toHaveTextContent('Enable notifications');
  });

  it('renders with children as label', () => {
    render(<Toggle>Dark mode</Toggle>);
    expect(screen.getByTestId('toggle-label')).toHaveTextContent('Dark mode');
  });

  it('renders with description', () => {
    render(<Toggle label="Feature" description="Enable this feature" />);
    expect(screen.getByTestId('toggle-description')).toHaveTextContent('Enable this feature');
  });

  it('renders unchecked by default', () => {
    render(<Toggle />);
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('renders checked when checked prop is true', () => {
    render(<Toggle checked />);
    expect(screen.getByRole('switch')).toBeChecked();
  });

  it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders size %s', (size) => {
    render(<Toggle size={size} />);
    expect(screen.getByTestId('toggle')).toHaveAttribute('data-size', size);
  });

  it.each(['default', 'primary', 'secondary', 'success', 'warning', 'error'] as const)(
    'renders color variant %s',
    (color) => {
      render(<Toggle color={color} />);
      expect(screen.getByTestId('toggle')).toHaveAttribute('data-color', color);
    }
  );

  it('renders disabled state', () => {
    render(<Toggle disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.getByTestId('toggle')).toHaveAttribute('data-disabled', 'true');
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(<Toggle disabled onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders loading state', () => {
    render(<Toggle loading />);
    expect(screen.getByTestId('toggle')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('toggle-loading')).toBeInTheDocument();
  });

  it('disables input when loading', () => {
    render(<Toggle loading />);
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Toggle onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('renders checked and unchecked labels', () => {
    render(<Toggle checkedLabel="ON" uncheckedLabel="OFF" />);
    expect(screen.getByTestId('checked-label')).toHaveTextContent('ON');
    expect(screen.getByTestId('unchecked-label')).toHaveTextContent('OFF');
  });

  it('applies custom className', () => {
    render(<Toggle className="custom-class" />);
    expect(screen.getByTestId('toggle')).toHaveClass('custom-class');
  });
});

describe('Toggle engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<Toggle engine={engine} />);
    expect(screen.getByTestId('toggle')).toBeInTheDocument();
  });
});

describe('Toggle tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Toggle />);
    expect(screen.getByTestId('toggle')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
