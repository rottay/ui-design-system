/**
 * The runtime producer behind the modern Tag's state paint.
 *
 * The skin decides hover, press and the focus ring through
 * `:is([data-state~='x'], :x)`: the pseudo-class arm is the platform fallback,
 * the stamped arm is the kernel's single decision (F-37). A twin with no
 * producer is a dead selector, so this pins the producer on both interactive
 * parts -- the clickable root and the close control -- and pins that neither
 * says anything at rest.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import ModernTag from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tag/index.css',
  ),
  'utf8',
);

afterEach(cleanup);

const CLICKABLE_ROOT = ".rottay-tag-shell--modern[data-part='root'][data-clickable='true']";

describe('Tag modern state stamp', () => {
  it('pairs every state rule in the skin with its stamped twin', () => {
    for (const twin of ["[data-state~='hovered']", "[data-state~='pressed']", "[data-state~='focus-visible']"]) {
      expect(SKIN).toContain(twin);
    }
    // No arm may decide a state through the pseudo-class alone.
    expect(SKIN).not.toMatch(/\[data-clickable='true'\]:hover\s*\{/u);
    expect(SKIN).not.toMatch(/\[data-part='close'\]:hover\s*\{/u);
  });

  it('says nothing at rest, so resting paint is unchanged', () => {
    const { container } = render(
      <ModernTag clickable onClick={vi.fn()} closable>
        Filter
      </ModernTag>,
    );
    const root = container.querySelector<HTMLElement>(CLICKABLE_ROOT)!;
    const close = root.querySelector<HTMLElement>("[data-part='close']")!;
    expect(root.hasAttribute('data-state')).toBe(false);
    expect(close.hasAttribute('data-state')).toBe(false);
  });

  it('stamps the clickable root through the pointer triad', () => {
    const { container } = render(
      <ModernTag clickable onClick={vi.fn()}>
        Filter
      </ModernTag>,
    );
    const root = container.querySelector<HTMLElement>(CLICKABLE_ROOT)!;

    fireEvent.pointerEnter(root);
    expect(root.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerDown(root);
    expect(root.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(root);
    expect(root.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerLeave(root);
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('presses the root from the keyboard, which a role="button" span never gets from :active', () => {
    const onClick = vi.fn();
    render(
      <ModernTag clickable onClick={onClick}>
        Filter
      </ModernTag>,
    );
    const root = screen.getByRole('button', { name: 'Filter' });

    fireEvent.keyDown(root, { key: 'Enter' });
    expect(root.getAttribute('data-state')).toContain('pressed');
    fireEvent.keyUp(root, { key: 'Enter' });
    expect(root.getAttribute('data-state') ?? '').not.toContain('pressed');
    // The activation contract is untouched by the stamp.
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stamps focus-visible for a keyboard focus and clears it on blur', () => {
    const { container } = render(
      <ModernTag clickable onClick={vi.fn()}>
        Filter
      </ModernTag>,
    );
    const root = container.querySelector<HTMLElement>(CLICKABLE_ROOT)!;

    fireEvent.focus(root);
    expect(root.getAttribute('data-state')).toContain('focus-visible');
    fireEvent.blur(root);
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('keeps a close-button focus off the root, which `:focus-visible` never lights', () => {
    const { container } = render(
      <ModernTag clickable onClick={vi.fn()} closable>
        Filter
      </ModernTag>,
    );
    const root = container.querySelector<HTMLElement>(CLICKABLE_ROOT)!;
    const close = root.querySelector<HTMLElement>("[data-part='close']")!;

    // React focus events are focusin/focusout and therefore bubble.
    fireEvent.focus(close);
    expect(close.getAttribute('data-state')).toContain('focus-visible');
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('presses the close control without pressing the tag underneath it', () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    const { container } = render(
      <ModernTag clickable onClick={onClick} onClose={onClose} closable>
        Filter
      </ModernTag>,
    );
    const root = container.querySelector<HTMLElement>(CLICKABLE_ROOT)!;
    const close = root.querySelector<HTMLElement>("[data-part='close']")!;

    fireEvent.keyDown(close, { key: 'Enter' });
    expect(close.getAttribute('data-state')).toContain('pressed');
    expect(root.hasAttribute('data-state')).toBe(false);
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.keyUp(close, { key: 'Enter' });
    expect(close.getAttribute('data-state') ?? '').not.toContain('pressed');
  });

  it('never stamps a non-clickable tag, whose skin has no state rule to feed', () => {
    const { container } = render(<ModernTag>Plain</ModernTag>);
    const root = container.querySelector<HTMLElement>("[data-part='root']")!;

    fireEvent.pointerEnter(root);
    fireEvent.pointerDown(root);
    fireEvent.focus(root);
    expect(root.hasAttribute('data-state')).toBe(false);
  });

  it('keeps the stamp when a composing family renames the part', () => {
    // list-toolbar's filter chip is a Tag that renames its root part; the
    // rename must not cost the family its state producer.
    const { container } = render(
      <ModernTag clickable onClick={vi.fn()} data-part="filter-chip">
        Status: open
      </ModernTag>,
    );
    const root = container.querySelector<HTMLElement>("[data-part='filter-chip']")!;
    fireEvent.pointerEnter(root);
    expect(root.getAttribute('data-state')).toBe('hovered');
  });

  it('chains the kernel with a handler the caller forwarded through', () => {
    const onPointerEnter = vi.fn();
    // `TagProps` declares no DOM handlers, so this is exactly the untyped
    // passthrough the chaining defends: a spread would have replaced one side.
    const forwarded = { onPointerEnter } as unknown as Partial<
      React.ComponentProps<typeof ModernTag>
    >;
    const { container } = render(
      <ModernTag clickable onClick={vi.fn()} {...forwarded}>
        Filter
      </ModernTag>,
    );
    const root = container.querySelector<HTMLElement>(CLICKABLE_ROOT)!;
    fireEvent.pointerEnter(root);
    expect(root.getAttribute('data-state')).toBe('hovered');
    expect(onPointerEnter).toHaveBeenCalledTimes(1);
  });
});
