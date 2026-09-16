/**
 * The stack family in a real browser. This suite carries the cascade half of
 * the rhythm-preset contract that used to be asserted as CSS source text: a
 * named rung answers the tenant rhythm and density, a caller's measurement is
 * exact geometry and answers neither, the hairline centres itself inside the
 * governed room on whichever axis is active, and the reflow answers the dial.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernStack from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type StackProps = React.ComponentProps<typeof ModernStack>;

function stack(props: Omit<StackProps, 'children'> = {}): string {
  return renderToStaticMarkup(
    <ModernStack {...props}>
      <button type="button">One</button>
      <button type="button">Two</button>
    </ModernStack>,
  );
}

const markup = [
  `<div id="rung">${stack({ spacing: 'md' })}</div>`,
  `<div id="tight">${stack({ spacing: 'xs' })}</div>`,
  `<div id="loose">${stack({ spacing: '4xl' })}</div>`,
  `<div id="zero">${stack({ spacing: 'none' })}</div>`,
  `<div id="exact">${stack({ spacing: 21 })}</div>`,
  `<div id="row">${stack({ direction: 'horizontal', align: 'center', justify: 'space-between' })}</div>`,
  `<div id="divided">${stack({ spacing: 'md', divider: true })}</div>`,
  `<div id="dividedRow">${stack({ spacing: 'md', direction: 'horizontal', divider: true })}</div>`,
  `<div id="motion">${stack({ spacing: 'md', motion: 'rearrange' })}</div>`,
].join('');

const RUNG = "#rung [data-part='root']";
const EXACT = "#exact [data-part='root']";

/**
 * MEASURED GAP, registered rather than forced: no `palette.*` decision reaches
 * the hairline in any first-party vertical. The deriver chains
 * `chrome.layout.stackDividerColor` ahead of `--ds-color-border-subtle`, no
 * vertical authors that field, and the fallback channel is itself pinned per
 * vertical (rottay #161619, bithire and evnto #f5f5f5) rather than derived from
 * the seeds -- `neutral-temperature`, `seeds` and `contrast-posture` all leave
 * it where it is (measured, 2026-09-16). The reach belongs to whoever owns the
 * neutral ramp's derivation; this suite states that rather than pretending the
 * decision covers it.
 *
 * This family renders only the caller's own children, so no scope carries debt.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describeCausality({
  family: 'stack',
  markup,
  targets: [
    { id: 'rungGap', selector: RUNG, property: 'row-gap' },
    { id: 'exactGap', selector: EXACT, property: 'row-gap' },
    { id: 'reflow', selector: "#motion [data-part='root']", property: 'transition-duration' },
  ],
  decisions: {
    'spacing.rhythm': { value: 'airy', moves: ['rungGap'], holds: 'exactGap', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['rungGap'], holds: 'exactGap', in: VERTICALS },
    'motion.dial': { value: { durationScale: 1.35 }, moves: ['reflow'], holds: 'exactGap', in: VERTICALS },
  },
});

describe('stack rungs, hairline centring and accessibility', () => {
  it('orders the rung ladder, zeroes it at `none`, and keeps a number exact', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {}, airy: { 'spacing.rhythm': 'airy' } },
      targets: [
        { id: 'zero', selector: "#zero [data-part='root']", property: 'row-gap' },
        { id: 'tight', selector: "#tight [data-part='root']", property: 'row-gap' },
        { id: 'rung', selector: RUNG, property: 'row-gap' },
        { id: 'loose', selector: "#loose [data-part='root']", property: 'row-gap' },
        { id: 'exact', selector: EXACT, property: 'row-gap' },
      ],
    });
    const r = result.base!;
    expect(r.zero).toBe('0px');
    expect(Number.parseFloat(r.tight!)).toBeLessThan(Number.parseFloat(r.rung!));
    expect(Number.parseFloat(r.rung!)).toBeLessThan(Number.parseFloat(r.loose!));
    expect(r.exact).toBe('21px');
    // Exact geometry survives a rhythm move; every rung does not.
    expect(result.airy!.exact).toBe('21px');
    expect(result.airy!.rung).not.toBe(r.rung);
    expect(result.airy!.zero).toBe('0px');
  }, 60_000);

  it('centres the hairline inside the governed room on the active axis', async () => {
    const result = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'columnGap', selector: "#divided [data-part='root']", property: 'row-gap' },
        { id: 'columnBlock', selector: "#divided [data-part='divider']", property: 'margin-top' },
        { id: 'columnInline', selector: "#divided [data-part='divider']", property: 'margin-left' },
        { id: 'rowBlock', selector: "#dividedRow [data-part='divider']", property: 'margin-top' },
        { id: 'rowInline', selector: "#dividedRow [data-part='divider']", property: 'margin-left' },
        { id: 'thickness', selector: "#divided [data-part='divider']", property: 'flex-basis' },
      ],
    });
    const r = result.base!;
    // A column stack pulls the hairline back on the BLOCK axis by half the gap.
    expect(Number.parseFloat(r.columnBlock!)).toBeCloseTo(-Number.parseFloat(r.columnGap!) / 2, 1);
    expect(Number.parseFloat(r.columnInline!)).toBe(0);
    // A row stack swaps the axes.
    expect(Number.parseFloat(r.rowBlock!)).toBe(0);
    expect(Number.parseFloat(r.rowInline!)).toBeLessThan(0);
    expect(r.thickness).toBe('1px');
  }, 60_000);

  it('projects the axis and alignment flags onto the computed box', async () => {
    const result = await measureArms({
      vertical: 'evnto',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'columnDirection', selector: RUNG, property: 'flex-direction' },
        { id: 'columnAlign', selector: RUNG, property: 'align-items' },
        { id: 'columnMin', selector: RUNG, property: 'min-inline-size' },
        { id: 'rowDirection', selector: "#row [data-part='root']", property: 'flex-direction' },
        { id: 'rowAlign', selector: "#row [data-part='root']", property: 'align-items' },
        { id: 'rowJustify', selector: "#row [data-part='root']", property: 'justify-content' },
      ],
    });
    const r = result.base!;
    expect(r.columnDirection).toBe('column');
    expect(r.columnAlign).toBe('stretch');
    // The shrink-safe formatting context the quality contract pins.
    expect(r.columnMin).toBe('0px');
    expect(r.rowDirection).toBe('row');
    expect(r.rowAlign).toBe('center');
    expect(r.rowJustify).toBe('space-between');
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
