/**
 * @fileoverview The ledger's render budget under purely visual states.
 *
 * The defect this pins: the focusable scroll region took its interaction state
 * from a hook called in the ledger itself, so every pointer enter, press,
 * release and leave over the region re-rendered the whole ledger — every row,
 * every cell — to restamp one attribute nothing painted.
 */

import React, { Profiler } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { LedgerEntry } from '../contracts';
import ModernOperationalLedger from '../engines/modern';

/** Entries whose `map` reports each render of the ledger's own body. */
function countedEntries(onLedgerRender: () => void): LedgerEntry[] {
  const entries: LedgerEntry[] = Array.from({ length: 12 }, (_, index) => ({
    id: String(index),
    timestamp: '2026-03-18T10:00:00.000Z',
    description: `Entry ${index}`,
    quantity: index + 1,
    type: index % 2 === 0 ? 'credit' : 'debit',
    actor: 'Warehouse Bot',
    reason: 'PO-1234',
  }));
  Object.defineProperty(entries, 'map', {
    value: (...args: Parameters<LedgerEntry[]['map']>) => {
      onLedgerRender();
      return Array.prototype.map.apply(entries, args);
    },
  });
  return entries;
}

function mountLedger() {
  /* `commits` is every React commit under the ledger, whichever node it touched;
     `ledgerRenders` is the ledger's own body running again, rows and all. */
  const count = { commits: 0, ledgerRenders: 0 };
  const entries = countedEntries(() => {
    count.ledgerRenders += 1;
  });
  render(
    <Profiler
      id="ledger"
      onRender={() => {
        count.commits += 1;
      }}
    >
      <ModernOperationalLedger entries={entries} />
    </Profiler>,
  );
  expect(count).toEqual({ commits: 1, ledgerRenders: 1 });
  count.commits = 0;
  count.ledgerRenders = 0;
  return { count, region: screen.getByRole('region', { name: 'Ledger entries' }) };
}

const MOUSE = { pointerType: 'mouse' };

describe('OperationalLedger modern engine — visual states stay off the ledger', () => {
  it('commits nothing for five pointer cycles over the scroll region', () => {
    const { count, region } = mountLedger();

    for (let cycle = 0; cycle < 5; cycle += 1) {
      fireEvent.pointerEnter(region, MOUSE);
      fireEvent.pointerDown(region, MOUSE);
      fireEvent.pointerUp(region, MOUSE);
      fireEvent.pointerLeave(region, MOUSE);
    }

    expect(count).toEqual({ commits: 0, ledgerRenders: 0 });
    expect(region).not.toHaveAttribute('data-state');
  });

  it('commits nothing when a pointer press is what focuses the region', () => {
    const { count, region } = mountLedger();

    fireEvent.pointerEnter(region, MOUSE);
    fireEvent.pointerDown(region, MOUSE);
    act(() => region.focus());
    fireEvent.pointerUp(region, MOUSE);
    fireEvent.pointerLeave(region, MOUSE);
    act(() => region.blur());

    expect(count).toEqual({ commits: 0, ledgerRenders: 0 });
  });

  it('spends one region-only commit per keyboard focus change, and never re-renders the ledger', () => {
    const { count, region } = mountLedger();

    act(() => region.focus());
    expect(region).toHaveAttribute('data-state', 'focus-visible');
    expect(count).toEqual({ commits: 1, ledgerRenders: 0 });

    act(() => region.blur());
    expect(region).not.toHaveAttribute('data-state');
    expect(count).toEqual({ commits: 2, ledgerRenders: 0 });
  });

  it('commits nothing for pointer travel over a region that holds a keyboard focus', () => {
    const { count, region } = mountLedger();

    act(() => region.focus());
    count.commits = 0;

    fireEvent.pointerEnter(region, MOUSE);
    fireEvent.pointerDown(region, MOUSE);
    fireEvent.pointerUp(region, MOUSE);
    fireEvent.pointerLeave(region, MOUSE);
    expect(count).toEqual({ commits: 0, ledgerRenders: 0 });
    expect(region).toHaveAttribute('data-state', 'focus-visible');

    act(() => region.blur());
    expect(count).toEqual({ commits: 1, ledgerRenders: 0 });
  });

  it('keeps the region a labelled, focusable scroll container around the table', () => {
    const { region } = mountLedger();
    expect(region).toHaveAttribute('data-part', 'table-region');
    expect(region.tabIndex).toBe(0);
    expect(region.firstElementChild).toHaveAttribute('data-part', 'table');
    expect(region.querySelectorAll("[data-part='entry']")).toHaveLength(12);
  });
});
