// `''` is this component's own reset payload, so a controlled echo must land on the
// placeholder; and arrows in the search input must reach the rows.

import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import TreeSelectModern from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';
import type { TreeSelectNode } from '../contracts';

const nodes: TreeSelectNode[] = [
  {
    title: 'Engineering',
    value: 'eng',
    children: [
      { title: 'Backend', value: 'be' },
      { title: 'Frontend', value: 'fe' },
    ],
  },
  { title: 'Design', value: 'design' },
];

/**
 * The Modern panel is PORTALED (WO-CAN-05) into `#rottay-portal-root`, so the
 * search box and the rows are siblings of the render container rather than its
 * descendants. Resolve the panel from the trigger's `aria-controls` -- the one
 * remaining link between field and panel -- and prove it came through the
 * kernel, so a panel that merely escaped the container by some other route
 * would not satisfy these tests.
 */
const ownedPanel = (container: HTMLElement): HTMLElement => {
  const trigger = container.querySelector('[data-part="trigger"]') as HTMLElement;
  const panelId = trigger.getAttribute('aria-controls');
  expect(panelId).toBeTruthy();
  const panel = document.getElementById(panelId as string) as HTMLElement;
  expect(panel).not.toBeNull();
  expect(container.contains(panel)).toBe(false);
  expect(panel.closest('#rottay-portal-root')).not.toBeNull();
  expect(panel.getAttribute('data-overlay-layer')).toMatch(/^ds-overlay-/);
  return panel;
};

describe('TreeSelect modern engine reset + keyboard entry', () => {
  it('falls back to the placeholder when a controlled value is cleared to an empty string', () => {
    const { container, rerender } = renderWithEngine(
      <TreeSelectModern treeData={nodes} value="design" placeholder="Please select" onChange={() => {}} />,
      'modern',
    );

    expect(container.querySelector('[data-part="value"]')?.textContent).toBe('Design');

    // The exact payload this component's own clear button emits for single-select.
    rerender(
      <TreeSelectModern treeData={nodes} value="" placeholder="Please select" onChange={() => {}} />,
    );

    expect(container.querySelector('[data-part="value"]')).toBeNull();
    const placeholder = container.querySelector('[data-part="placeholder"]');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.textContent).toBe('Please select');
  });

  it('moves focus from the search input into the tree on ArrowDown', () => {
    const { container } = renderWithEngine(
      <TreeSelectModern treeData={nodes} showSearch open treeDefaultExpandAll onChange={() => {}} />,
      'modern',
    );

    const panel = ownedPanel(container);
    const search = panel.querySelector('[data-part="search-input"]') as HTMLInputElement;
    expect(search).toBeTruthy();

    fireEvent.keyDown(search, { key: 'ArrowDown' });

    // Focus crosses the portal boundary: the row it lands on lives in the
    // panel, and the panel is no longer inside the field.
    const active = container.ownerDocument.activeElement as HTMLElement | null;
    expect(active?.getAttribute('data-part')).toBe('option');
    expect(active?.getAttribute('data-key')).toBe('eng');
    expect(panel.contains(active)).toBe(true);
  });

  it('moves focus to the last row from the search input on End', () => {
    const { container } = renderWithEngine(
      <TreeSelectModern treeData={nodes} showSearch open onChange={() => {}} />,
      'modern',
    );

    const panel = ownedPanel(container);
    const search = panel.querySelector('[data-part="search-input"]') as HTMLInputElement;
    fireEvent.keyDown(search, { key: 'End' });

    const active = container.ownerDocument.activeElement as HTMLElement | null;
    expect(active?.getAttribute('data-key')).toBe('design');
    expect(panel.contains(active)).toBe(true);
  });

  it('keeps the placeholder when a controlled multi-select is cleared to an empty list', () => {
    const { container, rerender } = renderWithEngine(
      <TreeSelectModern treeData={nodes} multiple value={['design']} placeholder="Please select" onChange={() => {}} />,
      'modern',
    );
    expect(container.querySelector('[data-part="value"]')?.textContent).toBe('Design');

    rerender(
      <TreeSelectModern treeData={nodes} multiple value={[]} placeholder="Please select" onChange={() => {}} />,
    );
    expect(container.querySelector('[data-part="placeholder"]')?.textContent).toBe('Please select');
  });
});
