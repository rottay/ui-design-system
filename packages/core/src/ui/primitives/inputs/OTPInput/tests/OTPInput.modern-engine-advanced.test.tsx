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

  it('stamps error + size hooks and renders the error wrapper anatomy', () => {
    const { container } = render(
      <ModernOTPInput length={6} size="lg" error errorMessage="Invalid code" disabled onChange={() => {}} />
    );

    const root = container.querySelector('[data-part="root"]') as HTMLElement;
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root).toHaveAttribute('data-disabled', 'true');

    const slot = container.querySelector('[data-part="slot"]') as HTMLElement;
    expect(slot).toHaveAttribute('data-error', 'true');
    expect(slot).toBeDisabled();

    expect(container.querySelector('[data-part="error-wrapper"]')).not.toBeNull();
    expect(container.querySelector('[data-part="error-message"]')).toHaveTextContent('Invalid code');
  });

  it('focuses the first slot on mount when autoFocus is set', () => {
    render(<ModernOTPInput length={4} autoFocus onChange={() => {}} />);
    expect(document.activeElement).toBe(screen.getByLabelText('Digit 1 of 4'));
  });
});
