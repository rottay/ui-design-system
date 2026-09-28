/**
 * The badge family in a real browser: the decisions its derived channels
 * consume move a destination's computed style with a negative control, across
 * the chip, count and dot contexts, and no gated vertical mode carries a
 * serious axe finding beyond what is pinned.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernBadge from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type BadgeProps = React.ComponentProps<typeof ModernBadge>;

const badge = (props: Partial<BadgeProps>, label: React.ReactNode = 'Ready') =>
  renderToStaticMarkup(<ModernBadge {...(props as BadgeProps)}>{label}</ModernBadge>);

const markup = [
  `<div id="solid">${badge({ badgeStyle: 'solid', variant: 'primary' })}</div>`,
  `<div id="soft">${badge({ badgeStyle: 'soft', variant: 'success' }, 'Done')}</div>`,
  `<div id="chip">${badge({ kind: 'chip' }, 'Chip')}</div>`,
  `<div id="counted">${badge({ kind: 'chip', count: 7 }, 'Inbox')}</div>`,
  `<div id="dotted">${badge({ dot: true }, 'Live')}</div>`,
  `<div id="square">${badge({ radius: 'sm' }, 'Square')}</div>`,
  `<div id="oracle" style="border-radius: var(--ds-radius-sm)"></div>`,
].join('');

const SOLID = "#solid [data-part='root']";
const CHIP = "#chip [data-part='root']";
const COUNT = "#counted [data-part='count']";
// An indicator badge IS the dot: the root wears it, there is no child part.
const DOT = "#dotted [data-part='root'][data-dot='true']";
// The step a square badge shape resolves to: it rides the tenant's own radius ramp.
const SQUARE = "#square [data-part='root']";

describeCausality({
  family: 'badge',
  markup,
  targets: [
    { id: 'solidFill', selector: SOLID, property: 'background-color' },
    { id: 'chipPad', selector: CHIP, property: 'padding-left' },
    { id: 'countFill', selector: COUNT, property: 'background-color' },
    { id: 'dotSize', selector: DOT, property: 'width' },
    { id: 'squareCorner', selector: SQUARE, property: 'border-top-left-radius' },
  ],
  decisions: {
    // The palette reaches the tone the chip wears, and leaves its geometry alone.
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['solidFill'], holds: 'chipPad', in: VERTICALS },
    // Density reaches the chip's own inline room, and not its fill.
    'density.mode': { value: 'spacious', moves: ['chipPad'], holds: 'solidFill', in: VERTICALS },
    // The radius dial reaches the square step's corner, and not the fill.
    'shape.radius-scale': { value: 1.2, moves: ['squareCorner'], holds: 'solidFill', in: VERTICALS },
  },
});

/**
 * Measured debt, pinned by node IDENTITY. CLEAN, and it must stay clean.
 *
 * `bithire dark` had three rows -- the anchor and both chip labels -- and they
 * DRAINED: that scope's dark block now re-derives its own canvas ground instead
 * of inheriting the light body's, so those nodes no longer sit on a near-white
 * ground. `rottay dark`'s soft `Done` chip DRAINED when the sheet's dark scope
 * gave `--ds-color-success-bg` a dark leg: the wash is step 50, which painted
 * #f0fdf4 under the dark-mode ink. Dropped by identity, not waived: a relapse reddens here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('badge derived channels and accessibility', () => {
  it('derives the count and dot contexts from the family deriver', async () => {
    const r = (
      await measureArms({
        vertical: 'bithire',
        markup,
        arms: { base: {} },
        targets: [
          { id: 'solidFill', selector: SOLID, property: 'background-color' },
          { id: 'softFill', selector: "#soft [data-part='root']", property: 'background-color' },
          { id: 'countFill', selector: COUNT, property: 'background-color' },
          { id: 'countCorner', selector: COUNT, property: 'border-top-left-radius' },
          { id: 'dotSize', selector: DOT, property: 'width' },
        ],
      })
    ).base!;
    // A solid chip and a soft one do not share a ground.
    expect(r.solidFill).not.toBe(r.softFill);
    // The count is a pill riding its own channel, not the chip's fill.
    expect(r.countFill).not.toBe(r.solidFill);
    expect(Number.parseFloat(r.countCorner)).toBeGreaterThan(0);
    // The indicator is a dot with a real diameter, not a collapsed box.
    expect(Number.parseFloat(r.dotSize)).toBeGreaterThan(0);
  }, 120_000);

  it('paints the square step at the tenant radius-sm, in every vertical', async () => {
    for (const vertical of VERTICALS) {
      const r = (
        await measureArms({
          vertical,
          markup,
          arms: { base: {} },
          targets: [
            { id: 'corner', selector: SQUARE, property: 'border-top-left-radius' },
            { id: 'oracle', selector: '#oracle', property: 'border-top-left-radius' },
          ],
        })
      ).base!;
      expect(r.corner, vertical).toBe(r.oracle);
    }
  }, 120_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
