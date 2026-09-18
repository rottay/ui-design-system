/**
 * The column-settings family in a real browser: every keypath the family
 * deriver declares in `consumes` is exercised against the family's OWN
 * computed paint with a negative control -- including the seeded palette,
 * whose only reader is the pin-side indicator the resting mount omits -- and
 * axe holds beyond the pinned debt.
 */
import React from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import ModernColumnSettingsDropdown from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const noop = () => {};

async function panelMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <EngineProvider defaultEngine="modern">
      <ModernColumnSettingsDropdown
        allColumns={[
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status' },
          { key: 'owner', header: 'Owner' },
        ]}
        visibleColumns={['name', 'status']}
        lockedColumns={[]}
        columnOrder={['name', 'status', 'owner']}
        pinnedColumns={{ left: [], right: [] }}
        onToggleVisibility={noop}
        onReorder={noop}
        onTogglePin={noop}
        onReset={noop}
      />
    </EngineProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const markup = await panelMarkup();

const ROOT = ".ds-column-settings[data-part='root']";
const ROW = `${ROOT} [data-part='row']`;
const TITLE = `${ROOT} [data-part='title']`;

describeCausality({
  family: 'column-settings',
  markup,
  targets: [
    { id: 'rowGap', selector: ROW, property: 'column-gap' },
    { id: 'rowCorner', selector: ROW, property: 'border-top-left-radius' },
    { id: 'titleSize', selector: TITLE, property: 'font-size' },
  ],
  decisions: {
    // `consumes: density` -- the row rhythm rides the density-scaled spacing ramp.
    'density.mode': { value: 'spacious', moves: ['rowGap'], holds: 'rowCorner', in: VERTICALS },
    // `consumes: surfaces.radiusScale` -- the row corner is the family's own channel.
    'shape.radius-scale': { value: 1.2, moves: ['rowCorner'], holds: 'rowGap', in: VERTICALS },
    // `consumes: typography.roles` -- the panel title is the family's own type step.
    'typography.scale': { value: 1.08, moves: ['titleSize'], holds: 'rowCorner', in: VERTICALS },
    // `consumes: palette.*` needs a pinned column to paint; measured below.
  },
});

/**
 * Measured contrast debt pinned by node identity; the fix is ink derivation,
 * never an axe exclusion.
 *
 * `bithire dark` had six rows -- the search input, the counter, the panel title
 * and the three column titles -- and they DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * none of those nodes sits on a near-white ground any more. Dropped by
 * identity, not waived: with no entry the scope must measure clean, and a
 * relapse reddens here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire light': { 'color-contrast': ['span[data-part="counter"]', 'span[title="Owner"]'] },
  'evnto light': { 'color-contrast': ['span[data-part="counter"]', 'span[title="Owner"]'] },
  'rottay dark': { 'color-contrast': ['#input-_R_3_'] },
};

describe('column-settings accessibility', () => {
  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});

/* ---------------------------------------------------------------------------
 * The seeded palette, which the resting mount cannot show.
 *
 * The panel's resting ink (title, counter, column labels, hairline) reads the
 * vertical's neutral roles, and no palette decision moves those. The family's
 * one seeded reading is the `pin-side` indicator, which renders only for a
 * pinned column -- so the probe mounts the same panel with one column pinned
 * rather than borrowing the ink of a composed primitive.
 * ------------------------------------------------------------------------ */

async function pinnedMarkup(): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <EngineProvider defaultEngine="modern">
      <ModernColumnSettingsDropdown
        allColumns={[
          { key: 'name', header: 'Name' },
          { key: 'status', header: 'Status' },
          { key: 'owner', header: 'Owner' },
        ]}
        visibleColumns={['name', 'status']}
        lockedColumns={[]}
        columnOrder={['name', 'status', 'owner']}
        pinnedColumns={{ left: ['name'], right: [] }}
        onToggleVisibility={noop}
        onReorder={noop}
        onTogglePin={noop}
        onReset={noop}
      />
    </EngineProvider>,
  );
  let html = '';
  for await (const chunk of prelude) html += String(chunk);
  return html;
}

const pinnedPanel = await pinnedMarkup();

describe('column-settings declared consumes', () => {
  it('moves the pin-side ink with the seeded palette and holds the row geometry', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: pinnedPanel,
      arms: {
        base: {},
        'palette.seeds': { 'palette.seeds': { primary: '#2F6B9A' } },
        'density.mode': { 'density.mode': 'spacious' },
      },
      targets: [
        { id: 'pinInk', selector: `${ROOT} [data-part='pin-side']`, property: 'color' },
        { id: 'labelInk', selector: `${ROOT} [data-part='label']`, property: 'color' },
        { id: 'rowGap', selector: ROW, property: 'column-gap' },
      ],
    });
    const base = readings.base!;
    expect(base.pinInk, 'the pinned column paints its side indicator').not.toMatch(/^<no match/);
    // `consumes: palette.*` -- the pin-side indicator reads the seeded primary.
    expect(readings['palette.seeds']!.pinInk).not.toBe(base.pinInk);
    // Negative control: the row rhythm is geometry, not colour.
    expect(readings['palette.seeds']!.rowGap).toBe(base.rowGap);
    // The family's neutral ink is not seeded, so the probe names the ONE reader.
    expect(readings['palette.seeds']!.labelInk).toBe(base.labelInk);
    // The control decision moves the geometry and leaves the seeded ink alone.
    expect(readings['density.mode']!.rowGap).not.toBe(base.rowGap);
    expect(readings['density.mode']!.pinInk).toBe(base.pinInk);
  }, 180_000);
});
