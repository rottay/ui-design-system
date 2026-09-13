/**
 * @fileoverview A button inside a text field reports its own interaction state and never takes focus from the field on press.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { partAttributes } from '../../../kernel/anatomy';
import { useFieldAction } from '..';

function Field({ disabled = false }: { disabled?: boolean }) {
  const { state, handlers } = useFieldAction({ disabled });
  return (
    <div>
      <input aria-label="Query" />
      <button type="button" aria-label="Clear" disabled={disabled} {...partAttributes('clear-button', state)} {...handlers} />
    </div>
  );
}

describe('useFieldAction', () => {
  it('keeps focus in the field when the pointer presses the action', () => {
    render(<Field />);
    const field = screen.getByRole('textbox', { name: 'Query' });
    const clear = screen.getByRole('button', { name: 'Clear' });
    field.focus();
    const press = fireEvent.pointerDown(clear);
    expect(press).toBe(false);
    expect(clear.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(clear);
    expect(clear.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('reports a Space press from the keyboard and a hover from the pointer', () => {
    render(<Field />);
    const clear = screen.getByRole('button', { name: 'Clear' });
    fireEvent.keyDown(clear, { key: ' ' });
    expect(clear.getAttribute('data-state')).toContain('pressed');
    fireEvent.keyUp(clear, { key: ' ' });
    fireEvent.pointerEnter(clear);
    expect(clear.getAttribute('data-state')).toContain('hovered');
  });

  it('reports nothing for a disabled action', () => {
    render(<Field disabled />);
    const clear = screen.getByRole('button', { name: 'Clear' });
    fireEvent.pointerEnter(clear);
    expect(clear.getAttribute('data-state')).not.toContain('hovered');
  });
});
