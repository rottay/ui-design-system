import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernOTPInput from '../engines/modern';

/**
 * OTPInput modern advanced coverage (K4-D Pass 1): direct modern-engine
 * behavior that the legacy mocked OTPInput.test.tsx cannot reach -- paste
 * distribution, backspace retreat, arrow navigation, type filtering, masking,
 * controlled sync, id/name prefixes, and the error anatomy hooks. Mirrors
 * Mentions.modern-engine-advanced.test.tsx.
 */
describe('OTPInput modern advanced coverage', () => {
  it('auto-advances on entry, fires onComplete when full, and retreats on backspace', () => {
    const handleChange = vi.fn();
    const handleComplete = vi.fn();
    render(<ModernOTPInput length={4} onChange={handleChange} onComplete={handleComplete} />);

    const slot0 = screen.getByLabelText('Digit 1 of 4');
    const slot1 = screen.getByLabelText('Digit 2 of 4');
    fireEvent.change(slot0, { target: { value: '5' } });
    expect(handleChange).toHaveBeenCalledWith('5');
    expect(document.activeElement).toBe(slot1);

    // Pasting distributes from the first slot and completes the code.
    fireEvent.paste(slot1, { clipboardData: { getData: () => '6789' } });
    expect(handleChange).toHaveBeenCalledWith('6789');
    expect(handleComplete).toHaveBeenCalledWith('6789');
    expect(document.activeElement).toBe(screen.getByLabelText('Digit 4 of 4'));

    // Backspace on a filled slot clears just that slot.
    const slot3 = screen.getByLabelText('Digit 4 of 4') as HTMLInputElement;
    fireEvent.keyDown(slot3, { key: 'Backspace' });
    expect(handleChange).toHaveBeenLastCalledWith('678');
    expect(slot3.value).toBe('');

    // Backspace on an already-empty slot clears and focuses the previous one.
    fireEvent.keyDown(slot3, { key: 'Backspace' });
    expect(handleChange).toHaveBeenLastCalledWith('67');
    expect(document.activeElement).toBe(screen.getByLabelText('Digit 3 of 4'));
  });

  it('moves focus laterally with ArrowLeft/ArrowRight and rejects invalid characters', () => {
    const handleChange = vi.fn();
    render(<ModernOTPInput length={3} type="numeric" onChange={handleChange} />);

    const slot0 = screen.getByLabelText('Digit 1 of 3');
    const slot1 = screen.getByLabelText('Digit 2 of 3');
    fireEvent.keyDown(slot1, { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(slot0);
    fireEvent.keyDown(slot0, { key: 'ArrowRight' });
    expect(document.activeElement).toBe(slot1);

    // Numeric type rejects letters outright.
    fireEvent.change(slot0, { target: { value: 'a' } });
    expect(handleChange).not.toHaveBeenCalled();
    fireEvent.change(slot0, { target: { value: '7' } });
    expect(handleChange).toHaveBeenCalledWith('7');
  });

  it('accepts letters in alphanumeric mode and masks slots as password fields', () => {
    const handleChange = vi.fn();
    render(<ModernOTPInput length={2} type="alphanumeric" mask onChange={handleChange} />);

    const slot0 = screen.getByLabelText('Digit 1 of 2');
    expect(slot0).toHaveAttribute('type', 'password');
    fireEvent.change(slot0, { target: { value: 'b' } });
    expect(handleChange).toHaveBeenCalledWith('b');
  });

  it('syncs a controlled value across rerenders and honors id/name-shaped prefixes', () => {
    const { rerender } = render(<ModernOTPInput length={4} value="12" id="code" onChange={() => {}} />);
    expect((screen.getByLabelText('Digit 1 of 4') as HTMLInputElement).value).toBe('1');
    expect((screen.getByLabelText('Digit 3 of 4') as HTMLInputElement).value).toBe('');
    expect(screen.getByLabelText('Digit 1 of 4')).toHaveAttribute('id', 'code-0');
    expect(screen.getByLabelText('Digit 4 of 4')).toHaveAttribute('id', 'code-3');

    rerender(<ModernOTPInput length={4} value="9876" id="code" onChange={() => {}} />);
    expect((screen.getByLabelText('Digit 4 of 4') as HTMLInputElement).value).toBe('6');
  });

  it('stamps error + size hooks and renders the error message anatomy', () => {
    const { container } = render(
      <ModernOTPInput length={6} size="lg" error errorMessage="Invalid code" disabled onChange={() => {}} />
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-disabled', 'true');

    const slot = container.querySelector('[data-part="slot"]') as HTMLElement;
    expect(slot).toHaveAttribute('data-error', 'true');
    expect(slot).toBeDisabled();

    expect(container.querySelector('[data-part="error-message"]')).toHaveTextContent('Invalid code');
  });

  it('focuses the first slot on mount when autoFocus is set', () => {
    render(<ModernOTPInput length={4} autoFocus onChange={() => {}} />);
    expect(document.activeElement).toBe(screen.getByLabelText('Digit 1 of 4'));
  });

  const codeOnScreen = (length: number): string =>
    Array.from({ length }, (_, i) =>
      (screen.getByLabelText(`Digit ${i + 1} of ${length}`) as HTMLInputElement).value
    ).join('');

  it('does not display a character the controlled parent refused to accept', () => {
    const handleChange = vi.fn();
    render(<ModernOTPInput length={4} value="12" onChange={handleChange} />);

    const slot3 = screen.getByLabelText('Digit 3 of 4') as HTMLInputElement;
    fireEvent.change(slot3, { target: { value: '9' } });

    expect(handleChange).toHaveBeenCalledWith('129');
    expect(slot3.value).toBe('');
    expect(codeOnScreen(4)).toBe('12');
  });

  it('does not retain a backspace the controlled parent refused to accept', () => {
    const handleChange = vi.fn();
    render(<ModernOTPInput length={4} value="12" onChange={handleChange} />);

    const slot2 = screen.getByLabelText('Digit 2 of 4') as HTMLInputElement;
    fireEvent.keyDown(slot2, { key: 'Backspace' });

    expect(handleChange).toHaveBeenCalledWith('1');
    expect(slot2.value).toBe('2');
    expect(codeOnScreen(4)).toBe('12');
  });

  it('renders the parent-committed value when the controlled parent accepts', () => {
    const { rerender } = render(<ModernOTPInput length={4} value="12" onChange={() => {}} />);

    fireEvent.change(screen.getByLabelText('Digit 3 of 4'), { target: { value: '9' } });
    rerender(<ModernOTPInput length={4} value="129" onChange={() => {}} />);

    expect(codeOnScreen(4)).toBe('129');
  });
});


describe('OTPInput modern public binding props', () => {
  it('names the first slot from caller references and retains every prefix and later positional name', () => {
    render(
      <>
        <span id="code-label">Security code</span><span id="code-help">From your device.</span>
        <ModernOTPInput length={2} id="security" name="secret" aria-label="Caller code"
          aria-labelledby="code-label" aria-describedby="code-help" aria-invalid="grammar" />
      </>
    );
    const first = screen.getByRole('textbox', { name: 'Security code' });
    const second = screen.getByRole('textbox', { name: 'Digit 2 of 2' });
    expect(first).toHaveAttribute('id', 'security-0');
    expect(first).toHaveAttribute('name', 'secret-0');
    expect(first).toHaveAttribute('aria-label', 'Caller code');
    expect(second).toHaveAttribute('id', 'security-1');
    expect(second).toHaveAttribute('name', 'secret-1');
    const slots = [first, second];
    for (const slot of slots) {
      expect(slot).toHaveAccessibleDescription('From your device.');
      expect(slot).toHaveAttribute('aria-invalid', 'grammar');
    }
  });

  it('keeps own error semantics when external validation clears and removes only the own message on recovery', () => {
    const field = (error: boolean) => (
      <><span id="otp-context">Caller context.</span>
        <ModernOTPInput length={2} id="recover" error={error} errorMessage="Code error."
          aria-describedby="otp-context" aria-invalid={false} /></>
    );
    const { rerender } = render(field(true));
    const first = screen.getByLabelText('Digit 1 of 2');
    expect(first).toHaveAttribute('aria-invalid', 'true');
    expect(first).toHaveAccessibleDescription('Code error. Caller context.');
    rerender(field(false));
    expect(first).toHaveAttribute('aria-invalid', 'false');
    expect(first).toHaveAccessibleDescription('Caller context.');
    expect(document.getElementById('recover-error')).toBeNull();
  });
});
