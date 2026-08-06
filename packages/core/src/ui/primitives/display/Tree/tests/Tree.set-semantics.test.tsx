import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

function setPositions(): Array<[string, string | null, string | null, string | null]> {
  return screen.getAllByRole('treeitem').map((item) => [
    item.textContent?.trim() ?? '',
    item.getAttribute('aria-posinset'),
    item.getAttribute('aria-setsize'),
    item.getAttribute('aria-level'),
  ]);
}

// The node's OWN guide is the last vertical connector it renders; the earlier
// ones are the ancestor pass-through rails.
function stemHeights(): Array<[string, string]> {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-part='node']"))
    .map((node) => {
      const row = node.querySelector<HTMLElement>("[data-part='row']");
      const verticals = Array.from(node.children).filter(
        (child): child is HTMLElement =>
          child.getAttribute('data-part') === 'connector' &&
          child.getAttribute('data-axis') === 'vertical'
      );
      const own = verticals[verticals.length - 1];
      const kind = !own ? 'none' : own.style.height === '50%' ? 'stem' : 'through';
      return [row?.textContent?.trim() ?? '', kind] as [string, string];
    })
    .filter(([label]) => label !== '');
}

describe('Tree modern set semantics', () => {
  it('numbers each treeitem within its own sibling set', () => {
    render(<ModernTree treeData={treeData} defaultExpandAll />);

    expect(setPositions()).toEqual([
      ['Root', '1', '2', '1'],
      ['Alpha keep', '1', '3', '2'],
      ['Beta keep', '2', '3', '2'],
      ['Gamma drop', '3', '3', '2'],
      ['Sibling drop', '2', '2', '1'],
    ]);
  });

  it('counts the rendered set, not the source set, once a filter culls siblings', async () => {
    render(
      <ModernTree treeData={treeData} filterTreeNode={contains} searchValue="keep" />
    );

    await waitFor(() => {
      expect(screen.getByRole('tree')).toHaveTextContent('Alpha keep');
    });

    // Gamma and Sibling are gone from the DOM: announcing "1 of 3" over two
    // rendered rows misreports the tree an assistive user can actually reach.
    expect(setPositions()).toEqual([
      ['Root', '1', '1', '1'],
      ['Alpha keep', '1', '2', '2'],
      ['Beta keep', '2', '2', '2'],
    ]);
  });

  it('terminates the connector on the last RENDERED sibling under a filter', async () => {
    render(
      <ModernTree
        treeData={treeData}
        showLine
        filterTreeNode={contains}
        searchValue="keep"
      />
    );

    await waitFor(() => {
      expect(screen.getByRole('tree')).toHaveTextContent('Beta keep');
    });

    // Beta is the last row actually drawn, so its guide must stop half way
    // rather than run through to a sibling that was filtered out.
    expect(stemHeights()).toEqual([
      ['Root', 'none'],
      ['Alpha keep', 'through'],
      ['Beta keep', 'stem'],
    ]);
  });

  it('keeps the unfiltered connector termination intact', () => {
    render(<ModernTree treeData={treeData} showLine defaultExpandAll />);

    expect(stemHeights()).toEqual([
      ['Root', 'none'],
      ['Alpha keep', 'through'],
      ['Beta keep', 'through'],
      ['Gamma drop', 'stem'],
      ['Sibling drop', 'none'],
    ]);
  });
});
