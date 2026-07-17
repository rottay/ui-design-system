import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePresence } from '..';
import { mockMatchMedia } from '@/tooling/testing/helpers/browser/match-media';

afterEach(() => {
  vi.useRealTimers();
  mockMatchMedia(1280, false);
});

/** Renders a node whose exit is gated by usePresence, with a caller-controlled inline transition. */
function PresenceHarness({
  present,
  transitionMs,
  reducedMotion,
  onExitComplete,
}: {
  present: boolean;
  transitionMs?: number;
  reducedMotion?: boolean;
  onExitComplete?: () => void;
}) {
  const { shouldRender, dataState, ref } = usePresence(present, { reducedMotion, onExitComplete });
  if (!shouldRender) return <div data-testid="unmounted" />;
  return (
    <div
      ref={ref}
      data-testid="node"
      data-state={dataState}
      style={
        transitionMs !== undefined
          ? { transitionProperty: 'opacity', transitionDuration: `${transitionMs}ms` }
          : undefined
      }
    />
  );
}

describe('usePresence', () => {
  it('renders with dataState "open" while present', () => {
    render(<PresenceHarness present={true} />);
    expect(screen.getByTestId('node')).toHaveAttribute('data-state', 'open');
  });

  it('unmounts immediately when present goes false and no transition/animation is declared', async () => {
    const { rerender } = render(<PresenceHarness present={true} />);
    expect(screen.getByTestId('node')).toBeInTheDocument();

    rerender(<PresenceHarness present={false} />);

    await waitFor(() => expect(screen.getByTestId('unmounted')).toBeInTheDocument());
  });

  it('keeps the node mounted with dataState "closed" while its exit transition plays, then unmounts', async () => {
    const { rerender } = render(<PresenceHarness present={true} transitionMs={50} />);
    rerender(<PresenceHarness present={false} transitionMs={50} />);

    // Still mounted immediately after the flip -- exit motion is in flight.
    const node = screen.getByTestId('node');
    expect(node).toHaveAttribute('data-state', 'closed');

    act(() => {
      node.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });

    await waitFor(() => expect(screen.getByTestId('unmounted')).toBeInTheDocument());
  });

  it('calls onExitComplete exactly once when the exit transition completes', async () => {
    const onExitComplete = vi.fn();
    const { rerender } = render(
      <PresenceHarness present={true} transitionMs={50} onExitComplete={onExitComplete} />,
    );
    rerender(<PresenceHarness present={false} transitionMs={50} onExitComplete={onExitComplete} />);

    const node = screen.getByTestId('node');
    act(() => {
      node.dispatchEvent(new Event('transitionend', { bubbles: true }));
      // A duplicate/late event (e.g. a second transitioned property finishing) must not double-fire.
      node.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });

    await waitFor(() => expect(onExitComplete).toHaveBeenCalledTimes(1));
  });

  it('ignores a transitionend bubbled up from a descendant, not the registered node itself', async () => {
    function NestedHarness({ present }: { present: boolean }) {
      const { shouldRender, dataState, ref } = usePresence(present);
      if (!shouldRender) return <div data-testid="unmounted" />;
      return (
        <div
          ref={ref}
          data-testid="node"
          data-state={dataState}
          style={{ transitionProperty: 'opacity', transitionDuration: '50ms' }}
        >
          <span data-testid="child" style={{ transitionProperty: 'color', transitionDuration: '10ms' }} />
        </div>
      );
    }

    const { rerender } = render(<NestedHarness present={true} />);
    rerender(<NestedHarness present={false} />);

    const child = screen.getByTestId('child');
    act(() => {
      child.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });

    // The bubbled child event must not have completed the parent's exit.
    expect(screen.getByTestId('node')).toBeInTheDocument();

    const node = screen.getByTestId('node');
    act(() => {
      node.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });
    await waitFor(() => expect(screen.getByTestId('unmounted')).toBeInTheDocument());
  });

  it('a safety timeout unmounts even if transitionend never fires', async () => {
    vi.useFakeTimers();
    const onExitComplete = vi.fn();
    const { rerender } = render(
      <PresenceHarness present={true} transitionMs={50} onExitComplete={onExitComplete} />,
    );
    rerender(<PresenceHarness present={false} transitionMs={50} onExitComplete={onExitComplete} />);

    expect(screen.getByTestId('node')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(200); // 50ms declared duration + 100ms buffer, plus margin
    });

    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it('skips waiting entirely under reducedMotion, even with a transition declared', async () => {
    const { rerender } = render(<PresenceHarness present={true} transitionMs={300} reducedMotion={true} />);
    rerender(<PresenceHarness present={false} transitionMs={300} reducedMotion={true} />);

    await waitFor(() => expect(screen.getByTestId('unmounted')).toBeInTheDocument());
  });

  it('reads the live prefers-reduced-motion system setting when no override is given', async () => {
    mockMatchMedia(1280, true);
    const { rerender } = render(<PresenceHarness present={true} transitionMs={300} />);
    rerender(<PresenceHarness present={false} transitionMs={300} />);

    await waitFor(() => expect(screen.getByTestId('unmounted')).toBeInTheDocument());
  });

  it('re-presenting before exit completes cancels the pending unmount and returns to "open"', async () => {
    const onExitComplete = vi.fn();
    const { rerender } = render(
      <PresenceHarness present={true} transitionMs={50} onExitComplete={onExitComplete} />,
    );
    rerender(<PresenceHarness present={false} transitionMs={50} onExitComplete={onExitComplete} />);
    expect(screen.getByTestId('node')).toHaveAttribute('data-state', 'closed');

    rerender(<PresenceHarness present={true} transitionMs={50} onExitComplete={onExitComplete} />);
    expect(screen.getByTestId('node')).toHaveAttribute('data-state', 'open');

    // A transitionend arriving after re-presenting must not retroactively unmount.
    const node = screen.getByTestId('node');
    act(() => {
      node.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });
    expect(screen.getByTestId('node')).toBeInTheDocument();
    expect(onExitComplete).not.toHaveBeenCalled();
  });
});
