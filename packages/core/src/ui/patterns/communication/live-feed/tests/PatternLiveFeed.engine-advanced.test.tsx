import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ClassicLiveFeed from '../engines/classic';
import ModernLiveFeed from '../engines/modern';
import RusticLiveFeed from '../engines/rustic';
import type { FeedItem, LiveFeedProps } from '../contracts';

type ActivityItem = FeedItem & {
  title: string;
};

const items: ActivityItem[] = [
  { key: 'a-1', title: 'Alpha', isNew: true },
  { key: 'a-2', title: 'Beta' },
  { key: 'a-3', title: 'Gamma' },
];

const ENGINE_COMPONENTS = [
  ['classic', ClassicLiveFeed<ActivityItem>],
  ['modern', ModernLiveFeed<ActivityItem>],
  ['rustic', RusticLiveFeed<ActivityItem>],
] as const;

function buildProps(overrides: Partial<LiveFeedProps<ActivityItem>> = {}): LiveFeedProps<ActivityItem> {
  return {
    items,
    renderItem: (item) => <div>{item.title}</div>,
    header: <div>Activity stream</div>,
    ...overrides,
  };
}

describe('PatternLiveFeed advanced engine coverage', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each(ENGINE_COMPONENTS)(
    'covers loading, empty, and slice branches in the %s engine',
    (engine, Component) => {
      const { rerender, container } = render(
        <Component {...buildProps({ items: [], loading: true })} />
      );

      if (engine === 'classic') {
        expect(container.querySelector('.ant-skeleton')).toBeTruthy();
      } else if (engine === 'modern') {
        expect(container.querySelector('.animate-pulse')).toBeTruthy();
      } else {
        // Rustic renders its loading skeleton as [data-part='skeleton'] nodes.
        // WO-SKIN-06 CK-F moved the rustic engine's inline `<style>` keyframes into
        // an unlayered skin, so the old `querySelector('style')` assertion (which
        // only ever proved the scaffolding tag existed, not that the skeleton
        // rendered) no longer holds — assert the actual skeleton element, matching
        // the classic (.ant-skeleton) and modern (.animate-pulse) branches above.
        expect(container.querySelector('[data-part="skeleton"]')).toBeTruthy();
      }

      rerender(
        <Component
          {...buildProps({
            items: [],
            loading: false,
            emptyState: <div>Nothing to show</div>,
          })}
        />
      );

      expect(screen.getByText('Nothing to show')).toBeInTheDocument();

      rerender(
        <Component {...buildProps({ maxItems: 2 })} />
      );

      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
      expect(screen.queryByText('Gamma')).not.toBeInTheDocument();
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'covers refresh, new-items, load-more, and auto-refresh branches in the %s engine',
    (engine, Component) => {
      vi.useFakeTimers();

      const onRefresh = vi.fn();
      const onShowNewItems = vi.fn();
      const onLoadMore = vi.fn();

      const { container } = render(
        <Component
          {...buildProps({
            onRefresh,
            autoRefresh: 1000,
            newItemsCount: 2,
            onShowNewItems,
            onLoadMore,
            hasMore: true,
            loading: false,
            maxHeight: 180,
          })}
        />
      );

      const refreshButton =
        engine === 'classic'
          ? (container.querySelector('.ant-card-extra button') as HTMLButtonElement | null)
          : engine === 'modern'
            ? screen.getAllByRole('button')[0]
            : screen.getByRole('button', { name: 'Refresh' });
      if (!refreshButton) {
        throw new Error(`Missing refresh button for ${engine}`);
      }
      fireEvent.click(refreshButton);
      expect(onRefresh).toHaveBeenCalledTimes(1);

      const newItemsTrigger =
        engine === 'classic'
          ? screen.getByText((content) => content.includes('new items'))
          : engine === 'modern'
            ? screen.getByRole('button', { name: /new items/i })
            : screen.getByText((content) => content.includes('new items'));
      fireEvent.click(newItemsTrigger);
      expect(onShowNewItems).toHaveBeenCalledTimes(1);

      // The shared infinite-scroll sentinel auto-loads once on mount (the
      // test-environment IntersectionObserver reports every element visible);
      // the manual load-more button then adds exactly one further call.
      const sentinelCalls = onLoadMore.mock.calls.length;
      expect(sentinelCalls).toBe(1);
      const loadMoreTrigger =
        engine === 'rustic'
          ? screen.getByRole('button', { name: /loading\.\.\.|load more/i })
          : screen.getByRole('button', { name: /load more/i });
      fireEvent.click(loadMoreTrigger);
      expect(onLoadMore).toHaveBeenCalledTimes(sentinelCalls + 1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onRefresh).toHaveBeenCalledTimes(2);
    }
  );
});
