import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

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
