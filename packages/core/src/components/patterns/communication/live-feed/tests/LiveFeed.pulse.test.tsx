/**
 * LiveFeed modern-engine data-changed pulse tests (WO-CRA-07).
 *
 * Before this WO, `isNew` items in the modern engine received Tailwind's
 * `animate-pulse` class -- an infinitely-looping opacity pulse with no
 * `prefers-reduced-motion` guard (`engines/modern/index.tsx`, the
 * `displayItems.map` branch). That is a live violation of the "one flash,
 * never looping, reduced-motion aware" data-changed pulse discipline this WO
 * exists to enforce. These tests fail if `animate-pulse` is reintroduced on
 * a feed item, or if `ds-pulse-changed` (a single-shot, reduced-motion-guarded
 * utility -- see foundation/animations/transitions/index.css) is removed.
 */
import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import ModernLiveFeed from '../engines/modern';
import type { FeedItem, LiveFeedProps } from '../contracts';

type Item = FeedItem & { title: string };

const items: Item[] = [
  { key: 'fresh', title: 'Fresh item', isNew: true },
  { key: 'stale', title: 'Stale item' },
];

const SKIN = readFileSync(
  join(
    __dirname,
    '../../../../../foundation/tokens/css/runtime/engines/modern/skin/live-feed/index.css',
  ),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const ROWS = "[data-part='list'] > div";

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

    const rows = Array.from(container.querySelectorAll(ROWS));
    expect(rows).toHaveLength(items.length);
    const staleRow = rows.find((row) => row.textContent === 'Stale item');
    expect(staleRow?.className).toBe('');
  });

  it('never renders the looping animate-pulse class on a feed item', () => {
    const { container } = render(<ModernLiveFeed {...buildProps()} />);

    // Scope to the item rows themselves, not the (intentionally looping)
    // loading-skeleton shimmer, which the skin paints while `loading` is true.
    const itemRows = container.querySelectorAll(ROWS);
    expect(itemRows).toHaveLength(items.length);
    itemRows.forEach((row) => {
      expect(row.className).not.toContain('animate-pulse');
    });
  });

  it('lays the list out from the skin, with no layout utility on the part', () => {
    const { container } = render(<ModernLiveFeed {...buildProps()} />);

    expect(container.querySelector("[data-part='list']")?.getAttribute('class')).toBeNull();
    const rule = SKIN.match(
      /\.ds-pattern-live-feed\.ds-engine-modern \[data-part='list'\]\s*\{([^{}]*)\}/,
    );
    const declarations = (rule?.[1] ?? '').split(';').map((declaration) => declaration.trim()).filter(Boolean);
    expect(declarations).toEqual(['display: flex', 'flex-direction: column', 'gap: var(--_ds-live-feed-list-gap, 8px)']);
  });
});
