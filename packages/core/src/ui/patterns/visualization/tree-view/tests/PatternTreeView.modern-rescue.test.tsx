import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTreeView from '../engines/modern';
import type { TreeNode } from '../contracts';

const DATA: TreeNode[] = [
  {
    key: 'src',
    label: 'src',
    children: [
      {
        key: 'deep',
        label: 'deep',
        children: [{ key: 'target', label: 'Needle.ts' }],
      },
    ],
  },
  { key: 'readme', label: 'README.md' },
];

describe('PatternTreeView modern — rescue drills', () => {
  it('reveals a search match buried under a controlled collapsed branch', () => {
    const { container } = render(
      <ModernTreeView data={DATA} searchable expandedKeys={[]} onExpand={vi.fn()} />,
    );

    // Nothing is expanded yet: the match is out of the render tree.
    expect(container.querySelector('[data-part="node"][data-key="target"]')).toBeNull();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Needle' } });

    // Before: the primitive's ancestor auto-expansion writes to its INTERNAL
    // state, which the controlled `expandedKeys` overrode — the tree reported
    // a match while rendering nothing.
    expect(container.querySelector('[data-part="node"][data-key="target"]')).not.toBeNull();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-empty',
      'false',
    );
  });

  it('leaves the caller expansion untouched when no search is active', () => {
    const { container } = render(
      <ModernTreeView data={DATA} searchable expandedKeys={[]} onExpand={vi.fn()} />,
    );

    expect(container.querySelector('[data-part="node"][data-key="deep"]')).toBeNull();
  });

  it('still reports an empty result set when the query matches nothing', () => {
    const { container } = render(
      <ModernTreeView data={DATA} searchable expandedKeys={[]} onExpand={vi.fn()} />,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzz' } });

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-empty',
      'true',
    );
  });
});
