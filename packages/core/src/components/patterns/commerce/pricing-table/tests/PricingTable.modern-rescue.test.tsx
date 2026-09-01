import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithEngine } from '@tests/support/engine';
import type { PricingTableProps } from '../contracts';
import ModernPricingTable from '../engines/modern';

function createProps(overrides: Partial<PricingTableProps> = {}): PricingTableProps {
  return {
    plans: [
      { id: 'starter', name: 'Starter', price: 0, cta: 'Start', features: { seats: true, sso: false } },
      { id: 'pro', name: 'Pro', price: 29, cta: 'Upgrade', popular: true, features: { seats: true, sso: true } },
    ],
    features: [
      { key: 'seats', label: 'Team seats', category: 'Core' },
      { key: 'sso', label: 'SSO', category: 'Security' },
    ],
    ...overrides,
  };
}

describe('ModernPricingTable - comparison grid semantics', () => {
  it('names the grid and scopes every header cell', async () => {
    renderWithEngine(<ModernPricingTable {...createProps()} />, 'modern');

    // A comparison grid with unscoped headers reaches a screen reader as bare
    // cells: "Included" with no row and no column to belong to.
    const table = await screen.findByRole('table', { name: 'Plan comparison' });
    expect(table).toBeInTheDocument();

    // Scope the query to the header row: `scope="colgroup"` category rows also
    // map to the columnheader role, so a document-wide query mixes both kinds.
    const headerRow = table.querySelector('thead tr') as HTMLElement;
    const columnHeaders = Array.from(headerRow.querySelectorAll('th'));
    expect(columnHeaders.map((h) => h.getAttribute('scope'))).toEqual([
      'col',
      'col',
      'col',
    ]);
    expect(columnHeaders[0]).toHaveTextContent('Features');
  });

  it('promotes feature labels to row headers', async () => {
    renderWithEngine(<ModernPricingTable {...createProps()} />, 'modern');

    const seats = await screen.findByRole('rowheader', { name: 'Team seats' });
    expect(seats).toHaveAttribute('scope', 'row');
    expect(seats.tagName).toBe('TH');

    const sso = screen.getByRole('rowheader', { name: 'SSO' });
    expect(sso).toHaveAttribute('scope', 'row');
  });

  it('marks category rows as group headers rather than data cells', async () => {
    renderWithEngine(<ModernPricingTable {...createProps()} />, 'modern');

    const core = await screen.findByText('Core');
    expect(core.tagName).toBe('TH');
    expect(core).toHaveAttribute('scope', 'colgroup');
  });
});

describe('ModernPricingTable - first-load skeleton footprint', () => {
  it('keeps a real footprint when loading before any plan has arrived', async () => {
    const { container } = renderWithEngine(
      <ModernPricingTable {...createProps({ plans: [], features: [], loading: true })} />,
      'modern',
    );

    await screen.findByRole('status', { name: 'Loading' });

    // Mirroring the (still empty) arrays made first load render an empty box
    // that reflowed the page the moment real content landed.
    expect(container.querySelectorAll('[data-part="skeleton-plan"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-part="skeleton-row"]').length).toBeGreaterThan(0);
  });

  it('still mirrors the real footprint once plans are known', async () => {
    const { container } = renderWithEngine(
      <ModernPricingTable {...createProps({ loading: true })} />,
      'modern',
    );

    await screen.findByRole('status', { name: 'Loading' });

    expect(container.querySelectorAll('[data-part="skeleton-plan"]').length).toBe(2);
    expect(container.querySelectorAll('[data-part="skeleton-row"]').length).toBe(2);
  });
});
