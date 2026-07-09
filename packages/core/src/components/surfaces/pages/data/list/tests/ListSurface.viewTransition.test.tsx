/** @fileoverview ListSurface view-transition tests -- per-card record identity. */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { recordTransitionName } from '../../../../../../motion';
import { ListSurface } from '..';
import type { EntityAdapter, ListSurfaceConfig } from '../../../../foundation/types';
import { renderSurface } from '../../../../foundation/common/test-utils';

interface RawRecord {
  id: string;
  name: string;
}

const adapter: EntityAdapter<RawRecord, RawRecord> = {
  entity: 'record',
  version: '1.0.0',
  map: (raw) => raw,
  fields: [{ key: 'name', fieldId: 'record.name' }],
};

const COLUMNS = [{ key: 'name', fieldId: 'record.name', header: 'Name' }];

const rows: RawRecord[] = [
  { id: 'rec-1', name: 'Ana Gomez' },
  { id: 'rec-2', name: 'Liam Chen' },
];

function buildConfig(overrides: Partial<ListSurfaceConfig<RawRecord>> = {}): ListSurfaceConfig<RawRecord> {
  return {
    visual: { defaultView: 'cards', allowViewSwitch: false },
    presentation: { chrome: { title: 'Records' } },
    behavior: { columns: COLUMNS },
    ...overrides,
  };
}

/** Finds the element carrying a given view-transition-name in the container. */
function findByTransitionName(container: HTMLElement, name: string): HTMLElement | undefined {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).find(
    (el) => el.style.viewTransitionName === name
  );
}

describe('ListSurface card view-transition names', () => {
  it('derives each card name from the configured rowKey via resolveRowKey', async () => {
    const config = buildConfig({ behavior: { columns: COLUMNS, rowKey: 'id' } });

    const { container } = renderSurface(<ListSurface data={rows} adapter={adapter} config={config} />);

    await screen.findByText('Ana Gomez');

    const first = findByTransitionName(container, recordTransitionName('rec-1'));
    const second = findByTransitionName(container, recordTransitionName('rec-2'));

    expect(first?.textContent).toContain('Ana Gomez');
    expect(second?.textContent).toContain('Liam Chen');
  });

  it('falls back to the array index when no rowKey is configured', async () => {
    const config = buildConfig();

    const { container } = renderSurface(<ListSurface data={rows} adapter={adapter} config={config} />);

    await screen.findByText('Ana Gomez');

    const first = findByTransitionName(container, recordTransitionName('0'));
    const second = findByTransitionName(container, recordTransitionName('1'));

    expect(first?.textContent).toContain('Ana Gomez');
    expect(second?.textContent).toContain('Liam Chen');
  });
});
