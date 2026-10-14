import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PresenceList, useLayoutAnimation } from '..';
import { mockMatchMedia } from '@tests/support/browser/match-media';

afterEach(() => {
  mockMatchMedia(1280, false);
});

/** A row with a caller-controlled inline exit transition, spreading the props the list stamps. */
function Row({ id, transitionMs, ...rest }: { id: string; transitionMs?: number }) {
  return (
    <div
      data-testid={`row-${id}`}
      style={transitionMs === undefined
        ? undefined
        : { transitionProperty: 'opacity', transitionDuration: `${transitionMs}ms` }}
      {...rest}
    />
  );
}

function List({ ids, transitionMs, reducedMotion, onExitComplete }: {
  ids: string[];
  transitionMs?: number;
  reducedMotion?: boolean;
  onExitComplete?: (key: string) => void;
}) {
  return (
    <PresenceList reducedMotion={reducedMotion} onExitComplete={onExitComplete}>
      {ids.map((id) => <Row key={id} id={id} transitionMs={transitionMs} />)}
    </PresenceList>
  );
}

describe('PresenceList', () => {
  it('stamps data-state="open" on every present child', () => {
    render(<List ids={['a', 'b']} />);
    expect(screen.getByTestId('row-a')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('row-b')).toHaveAttribute('data-state', 'open');
  });

  it('keeps a removed child mounted as closed until its own exit motion ends', async () => {
    const { rerender } = render(<List ids={['a', 'b']} transitionMs={50} />);
    rerender(<List ids={['a']} transitionMs={50} />);

    const exiting = screen.getByTestId('row-b');
    expect(exiting).toHaveAttribute('data-state', 'closed');

    act(() => {
      exiting.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });

    await waitFor(() => expect(screen.queryByTestId('row-b')).not.toBeInTheDocument());
    expect(screen.getByTestId('row-a')).toBeInTheDocument();
  });

  it('drops a removed child immediately when it declares no exit motion', async () => {
    const { rerender } = render(<List ids={['a', 'b']} />);
    rerender(<List ids={['a']} />);

    await waitFor(() => expect(screen.queryByTestId('row-b')).not.toBeInTheDocument());
  });

  it('drops a removed child on the same commit under reduced motion', () => {
    const { rerender } = render(<List ids={['a', 'b']} transitionMs={50} reducedMotion />);
    rerender(<List ids={['a']} transitionMs={50} reducedMotion />);

    expect(screen.queryByTestId('row-b')).not.toBeInTheDocument();
  });

  it('fires onExitComplete on BOTH arms -- reduce drops on the same commit and still notifies', async () => {
    // Under reduce the child never enters the exiting list, so the callback has no
    // exit effect to fire from; a consumer finalising removal there would lose the
    // item's cleanup exactly where `usePresence` does fire it.
    const underReduce: string[] = [];
    const reduced = render(
      <List ids={['a', 'b']} transitionMs={50} reducedMotion onExitComplete={(key) => underReduce.push(key)} />,
    );
    reduced.rerender(
      <List ids={['a']} transitionMs={50} reducedMotion onExitComplete={(key) => underReduce.push(key)} />,
    );

    expect(reduced.queryByTestId('row-b')).not.toBeInTheDocument();
    await waitFor(() => expect(underReduce).toEqual(['b']));
    reduced.unmount();

    // The non-vacuity floor: the same callback, same removal, motion allowed.
    const withMotion: string[] = [];
    const full = render(
      <List ids={['a', 'b']} transitionMs={50} onExitComplete={(key) => withMotion.push(key)} />,
    );
    full.rerender(<List ids={['a']} transitionMs={50} onExitComplete={(key) => withMotion.push(key)} />);
    expect(withMotion).toEqual([]);

    act(() => {
      full.getByTestId('row-b').dispatchEvent(new Event('transitionend', { bubbles: true }));
    });
    await waitFor(() => expect(withMotion).toEqual(['b']));
  });

  it('cancels an exit when the same key returns before its motion ended', () => {
    const { rerender } = render(<List ids={['a', 'b']} transitionMs={50} />);
    rerender(<List ids={['a']} transitionMs={50} />);
    expect(screen.getByTestId('row-b')).toHaveAttribute('data-state', 'closed');

    rerender(<List ids={['a', 'b']} transitionMs={50} />);
    expect(screen.getAllByTestId('row-b')).toHaveLength(1);
    expect(screen.getByTestId('row-b')).toHaveAttribute('data-state', 'open');
  });
});

/** The P-88 shape: keeps its own data-state anatomy and forwards every other prop. */
const StrippedRow = React.forwardRef<HTMLDivElement, { id: string; 'data-state'?: string }>(
  function StrippedRow({ id, 'data-state': _callerState, ...rest }, ref) {
    return (
      <div
        ref={ref}
        data-testid={`row-${id}`}
        role="listitem"
        aria-label={`Row ${id}`}
        tabIndex={-1}
        {...rest}
        data-state="own"
      />
    );
  },
);

const SEAM_EXIT_DURATION = ['50ms', '0.05s'];
const SEAM_EXIT_CSS ="[data-ds-presence='closed'] { transition-property: opacity; transition-duration: 50ms; }";

function StrippedList({ ids, reducedMotion, onExitComplete, rowRef }: {
  ids: string[];
  reducedMotion?: boolean;
  onExitComplete?: (key: string) => void;
  rowRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <>
      <style>{SEAM_EXIT_CSS}</style>
      <PresenceList reducedMotion={reducedMotion} onExitComplete={onExitComplete}>
        {ids.map((id) => <StrippedRow key={id} id={id} ref={id === 'b' ? rowRef : undefined} />)}
      </PresenceList>
    </>
  );
}

describe('PresenceList seam (data-ds-presence)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stamps its own seam on every present child beside the compatibility data-state', () => {
    render(<List ids={['a', 'b']} />);
    for (const id of ['a', 'b']) {
      expect(screen.getByTestId(`row-${id}`)).toHaveAttribute('data-ds-presence', 'open');
      expect(screen.getByTestId(`row-${id}`)).toHaveAttribute('data-state', 'open');
    }
  });

  it('a stripped child exits through the seam: CSS keyed on it holds the child until its end event', async () => {
    const exited: string[] = [];
    const { rerender } = render(<StrippedList ids={['a', 'b']} onExitComplete={(key) => exited.push(key)} />);
    expect(screen.getByTestId('row-b')).toHaveAttribute('data-ds-presence', 'open');
    expect(SEAM_EXIT_DURATION).not.toContain(getComputedStyle(screen.getByTestId('row-b')).transitionDuration);

    rerender(<StrippedList ids={['a']} onExitComplete={(key) => exited.push(key)} />);
    const exiting = screen.getByTestId('row-b');
    expect(exiting).toHaveAttribute('data-ds-presence', 'closed');
    expect(exiting).toHaveAttribute('data-state', 'own');
    expect(SEAM_EXIT_DURATION).toContain(getComputedStyle(exiting).transitionDuration);
    expect(exited).toEqual([]);

    act(() => {
      exiting.dispatchEvent(new Event('transitionend', { bubbles: true }));
    });
    await waitFor(() => expect(screen.queryByTestId('row-b')).not.toBeInTheDocument());
    expect(exited).toEqual(['b']);
    expect(screen.getByTestId('row-a')).toHaveAttribute('data-ds-presence', 'open');
  });

  it('keeps the exit window the seam CSS declares when no end event arrives', () => {
    vi.useFakeTimers();
    const exited: string[] = [];
    const { rerender } = render(<StrippedList ids={['a', 'b']} onExitComplete={(key) => exited.push(key)} />);
    rerender(<StrippedList ids={['a']} onExitComplete={(key) => exited.push(key)} />);

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(screen.getByTestId('row-b')).toHaveAttribute('data-ds-presence', 'closed');
    act(() => {
      vi.advanceTimersByTime(2);
    });
    expect(screen.queryByTestId('row-b')).not.toBeInTheDocument();
    expect(exited).toEqual(['b']);
  });

  it('under reduced motion a stripped child is dropped on the same commit and still notifies', async () => {
    const exited: string[] = [];
    const { rerender } = render(
      <StrippedList ids={['a', 'b']} reducedMotion onExitComplete={(key) => exited.push(key)} />,
    );
    rerender(<StrippedList ids={['a']} reducedMotion onExitComplete={(key) => exited.push(key)} />);

    expect(screen.queryByTestId('row-b')).not.toBeInTheDocument();
    await waitFor(() => expect(exited).toEqual(['b']));
  });

  it('the seam does not remount: node, ref, focus and accessible name survive into the exit', () => {
    const rowRef = React.createRef<HTMLDivElement>();
    const { rerender } = render(<StrippedList ids={['a', 'b', 'c']} rowRef={rowRef} />);
    const before = screen.getByTestId('row-b');
    act(() => before.focus());
    expect(rowRef.current).toBe(before);

    rerender(<StrippedList ids={['a', 'c']} rowRef={rowRef} />);
    const during = screen.getByTestId('row-b');
    expect(during).toBe(before);
    expect(rowRef.current).toBe(before);
    expect(document.activeElement).toBe(before);
    expect(screen.getAllByRole('listitem', { name: 'Row b' })).toEqual([before]);
    expect(screen.getAllByTestId('row-b')).toHaveLength(1);
    const order = () => screen.getAllByRole('listitem').map((node) => node.getAttribute('data-testid'));
    expect(order()).toEqual(['row-a', 'row-b', 'row-c']);

    rerender(<StrippedList ids={['a', 'c', 'd']} rowRef={rowRef} />);
    expect(order()).toEqual(['row-a', 'row-b', 'row-c', 'row-d']);
    expect(screen.getByTestId('row-b')).toBe(before);
  });

  it('the seam selector matches exactly where the compatibility data-state selector matches', () => {
    const { rerender } = render(<List ids={['a', 'b']} transitionMs={50} />);
    const nodes = () => ['a', 'b'].map((id) => screen.queryByTestId(`row-${id}`)).filter(Boolean) as HTMLElement[];
    const parity = () => nodes().forEach((node) => {
      for (const state of ['open', 'closed']) {
        expect(node.matches(`[data-ds-presence='${state}']`)).toBe(node.matches(`[data-state='${state}']`));
      }
    });
    parity();
    rerender(<List ids={['a']} transitionMs={50} />);
    expect(screen.getByTestId('row-b').matches("[data-ds-presence='closed']")).toBe(true);
    parity();
  });
});

describe('useLayoutAnimation({ kind: "presence" })', () => {
  function Gated({ present }: { present: boolean }) {
    const { shouldRender, dataState, ref } = useLayoutAnimation({ kind: 'presence', present });
    if (!shouldRender) return <div data-testid="unmounted" />;
    return <div ref={ref} data-testid="node" data-state={dataState} />;
  }

  it('returns the presence shape and gates unmount on the node', async () => {
    const { rerender } = render(<Gated present />);
    expect(screen.getByTestId('node')).toHaveAttribute('data-state', 'open');

    rerender(<Gated present={false} />);
    await waitFor(() => expect(screen.getByTestId('unmounted')).toBeInTheDocument());
  });
});
