import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useInfiniteScroll, type UseInfiniteScrollOptions } from '..';

/**
 * The test setup polyfills IntersectionObserver so that `observe()` synchronously
 * reports the target as intersecting. Mounting a sentinel therefore exercises the
 * hook's gating (hasMore / enabled) deterministically.
 */
function Harness(props: Omit<UseInfiniteScrollOptions, 'onLoadMore'> & { onLoadMore: () => void }) {
  const { sentinelRef } = useInfiniteScroll(props);
  return <div ref={sentinelRef} data-testid="sentinel" />;
}

describe('useInfiniteScroll', () => {
  it('calls onLoadMore when the sentinel intersects and hasMore is true', () => {
    const onLoadMore = vi.fn();
    render(<Harness hasMore onLoadMore={onLoadMore} />);
    expect(onLoadMore).toHaveBeenCalled();
  });

  it('does not call onLoadMore when hasMore is false', () => {
    const onLoadMore = vi.fn();
    render(<Harness hasMore={false} onLoadMore={onLoadMore} />);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('does not call onLoadMore when disabled via enabled=false', () => {
    const onLoadMore = vi.fn();
    render(<Harness hasMore enabled={false} onLoadMore={onLoadMore} />);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('loads when a sentinel mounts after hasMore becomes true', () => {
    // Mirrors PatternVirtualList: the sentinel is only rendered while hasMore is
    // true, so flipping it true remounts the sentinel and triggers a load.
    function ConditionalHarness({
      hasMore,
      onLoadMore,
    }: {
      hasMore: boolean;
      onLoadMore: () => void;
    }) {
      const { sentinelRef } = useInfiniteScroll({ hasMore, onLoadMore });
      return hasMore ? <div ref={sentinelRef} data-testid="sentinel" /> : null;
    }

    const onLoadMore = vi.fn();
    const { rerender } = render(
      <ConditionalHarness hasMore={false} onLoadMore={onLoadMore} />,
    );
    expect(onLoadMore).not.toHaveBeenCalled();

    rerender(<ConditionalHarness hasMore onLoadMore={onLoadMore} />);
    expect(onLoadMore).toHaveBeenCalled();
  });
});
