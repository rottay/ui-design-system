/**
 * C2b runtime laws: the epoch is REAL (environment changes invalidate and
 * re-measure), the production board shape is equivalence-proven across the
 * engine migration, and the persistence gate fails closed.
 */
import React, { useRef } from 'react';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DensityScope } from '@/infrastructure/runtime/foundation/density';
import { I18nProvider } from '@/infrastructure/runtime/i18n/runtime/context/provider';

import type { WidgetBoardItem } from '../../../../contracts';
import { resolveAdaptiveLayout } from '../..';
import { widgetItemsToAdaptiveInputs } from '../../policy';
import { normalizeLayoutRevision, useAdaptiveBoardLayout } from '..';

afterEach(cleanup);

function item(id: string, size: WidgetBoardItem['size'], order: number): WidgetBoardItem {
  return {
    id,
    accessibleTitle: id,
    title: id,
    content: null,
    size,
    order,
    visible: true,
  };
}

function EpochProbe({ items }: { items: WidgetBoardItem[] }) {
  const gridRef = useRef<HTMLElement | null>(null);
  const cellRefs = useRef(new Map<string, HTMLElement>());
  const layout = useAdaptiveBoardLayout({ items, gridRef, cellRefs, narrow: false });
  return <output data-testid="epoch">{layout.layoutEpoch}</output>;
}

describe('useAdaptiveBoardLayout — real environment inputs', () => {
  it('folds direction, locale and density into the invalidation epoch', () => {
    const items = [item('a', 'lg', 0)];
    const base = render(
      <I18nProvider locale="en">
        <DensityScope posture="comfortable">
          <EpochProbe items={items} />
        </DensityScope>
      </I18nProvider>
    );
    const baseEpoch = base.getByTestId('epoch').textContent!;
    expect(baseEpoch).toContain('ltr');
    expect(baseEpoch).toContain('en');
    base.unmount();

    const arabic = render(
      <I18nProvider locale="ar">
        <DensityScope posture="compact">
          <EpochProbe items={items} />
        </DensityScope>
      </I18nProvider>
    );
    const arabicEpoch = arabic.getByTestId('epoch').textContent!;
    // dir, locale AND density all moved — a stale epoch here would mean the
    // runtime reuses measurements across a metrics-changing environment.
    expect(arabicEpoch).toContain('rtl');
    expect(arabicEpoch).toContain('ar');
    expect(arabicEpoch).toContain('compact');
    expect(arabicEpoch).not.toBe(baseEpoch);
  });
});

describe('engine migration equivalence — the production board shape', () => {
  it('keeps app-bithire\'s real board (wide/lg pairs) byte-identical to the legacy geometry', () => {
    // The one production consumer ships 7 items, exclusively wide/lg, with
    // lg's adjacent (census 2026-08-01). For that shape the retired inline
    // packer and the solver agree exactly: wide rows are full, lg pairs
    // complete 6+6 rows. The migration changes NOTHING for the live board.
    const items = [
      item('w1', 'wide', 0),
      item('l1', 'lg', 1),
      item('l2', 'lg', 2),
      item('w2', 'wide', 3),
      item('l3', 'lg', 4),
      item('l4', 'lg', 5),
      item('w3', 'wide', 6),
    ];
    const { contracts, intents } = widgetItemsToAdaptiveInputs(items);
    const result = resolveAdaptiveLayout(contracts, intents, {
      cols: 12,
      posture: 'expanded',
    });
    const columns = result.placements.map((p) => `${p.colStart}/${p.colSpan}`);
    expect(columns).toEqual(['1/12', '1/6', '7/6', '1/12', '1/6', '7/6', '1/12']);
    expect(result.avoidableHoleCount).toBe(0);
    // Registered delta OUTSIDE this shape: a SOLITARY lg grows 6→8 to kill
    // its dead columns — that is the feature, not a regression.
    const solitary = resolveAdaptiveLayout(
      widgetItemsToAdaptiveInputs([item('only', 'lg', 0)]).contracts,
      [],
      { cols: 12, posture: 'expanded' }
    );
    expect(solitary.placements[0].colSpan).toBe(8);
  });
});

describe('normalizeLayoutRevision — versioned persistence gate', () => {
  const intents = [{ itemId: 'a', order: 0, visible: true }];

  it('admits a matching revision and discards orphans downstream', () => {
    expect(
      normalizeLayoutRevision(
        {
          schemaVersion: 1,
          profileId: 'p',
          revision: 3,
          scope: 'user',
          baseCatalogRevision: 'cat-7',
          intents,
          updatedAt: 'x',
        },
        'cat-7'
      )
    ).toEqual(intents);
  });

  it('fails CLOSED on foreign schema versions and stale catalog revisions', () => {
    expect(
      normalizeLayoutRevision(
        { schemaVersion: 2, baseCatalogRevision: 'cat-7', intents },
        'cat-7'
      )
    ).toEqual([]);
    expect(
      normalizeLayoutRevision(
        { schemaVersion: 1, baseCatalogRevision: 'cat-6', intents },
        'cat-7'
      )
    ).toEqual([]);
    expect(normalizeLayoutRevision('garbage', 'cat-7')).toEqual([]);
    expect(
      normalizeLayoutRevision(
        {
          schemaVersion: 1,
          baseCatalogRevision: 'cat-7',
          intents: [{ itemId: 42, order: 'x', visible: 'yes' }, ...intents],
        },
        'cat-7'
      )
    ).toEqual(intents);
  });
});
