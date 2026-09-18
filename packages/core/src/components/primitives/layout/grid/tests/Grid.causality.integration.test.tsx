/**
 * The grid family in a real browser. This suite carries the cascade half of the
 * rhythm-preset contract that used to be asserted as CSS source text: a named
 * rung answers the tenant rhythm and density, a measurement is exact geometry
 * and answers neither, an explicit axis still overrides the uniform gap, the
 * cell keeps its shrink floors, and the reflow answers the motion dial.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernGrid, { ModernGridItem } from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type GridProps = React.ComponentProps<typeof ModernGrid>;

function grid(props: Omit<GridProps, 'children'> = {}): string {
  return renderToStaticMarkup(
    <ModernGrid {...props}>
      <ModernGridItem>One</ModernGridItem>
      <ModernGridItem>Two</ModernGridItem>
    </ModernGrid>,
  );
}

const markup = [
  `<div id="rung">${grid({ columns: 2, gap: 'md' })}</div>`,
  `<div id="tight">${grid({ columns: 2, gap: 'xs' })}</div>`,
  `<div id="exact">${grid({ columns: 2, gap: 16 })}</div>`,
  `<div id="axis">${grid({ columns: 2, gap: 'md', columnGap: '2xl' })}</div>`,
  `<div id="axisExact">${grid({ columns: 2, gap: 'md', columnGap: 4 })}</div>`,
  `<div id="inline">${grid({ columns: 2, inline: true })}</div>`,
  `<div id="motion">${grid({ columns: 2, gap: 'md', motion: 'rearrange' })}</div>`,
].join('');

const RUNG = "#rung [data-part='root']";
const EXACT = "#exact [data-part='root']";

/**
 * NOT this family's debt: the cells show the caller's own text, and in
 * bithire's dark mode the harness ground `--ds-color-bg-primary` stayed #FFFFFF
 * while the ink followed the mode, so any text in that scope failed the
 * contrast floor. A bare `<p>` with no grid failed identically (measured
 * control).
 *
 * `bithire dark` had 14 rows and they DRAINED: that scope's dark block now
 * re-derives its own canvas ground instead of inheriting the light body's, so
 * the caller's cell copy no longer sits on a near-white ground.
 * Dropped by identity, not waived -- with no entry the scope must measure
 * clean, and a relapse reddens here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describeCausality({
  family: 'grid',
  markup,
  targets: [
    { id: 'rungGap', selector: RUNG, property: 'column-gap' },
    { id: 'exactGap', selector: EXACT, property: 'column-gap' },
    { id: 'reflow', selector: "#motion [data-part='root']", property: 'transition-duration' },
  ],
  decisions: {
    'spacing.rhythm': { value: 'airy', moves: ['rungGap'], holds: 'exactGap', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['rungGap'], holds: 'exactGap', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['reflow'], holds: 'exactGap', in: VERTICALS },
  },
});

describe('grid tracks, axis override and accessibility', () => {
  it('keeps a measurement exact while a rung scales, on the uniform gap and per axis', async () => {
    const result = await measureArms({
      vertical: 'evnto',
      markup,
      arms: { base: {}, airy: { 'spacing.rhythm': 'airy' } },
      targets: [
        { id: 'exact', selector: EXACT, property: 'column-gap' },
        { id: 'rung', selector: RUNG, property: 'column-gap' },
        { id: 'tight', selector: "#tight [data-part='root']", property: 'column-gap' },
        { id: 'axisColumn', selector: "#axis [data-part='root']", property: 'column-gap' },
        { id: 'axisRow', selector: "#axis [data-part='root']", property: 'row-gap' },
        { id: 'axisExact', selector: "#axisExact [data-part='root']", property: 'column-gap' },
      ],
    });
    const r = result.base!;
    expect(r.exact).toBe('16px');
    expect(Number.parseFloat(r.tight!)).toBeLessThan(Number.parseFloat(r.rung!));
    // An explicit axis overrides the uniform gap; the other axis keeps it.
    expect(Number.parseFloat(r.axisColumn!)).toBeGreaterThan(Number.parseFloat(r.axisRow!));
    expect(r.axisExact).toBe('4px');
    expect(result.airy!.exact).toBe('16px');
    expect(result.airy!.axisExact).toBe('4px');
    expect(result.airy!.rung).not.toBe(r.rung);
    expect(result.airy!.axisColumn).not.toBe(r.axisColumn);
  }, 60_000);

  it('builds the track formatting context and the cell shrink floors', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'display', selector: RUNG, property: 'display' },
        { id: 'inlineDisplay', selector: "#inline [data-part='root']", property: 'display' },
        { id: 'rootMin', selector: RUNG, property: 'min-inline-size' },
        { id: 'cellInline', selector: `${RUNG} > [data-part='grid-cell']`, property: 'min-inline-size' },
        { id: 'cellBlock', selector: `${RUNG} > [data-part='grid-cell']`, property: 'min-block-size' },
        { id: 'tracks', selector: RUNG, property: 'grid-template-columns' },
      ],
    });
    const r = result.base!;
    expect(r.display).toBe('grid');
    expect(r.inlineDisplay).toBe('inline-grid');
    expect(r.rootMin).toBe('0px');
    expect(r.cellInline).toBe('0px');
    expect(r.cellBlock).toBe('0px');
    // Two tracks, each free to shrink below its content.
    expect(r.tracks!.split(' ').length).toBe(2);
  }, 60_000);

  it('resolves the posture it is in and stamps it for the skin', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [{ id: 'posture', selector: RUNG, property: 'grid-template-columns' }],
    });
    // The attribute itself is asserted in the jsdom anatomy suite; here the
    // point is that resolving a posture does not disturb the track model.
    expect(result.base!.posture!.split(' ').length).toBe(2);
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
