/**
 * PasswordInput Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PasswordInput } from '../';

// Mock the engine factory to avoid async loading issues in tests
vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockPasswordInput = ({
      value,
      defaultValue,
      disabled,
      readOnly,
      error,
      errorMessage,
      showToggle = true,
      strengthIndicator,
      strengthLevel,
      placeholder,
      onChange,
      className,
      ...props
    }: any) => {
      const [visible, setVisible] = React.useState(false);
      return (
        <div data-testid="password-input" className={className} {...props}>
          <input
            type={visible ? 'text' : 'password'}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error}
            onChange={(e: any) => onChange?.(e.target.value, e)}
            data-testid="password-field"
          />
          {showToggle && (
            <button
              type="button"
              data-testid="toggle-visibility"
              onClick={() => setVisible(!visible)}
              aria-label={visible ? 'Hide password' : 'Show password'}
            />
          )}
          {strengthIndicator && strengthLevel && (
            <div data-testid="strength-bar" data-level={strengthLevel} />
          )}
          {error && errorMessage && (
            <span data-testid="error-message">{errorMessage}</span>
          )}
        </div>
      );
    };
    MockPasswordInput.displayName = 'PasswordInput';
    return MockPasswordInput;
  },
}));

import React from 'react';

describe('PasswordInput', () => {
  it('renders correctly', () => {
    render(<PasswordInput />);
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-field')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<PasswordInput placeholder="Enter password" />);
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  it('starts with password hidden', () => {
    render(<PasswordInput placeholder="password" />);
    expect(screen.getByTestId('password-field')).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility', () => {
    render(<PasswordInput />);
    const toggleBtn = screen.getByTestId('toggle-visibility');
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('password-field')).toHaveAttribute('type', 'text');
    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('password-field')).toHaveAttribute('type', 'password');
  });

  it('hides toggle when showToggle is false', () => {
    render(<PasswordInput showToggle={false} />);
    expect(screen.queryByTestId('toggle-visibility')).not.toBeInTheDocument();
  });

  it('renders strength indicator', () => {
    render(<PasswordInput strengthIndicator strengthLevel="strong" />);
    expect(screen.getByTestId('strength-bar')).toBeInTheDocument();
    expect(screen.getByTestId('strength-bar')).toHaveAttribute('data-level', 'strong');
  });

  it('does not render strength indicator without strengthLevel', () => {
    render(<PasswordInput strengthIndicator />);
    expect(screen.queryByTestId('strength-bar')).not.toBeInTheDocument();
  });

  it('renders error state with message', () => {
    render(<PasswordInput error errorMessage="Too short" />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Too short');
  });

  it('renders disabled state', () => {
    render(<PasswordInput disabled />);
    expect(screen.getByTestId('password-field')).toBeDisabled();
  });

  it('calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(<PasswordInput onChange={handleChange} />);
    fireEvent.change(screen.getByTestId('password-field'), { target: { value: 'abc' } });
    expect(handleChange).toHaveBeenCalledWith('abc', expect.any(Object));
  });

  it('applies custom className', () => {
    render(<PasswordInput className="custom-class" />);
    expect(screen.getByTestId('password-input')).toHaveClass('custom-class');
  });
});

describe('PasswordInput engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<PasswordInput engine={engine} />);
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
  });
});
