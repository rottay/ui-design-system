/**
 * The flex family in a real browser. This suite carries the cascade half of the
 * rhythm-preset contract that used to be asserted as CSS source text: a named
 * rung answers the tenant rhythm and density, a measurement is exact geometry
 * and answers neither, each axis flag reaches the computed style, the reflow
 * transition answers the motion dial, and the frozen engines are untouched by
 * the Modern rules.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernFlex from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type FlexProps = React.ComponentProps<typeof ModernFlex>;

function flex(props: Omit<FlexProps, 'children'> = {}): string {
  return renderToStaticMarkup(
    <ModernFlex {...props}>
      <button type="button">One</button>
      <button type="button">Two</button>
    </ModernFlex>,
  );
}

const markup = [
  `<div id="rung">${flex({ gap: 'md' })}</div>`,
  `<div id="exact">${flex({ gap: 16 })}</div>`,
  `<div id="split">${flex({ gap: ['sm', 'lg'] })}</div>`,
  `<div id="splitExact">${flex({ gap: [8, 24] })}</div>`,
  `<div id="column">${flex({ direction: 'column', align: 'start', justify: 'between', wrap: 'wrap' })}</div>`,
  `<div id="inline">${flex({ inline: true })}</div>`,
  `<div id="motion">${flex({ gap: 'md', motion: 'rearrange' })}</div>`,
  `<div id="still">${flex({ gap: 'md', motion: 'none' })}</div>`,
].join('');

const RUNG = "#rung [data-part='root']";
const EXACT = "#exact [data-part='root']";

/**
 * NOT this family's debt: the buttons show the caller's own text, and in
 * bithire's dark mode the harness ground `--ds-color-bg-primary` stays #FFFFFF
 * while the ink follows the mode, so any text in that scope fails the contrast
 * floor. A bare `<p>` with no flex fails identically (measured control).
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describeCausality({
  family: 'flex',
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

describe('flex axes, exact geometry and accessibility', () => {
  it('keeps a measurement exact on both axes while a rung scales', async () => {
    const result = await measureArms({
      vertical: 'evnto',
      markup,
      arms: { base: {}, airy: { 'spacing.rhythm': 'airy' } },
      targets: [
        { id: 'exactColumn', selector: EXACT, property: 'column-gap' },
        { id: 'exactRow', selector: EXACT, property: 'row-gap' },
        { id: 'splitExactColumn', selector: "#splitExact [data-part='root']", property: 'column-gap' },
        { id: 'splitExactRow', selector: "#splitExact [data-part='root']", property: 'row-gap' },
        { id: 'splitRungColumn', selector: "#split [data-part='root']", property: 'column-gap' },
        { id: 'splitRungRow', selector: "#split [data-part='root']", property: 'row-gap' },
        { id: 'rungGap', selector: RUNG, property: 'column-gap' },
      ],
    });
    expect(result.base!.exactColumn).toBe('16px');
    expect(result.base!.exactRow).toBe('16px');
    expect(result.base!.splitExactColumn).toBe('8px');
    expect(result.base!.splitExactRow).toBe('24px');
    // A split pair of RUNGS differs per axis and both scale.
    expect(result.base!.splitRungColumn).not.toBe(result.base!.splitRungRow);
    for (const id of ['exactColumn', 'exactRow', 'splitExactColumn', 'splitExactRow'] as const) {
      expect(result.airy![id], id).toBe(result.base![id]);
    }
    expect(result.airy!.rungGap).not.toBe(result.base!.rungGap);
    expect(result.airy!.splitRungColumn).not.toBe(result.base!.splitRungColumn);
    expect(result.airy!.splitRungRow).not.toBe(result.base!.splitRungRow);
  }, 60_000);

  it('projects every axis flag onto the computed box', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'rowDisplay', selector: RUNG, property: 'display' },
        { id: 'rowDirection', selector: RUNG, property: 'flex-direction' },
        { id: 'rowJustify', selector: RUNG, property: 'justify-content' },
        { id: 'rowAlign', selector: RUNG, property: 'align-items' },
        { id: 'rowWrap', selector: RUNG, property: 'flex-wrap' },
        { id: 'rowMin', selector: RUNG, property: 'min-inline-size' },
        { id: 'columnDirection', selector: "#column [data-part='root']", property: 'flex-direction' },
        { id: 'columnJustify', selector: "#column [data-part='root']", property: 'justify-content' },
        { id: 'columnAlign', selector: "#column [data-part='root']", property: 'align-items' },
        { id: 'columnWrap', selector: "#column [data-part='root']", property: 'flex-wrap' },
        { id: 'inlineDisplay', selector: "#inline [data-part='root']", property: 'display' },
      ],
    });
    const r = result.base!;
    expect(r.rowDisplay).toBe('flex');
    expect(r.rowDirection).toBe('row');
    expect(r.rowJustify).toBe('flex-start');
    expect(r.rowAlign).toBe('stretch');
    expect(r.rowWrap).toBe('nowrap');
    // The shrink-safe formatting context the quality contract pins.
    expect(r.rowMin).toBe('0px');
    expect(r.columnDirection).toBe('column');
    expect(r.columnJustify).toBe('space-between');
    expect(r.columnAlign).toBe('flex-start');
    expect(r.columnWrap).toBe('wrap');
    expect(r.inlineDisplay).toBe('inline-flex');
  }, 60_000);

  it('animates a reflow only when the caller asked for one', async () => {
    const resting = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'rearrange', selector: "#motion [data-part='root']", property: 'transition-duration' },
        { id: 'none', selector: "#still [data-part='root']", property: 'transition-duration' },
        { id: 'unset', selector: RUNG, property: 'transition-duration' },
      ],
    });
    const reduced = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [{ id: 'rearrange', selector: "#motion [data-part='root']", property: 'transition-duration' }],
      environment: { reducedMotion: 'reduce' },
    });
    expect(Number.parseFloat(resting.base!.rearrange!)).toBeGreaterThan(0);
    expect(Number.parseFloat(resting.base!.none!)).toBe(0);
    expect(Number.parseFloat(resting.base!.unset!)).toBe(0);
    expect(Number.parseFloat(reduced.base!.rearrange!)).toBeLessThan(0.001);
  }, 120_000);

  it('carries no serious axe finding in any gated vertical mode', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
