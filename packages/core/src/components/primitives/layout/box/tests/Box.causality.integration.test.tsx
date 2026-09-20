/**
 * The box family in a real browser: the corner ladder answers the tenant radius
 * scale, the depth ladder answers the elevation posture, both resolve from the
 * shared ramps rather than from a value the family owns, and no gated vertical
 * mode carries a serious axe finding.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernBox from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type BoxProps = React.ComponentProps<typeof ModernBox>;

function box(props: Omit<BoxProps, 'children'> = {}): string {
  return renderToStaticMarkup(<ModernBox {...props}>Framed</ModernBox>);
}

const markup = [
  `<div id="md">${box({ rounded: 'md', shadow: 'md' })}</div>`,
  `<div id="sm">${box({ rounded: 'sm', shadow: 'sm' })}</div>`,
  `<div id="xl">${box({ rounded: 'xl', shadow: 'xl' })}</div>`,
  `<div id="two-xl">${box({ rounded: 'xl', shadow: '2xl' })}</div>`,
  `<div id="full">${box({ rounded: 'full' })}</div>`,
  `<div id="flat">${box({})}</div>`,
  `<div id="caller">${box({ style: { borderRadius: '3px', boxShadow: 'none' } })}</div>`,
].join('');

const MD = '#md .rottay-box';
const TWO_XL = '#two-xl .rottay-box';

/**
 * Box anchors on `data-part='box-surface'`, not on `root` and not on `box`:
 * whatever part the escape hatch stamps lands on every nested Box in the fleet,
 * every family reads its own root, and `checkbox` already owns `box` and reads
 * it with descendant selectors. The name was censused clear against stamps,
 * skin reads and skeleton roles before it was adopted.
 *
 * Measured debt, pinned by node IDENTITY. Registered, never excluded.
 *
 * `bithire dark` had six rows -- the two unstamped boxes and the four radius
 * rungs -- and they DRAINED: that scope's dark block now re-derives its own
 * canvas ground instead of inheriting the light body's, so the ink no longer
 * sits on a near-white ground. The debt was never this family's (Box paints no
 * ground of its own; a bare `<p>` with no box used to fail identically), which
 * is why a repair outside the family cleared all six at once. Dropped by
 * identity, not waived: with no entry every scope must now measure clean, and a
 * relapse reddens here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describeCausality({
  family: 'box',
  markup,
  targets: [
    { id: 'corner', selector: MD, property: 'border-top-left-radius' },
    { id: 'depth', selector: MD, property: 'box-shadow' },
    // The top of the ladder is its own reading: `md` rides `--ds-elevation-3`,
    // and a decision that reached only the middle rungs would still pass above.
    { id: 'depth2xl', selector: TWO_XL, property: 'box-shadow' },
  ],
  decisions: {
    'shape.radius-scale': { value: 1.2, moves: ['corner'], holds: 'depth', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['depth', 'depth2xl'], holds: 'corner', in: VERTICALS },
  },
});

/** The px lengths of a computed shadow, in order: the part a rung's identity is in. */
function lengths(shadow: string): number[] {
  return [...shadow.matchAll(/(-?\d+(?:\.\d+)?)px/g)].map((match) => Number.parseFloat(match[1]));
}

describe('box ladders, caller ownership and accessibility', () => {
  it('orders both ladders and leaves an unasked box flat', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'smCorner', selector: "#sm .rottay-box", property: 'border-top-left-radius' },
        { id: 'mdCorner', selector: MD, property: 'border-top-left-radius' },
        { id: 'xlCorner', selector: "#xl .rottay-box", property: 'border-top-left-radius' },
        { id: 'fullCorner', selector: "#full .rottay-box", property: 'border-top-left-radius' },
        { id: 'flatCorner', selector: "#flat .rottay-box", property: 'border-top-left-radius' },
        { id: 'flatDepth', selector: "#flat .rottay-box", property: 'box-shadow' },
        { id: 'smDepth', selector: "#sm .rottay-box", property: 'box-shadow' },
        { id: 'xlDepth', selector: "#xl .rottay-box", property: 'box-shadow' },
      ],
    });
    const r = result.base!;
    expect(Number.parseFloat(r.smCorner!)).toBeLessThan(Number.parseFloat(r.mdCorner!));
    expect(Number.parseFloat(r.mdCorner!)).toBeLessThan(Number.parseFloat(r.xlCorner!));
    expect(Number.parseFloat(r.fullCorner!)).toBeGreaterThan(Number.parseFloat(r.xlCorner!));
    expect(r.flatCorner).toBe('0px');
    expect(r.flatDepth).toBe('none');
    expect(r.smDepth).not.toBe('none');
    expect(r.xlDepth).not.toBe(r.smDepth);
  }, 60_000);

  /**
   * `--ds-elevation-6` is the ladder's top rung and the box `2xl` depth is its
   * only reader, through `--ds-box-depth-2xl: var(--ds-elevation-6)` with the
   * same rung as the skin's fallback. Both arms of that read land on the rung,
   * which is what makes the route productive without a second reader -- and
   * what the census could not show while the row published no producer.
   *
   * The posture arms are the causality: `flat` and `elevated` state DIFFERENT
   * values for role 6, and the paint has to follow each of them. The `xl`
   * comparison is the identity half: a `2xl` that had quietly fallen back to
   * `--ds-elevation-5` would move with the posture just as obligingly.
   */
  it('paints the top rung: the elevation posture reaches 2xl through --ds-elevation-6, not through rung 5', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: {
        base: {},
        flat: { 'surfaces.elevation-posture': 'flat' },
        elevated: { 'surfaces.elevation-posture': 'elevated' },
      },
      targets: [
        { id: 'rung6', selector: TWO_XL, property: '--ds-elevation-6' },
        { id: 'rung5', selector: TWO_XL, property: '--ds-elevation-5' },
        { id: 'depth2xl', selector: TWO_XL, property: 'box-shadow' },
        { id: 'depthXl', selector: '#xl .rottay-box', property: 'box-shadow' },
        { id: 'corner', selector: TWO_XL, property: 'border-top-left-radius' },
      ],
    });
    const [base, flat, elevated] = [result.base!, result.flat!, result.elevated!];

    // The route exists at rest: the rung carries a value, the box paints one,
    // and it is not rung 5 wearing the top of the ladder.
    expect(base.rung6!.trim()).not.toBe('');
    expect(base.depth2xl).not.toBe('none');
    expect(lengths(base.depth2xl!)).not.toEqual(lengths(base.depthXl!));

    // The decision moves the rung to the lengths the posture states for role 6
    // (`0 32px 64px` / `0 2px 6px`), and the paint IS that rung: the comparison
    // is built from the arm's own reading, with the offset and spread Chromium
    // normalizes a one-shadow value into.
    expect(lengths(elevated.rung6!)).toEqual([32, 64]);
    expect(lengths(elevated.depth2xl!)).toEqual([0, ...lengths(elevated.rung6!), 0]);
    expect(lengths(flat.rung6!)).toEqual([2, 6]);
    expect(lengths(flat.depth2xl!)).toEqual([0, ...lengths(flat.rung6!), 0]);

    // …and it is role 6 that reached the paint: role 5 moves to its own,
    // different value in the same arm, and the box does not take it.
    expect(lengths(elevated.rung5!)).toEqual([24, 48]);
    expect(lengths(elevated.depth2xl!)).not.toEqual([0, ...lengths(elevated.rung5!), 0]);
    expect(lengths(elevated.depth2xl!)).not.toEqual(lengths(elevated.depthXl!));

    // The negative control: a depth posture states nothing about corners.
    expect(elevated.corner).toBe(base.corner);
    expect(flat.corner).toBe(base.corner);
  }, 90_000);

  it("leaves a caller's own radius and shadow sovereign", async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {}, scaled: { 'shape.radius-scale': 1.2 } },
      targets: [
        { id: 'callerCorner', selector: "#caller .rottay-box", property: 'border-top-left-radius' },
        { id: 'callerDepth', selector: "#caller .rottay-box", property: 'box-shadow' },
        { id: 'rungCorner', selector: MD, property: 'border-top-left-radius' },
      ],
    });
    // A caller who paints the property owns it: the engine stamps no rung, so
    // no ladder rule can reach it, and the tenant scale cannot move it either.
    expect(result.base!.callerCorner).toBe('3px');
    expect(result.base!.callerDepth).toBe('none');
    expect(result.scaled!.callerCorner).toBe('3px');
    expect(result.scaled!.rungCorner).not.toBe(result.base!.rungCorner);
  }, 60_000);

  it('carries no serious axe finding beyond the pinned ground debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
