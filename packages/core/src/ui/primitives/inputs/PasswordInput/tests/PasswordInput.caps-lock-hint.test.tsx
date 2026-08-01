import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernPasswordInput from '../engines/modern';

/**
 * New-contract coverage for `capsLockHint` (default true). Non-regression
 * for the rest of the family lives in `PasswordInput.modern-engine.test.tsx`
 * (untouched).
 *
 * `getModifierState` cannot be overridden through `fireEvent`'s event-init
 * object: React wraps the native event in a SyntheticEvent whose own
 * `getModifierState` reads the real (unpressed, jsdom) modifier state and
 * ignores extra properties attached to the init object. A prototype spy on
 * `KeyboardEvent.prototype.getModifierState` is what the engine's handler
 * actually observes.
 */
describe('Modern PasswordInput caps-lock hint', () => {
  let modifierState: boolean;

  beforeEach(() => {
    modifierState = false;
    vi.spyOn(window.KeyboardEvent.prototype, 'getModifierState').mockImplementation(
      (key: string) => key === 'CapsLock' && modifierState
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('appears on a Caps Lock keydown and disappears once released', () => {
    render(<ModernPasswordInput defaultValue="abc" />);
    const control = screen.getByDisplayValue('abc');

    expect(screen.queryByRole('status')).toBeNull();

    modifierState = true;
    fireEvent.keyDown(control, { key: 'CapsLock' });
    const hint = screen.getByRole('status');
    expect(hint).toHaveTextContent('Caps Lock is on');
    expect(hint).toHaveAttribute('data-part', 'caps-lock-hint');
    expect(hint).toHaveAttribute('aria-live', 'polite');

    modifierState = false;
    fireEvent.keyUp(control, { key: 'CapsLock' });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('is suppressed while an error is visible, even with Caps Lock on -- the error wins', () => {
    render(<ModernPasswordInput defaultValue="abc" error errorMessage="Too short" />);
    const control = screen.getByDisplayValue('abc');

    modifierState = true;
    fireEvent.keyDown(control, { key: 'CapsLock' });
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });

  it('never renders when capsLockHint is false', () => {
    render(<ModernPasswordInput defaultValue="abc" capsLockHint={false} />);
    const control = screen.getByDisplayValue('abc');

    modifierState = true;
    fireEvent.keyDown(control, { key: 'CapsLock' });
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('clears on blur', () => {
    render(<ModernPasswordInput defaultValue="abc" />);
    const control = screen.getByDisplayValue('abc');

    modifierState = true;
    fireEvent.keyDown(control, { key: 'CapsLock' });
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.blur(control);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('resets on a new focus session until the next keyboard signal proves otherwise', () => {
    render(<ModernPasswordInput defaultValue="abc" />);
    const control = screen.getByDisplayValue('abc');

    modifierState = true;
    fireEvent.keyDown(control, { key: 'CapsLock' });
    expect(screen.getByRole('status')).toBeInTheDocument();

    fireEvent.blur(control);
    fireEvent.focus(control);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
