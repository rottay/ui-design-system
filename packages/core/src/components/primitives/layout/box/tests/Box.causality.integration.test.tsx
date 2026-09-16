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
  `<div id="full">${box({ rounded: 'full' })}</div>`,
  `<div id="flat">${box({})}</div>`,
  `<div id="caller">${box({ style: { borderRadius: '3px', boxShadow: 'none' } })}</div>`,
].join('');

const MD = '#md .rottay-box';

/**
 * Box anchors on `data-part='box-surface'`, not on `root` and not on `box`:
 * whatever part the escape hatch stamps lands on every nested Box in the fleet,
 * every family reads its own root, and `checkbox` already owns `box` and reads
 * it with descendant selectors. The name was censused clear against stamps,
 * skin reads and skeleton roles before it was adopted.
 *
 * NOT this family's debt: in bithire's dark mode the harness ground
 * `--ds-color-bg-primary` stays #FFFFFF while the ink follows the mode, so ANY
 * text in that scope fails the contrast floor. A bare `<p>` with no box fails
 * identically (measured control). Box paints no ground of its own.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  'bithire dark': {
    'color-contrast': [
      '#caller > .rottay-box.rottay-box--modern[data-part="box-surface"]',
      '#flat > .rottay-box.rottay-box--modern[data-part="box-surface"]',
      'div[data-radius="full"]',
      'div[data-radius="md"]',
      'div[data-radius="sm"]',
      'div[data-radius="xl"]',
    ],
  },
};

describeCausality({
  family: 'box',
  markup,
  targets: [
    { id: 'corner', selector: MD, property: 'border-top-left-radius' },
    { id: 'depth', selector: MD, property: 'box-shadow' },
  ],
  decisions: {
    'shape.radius-scale': { value: 1.2, moves: ['corner'], holds: 'depth', in: VERTICALS },
    'surfaces.elevation-posture': { value: 'elevated', moves: ['depth'], holds: 'corner', in: VERTICALS },
  },
});

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
