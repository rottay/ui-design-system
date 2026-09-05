import React from 'react';
import { act } from '@testing-library/react';
import { renderWithEngineContext } from '@tests/support/engine';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ModernLiveFeed from '../engines/modern';
import type { FeedItem, LiveFeedProps } from '../contracts';

const render = (ui: React.ReactElement) => renderWithEngineContext(ui, 'classic');

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

describe('LiveFeed modern engine auto-refresh polling', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    error = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // An un-acted timer advance surfaces only as a console warning, so a silent
    // console is part of the assertion, not incidental hygiene.
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
  // The engine composes lazy primitives; their Suspense resolution must land
  // inside act or it reports as an unacted update after the test body.
  const settle = () => act(async () => {});

  it('keeps polling when the parent re-renders with a fresh onRefresh identity', async () => {
    const refresh = vi.fn();
    // A caller passing an inline arrow gets a new identity every parent render.
    const { rerender } = render(
      <ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: () => refresh() })} />,
    );
    await settle();

    // Re-render four times, each 400ms apart: total elapsed 1600ms, well past
    // the 1000ms interval, but no single gap reaches it.
    for (let i = 0; i < 4; i += 1) {
      advance(400);
      rerender(
        <ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: () => refresh() })} />,
      );
    }
    expect(refresh).toHaveBeenCalledTimes(1);

    advance(400);
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('calls the latest onRefresh, not the one captured at mount', async () => {
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = render(
      <ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: first })} />,
    );
    await settle();
    rerender(<ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: second })} />);

    advance(1000);

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it('starts polling when a handler appears after mount', async () => {
    const refresh = vi.fn();
    const { rerender } = render(<ModernLiveFeed {...buildProps({ autoRefresh: 1000 })} />);
    await settle();

    advance(3000);
    expect(refresh).not.toHaveBeenCalled();

    rerender(<ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: refresh })} />);
    advance(1000);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('stops polling when the handler is withdrawn', async () => {
    const refresh = vi.fn();
    const { rerender } = render(
      <ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: refresh })} />,
    );
    await settle();

    advance(1000);
    expect(refresh).toHaveBeenCalledTimes(1);

    rerender(<ModernLiveFeed {...buildProps({ autoRefresh: 1000 })} />);
    advance(5000);

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('stops polling on unmount', async () => {
    const refresh = vi.fn();
    const { unmount } = render(
      <ModernLiveFeed {...buildProps({ autoRefresh: 1000, onRefresh: refresh })} />,
    );
    await settle();

    unmount();
    advance(5000);

    expect(refresh).not.toHaveBeenCalled();
  });
});

describe('LiveFeed modern engine announcement region', () => {
  it('mounts the log region while the feed is still empty', () => {
    // A live region created already-populated is not announced: the region has
    // to exist before the first items land for their arrival to be spoken.
    const { getByRole } = render(<ModernLiveFeed {...buildProps({ items: [] })} />);

    expect(getByRole('log')).toBeTruthy();
  });

  it('keeps the same log region once items arrive', () => {
    const { getByRole, rerender } = render(<ModernLiveFeed {...buildProps({ items: [] })} />);
    const emptyRegion = getByRole('log');

    rerender(<ModernLiveFeed {...buildProps()} />);

    expect(getByRole('log')).toBe(emptyRegion);
    expect(getByRole('log').textContent).toContain('Fresh item');
  });
});
