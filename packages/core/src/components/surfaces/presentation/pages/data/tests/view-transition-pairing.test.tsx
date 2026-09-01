/**
 * @fileoverview List <-> detail view-transition pairing.
 * @description Proves a list card and the detail surface for the SAME
 * record resolve the SAME `view-transition-name`, which is the precondition
 * for the browser to morph the element instead of cross-fading the page
 * root. This is the regression test for the bug where the list named its
 * cards by array index and the detail surface used an unrelated constant
 * name, so the two elements never shared a name and no morph occurred.
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { recordTransitionName } from '@/graphics/motion';
import { ListSurface } from '../list';
import { DetailSurface } from '../detail';
import type { DetailSurfaceConfig, EntityAdapter, ListSurfaceConfig } from '../../../../foundation/contracts';
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

const rows: RawRecord[] = [
  { id: 'rec-1', name: 'Ana Gomez' },
  { id: 'rec-2', name: 'Liam Chen' },
];

/** Finds the element carrying a given view-transition-name in the container. */
function findByTransitionName(container: HTMLElement, name: string): HTMLElement | undefined {
  return Array.from(container.querySelectorAll<HTMLElement>('*')).find(
    (el) => el.style.viewTransitionName === name
  );
}

describe('list-to-detail view-transition pairing', () => {
  it('resolves the SAME view-transition-name for a list card and the detail surface showing that record', async () => {
    const listConfig: ListSurfaceConfig<RawRecord> = {
      visual: { defaultView: 'cards', allowViewSwitch: false },
      presentation: { chrome: { title: 'Records' } },
      behavior: {
        columns: [{ key: 'name', fieldId: 'record.name', header: 'Name' }],
        rowKey: 'id',
      },
    };

    const detailConfig: DetailSurfaceConfig<RawRecord> = {
      visual: {},
      presentation: { title: (item) => item.name },
      behavior: { recordKey: 'id' },
    };

    const list = renderSurface(<ListSurface data={rows} adapter={adapter} config={listConfig} />);
    await screen.findByText('Ana Gomez');
    const clickedCard = findByTransitionName(list.container, recordTransitionName('rec-2'));
    expect(clickedCard?.textContent).toContain('Liam Chen');
    const clickedCardTransitionName = clickedCard?.style.viewTransitionName;
    list.unmount();

    const detail = renderSurface(<DetailSurface data={rows[1]} adapter={adapter} config={detailConfig} />);
    await screen.findByText('Liam Chen');
    const detailBody = findByTransitionName(detail.container, recordTransitionName('rec-2'));

    expect(detailBody).toBeDefined();
    expect(clickedCardTransitionName).toBeTruthy();
    // The exact assertion that catches a regression to two files agreeing on
    // a convention rather than a shared resolution: both sides must name the
    // SAME element with the SAME string for the SAME record.
    expect(clickedCardTransitionName).toBe(detailBody?.style.viewTransitionName);
  });

  it('does not fabricate a pairing when only the list side configures identity -- a safe crossfade instead of a false morph', async () => {
    const listConfig: ListSurfaceConfig<RawRecord> = {
      visual: { defaultView: 'cards', allowViewSwitch: false },
      presentation: { chrome: { title: 'Records' } },
      behavior: {
        columns: [{ key: 'name', fieldId: 'record.name', header: 'Name' }],
        rowKey: 'id',
      },
    };

    const detailConfig: DetailSurfaceConfig<RawRecord> = {
      visual: {},
      presentation: { title: (item) => item.name },
      behavior: {},
    };

    const list = renderSurface(<ListSurface data={rows} adapter={adapter} config={listConfig} />);
    await screen.findByText('Ana Gomez');
    const clickedCard = findByTransitionName(list.container, recordTransitionName('rec-2'));
    expect(clickedCard).toBeDefined();
    list.unmount();

    const detail = renderSurface(<DetailSurface data={rows[1]} adapter={adapter} config={detailConfig} />);
    await screen.findByText('Liam Chen');

    expect(findByTransitionName(detail.container, recordTransitionName('rec-2'))).toBeUndefined();
    expect(findByTransitionName(detail.container, 'ds-vt-detail-body')).toBeDefined();
  });
});
