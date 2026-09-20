/**
 * The runtime producer behind the modern Tree's state paint.
 *
 * The skin decides row hover, row press and both focus rings through
 * `:is([data-state~='x'], :x)`: the pseudo-class arm is the platform fallback,
 * the stamped arm is the kernel's single decision (F-37). A twin with no
 * producer is a dead selector, so this pins the producer on both painted parts
 * -- the row and the Move control -- that neither says anything at rest, and
 * that the stamp never swallows the family's own `data-disabled` vocabulary the
 * state rules guard on.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import ModernTree from '../engines/modern';

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/tree/index.css',
  ),
  'utf8',
);

afterEach(cleanup);

const TREE_DATA = [
  {
    key: 'parent',
    title: 'Parent',
    children: [
      { key: 'child', title: 'Child one', isLeaf: true },
      { key: 'blocked', title: 'Child two', isLeaf: true, disabled: true },
    ],
  },
];

const renderTree = (props: Partial<React.ComponentProps<typeof ModernTree>> = {}) =>
  render(<ModernTree treeData={TREE_DATA} defaultExpandAll draggable checkable {...props} />);

const rowOf = (container: HTMLElement, key: string): HTMLElement =>
  container.querySelector<HTMLElement>(`[data-part='node'][data-key='${key}'] > [data-part='row']`)!;

const handleOf = (row: HTMLElement): HTMLElement =>
  row.querySelector<HTMLElement>("[data-part='drag-handle']")!;

describe('Tree modern state stamp', () => {
  it('pairs every state rule in the skin with its stamped twin', () => {
    for (const twin of ["[data-state~='hovered']", "[data-state~='pressed']", "[data-state~='focus-visible']"]) {
      expect(SKIN).toContain(twin);
    }
    // No arm may decide a painted state through the pseudo-class alone.
    expect(SKIN).not.toMatch(/\[data-part='row'\]:hover/u);
    expect(SKIN).not.toMatch(/\[data-part='row'\]:active/u);
    expect(SKIN).not.toMatch(/\[data-part='drag-handle'\]:focus-visible/u);
  });

  it('says nothing at rest on either painted part, so resting paint is unchanged', () => {
    const { container } = renderTree();
    const row = rowOf(container, 'parent');

    expect(row.hasAttribute('data-state')).toBe(false);
    expect(handleOf(row).hasAttribute('data-state')).toBe(false);
  });

  it('stamps the row through the pointer triad', () => {
    const { container } = renderTree();
    const row = rowOf(container, 'child');

    fireEvent.pointerEnter(row);
    expect(row.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerDown(row);
    expect(row.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(row);
    expect(row.getAttribute('data-state')).toBe('hovered');
    fireEvent.pointerLeave(row);
    expect(row.hasAttribute('data-state')).toBe(false);
  });

  it('stamps focus-visible on a keyboard focus of the row and clears it on blur', () => {
    const { container } = renderTree();
    const row = rowOf(container, 'parent');

    fireEvent.focus(row);
    expect(row.getAttribute('data-state')).toContain('focus-visible');
    fireEvent.blur(row);
    expect(row.hasAttribute('data-state')).toBe(false);
  });

  it('withholds the focus ring from a pointer press, which is where :focus-visible draws the line', () => {
    const { container } = renderTree();
    const row = rowOf(container, 'parent');

    fireEvent.pointerDown(row);
    fireEvent.focus(row);
    expect(row.getAttribute('data-state')).toContain('focused');
    expect(row.getAttribute('data-state')).not.toContain('focus-visible');
  });

  it('stamps the Move control and keeps its focus off the row underneath it', () => {
    const { container } = renderTree();
    const row = rowOf(container, 'child');
    const handle = handleOf(row);

    fireEvent.focus(handle);
    expect(handle.getAttribute('data-state')).toContain('focus-visible');
    // React focus events are focusin/focusout and therefore bubble; the row's
    // ring is the row's own.
    expect(row.hasAttribute('data-state')).toBe(false);

    fireEvent.pointerEnter(handle);
    expect(handle.getAttribute('data-state')).toContain('hovered');
    fireEvent.pointerDown(handle);
    expect(handle.getAttribute('data-state')).toContain('pressed');
    fireEvent.pointerUp(handle);
    fireEvent.pointerLeave(handle);
    fireEvent.blur(handle);
    expect(handle.hasAttribute('data-state')).toBe(false);
  });

  it('keeps a checkbox focus off the row ring', () => {
    const { container } = renderTree();
    const row = rowOf(container, 'child');

    fireEvent.focus(row.querySelector<HTMLElement>("[data-part='checkbox']")!);
    expect(row.hasAttribute('data-state')).toBe(false);
  });

  it('never collapses `data-disabled` into `data-state`', () => {
    const { container } = renderTree();
    const row = rowOf(container, 'blocked');

    expect(row.getAttribute('data-disabled')).toBe('true');
    fireEvent.pointerEnter(row);
    fireEvent.pointerDown(row);
    fireEvent.focus(row);
    // The skin's state rules guard on `:not([data-disabled])`; a disabled row
    // reports no triad AND never restates its disablement as a kernel state.
    expect(row.hasAttribute('data-state')).toBe(false);
  });

  it('leaves the family vocabulary beside the stamp, not inside it', () => {
    const { container } = renderTree({ defaultSelectedKeys: ['parent'] });
    const row = rowOf(container, 'parent');

    fireEvent.pointerEnter(row);
    expect(row.getAttribute('data-state')).toBe('hovered');
    expect(row.getAttribute('data-selected')).toBe('true');
    expect(row.getAttribute('data-expanded')).toBe('true');
    expect(row.getAttribute('data-draggable')).toBe('true');
  });

  it('unlatches the press a native drag swallowed the pointerup for', () => {
    const { container } = renderTree();
    const row = rowOf(container, 'child');

    // Measured in Chromium: starting a native drag on the row dispatches
    // `pointercancel`, `pointerout` and `pointerleave` before the first `drag`,
    // so the kernel's own leave handler is the press boundary and no
    // drag-specific cleanup rides the sortable bag.
    fireEvent.pointerEnter(row);
    fireEvent.pointerDown(row);
    expect(row.getAttribute('data-state')).toContain('pressed');
    fireEvent.dragStart(row, { dataTransfer: { effectAllowed: '', setData: vi.fn() } });
    fireEvent.pointerLeave(row);
    expect(row.hasAttribute('data-state')).toBe(false);
  });

  it('leaves the roving tab stop and the tree semantics untouched', () => {
    const { container } = renderTree();
    const rows = screen.getAllByRole('treeitem');
    const tabbable = rows.filter((row) => row.getAttribute('tabindex') === '0');

    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(rowOf(container, 'parent'));
    // The Move control shares that single stop rather than adding one.
    expect(handleOf(rowOf(container, 'parent')).getAttribute('tabindex')).toBe('0');
    expect(handleOf(rowOf(container, 'child')).getAttribute('tabindex')).toBe('-1');
    expect(rowOf(container, 'parent').getAttribute('aria-expanded')).toBe('true');
    expect(rowOf(container, 'child').getAttribute('aria-level')).toBe('2');
  });

  it('keeps the node clickable and the selection contract intact under the stamp', () => {
    const selected: string[][] = [];
    const { container } = renderTree({ onSelect: (keys) => selected.push(keys.map(String)) });
    const row = rowOf(container, 'child');

    fireEvent.pointerDown(row);
    fireEvent.click(row);
    fireEvent.pointerUp(row);
    expect(selected).toEqual([['child']]);
  });

  it('never renders a Move control for a non-draggable tree, so nothing stamps what is not there', () => {
    const { container } = renderTree({ draggable: false });
    const row = rowOf(container, 'parent');

    expect(row.querySelector("[data-part='drag-handle']")).toBeNull();
  });
});
