/**
 * LiveFeed modern-engine data-changed pulse tests (WO-CRA-07).
 *
 * Before this WO, `isNew` items in the modern engine received Tailwind's
 * `animate-pulse` class -- an infinitely-looping opacity pulse with no
 * `prefers-reduced-motion` guard (`engines/modern.tsx`, the
 * `displayItems.map` branch). That is a live violation of the "one flash,
 * never looping, reduced-motion aware" data-changed pulse discipline this WO
 * exists to enforce. These tests fail if `animate-pulse` is reintroduced on
 * a feed item, or if `ds-pulse-changed` (a single-shot, reduced-motion-guarded
 * utility -- see foundation/animations/transitions.css) is removed.
 */
import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernLiveFeed from '../engines/modern';
import type { FeedItem, LiveFeedProps } from '../LiveFeed.types';

type Item = FeedItem & { title: string };

const items: Item[] = [
  { key: 'fresh', title: 'Fresh item', isNew: true },
  { key: 'stale', title: 'Stale item' },
];

function buildProps(overrides: Partial<LiveFeedProps<Item>> = {}): LiveFeedProps<Item> {
  return {
    items,
    renderItem: (item) => <div>{item.title}</div>,
    ...overrides,
  };
}

describe('LiveFeed modern engine data-changed pulse', () => {
  it('applies ds-pulse-changed (not animate-pulse) to isNew items', () => {
    const { container } = render(<ModernLiveFeed {...buildProps()} />);

    const freshRow = container.querySelector('.ds-pulse-changed');
    expect(freshRow).toBeTruthy();
    expect(freshRow?.textContent).toBe('Fresh item');
  });

  it('never applies any pulse class to items that are not isNew', () => {
    const { container } = render(<ModernLiveFeed {...buildProps()} />);

    const rows = Array.from(container.querySelectorAll('.flex.flex-col.gap-2 > div'));
    const staleRow = rows.find((row) => row.textContent === 'Stale item');
    expect(staleRow?.className).toBe('');
  });

  it('never renders the looping animate-pulse class on a feed item', () => {
    const { container } = render(<ModernLiveFeed {...buildProps()} />);

    // Scope to the item rows themselves, not the (intentionally looping,
    // out-of-scope-for-this-WO) loading-skeleton shimmer, which legitimately
    // still uses animate-pulse while `loading` is true.
    const itemRows = container.querySelectorAll('.flex.flex-col.gap-2 > div');
    itemRows.forEach((row) => {
      expect(row.className).not.toContain('animate-pulse');
    });
  });
});
