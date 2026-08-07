// `''` is this component's own reset payload, so a controlled echo must land on the
// placeholder; and arrows in the search input must reach the rows.

import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import TreeSelectModern from '../engines/modern';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';
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

    const search = container.querySelector('[data-part="search-input"]') as HTMLInputElement;
    expect(search).toBeTruthy();

    fireEvent.keyDown(search, { key: 'ArrowDown' });

    const active = container.ownerDocument.activeElement as HTMLElement | null;
    expect(active?.getAttribute('data-part')).toBe('option');
    expect(active?.getAttribute('data-key')).toBe('eng');
  });

  it('moves focus to the last row from the search input on End', () => {
    const { container } = renderWithEngine(
      <TreeSelectModern treeData={nodes} showSearch open onChange={() => {}} />,
      'modern',
    );

    const search = container.querySelector('[data-part="search-input"]') as HTMLInputElement;
    fireEvent.keyDown(search, { key: 'End' });

    const active = container.ownerDocument.activeElement as HTMLElement | null;
    expect(active?.getAttribute('data-key')).toBe('design');
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
