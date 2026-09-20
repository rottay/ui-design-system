/**
 * The runtime producer behind every resize edge's state paint.
 *
 * Splitter's gutter and the widget-board's edges both decide hover, press and
 * the focus ring through `:is([data-state~='x'], :x)` (F-37), but neither of
 * them renders the node: this primitive does. Only the pseudo-class arm was
 * ever live on the gutter, because an owner that hands down `anatomy` has
 * nothing to decide the triad with. This pins the producer here -- and pins
 * the two contracts that make it safe to share: the owner's `anatomy` keeps
 * the last word, and the owner's `preventDefault()` on pointerdown cannot
 * swallow the press.
 */

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';

import { ResizeHandle } from '..';

afterEach(cleanup);

const renderHandle = (
  props: Partial<React.ComponentProps<typeof ResizeHandle>> = {}
): HTMLElement => {
  const { container } = render(
    <ResizeHandle
      orientation="vertical"
      label="Resize panels"
      min={0}
      max={100}
      value={50}
      anatomy={{ 'data-part': 'gutter', 'data-resizable': 'true' }}
      {...props}
    />
  );
  // The handle IS the rendered root; querying by part would miss the tests
  // that hand it a different anatomy.
  return container.firstElementChild as HTMLElement;
};

describe('ResizeHandle state stamp', () => {
  it('says nothing at rest, so resting paint is unchanged', () => {
    expect(renderHandle().hasAttribute('data-state')).toBe(false);
  });

  it('stamps the pointer triad and clears it on leave', () => {
    const node = renderHandle();

    fireEvent.pointerEnter(node);
    expect(node.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerDown(node);
    expect(node.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(node);
    expect(node.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerLeave(node);
    expect(node.hasAttribute('data-state')).toBe(false);
  });

  it('unlatches a press the pointer capture swallowed the pointerup for', () => {
    const node = renderHandle();

    // While capture is held the boundary events stop arriving, so `pointerup`
    // and `pointercancel` are the only press boundaries a dragged edge has.
    fireEvent.pointerEnter(node);
    fireEvent.pointerDown(node);
    expect(node.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerCancel(node);
    expect(node.getAttribute('data-state')).toBe('hovered');
  });

  it('stamps the focus ring on a keyboard focus and clears it on blur', () => {
    const node = renderHandle();

    fireEvent.focus(node);
    expect(node.getAttribute('data-state')).toContain('focus-visible');
    fireEvent.blur(node);
    expect(node.hasAttribute('data-state')).toBe(false);
  });

  it('withholds the focus ring from the owner\'s own pointer-drag focus', () => {
    const node = renderHandle({
      // Splitter's shape: `preventDefault()` swallows the native focus move, so
      // the owner focuses the separator itself mid-gesture.
      onPointerDown: (event) => {
        event.preventDefault();
        (event.currentTarget as HTMLElement).focus();
      },
    });

    fireEvent.pointerDown(node);
    fireEvent.focus(node);
    expect(node.getAttribute('data-state')).toContain('focused');
    expect(node.getAttribute('data-state')).not.toContain('focus-visible');
  });

  it('runs the kernel BEFORE an owner that prevents the default on pointerdown', () => {
    const onPointerDown = vi.fn((event: React.PointerEvent) => event.preventDefault());
    const node = renderHandle({ onPointerDown });

    fireEvent.pointerDown(node);
    // Composed the other way round, the owner's `preventDefault()` would stop
    // the chain and the press would never be decided.
    expect(node.getAttribute('data-state')).toContain('pressed');
    expect(onPointerDown).toHaveBeenCalledTimes(1);
  });

  it('never synthesizes a press from the keyboard', () => {
    const node = renderHandle({ onAdjust: vi.fn() });

    fireEvent.focus(node);
    for (const key of ['Enter', ' ', 'ArrowRight', 'Home']) {
      fireEvent.keyDown(node, { key });
      fireEvent.keyUp(node, { key });
    }
    // A `div[role='separator']` never takes `:active` from the keyboard, so the
    // twin must not paint a press the pseudo-class arm never had.
    expect(node.getAttribute('data-state')).not.toContain('pressed');
  });

  it('leaves the anatomy the owner passed verbatim, including its own state', () => {
    // The widget-board's shape: it hosts the kernel itself and hands the
    // serialized state down. The primitive must not take that word back.
    const node = renderHandle({
      anatomy: {
        'data-part': 'resize-handle',
        'data-state': 'hovered',
        'data-edge': 'block-end',
      },
    });

    fireEvent.focus(node);
    expect(node.getAttribute('data-state')).toBe('hovered');
    expect(node.getAttribute('data-part')).toBe('resize-handle');
    expect(node.getAttribute('data-edge')).toBe('block-end');
  });

  it('stamps a pointer-only hit area too, because `operable` is not a disabled flag', () => {
    // `operable={false}` means "no tab stop, no separator semantics", not
    // "inert": the widget-board's corners are pointer-only and fully painted.
    const node = renderHandle({ operable: false });

    expect(node).toHaveAttribute('aria-hidden', 'true');
    fireEvent.pointerEnter(node);
    expect(node.getAttribute('data-state')).toBe('hovered');
  });

  it('leaves the owner\'s own vocabulary beside the stamp, never inside it', () => {
    // A locked gutter is refused by the owner's skin through
    // `:not([data-resizable='false'])`; the kernel neither reads that flag nor
    // restates it, exactly as the pseudo-class arm does not.
    const node = renderHandle({
      operable: false,
      anatomy: { 'data-part': 'gutter', 'data-resizable': 'false' },
    });

    fireEvent.pointerEnter(node);
    expect(node.getAttribute('data-state')).toBe('hovered');
    expect(node.getAttribute('data-resizable')).toBe('false');
  });

  it('keeps a focusable decoration inside the edge off the edge\'s own ring', () => {
    const node = renderHandle({
      children: <button type="button">Collapse</button>,
    });

    // React's focus events are focusin/focusout and therefore bubble;
    // `:focus-visible`, the arm this mirrors, never matches an ancestor.
    fireEvent.focus(node.querySelector('button')!);
    expect(node.hasAttribute('data-state')).toBe(false);
  });

  it('keeps the separator semantics and the keyboard contract under the stamp', () => {
    const onAdjust = vi.fn();
    const node = renderHandle({ arrows: 'position', onAdjust });

    expect(node.getAttribute('role')).toBe('separator');
    expect(node.getAttribute('aria-orientation')).toBe('vertical');
    expect(node.getAttribute('aria-valuenow')).toBe('50');
    expect(node.tabIndex).toBe(0);

    fireEvent.pointerEnter(node);
    fireEvent.keyDown(node, { key: 'ArrowRight' });
    expect(onAdjust).toHaveBeenCalledWith('increase', expect.anything());
  });
});
