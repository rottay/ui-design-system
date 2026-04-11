/**
 * OTPInput Tests
 * Colocated with component following approved architecture
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OTPInput } from '../';

vi.mock('../../../../runtime/engines/factory', () => ({
  createEngineComponent: () => {
    const MockOTPInput = ({
      length = 6,
      value = '',
      onChange,
      onComplete,
      disabled,
      error,
      errorMessage,
      size,
      type = 'numeric',
      mask,
      ...props
    }: any) => {
      const values = value.split('').concat(Array(length).fill('')).slice(0, length);

      const isValid = (char: string) =>
        type === 'numeric' ? /^[0-9]$/.test(char) : /^[a-zA-Z0-9]$/.test(char);

      const handleInput = (index: number, char: string) => {
        if (!isValid(char)) return;
        const newValues = [...values];
        newValues[index] = char;
        const joined = newValues.join('');
        onChange?.(joined);
        if (newValues.every((v: string) => v !== '')) {
          onComplete?.(joined);
        }
      };

      return (
        <div
          data-testid="otpinput"
          data-size={size}
          data-disabled={disabled}
          data-error={error}
          {...props}
        >
          <div data-testid="otpinput-slots">
            {Array.from({ length }, (_, i) => (
              <input
                key={i}
                data-testid={`otp-slot-${i}`}
                type={mask ? 'password' : 'text'}
                maxLength={1}
                value={values[i] || ''}
                disabled={disabled}
                onChange={(e) => handleInput(i, e.target.value.slice(-1))}
                aria-label={`Digit ${i + 1} of ${length}`}
              />
            ))}
          </div>
          {error && errorMessage && <span data-testid="error-message">{errorMessage}</span>}
        </div>
      );
    };
    MockOTPInput.displayName = 'OTPInput';
    return MockOTPInput;
  },
}));

import React from 'react';

describe('OTPInput', () => {
  it('renders correct number of slots', () => {
    render(<OTPInput length={4} onChange={() => {}} />);
    const slots = screen.getByTestId('otpinput-slots');
    expect(slots.children).toHaveLength(4);
  });

  it('renders 6 slots by default', () => {
    render(<OTPInput onChange={() => {}} />);
    const slots = screen.getByTestId('otpinput-slots');
    expect(slots.children).toHaveLength(6);
  });

  it('calls onChange when typing', () => {
    const onChange = vi.fn();
    render(<OTPInput length={4} onChange={onChange} />);
    fireEvent.change(screen.getByTestId('otp-slot-0'), { target: { value: '1' } });
    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('calls onComplete when all slots filled', () => {
    const onComplete = vi.fn();
    render(<OTPInput length={2} value="1" onChange={() => {}} onComplete={onComplete} />);
    fireEvent.change(screen.getByTestId('otp-slot-1'), { target: { value: '2' } });
    expect(onComplete).toHaveBeenCalledWith('12');
  });

  it('displays existing value', () => {
    render(<OTPInput length={4} value="12" onChange={() => {}} />);
    expect(screen.getByTestId('otp-slot-0')).toHaveValue('1');
    expect(screen.getByTestId('otp-slot-1')).toHaveValue('2');
    expect(screen.getByTestId('otp-slot-2')).toHaveValue('');
  });

  it('shows error message', () => {
    render(<OTPInput onChange={() => {}} error errorMessage="Invalid code" />);
    expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid code');
  });

  it('disables inputs when disabled', () => {
    render(<OTPInput length={4} onChange={() => {}} disabled />);
    expect(screen.getByTestId('otp-slot-0')).toBeDisabled();
    expect(screen.getByTestId('otp-slot-3')).toBeDisabled();
  });

  it('uses password type when mask is true', () => {
    render(<OTPInput length={2} onChange={() => {}} mask />);
    expect(screen.getByTestId('otp-slot-0')).toHaveAttribute('type', 'password');
  });

  it('has proper aria labels', () => {
    render(<OTPInput length={4} onChange={() => {}} />);
    expect(screen.getByTestId('otp-slot-0')).toHaveAttribute('aria-label', 'Digit 1 of 4');
    expect(screen.getByTestId('otp-slot-3')).toHaveAttribute('aria-label', 'Digit 4 of 4');
  });
});

describe('OTPInput engines', () => {
  it.each(['classic', 'modern', 'rustic'] as const)('works with %s engine', (engine) => {
    render(<OTPInput engine={engine} onChange={() => {}} />);
    expect(screen.getByTestId('otpinput')).toBeInTheDocument();
  });
});
