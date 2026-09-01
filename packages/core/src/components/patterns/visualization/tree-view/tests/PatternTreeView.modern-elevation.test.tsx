/**
 * Modern-elevation drills for the TreeView modern engine.
 * Every assertion here is the OPPOSITE of what the pre-elevation engine
 * produced, so each one fails without its paired source change.
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ModernTreeView from '../engines/modern';
import type { TreeNode } from '../contracts';

/** The shape the contract advertises: `label` is a ReactNode. */
const RICH_DATA: TreeNode[] = [
  {
    key: 'src',
    label: (
      <span>
        <span>src</span>
        <em>4 files</em>
      </span>
    ),
    children: [{ key: 'needle', label: <strong>Needle.ts</strong> }],
  },
  { key: 'readme', label: <span>README.md</span> },
];

const ACCENT_DATA: TreeNode[] = [
  { key: 'cafe', label: 'Café Ledger' },
  { key: 'other', label: 'Warehouse' },
];

describe('PatternTreeView modern — elevation drills', () => {
  it('finds a ReactNode label the search index used to skip entirely', () => {
    const { container } = render(
      <ModernTreeView data={RICH_DATA} searchable defaultExpandedKeys={['src']} />,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Needle' } });

    // Before: `labelByKey` indexed only `typeof label === 'string'`, so every
    // query against a rich-label tree answered "No results found".
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-empty',
      'false',
    );
    expect(container.querySelector('[data-part="node"][data-key="needle"]')).not.toBeNull();
  });

  it('matches text nested inside a composed label', () => {
    const { container } = render(<ModernTreeView data={RICH_DATA} searchable />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '4 files' } });

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-empty',
      'false',
    );
  });

  it('matches across diacritics', () => {
    const { container } = render(<ModernTreeView data={ACCENT_DATA} searchable />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'cafe' } });

    // Before: `toLowerCase().includes()` never reached "Café".
    expect(container.querySelector('[data-part="node"][data-key="cafe"]')).not.toBeNull();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-empty',
      'false',
    );
  });

  it('treats a whitespace-only query as no query', () => {
    const { container } = render(<ModernTreeView data={ACCENT_DATA} searchable />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });

    // Before: the tree filtered itself away and reported "No results found".
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-empty',
      'false',
    );
    expect(container.querySelector('[data-part="node"][data-key="cafe"]')).not.toBeNull();
  });

  it('announces the match count while filtering', () => {
    const { container } = render(<ModernTreeView data={ACCENT_DATA} searchable />);
    const status = container.querySelector('[data-part="search-status"]') as HTMLElement;

    // Before: no live region existed at all.
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Warehouse' } });
    expect(status).toHaveTextContent('1 result');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzz' } });
    expect(status).toHaveTextContent('0 results');
  });

  it('clears the filter on Escape', () => {
    const { container } = render(<ModernTreeView data={ACCENT_DATA} searchable />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzzz' } });
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-empty',
      'true',
    );

    // The clearable affordance remounts the field once it holds text, so the
    // live node has to be re-read before the key is dispatched.
    fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });

    // Before: Escape was inert — the field kept its text and the tree stayed
    // filtered to nothing.
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'data-empty',
      'false',
    );
  });

  it('reserves the search row while loading and announces the wait', () => {
    const { container } = render(
      <ModernTreeView data={ACCENT_DATA} searchable loading />,
    );

    // Before: the search row appeared only after data landed, so every row
    // shifted down on arrival, and the skeleton was exposed to AT unlabelled.
    expect(container.querySelector('[data-part="search-row"]')).not.toBeNull();
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Loading tree');
    expect(container.querySelector('[data-part="skeleton-list"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('keeps plain string labels searchable', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <ModernTreeView
        data={[{ key: 'a', label: 'Alpha' }, { key: 'b', label: 'Beta' }]}
        searchable
        onSelect={onSelect}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Alph' } });

    expect(container.querySelector('[data-part="node"][data-key="a"]')).not.toBeNull();
    expect(container.querySelector('[data-part="node"][data-key="b"]')).toBeNull();
  });
});
