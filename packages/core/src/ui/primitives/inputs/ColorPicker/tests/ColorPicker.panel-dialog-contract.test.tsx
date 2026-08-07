/**
 * Panel disclosure contract for the modern ColorPicker.
 *
 * The trigger has always advertised `aria-haspopup="dialog"` and toggled
 * `aria-expanded`, but the surface it opened was an anonymous `<div>`: no
 * dialog role, no name, and no `aria-controls` tying the two together. Escape
 * already returned focus to the trigger while nothing ever moved focus INTO
 * the panel, and the hex field's error message named the problem without the
 * field pointing at it.
 *
 * @module ColorPicker/tests
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernColorPicker from '../engines/modern';

const trigger = () => document.querySelector('[data-part="trigger"]') as HTMLElement;

describe('ColorPicker modern panel dialog contract', () => {
  it('opens a named dialog the trigger points at', () => {
    render(<ModernColorPicker defaultValue="#1677ff" />);
    fireEvent.click(trigger());

    const panel = screen.getByRole('dialog');
    expect(panel).toHaveAccessibleName('Color picker panel');
    expect(trigger()).toHaveAttribute('aria-controls', panel.id);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('claims no panel while closed', () => {
    render(<ModernColorPicker defaultValue="#1677ff" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger()).not.toHaveAttribute('aria-controls');
  });

  it('moves focus into the panel on a keyboard open and back out on Escape', () => {
    render(<ModernColorPicker defaultValue="#1677ff" />);
    const disclosure = trigger();
    disclosure.focus();

    fireEvent.keyDown(disclosure, { key: 'Enter' });
    const panel = screen.getByRole('dialog');
    expect(panel.contains(document.activeElement)).toBe(true);

    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(disclosure);
  });

  it('does not steal focus when the pointer opens the panel', () => {
    render(<ModernColorPicker defaultValue="#1677ff" />);
    fireEvent.click(trigger());

    const panel = screen.getByRole('dialog');
    expect(panel.contains(document.activeElement)).toBe(false);
  });

  it('describes the hex field with its own validation message', () => {
    render(<ModernColorPicker defaultValue="#1677ff" />);
    fireEvent.click(trigger());

    const hex = screen.getByLabelText('Hex color');
    expect(hex).not.toHaveAttribute('aria-describedby');

    fireEvent.change(hex, { target: { value: '#zz' } });
    expect(hex).toHaveAttribute('aria-invalid', 'true');
    expect(hex).toHaveAccessibleDescription('Enter a valid hex color (e.g. #1677ff)');
  });
});
