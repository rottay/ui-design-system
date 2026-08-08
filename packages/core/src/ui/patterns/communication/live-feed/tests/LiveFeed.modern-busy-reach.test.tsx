import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernLiveFeed from '../engines/modern';
import type { FeedItem, LiveFeedProps } from '../contracts';

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

const settle = () => act(async () => {});

describe('LiveFeed modern engine busy posture', () => {
  it('marks the root busy while the first-load skeleton is showing', async () => {
    const { container } = render(<ModernLiveFeed {...buildProps({ items: [], loading: true })} />);
    await settle();

    const root = container.querySelector('[data-part="root"]');
    expect(root?.getAttribute('aria-busy')).toBe('true');
  });

  it('clears busy on the loaded root rather than dropping the attribute', async () => {
    const { container } = render(<ModernLiveFeed {...buildProps()} />);
    await settle();

    const root = container.querySelector('[data-part="root"]');
    expect(root?.getAttribute('aria-busy')).toBe('false');
  });

  it('keeps the header and refresh control mounted across the skeleton swap', async () => {
    const { container, rerender } = render(
      <ModernLiveFeed
        {...buildProps({ items: [], loading: true, onRefresh: vi.fn(), header: <span>Activity</span> })}
      />,
    );
    await settle();

    // The shell must not collapse on first load: a header that unmounts under
    // the skeleton re-flows the surrounding page when the items land.
    expect(container.querySelector('[data-part="header-row"]')).toBeTruthy();
    expect(await screen.findByRole('button', { name: 'Refresh' })).toBeTruthy();
    expect(container.querySelector('[data-part="skeleton-list"]')).toBeTruthy();

    rerender(<ModernLiveFeed {...buildProps({ onRefresh: vi.fn(), header: <span>Activity</span> })} />);
    await settle();

    expect(container.querySelector('[data-part="header-row"]')).toBeTruthy();
  });
});

describe('LiveFeed modern engine polling under an in-flight refresh', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });

  it('skips a tick while a refresh is still in flight', async () => {
    const refresh = vi.fn();
    const { rerender } = render(
      <ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: refresh, loading: true })} />,
    );
    await act(async () => {});

    advance(3000);
    // Three intervals elapsed while loading stayed true: stacking three more
    // fetches onto a slow feed is exactly what the guard exists to prevent.
    expect(refresh).not.toHaveBeenCalled();

    rerender(<ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: refresh, loading: false })} />);
    advance(1000);

    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

describe('LiveFeed modern engine bounded-viewport reachability', () => {
  it('makes a bounded scroller a named tab stop', async () => {
    const { container } = render(<ModernLiveFeed {...buildProps({ maxHeight: 180 })} />);
    await settle();

    const viewport = container.querySelector('[data-part="viewport"]');
    expect(viewport?.getAttribute('tabindex')).toBe('0');
    expect(viewport?.getAttribute('role')).toBe('region');
    expect(viewport?.getAttribute('aria-label')).toBe('Feed');
  });

  it('leaves an unbounded feed out of the tab order', async () => {
    const { container } = render(<ModernLiveFeed {...buildProps()} />);
    await settle();

    const viewport = container.querySelector('[data-part="viewport"]');
    expect(viewport?.getAttribute('tabindex')).toBe('-1');
    expect(viewport?.getAttribute('role')).toBeNull();
  });
});

describe('LiveFeed modern engine buffered-arrival announcement', () => {
  it('announces pending arrivals that never enter the polite list', async () => {
    const { container } = render(<ModernLiveFeed {...buildProps({ newItemsCount: 3 })} />);
    await settle();

    const status = container.querySelector('[role="status"][aria-live="polite"]');
    expect(status?.textContent).toContain('3');
  });

  it('keeps the status region mounted while nothing is buffered', async () => {
    const { container } = render(<ModernLiveFeed {...buildProps()} />);
    await settle();

    // A status created already-populated is not announced, so the region has to
    // pre-exist the count change it is meant to speak.
    const status = container.querySelector('[role="status"][aria-live="polite"]');
    expect(status).toBeTruthy();
    expect(status?.textContent).toBe('');
  });

  it('hands focus to the feed region when the banner unmounts itself', async () => {
    const onShowNewItems = vi.fn();
    const { container } = render(
      <ModernLiveFeed {...buildProps({ newItemsCount: 2, onShowNewItems })} />,
    );
    await settle();

    const banner = await screen.findByRole('button', { name: /new items/i });
    await act(async () => { fireEvent.click(banner); });

    expect(onShowNewItems).toHaveBeenCalledTimes(1);
    // The click destroys the element that held focus; without a handoff the
    // caret falls to <body> and the keyboard user loses their place.
    expect(document.activeElement).toBe(container.querySelector('[data-part="viewport"]'));
  });
});
