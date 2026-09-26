/**
 * The tag family in a real browser: the decisions its derived channels consume
 * move a destination's computed style with a negative control, and no gated
 * vertical mode carries a serious axe finding beyond what is pinned.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernTag from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type TagProps = React.ComponentProps<typeof ModernTag>;

const tag = (props: Partial<TagProps>, label = 'Ready') =>
  renderToStaticMarkup(<ModernTag {...(props as TagProps)}>{label}</ModernTag>);

const markup = [
  `<div id="solid">${tag({ variant: 'primary' })}</div>`,
  `<div id="outlined">${tag({ variant: 'success', outlined: true }, 'Done')}</div>`,
  `<div id="closable">${tag({ closable: true }, 'Dismiss')}</div>`,
  `<div id="small">${tag({ size: 'sm' }, 'Small')}</div>`,
].join('');

const SOLID = "#solid [data-part='root']";
const CLOSE = "#closable [data-part='close']";

/**
 * `shape.radius-scale` reaches the chip corner: the tag deriver produces the
 * radius rungs times the scale. The close affordance is a pill on the full
 * radius, which never scales, so it is the negative control.
 */
describeCausality({
  family: 'tag',
  markup,
  targets: [
    { id: 'solidFill', selector: SOLID, property: 'background-color' },
    { id: 'padInline', selector: SOLID, property: 'padding-left' },
    { id: 'closeCorner', selector: CLOSE, property: 'border-top-left-radius' },
    { id: 'chipCorner', selector: SOLID, property: 'border-top-left-radius' },
    { id: 'focusRing', selector: SOLID, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['solidFill'], holds: 'padInline', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['padInline'], holds: 'closeCorner', in: VERTICALS },
    'shape.radius-scale': { value: 1.2, moves: ['chipCorner'], holds: 'closeCorner', in: VERTICALS },
  },
});

/**
 * Measured debt, pinned by node IDENTITY. Registered, never excluded: a mode-aware
 * ink derivation is the fix, never an axe exclusion. Pinned by node identity, so
 * a repair or a swap both go red.
 *
 * `bithire dark` had three rows -- the dismiss, done and small labels -- and
 * they DRAINED: that scope's dark block now re-derives its own canvas ground
 * instead of inheriting the light body's, so those labels no longer sit on a
 * near-white ground. `evnto light` had one -- the solid "Ready" chip, the
 * light root's on-primary ink on the near-black primary at 1.09:1 -- and it
 * DRAINED when that ink took the light ramp's white. Dropped by identity, not
 * waived: with no entry every scope must measure clean, and a relapse reddens here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('tag derived channels and accessibility', () => {
  it('derives the tone fill and the pill corners from the family deriver', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'solidFill', selector: SOLID, property: 'background-color' },
        { id: 'outlinedFill', selector: "#outlined [data-part='root']", property: 'background-color' },
        { id: 'closeCorner', selector: CLOSE, property: 'border-top-left-radius' },
        { id: 'fullRadius', selector: SOLID, property: '--ds-radius-full' },
      ],
    });
    const r = result.base!;
    // A solid chip carries a fill; an outlined one leaves the ground showing.
    expect(r.solidFill).not.toBe(r.outlinedFill);
    // The close affordance is a pill: its corner resolves from the full radius.
    expect(Number.parseFloat(r.closeCorner)).toBeGreaterThan(0);
    expect(r.fullRadius.trim().length).toBeGreaterThan(0);
  }, 60_000);

  it('rests the chip corner on the vertical radius scale and never scales the pill', async () => {
    const corners: Record<string, Record<string, [string, string]>> = {};
    for (const vertical of VERTICALS) {
      const arms = await measureArms({
        vertical,
        markup,
        arms: { base: {}, r08: { 'shape.radius-scale': 0.8 }, r12: { 'shape.radius-scale': 1.2 } },
        targets: [
          { id: 'chip', selector: SOLID, property: 'border-top-left-radius' },
          { id: 'close', selector: CLOSE, property: 'border-top-left-radius' },
        ],
      });
      corners[vertical] = Object.fromEntries(Object.entries(arms).map(([arm, r]) => [arm, [r.chip!, r.close!]]));
    }
    // rottay and evnto rest at scale 1 (0.25rem at their 15px root); bithire's
    // own 0.8 now reaches its chips (0.25rem at 14.1px x 0.8).
    expect(corners).toEqual({
      rottay: { base: ['3.75px', '9999px'], r08: ['3px', '9999px'], r12: ['4.5px', '9999px'] },
      bithire: { base: ['2.82px', '9999px'], r08: ['2.82px', '9999px'], r12: ['4.23px', '9999px'] },
      evnto: { base: ['3.75px', '9999px'], r08: ['3px', '9999px'], r12: ['4.5px', '9999px'] },
    });
  }, 120_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
