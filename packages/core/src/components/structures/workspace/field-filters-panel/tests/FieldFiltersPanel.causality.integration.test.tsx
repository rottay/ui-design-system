/**
 * The field-filters-panel family in a real browser (WO-FAM-08 B9).
 *
 * NO DERIVER, DELIBERATELY: the only name this skin reads without a producer is
 * `--ds-material-control-highlight`, which belongs to the materials vocabulary
 * that `derivation/materials` owns. A `chrome/field-filters-panel` that produced
 * it would be a second owner of another family's channel, so it stays this
 * cut's named residue instead.
 *
 * With no `consumes` list to discharge, this suite probes what actually reaches
 * the family's own paint -- and pins what does NOT as an executable inventory
 * rather than leaving the gap implicit.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { waitFor } from '@testing-library/react';

import { FieldFiltersPanel } from '../index';
import { renderWithEngine } from '@tests/support/engine';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

const ROOT_SELECTOR = '.ds-field-filters-panel[data-part="root"]';

async function panelMarkup(): Promise<string> {
  const { container } = renderWithEngine(
    <FieldFiltersPanel
      filters={[
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'open', label: 'Open' },
            { value: 'closed', label: 'Closed' },
          ],
        },
        { key: 'window', label: 'Window', type: 'date-range' },
      ]}
      presets={[{ key: 'hot', label: 'Needs attention', values: { status: 'open' } }]}
      values={{ status: 'open' }}
      onChange={() => undefined}
    />,
    'modern',
  );
  const root = await waitFor(() => {
    const node = container.querySelector(ROOT_SELECTOR) as HTMLElement;
    expect(node).not.toBeNull();
    return node;
  });
  return root.outerHTML;
}

const panel = await panelMarkup();
const markup = `<div id="ffp" style="inline-size:60rem">${panel}</div>`;

const ROOT = `#ffp ${ROOT_SELECTOR}`;
const SIGNAL_PRIMARY = `${ROOT} [data-part='signal'][data-tone='primary']`;
const CHIP = `${ROOT} [data-part='preset-chip']`;
const CHIP_ICON = `${ROOT} [data-part='preset-chip-icon']`;
const CARD = `${ROOT} [data-part='filter-card']`;
const TITLE_GROUP = `${ROOT} [data-part='title-group']`;
const PRESETS_ROW = `${ROOT} [data-part='presets-row']`;
const CONTROL = `${ROOT} .ds-field-filters-panel__control`;

describeCausality({
  family: 'field-filters-panel',
  markup,
  targets: [
    // The live filter count and the chip's glyph chip are the family's own
    // seeded signals; everything else it paints is neutral by design.
    { id: 'signalInk', selector: SIGNAL_PRIMARY, property: 'color' },
    { id: 'chipIconGround', selector: CHIP_ICON, property: 'background-color' },
    // The chip's type step and its density-scaled target, measured where they
    // LAND -- on the composed Button -- rather than where they are written.
    { id: 'chipFont', selector: CHIP, property: 'font-size' },
    { id: 'chipPad', selector: CHIP, property: 'padding-left' },
    // The control: the card's corner is a px constant this family owns
    // outright, so no decision in the catalog may move it.
    { id: 'cardCorner', selector: CARD, property: 'border-top-left-radius' },
  ],
  decisions: {
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['signalInk', 'chipIconGround'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    'typography.scale': {
      value: 1.08,
      moves: ['chipFont'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    'density.mode': {
      value: 'spacious',
      moves: ['chipPad'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 * Registered, never excluded; a scope with no entry is a scope that must stay
 * clean.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('field-filters-panel causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(panel).toContain('data-part="title-group"');
    expect(panel).toContain('data-part="presets-row"');
    expect(panel).toContain('data-part="preset-chip"');
    expect(panel).toContain('data-part="filter-card"');
    // The family paints nothing from the TSX.
    expect(panel).not.toContain('style="background');
    expect(panel).not.toContain('aspect-ratio');
  });

  /**
   * The two lanes this cut consumed: both were stamped and painted by nobody,
   * so a long eyebrow or a long preset label pushed its lane past the panel
   * instead of wrapping inside it. The rule is `min-inline-size: 0`, which is
   * what the panel's other copy lanes already state.
   */
  it('lets both wrapping lanes shrink inside the panel', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'titleGroup', selector: TITLE_GROUP, property: 'min-inline-size' },
        { id: 'presetsRow', selector: PRESETS_ROW, property: 'min-inline-size' },
        { id: 'presetsWrap', selector: PRESETS_ROW, property: 'flex-wrap' },
      ],
    });
    const r = readings.base!;
    expect(r.titleGroup).toBe('0px');
    expect(r.presetsRow).toBe('0px');
    // The lane wraps rather than overflows, which is what the floor is for.
    expect(r.presetsWrap).toBe('wrap');
  }, 120_000);

  /**
   * What the catalog does NOT reach in this family, pinned executably instead
   * of left implicit. Each of these is a real decision with a real fan-out
   * elsewhere; here it moves nothing, and the day one of them starts to, this
   * case goes red and the inventory is re-adjudicated rather than silently
   * outgrown.
   *
   *  - `shape.radius-scale`: every corner this family owns is a px literal
   *    (card 18, control 12, pills 999) and the composed chip is a `round`
   *    Button, which closes on the full rung the ramp does not bend.
   *  - `motion.dial`: the panel entrance reads `--ds-motion-normal`, an alias of
   *    the cadence's `calm` step, which the theme's own entrance duration sets
   *    and the dial does not bend.
   *  - `states.focus-style`: the family's one focus decision is delivered
   *    through `--ds-button-focus-ring` under `:focus-visible`, a platform state
   *    no static probe can enter -- see the residue note in the roster row.
   */
  it('pins the decisions that reach none of its paint', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: {
        base: {},
        'shape.radius-scale': { 'shape.radius-scale': 1.2 },
        'motion.dial': { 'motion.dial': { durationScale: 1.3 } },
        'states.focus-style': { 'states.focus-style': 'glow' },
      },
      targets: [
        { id: 'cardCorner', selector: CARD, property: 'border-top-left-radius' },
        { id: 'controlCorner', selector: CONTROL, property: 'border-top-left-radius' },
        { id: 'chipCorner', selector: CHIP, property: 'border-top-left-radius' },
        { id: 'rootMotion', selector: ROOT, property: 'animation-duration' },
        { id: 'chipShadow', selector: CHIP, property: 'box-shadow' },
      ],
    });
    const base = readings.base!;
    for (const arm of ['shape.radius-scale', 'motion.dial', 'states.focus-style']) {
      expect(readings[arm], `${arm} is inert for this family`).toEqual(base);
    }
    // And the values the inventory is about, so a repaint is visible here too.
    expect(base.cardCorner).toBe('18px');
    expect(base.controlCorner).toBe('12px');
    expect(base.chipCorner).toBe('9999px');
  }, 240_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
