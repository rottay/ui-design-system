/**
 * @fileoverview The hover / press / focus triad is decided once (WO-ARC-02).
 *
 * The defect this pins: both interactive engines re-implemented these four
 * booleans, they disagreed on what a press means, and the modern Button raised
 * `data-focus-visible` on ANY focus — so clicking it with a mouse drew a
 * keyboard affordance.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { partAttributes, serializeState } from '../../../kernel/anatomy';
import { useInteractionState } from '..';

function Probe({ disabled = false }: { disabled?: boolean }) {
  const { state, handlers } = useInteractionState({ disabled });
  return (
    <button type="button" disabled={disabled} {...partAttributes('trigger', state)} {...handlers}>
      probe
    </button>
  );
}

const trigger = () => screen.getByRole('button', { name: 'probe' });

describe('serializeState', () => {
  it('is absent, not empty, when nothing is active', () => {
    // `[data-state]` must not match a part at rest.
    expect(serializeState({})).toBeUndefined();
    expect(serializeState({ hovered: false, pressed: false })).toBeUndefined();
  });

  it('serializes a token list a skin can match with [data-state~=...]', () => {
    expect(serializeState({ hovered: true, pressed: true })).toBe('hovered pressed');
  });

  it('spells focusVisible the way CSS does', () => {
    expect(serializeState({ focusVisible: true })).toBe('focus-visible');
  });
});

describe('the part carries its own state on the DOM', () => {
  it('rests with a part name and no state attribute', () => {
    render(<Probe />);
    expect(trigger()).toHaveAttribute('data-part', 'trigger');
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('hovers, and un-hovers', () => {
    render(<Probe />);
    fireEvent.pointerEnter(trigger());
    expect(trigger().getAttribute('data-state')).toContain('hovered');
    fireEvent.pointerLeave(trigger());
    expect(trigger()).not.toHaveAttribute('data-state');
  });

  it('presses, and releases', () => {
    render(<Probe />);
    fireEvent.pointerDown(trigger());
    expect(trigger().getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(trigger());
    expect(trigger().getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('cancels the press when the pointer leaves mid-press', () => {
    // The click will not fire, so the part must stop painting as if it will.
    render(<Probe />);
    fireEvent.pointerDown(trigger());
    fireEvent.pointerLeave(trigger());
    expect(trigger().getAttribute('data-state') ?? '').not.toContain('pressed');
  });
});

describe('a focus ring is a keyboard affordance', () => {
  it('does not ring when focus arrives from a pointer press', () => {
    render(<Probe />);
    fireEvent.pointerDown(trigger());
    fireEvent.focus(trigger());

    const state = trigger().getAttribute('data-state') ?? '';
    expect(state, 'a mouse click drew a focus ring').not.toContain('focus-visible');
    expect(state).toContain('focused');
  });

  it('rings when focus arrives without a pointer', () => {
    render(<Probe />);
    fireEvent.focus(trigger());
    expect(trigger().getAttribute('data-state')).toContain('focus-visible');
  });

  it('drops the ring on blur', () => {
    render(<Probe />);
    fireEvent.focus(trigger());
    fireEvent.blur(trigger());
    expect(trigger()).not.toHaveAttribute('data-state');
  });
});

describe('a disabled part reports nothing', () => {
  it('never hovers, presses, or rings', () => {
    render(<Probe disabled />);
    fireEvent.pointerEnter(trigger());
    fireEvent.pointerDown(trigger());
    fireEvent.focus(trigger());

    const state = trigger().getAttribute('data-state') ?? '';
    expect(state).toBe('disabled');
  });
});
