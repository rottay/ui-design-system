/**
 * Switch Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../../core/engines/factory', () => ({
  createEngineComponent: () => {
    const MockSwitch = ({
      checked,
      defaultChecked,
      disabled,
      loading,
      size,
      checkedChildren,
      unCheckedChildren,
      onChange,
      onClick,
      className,
      ...props
    }: any) => (
      <button
        data-testid="switch"
        data-size={size}
        data-checked={checked}
        data-disabled={disabled}
        data-loading={loading}
        role="switch"
        aria-checked={String(checked ?? defaultChecked ?? false)}
        disabled={disabled || loading}
        className={className}
        onClick={(e) => {
          if (!disabled && !loading) {
            const newChecked = !(checked ?? defaultChecked);
            onChange?.(newChecked);
            onClick?.(newChecked, e);
          }
        }}
        {...props}
      >
        {checkedChildren && <span data-testid="checked-children">{checkedChildren}</span>}
        {unCheckedChildren && <span data-testid="unchecked-children">{unCheckedChildren}</span>}
        {loading && <span data-testid="switch-loading">Loading...</span>}
      </button>
    );
    MockSwitch.displayName = 'Switch';
    return MockSwitch;
  },
}));

describe('Switch', () => {
  it('renders correctly', () => {
    render(<Switch />);
    expect(screen.getByTestId('switch')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders unchecked by default', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders checked when checked prop is true', () => {
    render(<Switch checked />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByTestId('switch')).toHaveAttribute('data-checked', 'true');
  });

  it('renders checked when defaultChecked is true', () => {
    render(<Switch defaultChecked />);
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
  });

  it.each(['small', 'default'] as const)('renders size %s', (size) => {
    render(<Switch size={size} />);
    expect(screen.getByTestId('switch')).toHaveAttribute('data-size', size);
  });

  it('renders disabled state', () => {
    render(<Switch disabled />);
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.getByTestId('switch')).toHaveAttribute('data-disabled', 'true');
  });

  it('does not call onChange when disabled', () => {
    const handleChange = vi.fn();
    render(<Switch disabled onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders loading state', () => {
    render(<Switch loading />);
    expect(screen.getByTestId('switch')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('switch-loading')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeDisabled();
  });

  it('does not call onChange when loading', () => {
    const handleChange = vi.fn();
    render(<Switch loading onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Switch onChange={handleChange} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Switch onClick={handleClick} />);
    fireEvent.click(screen.getByRole('switch'));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('renders checked and unchecked children', () => {
    render(<Switch checkedChildren="ON" unCheckedChildren="OFF" />);
    expect(screen.getByTestId('checked-children')).toHaveTextContent('ON');
    expect(screen.getByTestId('unchecked-children')).toHaveTextContent('OFF');
  });

  it('applies custom className', () => {
    render(<Switch className="custom-class" />);
    expect(screen.getByTestId('switch')).toHaveClass('custom-class');
  });
});

describe('Switch engines', () => {
  it.each(['titan', 'hermes', 'apollo'] as const)('works with %s engine', (engine) => {
    render(<Switch engine={engine} />);
    expect(screen.getByTestId('switch')).toBeInTheDocument();
  });
});

describe('Switch tenants', () => {
  it.each(['rottay', 'bithire', 'default'] as const)('renders with %s tenant', (tenant) => {
    document.documentElement.setAttribute('data-tenant', tenant);
    render(<Switch />);
    expect(screen.getByTestId('switch')).toBeInTheDocument();
    document.documentElement.removeAttribute('data-tenant');
  });
});
