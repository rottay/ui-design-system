import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernTree from '../engines/modern';

const treeData = [
  {
    key: 'root',
    title: 'Root',
    children: [
      { key: 'alpha', title: 'Alpha keep' },
      { key: 'beta', title: 'Beta keep' },
      { key: 'gamma', title: 'Gamma drop' },
    ],
  },
  { key: 'sibling', title: 'Sibling drop' },
];

const contains = (searchValue: string, node: { title?: React.ReactNode }) =>
  String(node.title ?? '').toLowerCase().includes(searchValue.toLowerCase());

const rovingStop = () =>
  screen
    .getAllByRole('treeitem')
    .filter((item) => item.getAttribute('tabindex') === '0')
    .map((item) => item.textContent?.trim() ?? '');

describe('Tree modern keyboard reach under a search filter', () => {
  it('walks only the nodes the filter left in the DOM', async () => {
    render(<ModernTree treeData={treeData} filterTreeNode={contains} searchValue="keep" />);
    await waitFor(() => expect(screen.getByRole('tree')).toHaveTextContent('Beta keep'));

    const tree = screen.getByRole('tree');
    // Root -> Alpha keep -> Beta keep, then the walk has nowhere left to go:
    // Gamma and Sibling are culled, so a fourth step must not leave the set.
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    fireEvent.keyDown(tree, { key: 'ArrowDown' });
    fireEvent.keyDown(tree, { key: 'ArrowDown' });

    expect(rovingStop()).toEqual(['Beta keep']);
    expect(document.activeElement?.getAttribute('role')).toBe('treeitem');
    expect(document.activeElement?.textContent?.trim()).toBe('Beta keep');
  });

  it('keeps a reachable roving stop while the filter is applied', async () => {
    render(<ModernTree treeData={treeData} filterTreeNode={contains} searchValue="keep" />);
    await waitFor(() => expect(screen.getByRole('tree')).toHaveTextContent('Beta keep'));

    const tree = screen.getByRole('tree');
    fireEvent.keyDown(tree, { key: 'End' });

    // End lands on the last RENDERED node. Against the source set it landed on
    // 'Sibling drop', which has no element: the tree was then left with zero
    // tabbable nodes and Tab could not enter it at all.
    expect(rovingStop()).toEqual(['Beta keep']);
  });

  it('leaves the unfiltered walk reaching every expanded node', () => {
    render(<ModernTree treeData={treeData} defaultExpandAll />);

    const tree = screen.getByRole('tree');
    for (let step = 0; step < 4; step++) fireEvent.keyDown(tree, { key: 'ArrowDown' });

    expect(rovingStop()).toEqual(['Sibling drop']);
  });
});
