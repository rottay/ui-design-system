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
].join('');

const SOLID = "#solid [data-part='root']";
const CHIP = "#chip [data-part='root']";
const COUNT = "#counted [data-part='count']";
// An indicator badge IS the dot: the root wears it, there is no child part.
const DOT = "#dotted [data-part='root'][data-dot='true']";

describeCausality({
  family: 'badge',
  markup,
  targets: [
    { id: 'solidFill', selector: SOLID, property: 'background-color' },
    { id: 'chipPad', selector: CHIP, property: 'padding-left' },
    { id: 'countFill', selector: COUNT, property: 'background-color' },
    { id: 'dotSize', selector: DOT, property: 'width' },
  ],
  decisions: {
    // The palette reaches the tone the chip wears, and leaves its geometry alone.
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['solidFill'], holds: 'chipPad', in: VERTICALS },
    // Density reaches the chip's own inline room, and not its fill.
    'density.mode': { value: 'spacious', moves: ['chipPad'], holds: 'solidFill', in: VERTICALS },
  },
});

/**
 * Measured debt, pinned by node IDENTITY. Registered, never excluded: the soft
 * chip's ink does not clear the contrast floor on these dark grounds, and
 * bithire's dark ground fails it for the anchor as well. The fix is a
 * mode-aware ink derivation for the soft tone, never an axe exclusion.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'rottay dark': { 'color-contrast': ['span[title="Done"]'] },
  'bithire dark': {
    'color-contrast': ['.rottay-badge-anchor', 'span[title="Chip"]', 'span[title="Inbox"]'],
  },
};

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

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
