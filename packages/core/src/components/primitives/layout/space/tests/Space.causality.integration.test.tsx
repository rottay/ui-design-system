/**
 * The space family in a real browser. This suite carries the cascade half of
 * the rhythm-preset contract that used to be asserted as CSS source text: a
 * named rung answers the tenant rhythm and density, a measurement is exact
 * geometry and answers neither, the axis flags reach the computed style, and
 * the row's motion answers the tenant dial.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernSpace from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type SpaceProps = React.ComponentProps<typeof ModernSpace>;

function space(props: Omit<SpaceProps, 'children'> = {}, children?: React.ReactNode): string {
  return renderToStaticMarkup(
    <ModernSpace {...props}>
      {children ?? (
        <>
          <button type="button">One</button>
          <button type="button">Two</button>
        </>
      )}
    </ModernSpace>,
  );
}

const markup = [
  `<div id="rung">${space({ size: 'md' })}</div>`,
  `<div id="legacy">${space({ size: 'middle' })}</div>`,
  `<div id="small">${space({ size: 'sm' })}</div>`,
  `<div id="large">${space({ size: 'lg' })}</div>`,
  `<div id="exact">${space({ size: 16 })}</div>`,
  `<div id="tuple">${space({ size: [8, 24] })}</div>`,
  `<div id="unknown">${space({ size: 'huge' as never })}</div>`,
  `<div id="column">${space({ direction: 'vertical', align: 'start', wrap: true })}</div>`,
  `<div id="split">${space({ split: '·' })}</div>`,
].join('');

const RUNG = "#rung [data-part='root']";
const EXACT = "#exact [data-part='root']";

/** This family renders only the caller's own children, so no scope carries debt. */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describeCausality({
  family: 'space',
  markup,
  targets: [
    { id: 'rungGap', selector: RUNG, property: 'column-gap' },
    { id: 'exactGap', selector: EXACT, property: 'column-gap' },
    { id: 'duration', selector: RUNG, property: 'transition-duration' },
  ],
  decisions: {
    'spacing.rhythm': { value: 'airy', moves: ['rungGap'], holds: 'exactGap', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['rungGap'], holds: 'exactGap', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['duration'], holds: 'exactGap', in: VERTICALS },
  },
});

describe('space rungs, exact geometry and accessibility', () => {
  it('answers both rung spellings identically and orders the ladder', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'sm', selector: "#small [data-part='root']", property: 'column-gap' },
        { id: 'md', selector: RUNG, property: 'column-gap' },
        { id: 'legacyMd', selector: "#legacy [data-part='root']", property: 'column-gap' },
        { id: 'lg', selector: "#large [data-part='root']", property: 'column-gap' },
        { id: 'unknown', selector: "#unknown [data-part='root']", property: 'column-gap' },
      ],
    });
    const r = result.base!;
    expect(r.legacyMd).toBe(r.md);
    expect(Number.parseFloat(r.sm!)).toBeLessThan(Number.parseFloat(r.md!));
    expect(Number.parseFloat(r.md!)).toBeLessThan(Number.parseFloat(r.lg!));
    // A spelling no rung rule enumerates falls closed to the resting rung.
    expect(r.unknown).toBe(r.sm);
  }, 60_000);

  it('keeps a measurement exact on both axes while a rung scales', async () => {
    const arms = { base: {}, airy: { 'spacing.rhythm': 'airy' } };
    const result = await measureArms({
      vertical: 'evnto',
      markup,
      arms,
      targets: [
        { id: 'exactColumn', selector: EXACT, property: 'column-gap' },
        { id: 'exactRow', selector: EXACT, property: 'row-gap' },
        { id: 'tupleColumn', selector: "#tuple [data-part='root']", property: 'column-gap' },
        { id: 'tupleRow', selector: "#tuple [data-part='root']", property: 'row-gap' },
        { id: 'rungGap', selector: RUNG, property: 'column-gap' },
      ],
    });
    expect(result.base!.exactColumn).toBe('16px');
    expect(result.base!.exactRow).toBe('16px');
    expect(result.base!.tupleColumn).toBe('8px');
    expect(result.base!.tupleRow).toBe('24px');
    for (const id of ['exactColumn', 'exactRow', 'tupleColumn', 'tupleRow'] as const) {
      expect(result.airy![id], id).toBe(result.base![id]);
    }
    expect(result.airy!.rungGap).not.toBe(result.base!.rungGap);
  }, 60_000);

  it('projects the axis, wrap and alignment flags onto the computed row', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'rowDirection', selector: RUNG, property: 'flex-direction' },
        { id: 'rowAlign', selector: RUNG, property: 'align-items' },
        { id: 'rowWrap', selector: RUNG, property: 'flex-wrap' },
        { id: 'columnDirection', selector: "#column [data-part='root']", property: 'flex-direction' },
        { id: 'columnAlign', selector: "#column [data-part='root']", property: 'align-items' },
        { id: 'columnWrap', selector: "#column [data-part='root']", property: 'flex-wrap' },
        { id: 'separator', selector: "#split [data-part='separator']", property: 'display' },
        { id: 'inline', selector: RUNG, property: 'display' },
      ],
    });
    const r = result.base!;
    expect(r.rowDirection).toBe('row');
    expect(r.rowAlign).toBe('center');
    expect(r.rowWrap).toBe('nowrap');
    expect(r.columnDirection).toBe('column');
    expect(r.columnAlign).toBe('flex-start');
    expect(r.columnWrap).toBe('wrap');
    // A flex item's `display` is blockified by the platform: the separator's
    // authored `inline-flex` computes to `flex` inside the row.
    expect(r.separator).toBe('flex');
    expect(r.inline).toBe('inline-flex');
  }, 60_000);

  it('carries no serious axe finding in any gated vertical mode', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
