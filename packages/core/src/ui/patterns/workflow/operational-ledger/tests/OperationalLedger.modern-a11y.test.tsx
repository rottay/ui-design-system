import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { LedgerEntry } from '../contracts';
import ModernOperationalLedger from '../engines/modern';

const ENTRIES: LedgerEntry[] = [
  {
    id: '1',
    timestamp: '2026-03-18T10:00:00.000Z',
    description: 'Stock received',
    quantity: 50,
    type: 'credit',
    actor: 'Warehouse Bot',
    reason: 'PO-1234',
  },
];

describe('Modern OperationalLedger — scroll region reachability', () => {
  it('gives the scrolling table region a keyboard tab stop and a name', () => {
    render(<ModernOperationalLedger entries={ENTRIES} />);

    // The region owns `overflow: auto` and holds no focusable cell, so without
    // its own tab stop the overflowing columns are keyboard-unreachable.
    const region = screen.getByRole('region', { name: 'Ledger entries' });
    expect(region).toHaveAttribute('data-part', 'table-region');
    expect(region).toHaveAttribute('tabindex', '0');
  });
});

describe('Modern OperationalLedger — loading lifecycle', () => {
  it('announces the skeleton branch as busy', () => {
    const { container } = render(<ModernOperationalLedger entries={[]} loading />);

    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('aria-busy', 'true');
  });
});
