/** @fileoverview ListSurface collection-stagger wiring -- cards-view entrance choreography. */

import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ListSurface } from '..';
import type { EntityAdapter, ListSurfaceConfig } from '../../../../../foundation/contracts';
import { renderSurface } from '../../../../../foundation/common/test-utils';
import { MotionProvider } from '@/infrastructure/runtime/motion';

interface Row {
  id: string;
  name: string;
}

const adapter: EntityAdapter<Row, Row> = {
  entity: 'row',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [{ key: 'name', fieldId: 'row.name' }],
};

function cardsConfig(): ListSurfaceConfig<Row> {
  return {
    visual: {
      defaultView: 'cards',
      mobileDefaultView: 'cards',
      allowViewSwitch: true,
      cardMinWidth: 260,
      // Force the product-profile entrance gate on; the motion policy still
      // decides whether it actually animates.
      profileOverrides: { animateEntrance: true },
    },
    presentation: {
      chrome: { title: 'Rows' },
      renderCard: (item) => <div data-testid="card">{item.name}</div>,
    },
    behavior: {
      rowKey: 'id',
      columns: [{ key: 'name', fieldId: 'row.name', header: 'Name', accessorKey: 'name' }],
      pagination: false,
    },
    access: { mode: 'all' },
  };
}

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({ id: String(index), name: `Row ${index}` }));
}

describe('ListSurface collection stagger (cards view)', () => {
  it('stamps the stagger preset on the card grid under a motion-permitting policy', async () => {
    const { container } = renderSurface(
      <ListSurface data={makeRows(5)} adapter={adapter} config={cardsConfig()} />,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-testid="card"]').length).toBe(5);
    });
    expect(container.querySelector('.ds-collection-stagger')).not.toBeNull();
    const items = container.querySelectorAll('[data-ds-stagger-item]');
    expect(items.length).toBe(5);
    expect((items[2] as HTMLElement).style.getPropertyValue('--ds-stagger-index')).toBe('2');
  });

  it('renders cards at their final state under reduced motion', async () => {
    const { container } = renderSurface(
      <MotionProvider reducedMotion>
        <ListSurface data={makeRows(5)} adapter={adapter} config={cardsConfig()} />
      </MotionProvider>,
    );

    await waitFor(() => {
      expect(container.querySelectorAll('[data-testid="card"]').length).toBe(5);
    });
    expect(container.querySelector('.ds-collection-stagger')).toBeNull();
    expect(container.querySelectorAll('[data-ds-stagger-item]').length).toBe(0);
  });
});
